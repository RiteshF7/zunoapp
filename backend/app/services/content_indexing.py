"""Shared content indexing service — chunk text and store embeddings for RAG.

Consolidates the duplicated chunk-and-embed logic from:
- app/routers/ai.py (_chunk_and_embed_content)
- app/routers/knowledge.py (reindex_content inner loop)
"""

from __future__ import annotations

import logging
from typing import Any

from supabase import Client

from app.config import Settings
from app.services.chunking_service import chunk_text
from app.services.ai_service import generate_embeddings_batch

logger = logging.getLogger(__name__)


async def index_content_chunks(
    db: Client,
    content_id: str,
    user_id: str,
    text: str,
    content_metadata: dict[str, Any],
    settings: Settings,
) -> int:
    """Chunk text, generate Vertex AI embeddings, and store in content_chunks.

    Parameters
    ----------
    db : Supabase client
    content_id : ID of the content item
    user_id : Owner of the content
    text : Full text to chunk
    content_metadata : Dict with title, platform, url, category
    settings : App settings (for chunk size, overlap, etc.)

    Returns
    -------
    int
        Number of chunks created.
    """
    # 1. Chunk the text
    chunks = chunk_text(
        text,
        max_tokens=settings.rag_chunk_size,
        overlap_tokens=settings.rag_chunk_overlap,
    )
    if not chunks:
        return 0

    # 2. Generate embeddings for all chunks (batch)
    chunk_texts = [c.chunk_text for c in chunks]
    embeddings = await generate_embeddings_batch(chunk_texts, settings)

    # 3. Delete existing chunks for this content (re-processing support)
    db.table("content_chunks").delete().eq("content_id", content_id).execute()

    # 4. Insert new chunks with embeddings
    rows = []
    for chunk, embedding in zip(chunks, embeddings):
        row: dict[str, Any] = {
            "content_id": content_id,
            "user_id": user_id,
            "chunk_index": chunk.chunk_index,
            "chunk_text": chunk.chunk_text,
            "token_count": chunk.token_count,
            "metadata": content_metadata,
        }
        if embedding is not None:
            row["embedding"] = embedding
        rows.append(row)

    # Batch insert
    if rows:
        db.table("content_chunks").insert(rows).execute()

    logger.info(
        "Created %d chunks for content %s (%d with embeddings)",
        len(rows),
        content_id,
        sum(1 for e in embeddings if e is not None),
    )
    return len(rows)


async def index_content_batch(
    db: Client,
    user_id: str,
    items: list[dict[str, Any]],
    settings: Settings,
) -> dict[str, int]:
    """Batch reindex multiple content items.

    Returns a stats dict with keys: content_processed, chunks_created, errors.
    """
    total_chunks = 0
    errors = 0

    for item in items:
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

            content_metadata = {
                "title": item.get("title", ""),
                "platform": item.get("platform", ""),
                "url": item.get("url", ""),
                "category": item.get("ai_category", ""),
            }

            chunks_created = await index_content_chunks(
                db=db,
                content_id=item["id"],
                user_id=user_id,
                text=text,
                content_metadata=content_metadata,
                settings=settings,
            )
            total_chunks += chunks_created

        except Exception as exc:
            logger.error("Failed to reindex content %s: %s", item["id"], exc)
            errors += 1

    return {
        "content_processed": len(items),
        "chunks_created": total_chunks,
        "errors": errors,
    }
