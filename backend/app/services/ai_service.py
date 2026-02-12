"""Unified AI service — single facade for all AI operations.

Every router imports from this module.  Internally it delegates to the
configured AIProvider implementation (currently Vertex AI).  Swapping
providers means changing ``_get_provider()`` — nothing else.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from app.config import Settings
from app.prompts import get_prompt
from app.services.ai_provider import AIProvider

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Provider singleton
# ---------------------------------------------------------------------------
_provider_instance: AIProvider | None = None


def _get_provider(settings: Settings) -> AIProvider:
    """Return (and lazily create) the configured AI provider."""
    global _provider_instance
    if _provider_instance is None:
        from app.services.providers.vertex_ai import VertexAIProvider

        _provider_instance = VertexAIProvider(settings)
    return _provider_instance


# ---------------------------------------------------------------------------
# Public API — content analysis
# ---------------------------------------------------------------------------
async def process_with_ai(text: str, settings: Settings) -> dict[str, Any]:
    """Categorize, summarize, tag, and embed the given text.

    Replaces the old openai_service.process_with_ai().
    """
    if not settings.gcp_project_id:
        raise RuntimeError(
            "No AI provider configured. Set GCP_PROJECT_ID for Vertex AI."
        )

    provider = _get_provider(settings)
    prompt_config = get_prompt("content_analysis")
    system_prompt = prompt_config["system"]
    temperature = prompt_config.get("temperature", 0.3)

    # Generate structured analysis via LLM (JSON mode)
    raw_json = await provider.generate_text(
        system_prompt=system_prompt,
        user_prompt=text,
        temperature=temperature,
        max_tokens=2048,
        json_mode=True,
    )
    result: dict[str, Any] = json.loads(raw_json)

    # Generate embedding for semantic search
    embedding = await provider.generate_embedding(
        text, task_type="RETRIEVAL_DOCUMENT",
    )

    return _normalize_ai_result(result, embedding)


def _normalize_ai_result(
    result: dict[str, Any], embedding: list[float] | None,
) -> dict[str, Any]:
    """Build a consistent return dict from raw AI JSON output."""
    tldr = result.get("tldr") or result.get("summary", "")
    return {
        "category": result.get("category", "Uncategorized"),
        "summary": tldr,  # backward-compat: ai_summary column in DB
        "tags": result.get("tags", []),
        "title": result.get("title"),
        "embedding": embedding,
        # Structured fields
        "structured_content": {
            "tldr": tldr,
            "key_points": result.get("key_points", []),
            "action_items": result.get("action_items", []),
            "save_motive": result.get("save_motive", ""),
        },
    }


# ---------------------------------------------------------------------------
# Public API — embeddings
# ---------------------------------------------------------------------------
async def generate_embedding(
    text: str, settings: Settings,
) -> list[float] | None:
    """Generate a single embedding (RETRIEVAL_DOCUMENT task type)."""
    if not settings.gcp_project_id:
        return None
    provider = _get_provider(settings)
    return await provider.generate_embedding(text, task_type="RETRIEVAL_DOCUMENT")


async def expand_query(query: str, settings: Settings) -> str:
    """Expand a user query via AI to fix typos, add synonyms, and alternate names.

    Returns the expanded query string, or the original query if expansion fails.
    """
    if not query or not settings.gcp_project_id:
        return query

    try:
        from app.prompts import get_prompt

        prompt_config = get_prompt("query_expansion")
        provider = _get_provider(settings)
        expanded = await provider.generate_text(
            system_prompt=prompt_config["system"],
            user_prompt=prompt_config["user_template"].format(query=query),
            temperature=prompt_config.get("temperature", 0.2),
            max_tokens=prompt_config.get("max_output_tokens", 256),
            json_mode=False,
        )
        expanded = expanded.strip()
        if expanded:
            logger.info("Query expanded: '%s' → '%s'", query, expanded)
            return expanded
    except Exception as exc:
        logger.warning("Query expansion failed (using original): %s", exc)

    return query


async def generate_query_embedding(
    text: str, settings: Settings,
) -> list[float] | None:
    """Generate a single embedding optimized for search queries."""
    if not text or not settings.gcp_project_id:
        return None
    provider = _get_provider(settings)
    return await provider.generate_embedding(text, task_type="RETRIEVAL_QUERY")


async def generate_embeddings_batch(
    texts: list[str],
    settings: Settings,
    batch_size: int = 250,
) -> list[list[float] | None]:
    """Generate embeddings for a list of texts (RETRIEVAL_DOCUMENT)."""
    if not texts:
        return []
    provider = _get_provider(settings)
    return await provider.generate_embeddings_batch(
        texts, task_type="RETRIEVAL_DOCUMENT", batch_size=batch_size,
    )


# ---------------------------------------------------------------------------
# Public API — RAG answer generation
# ---------------------------------------------------------------------------
async def generate_rag_answer(
    query: str,
    context_chunks: list[dict[str, Any]],
    system_prompt: str,
    settings: Settings,
    temperature: float = 0.3,
    max_output_tokens: int = 2048,
    expanded_query: str | None = None,
) -> str:
    """Generate a grounded answer from retrieved context chunks.

    Builds a formatted context block and passes it together with the
    query to the LLM.  When *expanded_query* differs from *query* it is
    included as an interpretation hint so the LLM can connect typos /
    abbreviations with the actual terms found in the context.
    """
    provider = _get_provider(settings)

    # Build context block
    context_parts: list[str] = []
    for i, chunk in enumerate(context_chunks, 1):
        meta = chunk.get("metadata", {})
        source_info = ""
        if meta.get("title"):
            source_info += f" | Title: {meta['title']}"
        if meta.get("platform"):
            source_info += f" | Source: {meta['platform']}"
        if meta.get("url"):
            source_info += f" | URL: {meta['url']}"

        similarity = chunk.get("similarity", 0)
        context_parts.append(
            f"[Chunk {i}{source_info} | Relevance: {similarity:.2f}]\n"
            f"{chunk['chunk_text']}"
        )

    context_block = "\n\n---\n\n".join(context_parts)

    # Include an interpretation hint when the query was expanded
    interpretation_hint = ""
    if expanded_query and expanded_query != query:
        interpretation_hint = (
            f"\n\n## Query Interpretation\n\n"
            f"The user typed \"{query}\" which likely refers to: {expanded_query}. "
            f"Use this interpretation to connect the question with the retrieved context."
        )

    user_message = (
        f"## Retrieved Context\n\n{context_block}\n\n"
        f"---{interpretation_hint}\n\n"
        f"## User Question\n\n{query}"
    )

    try:
        return await provider.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_message,
            temperature=temperature,
            max_tokens=max_output_tokens,
            json_mode=False,
        )
    except Exception as exc:
        logger.error("RAG answer generation failed: %s", exc)
        raise RuntimeError(f"Answer generation failed: {exc}") from exc


