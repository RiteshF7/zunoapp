"""Collections CRUD + collection items."""

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import (
    CollectionOut,
    CollectionCreate,
    CollectionUpdate,
    CollectionItemAdd,
)

router = APIRouter(prefix="/api/collections", tags=["collections"])


# ---------------------------------------------------------------------------
# Categories (must be above /{collection_id} to avoid route conflict)
# ---------------------------------------------------------------------------
@router.get("/categories")
async def list_categories(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Return distinct AI categories the user has content in."""
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
async def list_collections(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """List all collections for the current user."""
    result = (
        db.table("collections")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/{collection_id}", response_model=CollectionOut)
async def get_collection(
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
async def create_collection(
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
async def update_collection(
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
async def delete_collection(
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
@router.get("/{collection_id}/items")
async def get_collection_items(
    collection_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get items in a collection with joined content."""
    result = (
        db.table("collection_items")
        .select("added_at, content:content_id (*)")
        .eq("collection_id", collection_id)
        .order("added_at", desc=True)
        .execute()
    )
    return result.data or []


@router.post("/{collection_id}/items", status_code=201)
async def add_item_to_collection(
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
async def remove_item_from_collection(
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
