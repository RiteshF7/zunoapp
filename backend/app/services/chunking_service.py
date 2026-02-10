"""Text chunking service for RAG pipeline.

Splits long text into manageable chunks (~500 tokens) with configurable
overlap for embedding and retrieval.  Uses sentence-aware splitting to
avoid breaking mid-sentence.
"""

from __future__ import annotations

import re
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Approximate token counting (avoids heavy tokenizer dependency)
# ---------------------------------------------------------------------------
# English text averages ~0.75 tokens/word with most embedding models.
# Using 1.33 words/token (inverse) for a safe estimate.
_CHARS_PER_TOKEN = 4  # conservative: 1 token ≈ 4 chars for English text


def _estimate_tokens(text: str) -> int:
    """Estimate token count from character length (fast, no external deps)."""
    return max(1, len(text) // _CHARS_PER_TOKEN)


# ---------------------------------------------------------------------------
# Sentence splitting
# ---------------------------------------------------------------------------
# Regex that splits on sentence boundaries while keeping the delimiter
_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")
# Paragraph boundary
_PARAGRAPH_RE = re.compile(r"\n{2,}")


def _split_into_sentences(text: str) -> list[str]:
    """Split text into sentences / natural segments."""
    # First split by paragraphs, then by sentences within each paragraph
    segments: list[str] = []
    paragraphs = _PARAGRAPH_RE.split(text.strip())
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        sentences = _SENTENCE_RE.split(para)
        for sent in sentences:
            sent = sent.strip()
            if sent:
                segments.append(sent)
    return segments


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
@dataclass
class Chunk:
    """A single text chunk with metadata."""
    chunk_index: int
    chunk_text: str
    token_count: int


def chunk_text(
    text: str,
    max_tokens: int = 500,
    overlap_tokens: int = 50,
) -> list[Chunk]:
    """Split text into overlapping chunks of approximately ``max_tokens`` each.

    Strategy:
    1. Split text into sentences.
    2. Greedily accumulate sentences until the token budget is reached.
    3. Store the chunk and rewind by ``overlap_tokens`` worth of sentences
       to create overlap with the next chunk.

    Parameters
    ----------
    text : str
        The full text to chunk.
    max_tokens : int
        Target maximum tokens per chunk (approximate).
    overlap_tokens : int
        Number of tokens of overlap between consecutive chunks.

    Returns
    -------
    list[Chunk]
        Ordered list of chunks with index, text, and estimated token count.
    """
    if not text or not text.strip():
        return []

    sentences = _split_into_sentences(text)
    if not sentences:
        return []

    # If total text is small enough, return as a single chunk
    total_tokens = _estimate_tokens(text)
    if total_tokens <= max_tokens:
        return [Chunk(chunk_index=0, chunk_text=text.strip(), token_count=total_tokens)]

    chunks: list[Chunk] = []
    current_sentences: list[str] = []
    current_tokens = 0
    chunk_idx = 0

    i = 0
    while i < len(sentences):
        sent = sentences[i]
        sent_tokens = _estimate_tokens(sent)

        # If a single sentence exceeds max_tokens, force-split it by characters
        if sent_tokens > max_tokens and not current_sentences:
            _force_split_long_sentence(sent, max_tokens, overlap_tokens, chunks, chunk_idx)
            chunk_idx = len(chunks)
            i += 1
            continue

        # Would adding this sentence exceed the budget?
        if current_tokens + sent_tokens > max_tokens and current_sentences:
            # Flush current chunk
            chunk_text_str = " ".join(current_sentences)
            chunks.append(Chunk(
                chunk_index=chunk_idx,
                chunk_text=chunk_text_str,
                token_count=_estimate_tokens(chunk_text_str),
            ))
            chunk_idx += 1

            # Rewind for overlap: keep trailing sentences worth ~overlap_tokens
            overlap_sents: list[str] = []
            overlap_tok = 0
            for s in reversed(current_sentences):
                s_tok = _estimate_tokens(s)
                if overlap_tok + s_tok > overlap_tokens:
                    break
                overlap_sents.insert(0, s)
                overlap_tok += s_tok

            current_sentences = overlap_sents
            current_tokens = overlap_tok
            # Don't increment i — re-process this sentence in the new chunk
            continue

        current_sentences.append(sent)
        current_tokens += sent_tokens
        i += 1

    # Flush remaining sentences
    if current_sentences:
        chunk_text_str = " ".join(current_sentences)
        chunks.append(Chunk(
            chunk_index=chunk_idx,
            chunk_text=chunk_text_str,
            token_count=_estimate_tokens(chunk_text_str),
        ))

    logger.info(
        "Chunked %d tokens into %d chunks (max=%d, overlap=%d)",
        total_tokens, len(chunks), max_tokens, overlap_tokens,
    )
    return chunks


def _force_split_long_sentence(
    sentence: str,
    max_tokens: int,
    overlap_tokens: int,
    chunks: list[Chunk],
    start_idx: int,
) -> None:
    """Force-split a very long sentence by character boundaries."""
    max_chars = max_tokens * _CHARS_PER_TOKEN
    overlap_chars = overlap_tokens * _CHARS_PER_TOKEN
    idx = start_idx
    pos = 0
    while pos < len(sentence):
        end = min(pos + max_chars, len(sentence))
        fragment = sentence[pos:end].strip()
        if fragment:
            chunks.append(Chunk(
                chunk_index=idx,
                chunk_text=fragment,
                token_count=_estimate_tokens(fragment),
            ))
            idx += 1
        pos = end - overlap_chars if end < len(sentence) else end
