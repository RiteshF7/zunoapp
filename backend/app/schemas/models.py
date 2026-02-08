"""Pydantic request/response models matching the Supabase schema."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------
class ProfileOut(BaseModel):
    id: str
    display_name: str | None = None
    avatar_url: str | None = None
    phone: str | None = None
    email: str | None = None
    created_at: str
    updated_at: str


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None


# ---------------------------------------------------------------------------
# Collections
# ---------------------------------------------------------------------------
class CollectionOut(BaseModel):
    id: str
    user_id: str
    title: str
    description: str | None = None
    icon: str = "folder"
    theme: str = "blue"
    is_smart: bool = False
    smart_rules: dict[str, Any] | None = None
    item_count: int = 0
    is_shared: bool = False
    created_at: str
    updated_at: str


class CollectionCreate(BaseModel):
    title: str
    description: str | None = None
    icon: str = "folder"
    theme: str = "blue"
    is_smart: bool = False
    smart_rules: dict[str, Any] | None = None


class CollectionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    icon: str | None = None
    theme: str | None = None
    is_smart: bool | None = None
    smart_rules: dict[str, Any] | None = None
    is_shared: bool | None = None


class CollectionItemAdd(BaseModel):
    content_id: str


# ---------------------------------------------------------------------------
# Content
# ---------------------------------------------------------------------------
class ContentOut(BaseModel):
    id: str
    user_id: str
    url: str
    title: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    platform: str = "other"
    content_type: str = "post"
    ai_category: str | None = None
    ai_summary: str | None = None
    ai_processed: bool = False
    source_metadata: dict[str, Any] | None = None
    created_at: str
    updated_at: str


class ContentCreate(BaseModel):
    url: str
    title: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    platform: str = "other"
    content_type: str = "post"


class ContentUpdate(BaseModel):
    url: str | None = None
    title: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    platform: str | None = None
    content_type: str | None = None
    ai_category: str | None = None
    ai_summary: str | None = None


class TagOut(BaseModel):
    id: str
    name: str
    slug: str
    is_ai_generated: bool


class ContentWithTagsOut(ContentOut):
    content_tags: list[dict[str, Any]] | None = None


# ---------------------------------------------------------------------------
# Feed
# ---------------------------------------------------------------------------
class FeedItemOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    image_url: str | None = None
    source_url: str
    category: str | None = None
    content_type: str = "article"
    platform: str = "other"
    likes: int = 0
    relevance_score: float | None = None
    reason: str | None = None
    created_at: str


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------
class SearchResultOut(BaseModel):
    id: str
    url: str
    title: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    platform: str
    content_type: str
    ai_category: str | None = None
    ai_summary: str | None = None
    created_at: str
    rank: float | None = None
    combined_score: float | None = None


class PopularTagOut(BaseModel):
    name: str
    slug: str
    count: int = Field(alias="usage_count", default=0)

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# AI
# ---------------------------------------------------------------------------
class ProcessContentRequest(BaseModel):
    content_id: str


class ProcessContentResponse(BaseModel):
    success: bool
    category: str | None = None
    summary: str | None = None
    tags: list[str] = []


class GenerateEmbeddingRequest(BaseModel):
    text: str


class GenerateEmbeddingResponse(BaseModel):
    embedding: list[float]


class GenerateFeedResponse(BaseModel):
    items: list[FeedItemOut]
    interests: list[list[Any]] | None = None
    message: str | None = None
