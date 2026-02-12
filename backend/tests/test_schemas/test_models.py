"""Unit tests for Pydantic models in app.schemas.models."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.models import (
    ProfileOut,
    ContentOut,
    ContentCreate,
    CollectionOut,
    GoalOut,
    GoalDetailOut,
    GoalStepOut,
    ContentWithTagsOut,
    SuggestedContentOut,
    PopularTagOut,
    KnowledgeQueryRequest,
    AppConfigOut,
    UserPreferencesOut,
    FeedItemOut,
    GoalMergeSuggestionOut,
    ProcessContentRequest,
    GenerateEmbeddingRequest,
    StatusMessage,
    KnowledgeStatsOut,
    ContentCreateText,
)


# ---------------------------------------------------------------------------
# ProfileOut
# ---------------------------------------------------------------------------

def test_profile_out_requires_id_and_timestamps():
    p = ProfileOut(
        id="id-1",
        created_at="2024-01-01T00:00:00",
        updated_at="2024-01-01T00:00:00",
    )
    assert p.id == "id-1"
    assert p.created_at == "2024-01-01T00:00:00"
    assert p.updated_at == "2024-01-01T00:00:00"
    with pytest.raises(ValidationError):
        ProfileOut(display_name="x")  # missing id, created_at, updated_at


# ---------------------------------------------------------------------------
# ContentOut
# ---------------------------------------------------------------------------

def test_content_out_defaults():
    c = ContentOut(
        id="c1",
        user_id="u1",
        url="https://example.com",
        created_at="2024-01-01",
        updated_at="2024-01-01",
    )
    assert c.platform == "other"
    assert c.content_type == "post"


# ---------------------------------------------------------------------------
# ContentCreate
# ---------------------------------------------------------------------------

def test_content_create_requires_url():
    c = ContentCreate(url="https://example.com")
    assert c.url == "https://example.com"
    with pytest.raises(ValidationError):
        ContentCreate(title="No URL")  # url required


# ---------------------------------------------------------------------------
# CollectionOut
# ---------------------------------------------------------------------------

def test_collection_out_defaults():
    c = CollectionOut(
        id="col-1",
        user_id="u1",
        title="My Collection",
        created_at="2024-01-01",
        updated_at="2024-01-01",
    )
    assert c.icon == "folder"
    assert c.theme == "blue"


# ---------------------------------------------------------------------------
# GoalOut
# ---------------------------------------------------------------------------

def test_goal_out_defaults():
    g = GoalOut(
        id="g1",
        user_id="u1",
        title="Learn Python",
        created_at="2024-01-01",
        updated_at="2024-01-01",
    )
    assert g.status == "active"
    assert g.confidence == 0.5


# ---------------------------------------------------------------------------
# GoalDetailOut
# ---------------------------------------------------------------------------

def test_goal_detail_out_extends_goal_out_with_steps_and_children():
    step = GoalStepOut(
        id="s1",
        goal_id="g1",
        title="Step 1",
        created_at="2024-01-01",
        updated_at="2024-01-01",
    )
    g = GoalDetailOut(
        id="g1",
        user_id="u1",
        title="Learn Python",
        created_at="2024-01-01",
        updated_at="2024-01-01",
        steps=[step],
        children=[],
    )
    assert g.steps is not None
    assert len(g.steps) == 1
    assert g.children == []
    assert g.ai_reasoning == ""


# ---------------------------------------------------------------------------
# ContentWithTagsOut
# ---------------------------------------------------------------------------

def test_content_with_tags_out_extends_content_out():
    c = ContentWithTagsOut(
        id="c1",
        user_id="u1",
        url="https://x.com",
        created_at="2024-01-01",
        updated_at="2024-01-01",
        content_tags=[{"tag_id": "t1", "name": "python"}],
    )
    assert c.content_tags is not None
    assert len(c.content_tags) == 1


# ---------------------------------------------------------------------------
# SuggestedContentOut
# ---------------------------------------------------------------------------

def test_suggested_content_out_extends_content_out_with_relevance_score():
    c = SuggestedContentOut(
        id="c1",
        user_id="u1",
        url="https://x.com",
        created_at="2024-01-01",
        updated_at="2024-01-01",
        relevance_score=0.85,
    )
    assert c.relevance_score == 0.85


# ---------------------------------------------------------------------------
# PopularTagOut
# ---------------------------------------------------------------------------

def test_popular_tag_out_populate_by_name_accepts_usage_count():
    """PopularTagOut has count field with alias usage_count; populate_by_name allows both."""
    # By field name
    p1 = PopularTagOut(name="python", slug="python", count=10)
    assert p1.count == 10
    # By alias (usage_count)
    p2 = PopularTagOut(name="js", slug="js", usage_count=5)
    assert p2.count == 5


# ---------------------------------------------------------------------------
# KnowledgeQueryRequest
# ---------------------------------------------------------------------------

def test_knowledge_query_request_validation():
    q = KnowledgeQueryRequest(query="hello", top_k=8)
    assert q.query == "hello"
    assert q.top_k == 8
    with pytest.raises(ValidationError):
        KnowledgeQueryRequest(query="")  # min_length=1
    with pytest.raises(ValidationError):
        KnowledgeQueryRequest(query="x", top_k=0)  # ge=1
    with pytest.raises(ValidationError):
        KnowledgeQueryRequest(query="x", top_k=50)  # le=30


# ---------------------------------------------------------------------------
# AppConfigOut
# ---------------------------------------------------------------------------

def test_app_config_out_nested_defaults():
    c = AppConfigOut()
    assert c.feature_flags is not None
    assert c.content_limits is not None
    assert c.feed_settings is not None
    assert c.app_links is not None
    assert c.app_links.terms_url == "https://zuno.app/terms"


# ---------------------------------------------------------------------------
# UserPreferencesOut
# ---------------------------------------------------------------------------

def test_user_preferences_out_defaults():
    u = UserPreferencesOut(
        id="pref-1",
        user_id="u1",
        created_at="2024-01-01",
        updated_at="2024-01-01",
    )
    assert u.feed_type == "usersaved"


# ---------------------------------------------------------------------------
# FeedItemOut
# ---------------------------------------------------------------------------

def test_feed_item_out_defaults():
    f = FeedItemOut(
        id="f1",
        title="Item",
        source_url="https://x.com",
        created_at="2024-01-01",
    )
    assert f.content_type == "article"
    assert f.platform == "other"
    assert f.likes == 0


# ---------------------------------------------------------------------------
# GoalStepOut
# ---------------------------------------------------------------------------

def test_goal_step_out_defaults():
    s = GoalStepOut(
        id="s1",
        goal_id="g1",
        title="Step 1",
        created_at="2024-01-01",
        updated_at="2024-01-01",
    )
    assert s.step_index == 0
    assert s.description == ""
    assert s.is_completed is False


# ---------------------------------------------------------------------------
# GoalMergeSuggestionOut
# ---------------------------------------------------------------------------

def test_goal_merge_suggestion_out_defaults():
    g = GoalMergeSuggestionOut(
        id="m1",
        user_id="u1",
        suggested_parent_title="Parent",
        created_at="2024-01-01",
        updated_at="2024-01-01",
    )
    assert g.suggested_parent_description == ""
    assert g.status == "pending"
    assert g.child_goal_ids == []


# ---------------------------------------------------------------------------
# ProcessContentRequest
# ---------------------------------------------------------------------------

def test_process_content_request_requires_content_id():
    r = ProcessContentRequest(content_id="c1")
    assert r.content_id == "c1"
    with pytest.raises(ValidationError):
        ProcessContentRequest()


# ---------------------------------------------------------------------------
# GenerateEmbeddingRequest
# ---------------------------------------------------------------------------

def test_generate_embedding_request_requires_text():
    r = GenerateEmbeddingRequest(text="hello world")
    assert r.text == "hello world"
    with pytest.raises(ValidationError):
        GenerateEmbeddingRequest()


# ---------------------------------------------------------------------------
# StatusMessage
# ---------------------------------------------------------------------------

def test_status_message_defaults():
    s = StatusMessage()
    assert s.status == "ok"
    assert s.message == ""


# ---------------------------------------------------------------------------
# KnowledgeStatsOut
# ---------------------------------------------------------------------------

def test_knowledge_stats_out_defaults():
    k = KnowledgeStatsOut()
    assert k.total_chunks == 0
    assert k.indexed_content == 0


# ---------------------------------------------------------------------------
# ContentCreateText
# ---------------------------------------------------------------------------

def test_content_create_text_requires_source_text():
    c = ContentCreateText(source_text="Pasted text here", title="Note")
    assert c.source_text == "Pasted text here"
    assert c.content_type == "note"
    with pytest.raises(ValidationError):
        ContentCreateText(title="No text")
