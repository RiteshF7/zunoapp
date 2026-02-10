"""Knowledge Engine endpoints — RAG query and content reindexing."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client

from app.config import Settings, get_settings
from app.dependencies import get_current_user, get_supabase
from app.prompts import get_prompt
from app.schemas.models import (
    KnowledgeQueryRequest,
    KnowledgeQueryResponse,
    KnowledgeSourceOut,
    ReindexRequest,
    ReindexResponse,
)
from app.services.ai_service import (
    generate_query_embedding,
    generate_embeddings_batch,
    generate_rag_answer,
)
from app.services.chunking_service import chunk_text
from app.utils.rate_limit import limiter, RATE_AI_PROCESS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

RATE_KNOWLEDGE_QUERY = "30/minute"
RATE_KNOWLEDGE_REINDEX = "5/hour"


# ---------------------------------------------------------------------------
# POST /api/knowledge/ask — RAG query
# ---------------------------------------------------------------------------
@router.post("/ask", response_model=KnowledgeQueryResponse)
@limiter.limit(RATE_KNOWLEDGE_QUERY)
async def ask_knowledge(
    request: Request,
    body: KnowledgeQueryRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Answer a question using RAG over the user's saved content.

    Pipeline:
    1. Embed the query via Vertex AI (RETRIEVAL_QUERY task type).
    2. Search content_chunks via pgvector (match_chunks RPC).
    3. Pass retrieved context + query to Gemini for answer generation.
    4. Return the answer with source references.
    """
    # Validate Vertex AI is configured
    if not settings.gcp_project_id:
        raise HTTPException(
            status_code=503,
            detail="Knowledge engine requires Vertex AI configuration (GCP_PROJECT_ID).",
        )

    # 1. Embed the query
    query_embedding = await generate_query_embedding(body.query, settings)
    if query_embedding is None:
        raise HTTPException(
            status_code=502,
            detail="Failed to generate query embedding. Please try again.",
        )

    # 2. Retrieve top-k chunks from pgvector
    try:
        chunks_result = db.rpc(
            "match_chunks",
            {
                "query_embedding": query_embedding,
                "match_user_id": user_id,
                "match_count": body.top_k,
                "similarity_threshold": 0.3,
            },
        ).execute()
    except Exception as exc:
        logger.error("Chunk retrieval failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to search knowledge base.")

    retrieved_chunks = chunks_result.data or []

    if not retrieved_chunks:
        return KnowledgeQueryResponse(
            answer=(
                "I couldn't find information about this in your saved content. "
                "Try saving more content related to this topic, or rephrase your question."
            ),
            sources=[],
            chunks_used=0,
        )

    # 3. Enrich chunks with content metadata (title, url)
    # Get unique content IDs to fetch full content records
    content_ids = list({c["content_id"] for c in retrieved_chunks})
    content_records = {}
    if content_ids:
        content_result = (
            db.table("content")
            .select("id, title, url, platform, created_at")
            .in_("id", content_ids)
            .execute()
        )
        content_records = {c["id"]: c for c in (content_result.data or [])}

    # Merge content metadata into chunks
    enriched_chunks = []
    for chunk in retrieved_chunks:
        content = content_records.get(chunk["content_id"], {})
        meta = chunk.get("metadata") or {}
        enriched_chunks.append({
            "chunk_text": chunk["chunk_text"],
            "similarity": chunk.get("similarity", 0),
            "metadata": {
                "title": content.get("title") or meta.get("title", ""),
                "platform": content.get("platform") or meta.get("platform", ""),
                "url": content.get("url") or meta.get("url", ""),
            },
            "content_id": chunk["content_id"],
            "created_at": content.get("created_at"),
        })

    # 4. Load RAG prompt and add format instruction
    prompt_config = get_prompt("rag_answer")
    system_prompt = prompt_config["system"]

    if body.format == "summary":
        system_prompt += "\n\nThe user wants a SUMMARY. Use 3-5 concise bullet points."
    elif body.format == "list":
        system_prompt += "\n\nThe user wants a LIST. Use a numbered or bulleted list format."
    elif body.format == "detailed":
        system_prompt += "\n\nThe user wants a DETAILED answer. Provide comprehensive paragraphs."

    # 5. Generate answer via Gemini
    try:
        answer = await generate_rag_answer(
            query=body.query,
            context_chunks=enriched_chunks,
            system_prompt=system_prompt,
            settings=settings,
            temperature=prompt_config.get("temperature", 0.3),
            max_output_tokens=prompt_config.get("max_output_tokens", 2048),
        )
    except Exception as exc:
        logger.error("Answer generation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Failed to generate answer.")

    # 6. Build source references
    sources: list[KnowledgeSourceOut] = []
    if body.include_sources:
        seen_content_ids = set()
        for chunk in enriched_chunks:
            cid = chunk["content_id"]
            if cid in seen_content_ids:
                continue
            seen_content_ids.add(cid)
            sources.append(KnowledgeSourceOut(
                content_id=cid,
                title=chunk["metadata"].get("title"),
                platform=chunk["metadata"].get("platform"),
                url=chunk["metadata"].get("url"),
                timestamp=chunk.get("created_at"),
                chunk_text=chunk["chunk_text"][:200] + "..." if len(chunk["chunk_text"]) > 200 else chunk["chunk_text"],
                relevance_score=chunk.get("similarity"),
            ))

    return KnowledgeQueryResponse(
        answer=answer,
        sources=sources,
        chunks_used=len(enriched_chunks),
    )


