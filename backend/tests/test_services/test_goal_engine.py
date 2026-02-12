"""Unit tests for app/services/goal_engine.py."""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from unittest.mock import patch, AsyncMock, MagicMock

import pytest

from app.config import Settings
from app.services import goal_engine
from app.services.goal_engine import (
    analyze_and_update_goals,
    check_and_suggest_consolidation,
    apply_consolidation,
    dismiss_consolidation,
    _DEBOUNCE_SECONDS,
    _MIN_GOALS_FOR_CONSOLIDATION,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def test_settings():
    """Settings with gcp_project_id empty (for skip test)."""
    return Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-service-role-key",
        supabase_jwt_secret="test-jwt-secret-that-is-at-least-32-chars-long",
        gcp_project_id="",
        gcp_location="us-central1",
        backend_port=8000,
        cors_origins="http://localhost:3000",
    )


@pytest.fixture
def test_settings_with_ai(test_settings):
    """Settings with gcp_project_id set for active AI tests."""
    test_settings.gcp_project_id = "test-project"
    return test_settings


@pytest.fixture
def mock_db():
    """Mock Supabase client."""
    return MagicMock()


@pytest.fixture
def new_content():
    """Sample new content dict."""
    return {
        "id": "content-123",
        "title": "Learn Python Basics",
        "url": "https://example.com/python",
        "platform": "youtube",
        "content_type": "video",
    }


@pytest.fixture
def ai_result():
    """Sample AI result with embedding."""
    return {
        "category": "Tech",
        "tags": ["python", "programming"],
        "summary": "Intro to Python",
        "embedding": [0.1] * 768,
        "structured_content": {"tldr": "TLDR", "key_points": []},
    }


# ---------------------------------------------------------------------------
# analyze_and_update_goals
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_analyze_and_update_goals_skips_when_no_gcp_project_id(
    mock_db, test_settings, new_content, ai_result
):
    """analyze_and_update_goals skips when no gcp_project_id."""
    await analyze_and_update_goals(
        mock_db, "user-1", new_content, ai_result, test_settings
    )
    mock_db.table.assert_not_called()


@pytest.mark.asyncio
async def test_analyze_and_update_goals_debounce_skips_when_recently_ran(
    mock_db, test_settings_with_ai, new_content, ai_result
):
    """analyze_and_update_goals with debounce skips when last run < 30s ago."""
    recent_time = (datetime.now(timezone.utc) - timedelta(seconds=10)).isoformat()
    personality = {"updated_at": recent_time, "summary": "test"}

    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock()

    with (
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=personality,
        ),
        patch("app.services.goal_engine._get_provider", return_value=mock_provider),
    ):
        await analyze_and_update_goals(
            mock_db, "user-1", new_content, ai_result, test_settings_with_ai
        )

    # AI provider should not be called (debounced)
    mock_provider.generate_text.assert_not_called()


@pytest.mark.asyncio
async def test_analyze_and_update_goals_skip_debounce_bypasses(
    mock_db, test_settings_with_ai, new_content, ai_result
):
    """analyze_and_update_goals with skip_debounce=True bypasses debounce."""
    recent_time = (datetime.now(timezone.utc) - timedelta(seconds=5)).isoformat()
    personality = {"updated_at": recent_time, "summary": "test"}

    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"personality_update": null, "goal_changes": []}'
    )

    with (
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=personality,
        ),
        patch.object(
            goal_engine,
            "_fetch_active_goals",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_recent_content",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_similar_content",
            return_value=[],
        ),
        patch("app.services.goal_engine._get_provider", return_value=mock_provider),
    ):
        await analyze_and_update_goals(
            mock_db,
            "user-1",
            new_content,
            ai_result,
            test_settings_with_ai,
            skip_debounce=True,
        )

    mock_provider.generate_text.assert_called_once()


