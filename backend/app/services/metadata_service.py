"""URL metadata scraping — extract OG tags, title, description, thumbnail, body text."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

import httpx
from bs4 import BeautifulSoup, Comment

logger = logging.getLogger(__name__)

# Maximum characters of body text to extract (keeps AI API costs reasonable)
_MAX_BODY_CHARS = 8000

# Tags whose content is never visible text
_INVISIBLE_TAGS = frozenset(
    {"script", "style", "noscript", "iframe", "svg", "head", "meta", "link"}
)


@dataclass
class UrlMetadata:
    title: str | None = None
    description: str | None = None
    thumbnail: str | None = None
    body_text: str | None = None
    author: str | None = None
    site_name: str | None = None
    og_type: str | None = None
    keywords: str | None = None


async def fetch_url_metadata(url: str) -> UrlMetadata:
    """Fetch and extract Open Graph / meta tags + visible body text from a URL."""
    try:
        async with httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
            headers={"User-Agent": "Zuno Content Analyzer/1.0"},
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text

        soup = BeautifulSoup(html, "html.parser")

        title = _get_og(soup, "og:title") or _get_tag_text(soup, "title")
        description = _get_og(soup, "og:description") or _get_meta(soup, "description")
        thumbnail = _get_og(soup, "og:image")
        body_text = _extract_visible_text(soup)

        # Extended metadata
        author = (
            _get_meta(soup, "author")
            or _get_og(soup, "article:author")
            or _get_meta(soup, "twitter:creator")
            or _get_meta(soup, "article:author")
        )
        site_name = (
            _get_og(soup, "og:site_name")
            or _get_meta(soup, "application-name")
        )
        og_type = _get_og(soup, "og:type")
        keywords = _get_meta(soup, "keywords")

        return UrlMetadata(
            title=title,
            description=description,
            thumbnail=thumbnail,
            body_text=body_text,
            author=author,
            site_name=site_name,
            og_type=og_type,
            keywords=keywords,
        )
    except Exception as exc:
        logger.warning("Failed to fetch metadata for %s: %s", url, exc)
        return UrlMetadata()


def _get_og(soup: BeautifulSoup, prop: str) -> str | None:
    """Extract an Open Graph meta tag value."""
    tag = soup.find("meta", attrs={"property": prop})
    if tag and tag.get("content"):
        return tag["content"]
    # Some sites use name= instead of property=
    tag = soup.find("meta", attrs={"name": prop})
    if tag and tag.get("content"):
        return tag["content"]
    return None


def _get_meta(soup: BeautifulSoup, name: str) -> str | None:
    """Extract a regular meta tag value."""
    tag = soup.find("meta", attrs={"name": name})
    if tag and tag.get("content"):
        return tag["content"]
    return None


def _get_tag_text(soup: BeautifulSoup, tag_name: str) -> str | None:
    """Extract text content from an HTML tag."""
    tag = soup.find(tag_name)
    return tag.get_text(strip=True) if tag else None


def _extract_visible_text(soup: BeautifulSoup) -> str | None:
    """Extract visible body text, stripping scripts/styles/nav chrome.

    Returns up to ``_MAX_BODY_CHARS`` characters of cleaned text, or *None*
    if nothing meaningful is found.
    """
    # Remove invisible elements in-place so get_text ignores them
    for tag in soup.find_all(_INVISIBLE_TAGS):
        tag.decompose()
    # Remove HTML comments
    for comment in soup.find_all(string=lambda t: isinstance(t, Comment)):
        comment.extract()

    # Prefer <article> or <main> if present — they hold the actual content
    body = soup.find("article") or soup.find("main") or soup.find("body")
    if body is None:
        return None

    raw = body.get_text(separator="\n", strip=True)

    # Collapse excessive whitespace / blank lines
    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    text = "\n".join(lines)

    if len(text) < 50:
        return None  # too short to be useful

    return text[:_MAX_BODY_CHARS]
