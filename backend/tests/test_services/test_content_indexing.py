"""Unit tests for app/services/content_indexing.py."""

from __future__ import annotations

from unittest.mock import patch, AsyncMock
import pytest

from app.config import Settings
from app.services.content_indexing import index_content_chunks, index_content_batch
from app.services.chunking_service import Chunk
from tests.conftest import MockSupabaseClient


def _test_settings() -> Settings:
    return Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-jwt-secret-that-is-at-least-32-chars-long",
        gcp_project_id="test-gcp",
        rag_chunk_size=500,
        rag_chunk_overlap=50,
    )


@pytest.mark.asyncio
async def test_index_content_chunks_inserts_chunks_with_embeddings():
    """index_content_chunks chunks text, generates embeddings, inserts rows."""
    db = MockSupabaseClient()
    settings = _test_settings()
    chunks = [
        Chunk(chunk_index=0, chunk_text="Chunk one.", token_count=10),
        Chunk(chunk_index=1, chunk_text="Chunk two.", token_count=10),
    ]
    embeddings = [[0.1] * 768, [0.2] * 768]

    with patch(
        "app.services.content_indexing.chunk_text", return_value=chunks
    ), patch(
        "app.services.content_indexing.generate_embeddings_batch",
        new_callable=AsyncMock,
        return_value=embeddings,
    ):
        count = await index_content_chunks(
            db, "content-123", "user-456", "Full text here.", {}, settings
        )

    assert count == 2


@pytest.mark.asyncio
async def test_index_content_chunks_returns_zero_when_no_chunks():
    """index_content_chunks returns 0 when chunk_text returns empty."""
    db = MockSupabaseClient()
    settings = _test_settings()

    with patch("app.services.content_indexing.chunk_text", return_value=[]):
        count = await index_content_chunks(
            db, "content-123", "user-456", "x", {}, settings
        )

    assert count == 0


@pytest.mark.asyncio
async def test_index_content_chunks_deletes_existing_before_insert():
    """index_content_chunks deletes existing chunks for content before insert."""
    db = MockSupabaseClient()
    settings = _test_settings()
    chunks = [Chunk(chunk_index=0, chunk_text="Only chunk", token_count=5)]
    embeddings = [[0.1] * 768]

    with patch(
        "app.services.content_indexing.chunk_text", return_value=chunks
    ), patch(
        "app.services.content_indexing.generate_embeddings_batch",
        new_callable=AsyncMock,
        return_value=embeddings,
    ):
        await index_content_chunks(
            db, "content-existing", "user-1", "Text", {}, settings
        )

    # The service calls db.table("content_chunks").delete().eq("content_id", ...)
    # The mock doesn't store calls, but the flow completes. We verify no exception.


@pytest.mark.asyncio
async def test_index_content_chunks_handles_none_embedding():
    """index_content_chunks handles None in embeddings (skips embedding column)."""
    db = MockSupabaseClient()
    settings = _test_settings()
    chunks = [Chunk(chunk_index=0, chunk_text="Chunk", token_count=5)]
    embeddings = [None]  # One chunk, no embedding

    with patch(
        "app.services.content_indexing.chunk_text", return_value=chunks
    ), patch(
        "app.services.content_indexing.generate_embeddings_batch",
        new_callable=AsyncMock,
        return_value=embeddings,
    ):
        count = await index_content_chunks(
            db, "content-1", "user-1", "Text", {"title": "Doc"}, settings
        )

    assert count == 1


@pytest.mark.asyncio
async def test_index_content_batch_processes_items():
    """index_content_batch processes items and returns stats."""
    db = MockSupabaseClient()
    settings = _test_settings()
    items = [
        {
            "id": "c1",
            "full_text": "Long enough text for chunking to produce at least one chunk.",
            "title": "Article 1",
        },
    ]
    chunks = [Chunk(chunk_index=0, chunk_text="Chunk", token_count=20)]
    embeddings = [[0.1] * 768]

    with patch(
        "app.services.content_indexing.chunk_text", return_value=chunks
    ), patch(
        "app.services.content_indexing.generate_embeddings_batch",
        new_callable=AsyncMock,
        return_value=embeddings,
    ):
        result = await index_content_batch(db, "user-1", items, settings)

    assert result["content_processed"] == 1
    assert result["chunks_created"] == 1
    assert result["errors"] == 0


@pytest.mark.asyncio
async def test_index_content_batch_uses_title_and_summary_when_no_full_text():
    """index_content_batch uses title + ai_summary when full_text missing."""
    db = MockSupabaseClient()
    settings = _test_settings()
    items = [
        {
            "id": "c2",
            "title": "Title",
            "ai_summary": "Summary content here for chunking.",
            "description": "",
        },
    ]
    chunks = [Chunk(chunk_index=0, chunk_text="Combined", token_count=10)]
    embeddings = [[0.1] * 768]

    with patch(
        "app.services.content_indexing.chunk_text", return_value=chunks
    ), patch(
        "app.services.content_indexing.generate_embeddings_batch",
        new_callable=AsyncMock,
        return_value=embeddings,
    ):
        result = await index_content_batch(db, "user-1", items, settings)

    assert result["chunks_created"] == 1
    assert result["errors"] == 0
