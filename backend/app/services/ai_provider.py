"""AIProvider Protocol — abstract interface for AI backends.

Defines the contract that any AI provider (Vertex AI, OpenAI, AWS Bedrock,
etc.) must implement.  The rest of the application talks only to this
interface via the facade in ai_service.py, so swapping providers means
writing a single new class — no router / config changes required.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable


@runtime_checkable
class AIProvider(Protocol):
    """Contract every AI backend must fulfil."""

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
        """Generate text from the LLM.

        Parameters
        ----------
        system_prompt : str
            System-level instruction for the model.
        user_prompt : str
            User message / content to process.
        temperature : float
            Sampling temperature.
        max_tokens : int
            Maximum output tokens.
        json_mode : bool
            When True the provider MUST return valid JSON.

        Returns
        -------
        str
            The raw text (or JSON string) returned by the model.
        """
        ...

    # ------------------------------------------------------------------
    # Single embedding
    # ------------------------------------------------------------------
    async def generate_embedding(
        self,
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
    ) -> list[float] | None:
        """Generate a single embedding vector.

        Parameters
        ----------
        text : str
            Text to embed.
        task_type : str
            Hint for the embedding model.  Common values:
            ``"RETRIEVAL_DOCUMENT"`` (default), ``"RETRIEVAL_QUERY"``.

        Returns
        -------
        list[float] | None
            Embedding vector, or None on failure.
        """
        ...

    # ------------------------------------------------------------------
    # Batch embeddings
    # ------------------------------------------------------------------
    async def generate_embeddings_batch(
        self,
        texts: list[str],
        task_type: str = "RETRIEVAL_DOCUMENT",
        batch_size: int = 250,
    ) -> list[list[float] | None]:
        """Generate embeddings for a list of texts.

        Parameters
        ----------
        texts : list[str]
            Texts to embed.
        task_type : str
            Hint for the embedding model.
        batch_size : int
            Maximum texts per underlying API call.

        Returns
        -------
        list[list[float] | None]
            Embedding vectors in the same order as *texts*.
            ``None`` entries indicate failure for that text.
        """
        ...