@pytest.mark.asyncio
async def test_analyze_and_update_goals_calls_ai_and_applies_updates(
    mock_db, test_settings_with_ai, new_content, ai_result
):
    """analyze_and_update_goals calls AI and applies updates."""
    personality = None
    active_goals = []
    similar_content = []
    recent_content = []

    ai_response = {
        "personality_update": {"summary": "Tech enthusiast"},
        "goal_changes": [
            {
                "action": "create",
                "title": "Master Python",
                "description": "Learn Python",
                "category": "Tech",
                "confidence": 0.8,
            }
        ],
    }

    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"personality_update": {"summary": "Tech enthusiast"}, "goal_changes": [{"action": "create", "title": "Master Python", "description": "Learn Python", "category": "Tech", "confidence": 0.8}]}'
    )

    apply_personality_calls = []

    def capture_apply_personality(db, user_id, update, content_id):
        apply_personality_calls.append((user_id, update))

    with (
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=personality,
        ),
        patch.object(
            goal_engine,
            "_fetch_active_goals",
            return_value=active_goals,
        ),
        patch.object(
            goal_engine,
            "_fetch_recent_content",
            return_value=recent_content,
        ),
        patch.object(
            goal_engine,
            "_fetch_similar_content",
            return_value=similar_content,
        ),
        patch("app.services.goal_engine._get_provider", return_value=mock_provider),
        patch.object(
            goal_engine,
            "_apply_personality_update",
            side_effect=capture_apply_personality,
        ),
    ):
        await analyze_and_update_goals(
            mock_db, "user-1", new_content, ai_result, test_settings_with_ai
        )

    mock_provider.generate_text.assert_called_once()
    assert len(apply_personality_calls) == 1
    assert apply_personality_calls[0][1]["summary"] == "Tech enthusiast"


@pytest.mark.asyncio
async def test_analyze_and_update_goals_handles_ai_call_failure(
    mock_db, test_settings_with_ai, new_content, ai_result
):
    """analyze_and_update_goals handles AI call failure."""
    with (
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=None,
        ),
        patch.object(
            goal_engine,
            "_fetch_active_goals",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_recent_content",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_similar_content",
            return_value=[],
        ),
        patch(
            "app.services.goal_engine._get_provider",
            return_value=MagicMock(
                generate_text=AsyncMock(side_effect=Exception("API failed"))
            ),
        ),
    ):
        with pytest.raises(Exception, match="API failed"):
            await analyze_and_update_goals(
                mock_db, "user-1", new_content, ai_result, test_settings_with_ai
            )


@pytest.mark.asyncio
async def test_analyze_and_update_goals_no_embedding_no_rag_search(
    mock_db, test_settings_with_ai, new_content
):
    """analyze_and_update_goals with no embedding skips RAG search."""
    ai_result_no_embedding = {
        "category": "Tech",
        "tags": [],
        "summary": "test",
        "structured_content": {},
    }
    assert "embedding" not in ai_result_no_embedding

    fetch_similar_called = []

    def capture_similar(db, user_id, embedding, limit, threshold, exclude):
        fetch_similar_called.append(True)
        return []

    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"personality_update": null, "goal_changes": []}'
    )

    with (
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=None,
        ),
        patch.object(
            goal_engine,
            "_fetch_active_goals",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_recent_content",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_similar_content",
            side_effect=capture_similar,
        ),
        patch("app.services.goal_engine._get_provider", return_value=mock_provider),
    ):
        await analyze_and_update_goals(
            mock_db,
            "user-1",
            new_content,
            ai_result_no_embedding,
            test_settings_with_ai,
        )

    # _fetch_similar_content should NOT be called (no embedding)
    assert len(fetch_similar_called) == 0


@pytest.mark.asyncio
async def test_analyze_and_update_goals_applies_personality_updates(
    mock_db, test_settings_with_ai, new_content, ai_result
):
    """analyze_and_update_goals applies personality updates."""
    ai_response = {
        "personality_update": {
            "summary": "Updated summary",
            "primary_interests": [{"name": "Python", "confidence": 0.9}],
        },
        "goal_changes": [],
    }

    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"personality_update": {"summary": "Updated summary", "primary_interests": [{"name": "Python", "confidence": 0.9}]}, "goal_changes": []}'
    )

    apply_calls = []

    def capture_apply(db, user_id, update, content_id):
        apply_calls.append(update)

    with (
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=None,
        ),
        patch.object(
            goal_engine,
            "_fetch_active_goals",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_recent_content",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_similar_content",
            return_value=[],
        ),
        patch("app.services.goal_engine._get_provider", return_value=mock_provider),
        patch.object(
            goal_engine,
            "_apply_personality_update",
            side_effect=capture_apply,
        ),
    ):
        await analyze_and_update_goals(
            mock_db, "user-1", new_content, ai_result, test_settings_with_ai
        )

    assert len(apply_calls) == 1
    assert apply_calls[0]["summary"] == "Updated summary"
    assert apply_calls[0]["primary_interests"][0]["name"] == "Python"


