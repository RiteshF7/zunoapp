"""Unit tests for app.services.chunking_service module."""

from __future__ import annotations

import pytest

from app.services.chunking_service import chunk_text, Chunk

# _CHARS_PER_TOKEN = 4 for estimation
_CHARS_PER_TOKEN = 4


# ---------------------------------------------------------------------------
# Basic behavior
# ---------------------------------------------------------------------------

def test_empty_text_returns_empty_list():
    assert chunk_text("") == []
    assert chunk_text("   ") == []
    assert chunk_text("\n\n\t\n") == []


def test_short_text_returns_single_chunk():
    text = "Hello world. This is short."
    chunks = chunk_text(text, max_tokens=500)
    assert len(chunks) == 1
    assert chunks[0].chunk_text == text.strip()
    assert chunks[0].chunk_index == 0


def test_long_text_splits_into_multiple_chunks():
    # ~25 chars * 10 sentences = 250 chars -> ~62 tokens, under 500
    # Need more: 500 tokens * 4 = 2000 chars. Use many sentences.
    sentences = [f"Sentence number {i} is here." for i in range(80)]
    text = " ".join(sentences)
    chunks = chunk_text(text, max_tokens=100, overlap_tokens=10)
    assert len(chunks) >= 2
    # Total content should be preserved (allowing for overlap)
    all_text = " ".join(c.chunk_text for c in chunks)
    for s in sentences[:5]:  # At least first few should appear
        assert s in all_text or s.replace(" ", "") in all_text.replace(" ", "")


def test_chunks_have_correct_indices():
    sentences = [f"Sentence {i}." for i in range(100)]
    text = " ".join(sentences)
    chunks = chunk_text(text, max_tokens=50, overlap_tokens=5)
    for i, c in enumerate(chunks):
        assert c.chunk_index == i


def test_chunk_dataclass_fields():
    """Chunk has chunk_text, chunk_index, token_count."""
    text = "One sentence."
    chunks = chunk_text(text)
    assert len(chunks) == 1
    c = chunks[0]
    assert hasattr(c, "chunk_text")
    assert hasattr(c, "chunk_index")
    assert hasattr(c, "token_count")
    assert c.chunk_text == "One sentence."
    assert c.chunk_index == 0
    assert c.token_count >= 1


# ---------------------------------------------------------------------------
# Sentence-aware splitting
# ---------------------------------------------------------------------------

def test_sentence_aware_splitting():
    """Chunks break at sentence boundaries, not mid-sentence."""
    text = "First sentence here. Second sentence there. Third one."
    chunks = chunk_text(text, max_tokens=5, overlap_tokens=1)
    for c in chunks:
        # Chunk boundaries should be at sentence ends (periods)
        # Each chunk should end with period or be complete
        assert c.chunk_text
        # No chunk should break mid-sentence (e.g. "here. Sec" would be bad)
        if len(chunks) > 1:
            for chunk in chunks[:-1]:
                if "." in chunk.chunk_text:
                    assert chunk.chunk_text.strip().endswith(".")


# ---------------------------------------------------------------------------
# Overlap
# ---------------------------------------------------------------------------

def test_overlap_between_consecutive_chunks():
    """Consecutive chunks share overlap_tokens worth of content."""
    sentences = [f"This is sentence number {i} with some words." for i in range(50)]
    text = " ".join(sentences)
    chunks = chunk_text(text, max_tokens=30, overlap_tokens=8)
    if len(chunks) < 2:
        pytest.skip("Text too short for multiple chunks")
    # Last part of chunk 0 should appear at start of chunk 1
    end_of_first = chunks[0].chunk_text.split()[-5:]
    start_of_second = chunks[1].chunk_text.split()[:10]
    overlap_found = any(w in start_of_second for w in end_of_first)
    assert overlap_found or len(chunks) == 1


# ---------------------------------------------------------------------------
# Force-split long sentences
# ---------------------------------------------------------------------------

def test_force_split_very_long_sentence():
    """Very long sentence with no periods gets force-split by chars."""
    # No periods - one long string. 500 tokens * 4 = 2000 chars
    long_run = "a" * 2500
    chunks = chunk_text(long_run, max_tokens=100, overlap_tokens=10)
    assert len(chunks) >= 2
    for c in chunks:
        assert len(c.chunk_text) <= 500  # ~100 tokens * 4 chars


# ---------------------------------------------------------------------------
# Custom parameters
# ---------------------------------------------------------------------------

def test_custom_max_tokens():
    text = "A. B. C. D. E. F. G. H. I. J."
    chunks_small = chunk_text(text, max_tokens=5, overlap_tokens=0)
    chunks_large = chunk_text(text, max_tokens=500, overlap_tokens=0)
    assert len(chunks_small) >= len(chunks_large)
    assert len(chunks_large) == 1


def test_custom_overlap_tokens():
    sentences = [f"Sentence {i}." for i in range(60)]
    text = " ".join(sentences)
    chunks_no_overlap = chunk_text(text, max_tokens=80, overlap_tokens=0)
    chunks_with_overlap = chunk_text(text, max_tokens=80, overlap_tokens=15)
    # With overlap, we get more chunks (because we rewind and re-process)
    assert len(chunks_with_overlap) >= len(chunks_no_overlap)
