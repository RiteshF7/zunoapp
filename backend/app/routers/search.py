"""Search endpoints: FTS, hybrid, tag-based, popular tags."""

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.config import Settings, get_settings
from app.schemas.models import SearchResultOut, PopularTagOut
from app.services.openai_service import generate_embedding

router = APIRouter(tags=["search"])


@router.get("/api/search", response_model=list[SearchResultOut])
async def full_text_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Full-text search via the search_content RPC."""
    result = db.rpc(
        "search_content",
        {"query_text": q, "match_count": limit},
    ).execute()
    return result.data or []


@router.get("/api/search/hybrid", response_model=list[SearchResultOut])
async def hybrid_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Hybrid search (full-text + semantic). Falls back to FTS if embedding fails."""
    embedding = await generate_embedding(q, settings)

    if embedding is None:
        # Fallback to full-text search
        result = db.rpc(
            "search_content",
            {"query_text": q, "match_count": limit},
        ).execute()
        return result.data or []

    result = db.rpc(
        "hybrid_search",
        {"query_text": q, "query_embedding": embedding, "match_count": limit},
    ).execute()
    return result.data or []


@router.get("/api/search/tag/{slug}", response_model=list[SearchResultOut])
async def search_by_tag(
    slug: str,
    limit: int = Query(50, ge=1, le=200),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Tag-based search via the search_by_tag RPC."""
    result = db.rpc(
        "search_by_tag",
        {"tag_slug": slug, "match_count": limit},
    ).execute()
    return result.data or []


@router.get("/api/tags/popular")
async def get_popular_tags(
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get popular tags ordered by usage_count."""
    result = (
        db.table("tags")
        .select("name, slug, usage_count")
        .order("usage_count", desc=True)
        .limit(limit)
        .execute()
    )
    return [
        {"name": t["name"], "slug": t["slug"], "count": t["usage_count"]}
        for t in (result.data or [])
    ]
