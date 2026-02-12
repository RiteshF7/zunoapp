"""Vertex AI provider — implements AIProvider using the Vertex AI SDK.

Handles:
- Text generation via Gemini (GenerativeModel).
- Single and batch embedding generation (TextEmbeddingModel).
- Lazy SDK initialization (only when first called).
- Thread-pool execution for synchronous SDK calls.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from app.config import Settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# SDK initialization (lazy, one-time)
# ---------------------------------------------------------------------------
_initialized = False


def _ensure_init(settings: Settings) -> None:
    """Initialize the Vertex AI SDK once."""
    global _initialized
    if _initialized:
        return

    import vertexai
    from google.oauth2 import service_account

    init_kwargs: dict[str, Any] = {
        "project": settings.gcp_project_id,
        "location": settings.gcp_location,
    }

    # Use explicit service-account JSON when provided; fall back to ADC.
    # Supports: file path (string) or inline JSON (env var paste, starts with '{')
    if settings.gcp_credentials_json:
        import json as _json

        raw = settings.gcp_credentials_json.strip()
        if raw.startswith("{"):
            info = _json.loads(raw)
            creds = service_account.Credentials.from_service_account_info(
                info,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )
        else:
            creds = service_account.Credentials.from_service_account_file(
                raw,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )
        init_kwargs["credentials"] = creds

    vertexai.init(**init_kwargs)
    _initialized = True
    logger.info(
        "Vertex AI initialized: project=%s, location=%s",
        settings.gcp_project_id,
        settings.gcp_location,
    )


# ---------------------------------------------------------------------------
# VertexAIProvider
# ---------------------------------------------------------------------------
class VertexAIProvider:
    """AIProvider implementation backed by Google Vertex AI."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    # ------------------------------------------------------------------
    # Text generation
    # ------------------------------------------------------------------
    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: float = 0.3,
        max_tokens: int = 2048,
        json_mode: bool = False,
    ) -> str:
        """Generate text using Gemini via Vertex AI."""
        _ensure_init(self._settings)

        from vertexai.generative_models import GenerationConfig, GenerativeModel

        model = GenerativeModel(
            model_name=self._settings.vertex_llm_model,
            system_instruction=system_prompt,
        )

        config_kwargs: dict[str, Any] = {
            "temperature": temperature,
            "max_output_tokens": max_tokens,
            "top_p": 0.95,
        }
        if json_mode:
            config_kwargs["response_mime_type"] = "application/json"

        config = GenerationConfig(**config_kwargs)

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content(user_prompt, generation_config=config),
        )
        return response.text

    # ------------------------------------------------------------------
    # Single embedding
    # ------------------------------------------------------------------
    async def generate_embedding(
        self,
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
    ) -> list[float] | None:
        """Generate a single embedding vector (768-dim)."""
        result = await self.generate_embeddings_batch(
            [text], task_type=task_type, batch_size=1,
        )
        return result[0] if result else None

    # ------------------------------------------------------------------
    # Batch embeddings
    # ------------------------------------------------------------------
    async def generate_embeddings_batch(
        self,
        texts: list[str],
        task_type: str = "RETRIEVAL_DOCUMENT",
        batch_size: int = 250,
    ) -> list[list[float] | None]:
        """Generate embeddings for a list of texts via Vertex AI.

        The SDK is synchronous, so calls run in a thread pool.
        """
        if not texts:
            return []

        _ensure_init(self._settings)

        from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

        model = TextEmbeddingModel.from_pretrained(
            self._settings.vertex_embedding_model,
        )

        all_embeddings: list[list[float] | None] = [None] * len(texts)

        for batch_start in range(0, len(texts), batch_size):
            batch_end = min(batch_start + batch_size, len(texts))
            batch_texts = texts[batch_start:batch_end]

            try:
                inputs = [
                    TextEmbeddingInput(text=t, task_type=task_type)
                    for t in batch_texts
                ]
                loop = asyncio.get_event_loop()
                embeddings = await loop.run_in_executor(
                    None, lambda inp=inputs: model.get_embeddings(inp),
                )
                for i, emb in enumerate(embeddings):
                    all_embeddings[batch_start + i] = emb.values

            except Exception as exc:
                logger.error(
                    "Vertex AI batch embedding failed (batch %d-%d): %s",
                    batch_start, batch_end, exc,
                )
                # Leave those entries as None

        return all_embeddings
