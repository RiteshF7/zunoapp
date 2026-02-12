"""API integration tests for the goals router."""

import pytest

from tests.conftest import TEST_USER_ID

_TS = "2024-01-01T00:00:00Z"


def test_list_goals_returns_goals(client, mock_db, auth_headers):
    """GET /api/v1/goals returns list of goals."""
    goals = [
        {"id": "g1", "user_id": TEST_USER_ID, "title": "Learn Python", "status": "active", "created_at": _TS, "updated_at": _TS},
        {"id": "g2", "user_id": TEST_USER_ID, "title": "Read books", "status": "active", "created_at": _TS, "updated_at": _TS},
    ]
    mock_db.set_table_data("user_goals", goals)

    res = client.get("/api/v1/goals", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["title"] == "Learn Python"
    assert data[1]["title"] == "Read books"


def test_list_goals_filters_by_status_active(client, mock_db, auth_headers):
    """GET /api/v1/goals?status=active filters goals."""
    goals = [
        {"id": "g1", "user_id": TEST_USER_ID, "title": "A", "status": "active", "created_at": _TS, "updated_at": _TS},
        {"id": "g2", "user_id": TEST_USER_ID, "title": "B", "status": "active", "created_at": _TS, "updated_at": _TS},
    ]
    mock_db.set_table_data("user_goals", goals)

    res = client.get("/api/v1/goals?status=active", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert all(g["status"] == "active" for g in data)


def test_list_goals_invalid_status_returns_400(client, mock_db, auth_headers):
    """GET /api/v1/goals?status=invalid returns 400."""
    mock_db.set_table_data("user_goals", [])

    res = client.get("/api/v1/goals?status=invalid", headers=auth_headers)
    assert res.status_code == 400
    assert "Invalid status" in res.json()["detail"]


def test_get_goal_detail_returns_goal_with_steps(client, mock_db, auth_headers):
    """GET /api/v1/goals/{id} returns goal detail with steps."""
    goal = {"id": "g1", "user_id": TEST_USER_ID, "title": "Learn Python", "status": "active", "created_at": _TS, "updated_at": _TS}
    steps = [
        {"id": "s1", "goal_id": "g1", "title": "Step 1", "is_completed": False, "created_at": _TS, "updated_at": _TS},
    ]
    mock_db.set_table_data("user_goals", [goal])
    mock_db.add_table_response("user_goals", [])
    mock_db.set_table_data("goal_steps", steps)

    res = client.get("/api/v1/goals/g1", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "g1"
    assert data["title"] == "Learn Python"
    assert "steps" in data
    assert len(data["steps"]) == 1
    assert data["steps"][0]["title"] == "Step 1"


def test_get_goal_detail_returns_404(client, mock_db, auth_headers):
    """GET /api/v1/goals/{id} returns 404 when not found."""
    mock_db.set_table_data("user_goals", [])

    res = client.get("/api/v1/goals/nonexistent", headers=auth_headers)
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_patch_goal_updates_goal(client, mock_db, auth_headers):
    """PATCH /api/v1/goals/{id} updates goal."""
    goal = {"id": "g1", "user_id": TEST_USER_ID, "title": "Old", "status": "active", "created_at": _TS, "updated_at": _TS}
    updated = {"id": "g1", "user_id": TEST_USER_ID, "title": "New", "status": "active", "created_at": _TS, "updated_at": _TS}
    mock_db.set_table_data("user_goals", [goal])
    mock_db.add_table_response("user_goals", [updated])

    res = client.patch(
        "/api/v1/goals/g1",
        headers=auth_headers,
        json={"title": "New"},
    )
    assert res.status_code == 200
    assert res.json()["title"] == "New"


def test_delete_goal_deletes(client, mock_db, auth_headers):
    """DELETE /api/v1/goals/{id} deletes goal."""
    goal = {"id": "g1", "user_id": TEST_USER_ID, "title": "To delete", "created_at": _TS, "updated_at": _TS}
    mock_db.set_table_data("user_goals", [goal])

    res = client.delete("/api/v1/goals/g1", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert "deleted" in res.json()["message"].lower()


def test_patch_goal_step_toggles_step(client, mock_db, auth_headers):
    """PATCH /api/v1/goals/{id}/steps/{step_id} toggles step completion."""
    goal = {"id": "g1", "user_id": TEST_USER_ID, "created_at": _TS, "updated_at": _TS}
    step = {"id": "s1", "goal_id": "g1", "title": "Step", "is_completed": False, "created_at": _TS, "updated_at": _TS}
    updated_step = {**step, "is_completed": True}
    mock_db.set_table_data("user_goals", [goal])
    mock_db.set_table_data("goal_steps", [step])
    mock_db.add_table_response("goal_steps", [updated_step])

    res = client.patch(
        "/api/v1/goals/g1/steps/s1",
        headers=auth_headers,
        json={"is_completed": True},
    )
    assert res.status_code == 200
    assert res.json()["is_completed"] is True


def test_post_consolidate_triggers_task(client, mock_db, auth_headers):
    """POST /api/v1/goals/consolidate triggers background task."""
    mock_db.set_table_data("user_goals", [])

    res = client.post("/api/v1/goals/consolidate", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert "Consolidation" in res.json()["message"]


def test_get_suggestions_returns_suggestions(client, mock_db, auth_headers):
    """GET /api/v1/goals/suggestions returns merge suggestions."""
    suggestions = [
        {
            "id": "sg1",
            "user_id": TEST_USER_ID,
            "status": "pending",
            "suggested_parent_title": "Learn things",
            "child_goal_ids": ["g1", "g2"],
            "created_at": _TS,
            "updated_at": _TS,
        },
    ]
    mock_db.set_table_data("goal_merge_suggestions", suggestions)

    res = client.get("/api/v1/goals/suggestions", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["id"] == "sg1"


def test_post_suggestions_accept_applies(client, mock_db, auth_headers):
    """POST /api/v1/goals/suggestions/{id}/accept applies consolidation."""
    from unittest.mock import AsyncMock, patch

    with patch(
        "app.routers.goals.apply_consolidation",
        new_callable=AsyncMock,
        return_value={"id": "parent-goal-1"},
    ):
        res = client.post(
            "/api/v1/goals/suggestions/sg1/accept",
            headers=auth_headers,
        )
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["parent_goal_id"] == "parent-goal-1"


def test_post_suggestions_dismiss_dismisses(client, mock_db, auth_headers):
    """POST /api/v1/goals/suggestions/{id}/dismiss dismisses suggestion."""
    from unittest.mock import AsyncMock, patch

    with patch(
        "app.routers.goals.dismiss_consolidation",
        new_callable=AsyncMock,
        return_value=None,
    ):
        res = client.post(
            "/api/v1/goals/suggestions/sg1/dismiss",
            headers=auth_headers,
        )
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert "dismissed" in res.json()["message"].lower()
