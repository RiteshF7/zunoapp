"""Collections CRUD + collection items."""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import (
    CollectionOut,
    CollectionCreate,
    CollectionUpdate,
    CollectionItemAdd,
    ContentOut,
)
from app.utils.rate_limit import limiter, RATE_READ, RATE_WRITE
from app.utils.cache import cache, bust_cache

router = APIRouter(prefix="/collections", tags=["collections"])


# ---------------------------------------------------------------------------
# Categories (must be above /{collection_id} to avoid route conflict)
# ---------------------------------------------------------------------------
@router.get("/categories")
@limiter.limit(RATE_READ)
async def list_categories(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Return distinct AI categories the user has content in (cached 15 min)."""
    return await _list_categories_cached(user_id=user_id, db=db)


@cache(ttl=900, prefix="categories", key="{user_id}")
async def _list_categories_cached(user_id: str = "", db: Client = None):
    """Inner cached function for user categories."""
    result = (
        db.table("content")
        .select("ai_category")
        .eq("user_id", user_id)
        .eq("ai_processed", True)
        .not_.is_("ai_category", "null")
        .execute()
    )
    # Deduplicate and sort
    categories = sorted(
        {row["ai_category"] for row in (result.data or []) if row.get("ai_category")}
    )
    return categories


# ---------------------------------------------------------------------------
# Collections CRUD
# ---------------------------------------------------------------------------
@router.get("", response_model=list[CollectionOut])
@limiter.limit(RATE_READ)
async def list_collections(
    request: Request,
    category: str | None = Query(None, description="Filter by AI category (smart_rules->>'category')"),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """List all collections for the current user, optionally filtered by AI category."""
    query = (
        db.table("collections")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
    )

    if category:
        query = query.filter("smart_rules->>category", "eq", category)

    result = query.execute()
    return result.data or []


@router.get("/{collection_id}", response_model=CollectionOut)
@limiter.limit(RATE_READ)
async def get_collection(
    request: Request,
    collection_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get a single collection."""
    result = (
        db.table("collections")
        .select("*")
        .eq("id", collection_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Collection not found")
    return result.data


@router.post("", response_model=CollectionOut, status_code=201)
@limiter.limit(RATE_WRITE)
async def create_collection(
    request: Request,
    body: CollectionCreate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Create a new collection."""
    payload = body.model_dump(exclude_none=True)
    payload["user_id"] = user_id

    result = db.table("collections").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create collection")
    return result.data[0]


@router.patch("/{collection_id}", response_model=CollectionOut)
@limiter.limit(RATE_WRITE)
async def update_collection(
    request: Request,
    collection_id: str,
    body: CollectionUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Update a collection."""
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        db.table("collections")
        .update(updates)
        .eq("id", collection_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Collection not found")
    return result.data[0]


@router.delete("/{collection_id}", status_code=204)
@limiter.limit(RATE_WRITE)
async def delete_collection(
    request: Request,
    collection_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Delete a collection."""
    db.table("collections").delete().eq("id", collection_id).eq(
        "user_id", user_id
    ).execute()
    return None


# ---------------------------------------------------------------------------
# Collection Items
# ---------------------------------------------------------------------------
@router.get("/{collection_id}/items", response_model=list[ContentOut])
@limiter.limit(RATE_READ)
async def get_collection_items(
    request: Request,
    collection_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get content items in a collection, sorted by most recently added."""
    result = (
        db.table("collection_items")
        .select("added_at, content:content_id (*)")
        .eq("collection_id", collection_id)
        .order("added_at", desc=True)
        .execute()
    )
    # Flatten: extract the nested content object from each join row
    items = []
    for row in result.data or []:
        content = row.get("content")
        if content:
            items.append(content)
    return items


@router.post("/{collection_id}/items", status_code=201)
@limiter.limit(RATE_WRITE)
async def add_item_to_collection(
    request: Request,
    collection_id: str,
    body: CollectionItemAdd,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Add a content item to a collection and increment the count."""
    db.table("collection_items").insert(
        {"collection_id": collection_id, "content_id": body.content_id}
    ).execute()

    # Increment item count via RPC
    db.rpc("increment_collection_count", {"collection_id": collection_id}).execute()
    return {"success": True}


@router.delete("/{collection_id}/items/{content_id}", status_code=204)
@limiter.limit(RATE_WRITE)
async def remove_item_from_collection(
    request: Request,
    collection_id: str,
    content_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Remove a content item from a collection and decrement the count."""
    db.table("collection_items").delete().eq("collection_id", collection_id).eq(
        "content_id", content_id
    ).execute()

    # Decrement item count via RPC
    db.rpc("decrement_collection_count", {"collection_id": collection_id}).execute()
    return None
