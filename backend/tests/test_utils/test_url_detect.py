"""Unit tests for app.utils.url_detect module."""

from __future__ import annotations

import pytest

from app.utils.url_detect import (
    detect_platform,
    detect_content_type,
    detect_platform_and_type,
)


# ---------------------------------------------------------------------------
# Platform detection (detect_platform)
# ---------------------------------------------------------------------------

def test_detect_platform_instagram():
    assert detect_platform("https://instagram.com/p/ABC123") == "instagram"
    assert detect_platform("https://www.instagram.com/reel/xyz") == "instagram"


def test_detect_platform_youtube():
    assert detect_platform("https://www.youtube.com/watch?v=abc") == "youtube"
    assert detect_platform("https://youtu.be/abc123") == "youtube"


def test_detect_platform_twitter():
    assert detect_platform("https://twitter.com/user/status/123") == "twitter"
    assert detect_platform("https://x.com/user/status/456") == "twitter"


def test_detect_platform_facebook():
    assert detect_platform("https://facebook.com/post/123") == "facebook"
    assert detect_platform("https://fb.com/something") == "facebook"


def test_detect_platform_linkedin_tiktok_reddit_pinterest():
    assert detect_platform("https://linkedin.com/in/user") == "linkedin"
    assert detect_platform("https://tiktok.com/@user/video/123") == "tiktok"
    assert detect_platform("https://reddit.com/r/sub/comments/123") == "reddit"
    assert detect_platform("https://pinterest.com/pin/123") == "pinterest"


def test_detect_platform_spotify_medium():
    assert detect_platform("https://open.spotify.com/episode/123") == "spotify"
    assert detect_platform("https://medium.com/@user/article-title") == "medium"


def test_detect_platform_unknown_domain():
    assert detect_platform("https://example.com/page") == "other"
    assert detect_platform("https://random-blog.org/post/1") == "other"


def test_detect_platform_case_insensitive():
    assert detect_platform("https://INSTAGRAM.com/p/1") == "instagram"
    assert detect_platform("https://YouTube.COM/watch?v=x") == "youtube"
    assert detect_platform("https://X.COM/user") == "twitter"


# ---------------------------------------------------------------------------
# Content type detection (detect_content_type)
# ---------------------------------------------------------------------------

def test_detect_content_type_platform_defaults():
    """YouTube/TikTok -> video, Spotify -> podcast, Pinterest -> image."""
    assert detect_content_type("https://youtube.com/watch?v=1") == "video"
    assert detect_content_type("https://tiktok.com/@u/v/1") == "video"
    assert detect_content_type("https://spotify.com/episode/1") == "podcast"
    assert detect_content_type("https://pinterest.com/pin/1") == "image"


def test_detect_content_type_url_patterns():
    assert detect_content_type("https://instagram.com/reels/abc", "instagram") == "video"
    assert detect_content_type("https://x.com/user/status/1/shorts/", "twitter") == "video"
    assert detect_content_type("https://example.com/podcast/episode-1") == "podcast"
    assert detect_content_type("https://example.com/article/my-blog") == "article"
    assert detect_content_type("https://example.com/blog/post-title") == "article"
    assert detect_content_type("https://example.com/photo/image.jpg") == "image"
    assert detect_content_type("https://cdn.example.com/thumb.png?size=large") == "image"


def test_detect_content_type_social_defaults_to_post():
    """Instagram, Twitter, Facebook, Reddit, LinkedIn default to 'post' when no URL pattern."""
    assert detect_content_type("https://instagram.com/p/ABC123", "instagram") == "post"
    assert detect_content_type("https://twitter.com/user/status/1", "twitter") == "post"
    assert detect_content_type("https://facebook.com/post/1", "facebook") == "post"
    assert detect_content_type("https://reddit.com/r/sub/comments/1", "reddit") == "post"
    assert detect_content_type("https://linkedin.com/feed/update/1", "linkedin") == "post"


def test_detect_content_type_fallback_to_article():
    """Unknown platforms and medium default to article."""
    assert detect_content_type("https://example.com/random-page") == "article"
    assert detect_content_type("https://medium.com/@user/some-post", "medium") == "article"


def test_detect_content_type_auto_detects_platform_when_none():
    """When platform is None, detect_content_type infers it from URL."""
    assert detect_content_type("https://youtube.com/watch?v=1") == "video"
    assert detect_content_type("https://instagram.com/reels/abc") == "video"


# ---------------------------------------------------------------------------
# Combined (detect_platform_and_type)
# ---------------------------------------------------------------------------

def test_detect_platform_and_type():
    assert detect_platform_and_type("https://youtube.com/watch?v=1") == ("youtube", "video")
    assert detect_platform_and_type("https://instagram.com/reels/abc") == ("instagram", "video")
    assert detect_platform_and_type("https://twitter.com/user/status/1") == ("twitter", "post")
    assert detect_platform_and_type("https://example.com/blog/my-article") == ("other", "article")
