"""API integration tests for collections endpoints."""

import pytest

TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001"

SAMPLE_COLLECTION = {
    "id": "col-111",
    "user_id": TEST_USER_ID,
    "title": "My Tech Collection",
    "description": "Tech stuff",
    "icon": "folder",
    "theme": "blue",
    "is_smart": False,
    "smart_rules": {"category": "Tech"},
    "item_count": 2,
    "is_shared": False,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
}


def test_get_collections_returns_list(client, mock_db):
    """GET /api/v1/collections returns list."""
    mock_db.set_table_data("collections", [SAMPLE_COLLECTION])

    response = client.get("/api/v1/collections")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["title"] == "My Tech Collection"


def test_get_collections_with_category_filter(client, mock_db):
    """GET /api/v1/collections?category=Tech filters."""
    tech_collection = {**SAMPLE_COLLECTION, "smart_rules": {"category": "Tech"}}
    mock_db.set_table_data("collections", [tech_collection])

    response = client.get("/api/v1/collections?category=Tech")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["smart_rules"].get("category") == "Tech"


def test_get_collection_by_id_returns_one(client, mock_db):
    """GET /api/v1/collections/{id} returns one collection."""
    mock_db.set_table_data("collections", [SAMPLE_COLLECTION])

    response = client.get(f"/api/v1/collections/{SAMPLE_COLLECTION['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == SAMPLE_COLLECTION["id"]
    assert data["title"] == "My Tech Collection"


def test_get_collection_by_id_returns_404(client, mock_db):
    """GET /api/v1/collections/{id} returns 404."""
    mock_db.set_table_data("collections", [])

    response = client.get("/api/v1/collections/nonexistent-id")
    assert response.status_code == 404


def test_post_collections_creates(client, mock_db):
    """POST /api/v1/collections creates collection (status 201 or 200)."""
    new_collection = {
        **SAMPLE_COLLECTION,
        "id": "col-new",
        "title": "New Collection",
    }
    mock_db.set_table_data("collections", [], insert_data=[new_collection])

    response = client.post(
        "/api/v1/collections",
        json={"title": "New Collection", "description": "A new collection"},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["title"] == "New Collection"


def test_patch_collection_updates(client, mock_db):
    """PATCH /api/v1/collections/{id} updates."""
    updated = {**SAMPLE_COLLECTION, "title": "Updated Title"}
    mock_db.set_table_data("collections", [updated])

    response = client.patch(
        f"/api/v1/collections/{SAMPLE_COLLECTION['id']}",
        json={"title": "Updated Title"},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"


def test_delete_collection_deletes(client, mock_db):
    """DELETE /api/v1/collections/{id} deletes."""
    mock_db.set_table_data("collections", [SAMPLE_COLLECTION])

    response = client.delete(
        f"/api/v1/collections/{SAMPLE_COLLECTION['id']}",
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 204


def test_get_collection_items_returns_items(client, mock_db):
    """GET /api/v1/collections/{id}/items returns items."""
    content_item = {
        "id": "cont-1",
        "user_id": TEST_USER_ID,
        "url": "https://example.com/1",
        "title": "Item 1",
        "platform": "web",
        "content_type": "article",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }
    mock_db.set_table_data(
        "collection_items",
        [{"added_at": "2024-01-01T00:00:00Z", "content": content_item}],
    )

    response = client.get(f"/api/v1/collections/{SAMPLE_COLLECTION['id']}/items")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["title"] == "Item 1"


def test_post_collection_items_adds_item(client, mock_db):
    """POST /api/v1/collections/{id}/items adds item."""
    mock_db.set_table_data("collection_items", [])
    mock_db.set_rpc_data("increment_collection_count", [])

    response = client.post(
        f"/api/v1/collections/{SAMPLE_COLLECTION['id']}/items",
        json={"content_id": "cont-1"},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data.get("success") is True


def test_delete_collection_item_removes_item(client, mock_db):
    """DELETE /api/v1/collections/{id}/items/{cid} removes item."""
    mock_db.set_table_data("collection_items", [])
    mock_db.set_rpc_data("decrement_collection_count", [])

    response = client.delete(
        f"/api/v1/collections/{SAMPLE_COLLECTION['id']}/items/cont-1",
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 204