# ---------------------------------------------------------------------------
# check_and_suggest_consolidation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_check_and_suggest_consolidation_skips_with_less_than_3_goals(
    mock_db, test_settings_with_ai
):
    """check_and_suggest_consolidation skips when < 3 active goals."""
    two_goals = [
        {"id": "g1", "title": "Goal 1", "parent_goal_id": None},
        {"id": "g2", "title": "Goal 2", "parent_goal_id": None},
    ]

    with patch.object(
        goal_engine,
        "_fetch_active_goals",
        return_value=two_goals,
    ):
        result = await check_and_suggest_consolidation(
            mock_db, "user-1", test_settings_with_ai
        )

    assert result == []
    assert len(two_goals) < _MIN_GOALS_FOR_CONSOLIDATION


@pytest.mark.asyncio
async def test_check_and_suggest_consolidation_creates_suggestions(
    mock_db, test_settings_with_ai
):
    """check_and_suggest_consolidation creates suggestions."""
    three_goals = [
        {"id": "g1", "title": "Goal 1", "parent_goal_id": None},
        {"id": "g2", "title": "Goal 2", "parent_goal_id": None},
        {"id": "g3", "title": "Goal 3", "parent_goal_id": None},
    ]

    ai_response = {
        "consolidation_suggestions": [
            {
                "parent_title": "Master All",
                "parent_description": "Combine goals",
                "parent_category": "Tech",
                "child_goal_ids": ["g1", "g2"],
                "reasoning": "Related",
                "new_steps": [],
            }
        ],
    }

    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"consolidation_suggestions": [{"parent_title": "Master All", "parent_description": "Combine goals", "parent_category": "Tech", "child_goal_ids": ["g1", "g2"], "reasoning": "Related", "new_steps": []}]}'
    )

    insert_result = MagicMock()
    insert_result.data = [{"id": "sugg-1", "status": "pending"}]

    mock_table = MagicMock()
    mock_table.select.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.execute.return_value = MagicMock(data=[])
    mock_table.insert.return_value = MagicMock(execute=MagicMock(return_value=insert_result))
    mock_db.table.return_value = mock_table

    with (
        patch.object(
            goal_engine,
            "_fetch_active_goals",
            return_value=three_goals,
        ),
        patch.object(
            goal_engine,
            "_fetch_pending_suggestions",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_dismissed_suggestions",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=None,
        ),
        patch("app.services.goal_engine._get_provider", return_value=mock_provider),
    ):
        result = await check_and_suggest_consolidation(
            mock_db, "user-1", test_settings_with_ai
        )

    assert len(result) == 1
    assert result[0]["id"] == "sugg-1"


@pytest.mark.asyncio
async def test_check_and_suggest_consolidation_skips_duplicate_suggestions(
    mock_db, test_settings_with_ai
):
    """check_and_suggest_consolidation skips duplicate suggestions."""
    three_goals = [
        {"id": "g1", "title": "Goal 1", "parent_goal_id": None},
        {"id": "g2", "title": "Goal 2", "parent_goal_id": None},
        {"id": "g3", "title": "Goal 3", "parent_goal_id": None},
    ]

    # Already have pending suggestion for g1+g2
    existing_pending = [
        {"child_goal_ids": ["g1", "g2"]},
    ]

    ai_response = {
        "consolidation_suggestions": [
            {
                "parent_title": "Duplicate",
                "child_goal_ids": ["g1", "g2"],
                "reasoning": "Same",
                "new_steps": [],
            }
        ],
    }

    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"consolidation_suggestions": [{"parent_title": "Duplicate", "child_goal_ids": ["g1", "g2"], "reasoning": "Same", "new_steps": []}]}'
    )

    with (
        patch.object(
            goal_engine,
            "_fetch_active_goals",
            return_value=three_goals,
        ),
        patch.object(
            goal_engine,
            "_fetch_pending_suggestions",
            return_value=existing_pending,
        ),
        patch.object(
            goal_engine,
            "_fetch_dismissed_suggestions",
            return_value=[],
        ),
        patch.object(
            goal_engine,
            "_fetch_personality_cached",
            return_value=None,
        ),
        patch("app.services.goal_engine._get_provider", return_value=mock_provider),
    ):
        result = await check_and_suggest_consolidation(
            mock_db, "user-1", test_settings_with_ai
        )

    assert result == []
    mock_db.table.return_value.insert.assert_not_called()


