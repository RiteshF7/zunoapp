"""Pydantic request/response models matching the Supabase schema."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Standard error response
# ---------------------------------------------------------------------------
class ErrorResponse(BaseModel):
    """Standardised error envelope returned by all error handlers."""
    error: str
    code: str
    detail: str | None = None
    request_id: str | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list with metadata."""
    items: list[T]
    total: int
    limit: int
    offset: int
    has_more: bool


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
    ai_structured_content: dict[str, Any] | None = None
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


class ContentCreateText(BaseModel):
    """Schema for saving plain text shared from another app (no URL)."""
    title: str | None = None
    source_text: str
    description: str | None = None
    platform: str = "other"
    content_type: str = "note"


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


# ---------------------------------------------------------------------------
# User Preferences (per-user config)
# ---------------------------------------------------------------------------
class UserPreferencesOut(BaseModel):
    id: str
    user_id: str
    feed_type: str = "usersaved"  # "usersaved" | "suggestedcontent"
    created_at: str
    updated_at: str


class UserPreferencesUpdate(BaseModel):
    feed_type: str | None = None  # "usersaved" | "suggestedcontent"


# ---------------------------------------------------------------------------
# Suggested Feed
# ---------------------------------------------------------------------------
class SuggestedContentOut(ContentOut):
    """A content item from another user's shared collection, with relevance score."""
    relevance_score: float = 0.0


# ---------------------------------------------------------------------------
# Knowledge Engine (RAG)
# ---------------------------------------------------------------------------
class KnowledgeQueryRequest(BaseModel):
    """Request body for the RAG query endpoint."""
    query: str = Field(..., min_length=1, max_length=2000)
    top_k: int = Field(8, ge=1, le=30)
    format: str = "default"  # "default" | "summary" | "list" | "detailed"
    include_sources: bool = True


class KnowledgeSourceOut(BaseModel):
    """A source reference returned alongside a RAG answer."""
    content_id: str
    title: str | None = None
    platform: str | None = None
    url: str | None = None
    timestamp: str | None = None
    chunk_text: str | None = None
    relevance_score: float | None = None


class KnowledgeQueryResponse(BaseModel):
    """Response from the RAG query endpoint."""
    answer: str
    sources: list[KnowledgeSourceOut] = []
    chunks_used: int = 0


class ReindexRequest(BaseModel):
    """Optional filters for the reindex endpoint."""
    content_ids: list[str] | None = None  # None = reindex all


class ReindexResponse(BaseModel):
    """Response from the reindex endpoint."""
    content_processed: int = 0
    chunks_created: int = 0
    errors: int = 0
    message: str = ""


class KnowledgeStatsOut(BaseModel):
    """Knowledge base statistics for a user."""
    total_chunks: int = 0
    indexed_content: int = 0
    total_processed_content: int = 0
    needs_reindex: int = 0


# ---------------------------------------------------------------------------
# Generic status message
# ---------------------------------------------------------------------------
class StatusMessage(BaseModel):
    """Simple status response for background tasks."""
    status: str = "ok"
    message: str = ""


# ---------------------------------------------------------------------------
# Goals
# ---------------------------------------------------------------------------
class GoalStepOut(BaseModel):
    """A single step within a goal."""
    id: str
    goal_id: str
    step_index: int = 0
    title: str
    description: str = ""
    source_content_ids: list[str] = []
    is_completed: bool = False
    completed_at: str | None = None
    created_at: str
    updated_at: str


class GoalOut(BaseModel):
    """Goal summary (without steps — used in list views)."""
    id: str
    user_id: str
    title: str
    description: str = ""
    category: str = ""
    status: str = "active"
    confidence: float = 0.5
    evidence_content_ids: list[str] = []
    parent_goal_id: str | None = None
    created_at: str
    updated_at: str


class GoalDetailOut(GoalOut):
    """Goal with all steps included."""
    steps: list[GoalStepOut] = []
    ai_reasoning: str = ""
    children: list[GoalOut] = []


class GoalUpdate(BaseModel):
    """Updatable fields for a goal."""
    title: str | None = None
    description: str | None = None
    status: str | None = None  # "active" | "completed" | "dismissed"


class GoalStepUpdate(BaseModel):
    """Toggle step completion."""
    is_completed: bool


# ---------------------------------------------------------------------------
# Goal Consolidation (merge suggestions)
# ---------------------------------------------------------------------------
class GoalMergeSuggestionOut(BaseModel):
    """A pending AI-suggested goal merge."""
    id: str
    user_id: str
    suggested_parent_title: str
    suggested_parent_description: str = ""
    suggested_parent_category: str = ""
    child_goal_ids: list[str] = []
    ai_reasoning: str = ""
    new_steps: list[dict[str, Any]] = []
    status: str = "pending"
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# App Config (global — same for all users)
# ---------------------------------------------------------------------------
class FeatureFlags(BaseModel):
    """Toggle features on/off without an app update."""
    feed_enabled: bool = True
    vfeed_enabled: bool = False
    ai_processing_enabled: bool = True
    search_enabled: bool = True
    collections_enabled: bool = True
    share_enabled: bool = True


class ContentLimits(BaseModel):
    """Dynamic limits for user content."""
    max_saves: int = 500
    max_collections: int = 50
    max_tags_per_content: int = 10


class FeedSettings(BaseModel):
    """Tunable feed behaviour."""
    page_size: int = 20
    refresh_interval_seconds: int = 300
    max_feed_items: int = 200


class AppLinks(BaseModel):
    """Deep-links / external URLs the app may need."""
    terms_url: str = "https://zuno.app/terms"
    privacy_url: str = "https://zuno.app/privacy"
    support_url: str = "https://zuno.app/support"
    app_store_url: str = ""
    play_store_url: str = ""


class AppConfigOut(BaseModel):
    """Top-level config payload returned at app startup."""
    app_version: str = "1.0.0"
    min_supported_version: str = "1.0.0"
    maintenance_mode: bool = False
    maintenance_message: str | None = None
    feature_flags: FeatureFlags = Field(default_factory=FeatureFlags)
    content_limits: ContentLimits = Field(default_factory=ContentLimits)
    feed_settings: FeedSettings = Field(default_factory=FeedSettings)
    app_links: AppLinks = Field(default_factory=AppLinks)
    supported_platforms: list[str] = Field(
        default_factory=lambda: [
            "youtube", "instagram", "x", "reddit",
            "tiktok", "spotify", "web",
        ]
    )