# ---------------------------------------------------------------------------
# POST /api/knowledge/reindex — Re-chunk and re-embed content
# ---------------------------------------------------------------------------
@router.post("/reindex", response_model=ReindexResponse)
@limiter.limit(RATE_KNOWLEDGE_REINDEX)
async def reindex_content(
    request: Request,
    body: ReindexRequest | None = None,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Re-chunk and re-embed all (or selected) content for the current user.

    This is useful for:
    - Migrating existing content into the RAG pipeline.
    - Re-processing content after changing chunk settings.
    """
    if not settings.gcp_project_id:
        raise HTTPException(
            status_code=503,
            detail="Knowledge engine requires Vertex AI configuration (GCP_PROJECT_ID).",
        )

    # Fetch content to reindex
    query = (
        db.table("content")
        .select("id, user_id, url, title, platform, ai_category, full_text, ai_summary, description")
        .eq("user_id", user_id)
        .eq("ai_processed", True)
    )

    if body and body.content_ids:
        query = query.in_("id", body.content_ids)

    result = query.order("created_at", desc=True).execute()
    content_items = result.data or []

    if not content_items:
        return ReindexResponse(
            content_processed=0,
            chunks_created=0,
            message="No processed content found to reindex.",
        )

    total_chunks = 0
    errors = 0

    for item in content_items:
        try:
            # Use full_text if available, otherwise fall back to summary + description
            text = item.get("full_text") or ""
            if not text:
                parts = []
                if item.get("title"):
                    parts.append(f"Title: {item['title']}")
                if item.get("ai_summary"):
                    parts.append(item["ai_summary"])
                if item.get("description"):
                    parts.append(item["description"])
                text = "\n\n".join(parts)

            if not text.strip():
                continue

            # Chunk
            chunks = chunk_text(
                text,
                max_tokens=settings.rag_chunk_size,
                overlap_tokens=settings.rag_chunk_overlap,
            )
            if not chunks:
                continue

            # Embed
            chunk_texts = [c.chunk_text for c in chunks]
            embeddings = await generate_embeddings_batch(chunk_texts, settings)

            # Delete old chunks
            db.table("content_chunks").delete().eq("content_id", item["id"]).execute()

            # Build metadata
            content_metadata = {
                "title": item.get("title", ""),
                "platform": item.get("platform", ""),
                "url": item.get("url", ""),
                "category": item.get("ai_category", ""),
            }

            # Insert new chunks
            rows = []
            for chunk, embedding in zip(chunks, embeddings):
                row = {
                    "content_id": item["id"],
                    "user_id": user_id,
                    "chunk_index": chunk.chunk_index,
                    "chunk_text": chunk.chunk_text,
                    "token_count": chunk.token_count,
                    "metadata": content_metadata,
                }
                if embedding is not None:
                    row["embedding"] = embedding
                rows.append(row)

            if rows:
                db.table("content_chunks").insert(rows).execute()
                total_chunks += len(rows)

        except Exception as exc:
            logger.error("Failed to reindex content %s: %s", item["id"], exc)
            errors += 1

    return ReindexResponse(
        content_processed=len(content_items),
        chunks_created=total_chunks,
        errors=errors,
        message=f"Reindexed {len(content_items)} content items into {total_chunks} chunks.",
    )


# ---------------------------------------------------------------------------
# GET /api/knowledge/stats — Knowledge base stats for the user
# ---------------------------------------------------------------------------
@router.get("/stats")
@limiter.limit("30/minute")
async def knowledge_stats(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Return knowledge base statistics for the current user."""
    # Count total chunks
    chunks_result = (
        db.table("content_chunks")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )

    # Count content with chunks
    indexed_content_result = (
        db.table("content_chunks")
        .select("content_id")
        .eq("user_id", user_id)
        .execute()
    )
    unique_content_ids = {r["content_id"] for r in (indexed_content_result.data or [])}

    # Count total processed content
    total_content_result = (
        db.table("content")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("ai_processed", True)
        .execute()
    )

    return {
        "total_chunks": chunks_result.count or 0,
        "indexed_content": len(unique_content_ids),
        "total_processed_content": total_content_result.count or 0,
        "needs_reindex": (total_content_result.count or 0) - len(unique_content_ids),
    }
