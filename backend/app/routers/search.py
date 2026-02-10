"""Search endpoints: FTS, hybrid, tag-based, popular tags."""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.config import Settings, get_settings
from app.schemas.models import SearchResultOut, PopularTagOut
from app.services.ai_service import generate_query_embedding
from app.utils.rate_limit import limiter, RATE_SEARCH, RATE_READ
from app.utils.cache import cache

router = APIRouter(tags=["search"])


@router.get("/api/search", response_model=list[SearchResultOut])
@limiter.limit(RATE_SEARCH)
async def full_text_search(
    request: Request,
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
@limiter.limit(RATE_SEARCH)
async def hybrid_search(
    request: Request,
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Hybrid search (full-text + semantic). Falls back to FTS if embedding fails."""
    embedding = await generate_query_embedding(q, settings)

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
@limiter.limit(RATE_SEARCH)
async def search_by_tag(
    request: Request,
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
@limiter.limit(RATE_READ)
async def get_popular_tags(
    request: Request,
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get popular tags ordered by usage_count (cached for 10 minutes)."""
    return await _get_popular_tags_cached(limit=limit, db=db)


@cache(ttl=600, prefix="popular_tags", key="{limit}")
async def _get_popular_tags_cached(
    limit: int = 20,
    db: Client = None,
):
    """Inner cached function for popular tags."""
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