# ---------------------------------------------------------------------------
# Recommendation: Mock table().insert() to avoid actual insert calls
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_apply_consolidation_creates_parent_and_links_children(
    mock_db,
):
    """apply_consolidation creates parent goal and links children."""
    suggestion = {
        "id": "sugg-1",
        "user_id": "user-1",
        "status": "pending",
        "suggested_parent_title": "Parent Goal",
        "suggested_parent_description": "Desc",
        "suggested_parent_category": "Tech",
        "child_goal_ids": ["g1", "g2"],
        "ai_reasoning": "Merge",
        "new_steps": [],
    }

    child1 = {"id": "g1", "confidence": 0.8, "evidence_content_ids": ["c1"], "steps": []}
    child2 = {"id": "g2", "confidence": 0.6, "evidence_content_ids": ["c2"], "steps": []}
    parent_goal = {"id": "parent-1", "title": "Parent Goal"}

    goals_responses = [
        MagicMock(data=[child1]),
        MagicMock(data=[child2]),
        MagicMock(data=[parent_goal]),
        MagicMock(data=[]),  # update g1
        MagicMock(data=[]),  # update g2
    ]
    goals_idx = [0]

    def goals_exec():
        r = goals_responses[min(goals_idx[0], len(goals_responses) - 1)]
        goals_idx[0] += 1
        return r

    steps_responses = [MagicMock(data=[]), MagicMock(data=[])]
    steps_idx = [0]

    def steps_exec():
        r = steps_responses[min(steps_idx[0], len(steps_responses) - 1)]
        steps_idx[0] += 1
        return r

    def table_fn(name):
        chain = MagicMock()
        chain.select.return_value = chain
        chain.eq.return_value = chain
        chain.in_.return_value = chain
        chain.neq.return_value = chain
        chain.order.return_value = chain
        chain.single.return_value = chain
        chain.limit.return_value = chain
        chain.insert.return_value = chain
        chain.update.return_value = chain

        if name == "goal_merge_suggestions":
            chain.execute.return_value = MagicMock(data=suggestion)
        elif name == "user_goals":
            chain.execute.side_effect = goals_exec
        elif name == "goal_steps":
            chain.execute.side_effect = steps_exec
        return chain

    mock_db.table.side_effect = table_fn

    result = await apply_consolidation(mock_db, "user-1", "sugg-1")

    assert result["id"] == "parent-1"
    assert result["title"] == "Parent Goal"


@pytest.mark.asyncio
async def test_dismiss_consolidation_updates_status(mock_db):
    """dismiss_consolidation updates status to dismissed."""
    update_result = MagicMock()
    update_result.data = [{"id": "sugg-1", "status": "dismissed"}]

    chain = MagicMock()
    chain.eq.return_value = chain
    chain.execute.return_value = update_result
    mock_db.table.return_value.update.return_value = chain

    await dismiss_consolidation(mock_db, "user-1", "sugg-1")

    mock_db.table.return_value.update.assert_called_once_with({"status": "dismissed"})


# ---------------------------------------------------------------------------
# Threshold constants
# ---------------------------------------------------------------------------


def test_debounce_seconds_constant():
    """_DEBOUNCE_SECONDS is 30."""
    assert _DEBOUNCE_SECONDS == 30


def test_min_goals_for_consolidation_constant():
    """_MIN_GOALS_FOR_CONSOLIDATION is 3."""
    assert _MIN_GOALS_FOR_CONSOLIDATION == 3
