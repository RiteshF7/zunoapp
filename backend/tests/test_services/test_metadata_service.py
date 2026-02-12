"""Unit tests for app/services/metadata_service.py."""

from __future__ import annotations

from unittest.mock import patch, AsyncMock, MagicMock
import pytest

from app.services.metadata_service import fetch_url_metadata, UrlMetadata


@pytest.mark.asyncio
async def test_extracts_og_title_description_image():
    """Extracts OG title, description, image from meta tags."""
    html = """
    <html>
    <head>
        <meta property="og:title" content="My Article Title" />
        <meta property="og:description" content="Short description here" />
        <meta property="og:image" content="https://example.com/thumb.png" />
    </head>
    <body><p>Body with enough text to pass the fifty character minimum threshold.</p></body>
    </html>
    """
    mock_resp = MagicMock()
    mock_resp.text = html
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        ctx = mock_client.return_value.__aenter__.return_value
        ctx.get = AsyncMock(return_value=mock_resp)

        result = await fetch_url_metadata("https://example.com/article")

    assert result.title == "My Article Title"
    assert result.description == "Short description here"
    assert result.thumbnail == "https://example.com/thumb.png"
    assert "Body with enough text" in (result.body_text or "")


@pytest.mark.asyncio
async def test_falls_back_to_title_tag_when_no_og():
    """Falls back to <title> tag when no OG meta present."""
    html = """
    <html>
    <head><title>Fallback Page Title</title></head>
    <body><p>Body content that is long enough to exceed fifty characters for extraction.</p></body>
    </html>
    """
    mock_resp = MagicMock()
    mock_resp.text = html
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        ctx = mock_client.return_value.__aenter__.return_value
        ctx.get = AsyncMock(return_value=mock_resp)

        result = await fetch_url_metadata("https://example.com/page")

    assert result.title == "Fallback Page Title"


@pytest.mark.asyncio
async def test_extracts_body_text_from_article_tag():
    """Extracts body text from <article> tag."""
    html = """
    <html><body>
    <article>
        <p>Primary article content goes here with enough characters to pass the threshold.</p>
    </article>
    <main><p>Main content that should be ignored in favor of article.</p></main>
    </body></html>
    """
    mock_resp = MagicMock()
    mock_resp.text = html
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        ctx = mock_client.return_value.__aenter__.return_value
        ctx.get = AsyncMock(return_value=mock_resp)

        result = await fetch_url_metadata("https://example.com/article")

    assert result.body_text is not None
    assert "Primary article content" in result.body_text
    assert "Main content that should be ignored" not in result.body_text


@pytest.mark.asyncio
async def test_falls_back_to_main_then_body_for_text():
    """Falls back to <main> then <body> for text extraction."""
    html = """
    <html><body>
    <main><p>Main section content with enough characters for the body text threshold.</p></main>
    </body></html>
    """
    mock_resp = MagicMock()
    mock_resp.text = html
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        ctx = mock_client.return_value.__aenter__.return_value
        ctx.get = AsyncMock(return_value=mock_resp)

        result = await fetch_url_metadata("https://example.com/page")

    assert result.body_text is not None
    assert "Main section content" in result.body_text


@pytest.mark.asyncio
async def test_removes_script_style_elements():
    """Removes script/style elements from extracted text."""
    html = """
    <html><body>
    <script>var x = 1;</script>
    <style>.cls { color: red; }</style>
    <p>Actual paragraph content that is long enough to pass the fifty character minimum.</p>
    </body></html>
    """
    mock_resp = MagicMock()
    mock_resp.text = html
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        ctx = mock_client.return_value.__aenter__.return_value
        ctx.get = AsyncMock(return_value=mock_resp)

        result = await fetch_url_metadata("https://example.com/page")

    assert result.body_text is not None
    assert "var x = 1" not in result.body_text
    assert ".cls" not in result.body_text
    assert "Actual paragraph content" in result.body_text


@pytest.mark.asyncio
async def test_returns_empty_url_metadata_on_timeout():
    """Returns empty UrlMetadata on timeout."""
    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(
            side_effect=Exception("Connection timeout")
        )
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)

        result = await fetch_url_metadata("https://example.com/slow")

    assert result == UrlMetadata()
    assert result.title is None
    assert result.description is None
    assert result.thumbnail is None
    assert result.body_text is None


@pytest.mark.asyncio
async def test_returns_empty_url_metadata_on_http_error():
    """Returns empty UrlMetadata on HTTP error."""
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock(side_effect=Exception("404 Not Found"))

    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        ctx = mock_client.return_value.__aenter__.return_value
        ctx.get = AsyncMock(return_value=mock_resp)

        result = await fetch_url_metadata("https://example.com/404")

    assert result == UrlMetadata()
    assert result.title is None
    assert result.body_text is None


@pytest.mark.asyncio
async def test_truncates_body_text_returns_none_if_under_50_chars():
    """body_text is None if content is under 50 chars."""
    html = """
    <html><body><p>Short.</p></body></html>
    """
    mock_resp = MagicMock()
    mock_resp.text = html
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.metadata_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        ctx = mock_client.return_value.__aenter__.return_value
        ctx.get = AsyncMock(return_value=mock_resp)

        result = await fetch_url_metadata("https://example.com/short")

    assert result.body_text is None
