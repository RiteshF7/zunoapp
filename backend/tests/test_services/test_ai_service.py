"""Unit tests for app/services/ai_service.py."""

from __future__ import annotations

from unittest.mock import patch, AsyncMock, MagicMock
import pytest

from app.config import Settings
from app.services import ai_service


def _test_settings(with_gcp: bool = True) -> Settings:
    s = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-jwt-secret-that-is-at-least-32-chars-long",
        gcp_project_id="test-gcp-project" if with_gcp else "",
        gcp_location="us-central1",
    )
    return s


@pytest.fixture(autouse=True)
def reset_provider_instance():
    """Reset _provider_instance before and after each test."""
    ai_service._provider_instance = None
    yield
    ai_service._provider_instance = None


@pytest.mark.asyncio
async def test_process_with_ai_raises_runtime_error_when_no_gcp_project_id():
    """process_with_ai raises RuntimeError if no gcp_project_id."""
    settings = _test_settings(with_gcp=False)
    with pytest.raises(RuntimeError, match="No AI provider configured"):
        await ai_service.process_with_ai("Some text", settings)


@pytest.mark.asyncio
async def test_generate_embedding_returns_none_when_no_gcp_project_id():
    """generate_embedding returns None if no gcp_project_id."""
    settings = _test_settings(with_gcp=False)
    result = await ai_service.generate_embedding("Some text", settings)
    assert result is None


@pytest.mark.asyncio
async def test_process_with_ai_success_with_mocked_provider():
    """process_with_ai returns normalized result when provider is configured."""
    settings = _test_settings(with_gcp=True)
    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"category": "Tech", "tldr": "Summary", "tags": ["python"]}'
    )
    mock_provider.generate_embedding = AsyncMock(return_value=[0.1] * 768)

    with patch.object(ai_service, "_get_provider", return_value=mock_provider):
        result = await ai_service.process_with_ai("Article about Python", settings)

    assert result["category"] == "Tech"
    assert result["summary"] == "Summary"
    assert result["tags"] == ["python"]
    assert result["embedding"] == [0.1] * 768
    assert "structured_content" in result


@pytest.mark.asyncio
async def test_expand_query_returns_original_on_failure():
    """expand_query returns original query on failure."""
    settings = _test_settings(with_gcp=True)
    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(side_effect=Exception("API error"))

    with patch.object(ai_service, "_get_provider", return_value=mock_provider):
        result = await ai_service.expand_query("typo qurey", settings)

    assert result == "typo qurey"


@pytest.mark.asyncio
async def test_expand_query_returns_expanded_when_success():
    """expand_query returns expanded query when AI succeeds."""
    settings = _test_settings(with_gcp=True)
    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(return_value="typo query")

    with patch.object(ai_service, "_get_provider", return_value=mock_provider):
        result = await ai_service.expand_query("typo qurey", settings)

    assert result == "typo query"


@pytest.mark.asyncio
async def test_expand_query_returns_original_when_no_gcp():
    """expand_query returns original when no gcp_project_id."""
    settings = _test_settings(with_gcp=False)
    result = await ai_service.expand_query("some query", settings)
    assert result == "some query"


@pytest.mark.asyncio
async def test_generate_query_embedding_returns_none_when_no_gcp():
    """generate_query_embedding returns None when no gcp_project_id."""
    settings = _test_settings(with_gcp=False)
    result = await ai_service.generate_query_embedding("query", settings)
    assert result is None


@pytest.mark.asyncio
async def test_generate_embeddings_batch_returns_empty_for_empty_list():
    """generate_embeddings_batch returns [] for empty texts."""
    settings = _test_settings(with_gcp=True)
    result = await ai_service.generate_embeddings_batch([], settings)
    assert result == []


@pytest.mark.asyncio
async def test_generate_embeddings_batch_calls_provider():
    """generate_embeddings_batch delegates to provider."""
    settings = _test_settings(with_gcp=True)
    mock_provider = MagicMock()
    mock_provider.generate_embeddings_batch = AsyncMock(
        return_value=[[0.1] * 768, [0.2] * 768]
    )

    with patch.object(ai_service, "_get_provider", return_value=mock_provider):
        result = await ai_service.generate_embeddings_batch(
            ["chunk1", "chunk2"], settings
        )

    assert len(result) == 2
    mock_provider.generate_embeddings_batch.assert_called_once()


@pytest.mark.asyncio
async def test_generate_rag_answer_builds_context_and_returns_answer():
    """generate_rag_answer builds context block and returns LLM response."""
    settings = _test_settings(with_gcp=True)
    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(return_value="Generated answer here.")

    chunks = [
        {
            "chunk_text": "Relevant content.",
            "metadata": {"title": "Doc1", "url": "https://example.com"},
            "similarity": 0.9,
        }
    ]

    with patch.object(ai_service, "_get_provider", return_value=mock_provider):
        result = await ai_service.generate_rag_answer(
            "What is X?",
            chunks,
            "Answer based on context.",
            settings,
        )

    assert result == "Generated answer here."
    call_args = mock_provider.generate_text.call_args
    assert "Relevant content." in call_args[1]["user_prompt"]
    assert "What is X?" in call_args[1]["user_prompt"]
