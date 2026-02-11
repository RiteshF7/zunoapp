"""Auto-detect platform and content type from a URL.

Used by:
- ``app/routers/content.py``  — on content creation (before DB insert).
- ``app/routers/ai.py``       — during AI processing (fallback).
"""

from __future__ import annotations

import re

# ── Platform detection (domain → platform slug) ─────────────────────────
_PLATFORM_PATTERNS: list[tuple[str, str]] = [
    ("instagram.com", "instagram"),
    ("youtube.com", "youtube"),
    ("youtu.be", "youtube"),
    ("twitter.com", "twitter"),
    ("x.com", "twitter"),
    ("facebook.com", "facebook"),
    ("fb.com", "facebook"),
    ("linkedin.com", "linkedin"),
    ("tiktok.com", "tiktok"),
    ("reddit.com", "reddit"),
    ("pinterest.com", "pinterest"),
    ("spotify.com", "spotify"),
    ("medium.com", "medium"),
]

# ── Content-type detection rules ─────────────────────────────────────────
# Platform-level defaults (entire platform always produces one type)
_PLATFORM_TYPE_MAP: dict[str, str] = {
    "youtube": "video",
    "tiktok": "video",
    "spotify": "podcast",
    "pinterest": "image",
}

# URL-path patterns → content type (checked in order, first match wins)
_URL_TYPE_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"/reel(s)?/", re.I), "video"),
    (re.compile(r"/shorts/", re.I), "video"),
    (re.compile(r"/video/", re.I), "video"),
    (re.compile(r"/watch", re.I), "video"),
    (re.compile(r"/stories/", re.I), "video"),
    (re.compile(r"/live/", re.I), "video"),
    (re.compile(r"/podcast/", re.I), "podcast"),
    (re.compile(r"/episode/", re.I), "podcast"),
    (re.compile(r"/gallery/", re.I), "image"),
    (re.compile(r"/photo/", re.I), "image"),
    (re.compile(r"\.(jpg|jpeg|png|gif|webp|svg)(\?|$)", re.I), "image"),
    (re.compile(r"/article/", re.I), "article"),
    (re.compile(r"/blog/", re.I), "article"),
    (re.compile(r"/post/", re.I), "post"),
    (re.compile(r"/comments/", re.I), "post"),
]

# Social platforms where the default type is "post" (when no URL pattern matches)
_SOCIAL_PLATFORMS: set[str] = {
    "instagram", "twitter", "facebook", "reddit", "linkedin",
}


def detect_platform(url: str) -> str:
    """Detect the platform from a URL's domain.

    Returns a platform slug (e.g. ``"youtube"``, ``"instagram"``) or ``"other"``.
    """
    url_lower = url.lower()
    for domain, platform in _PLATFORM_PATTERNS:
        if domain in url_lower:
            return platform
    return "other"


def detect_content_type(url: str, platform: str | None = None) -> str:
    """Detect the content type from a URL and (optionally) known platform.

    Returns one of: ``"video"``, ``"article"``, ``"post"``, ``"podcast"``,
    ``"image"``, or ``"article"`` (default fallback for web content).
    """
    if platform is None:
        platform = detect_platform(url)

    # 1. Platform-level default (YouTube is always video, etc.)
    if platform in _PLATFORM_TYPE_MAP:
        return _PLATFORM_TYPE_MAP[platform]

    # 2. URL-path pattern matching
    for pattern, content_type in _URL_TYPE_PATTERNS:
        if pattern.search(url):
            return content_type

    # 3. Social platforms default to "post"
    if platform in _SOCIAL_PLATFORMS:
        return "post"

    # 4. Default fallback
    return "article"


def detect_platform_and_type(url: str) -> tuple[str, str]:
    """Detect both platform and content type from a URL.

    Returns ``(platform, content_type)`` — e.g. ``("instagram", "video")``.
    """
    platform = detect_platform(url)
    content_type = detect_content_type(url, platform)
    return platform, content_type
