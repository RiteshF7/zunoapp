"""URL metadata scraping — extract OG tags, title, description, thumbnail."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class UrlMetadata:
    title: str | None = None
    description: str | None = None
    thumbnail: str | None = None


async def fetch_url_metadata(url: str) -> UrlMetadata:
    """Fetch and extract Open Graph / meta tags from a URL."""
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

        return UrlMetadata(title=title, description=description, thumbnail=thumbnail)
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
