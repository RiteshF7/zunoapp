"""Shared test fixtures for the Zuno backend test suite."""

from __future__ import annotations

from unittest.mock import MagicMock, AsyncMock, patch
from typing import Any

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Mock Supabase query builder (chainable)
# ---------------------------------------------------------------------------

class MockNotBuilder:
    """Helper for chainable .not_.is_(...) support."""

    def __init__(self, parent: "MockQueryBuilder"):
        self._parent = parent

    def is_(self, *args, **kwargs) -> "MockQueryBuilder":
        return self._parent


class MockQueryBuilder:
    """Simulates Supabase's chainable query builder for tests."""

    def __init__(
        self,
        data: list[dict] | None = None,
        count: int | None = None,
        insert_data: list[dict] | None = None,
    ):
        self._data = data or []
        self._count = count if count is not None else len(self._data)
        self._insert_data = insert_data  # Used when insert().execute() is called
        self._last_op = "select"
        self._use_single = False

    def select(self, *args, **kwargs) -> "MockQueryBuilder":
        self._last_op = "select"
        return self

    def insert(self, *args, **kwargs) -> "MockQueryBuilder":
        self._last_op = "insert"
        return self

    def upsert(self, *args, **kwargs) -> "MockQueryBuilder":
        self._last_op = "upsert"
        return self

    def update(self, *args, **kwargs) -> "MockQueryBuilder":
        self._last_op = "update"
        return self

    def delete(self) -> "MockQueryBuilder":
        return self

    def eq(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    def neq(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    def filter(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    @property
    def not_(self) -> "MockNotBuilder":
        return MockNotBuilder(self)

    def in_(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    def is_(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    def order(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    def limit(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    def range(self, *args, **kwargs) -> "MockQueryBuilder":
        return self

    def single(self) -> "MockQueryBuilder":
        self._use_single = True
        return self

    def maybe_single(self) -> "MockQueryBuilder":
        self._use_single = True
        return self

    def execute(self) -> MagicMock:
        result = MagicMock()
        op = getattr(self, "_last_op", "select")
        if op in ("insert", "upsert") and self._insert_data is not None:
            result.data = self._insert_data
        else:
            result.data = self._data
        if getattr(self, "_use_single", False):
            result.data = result.data[0] if result.data else None
        result.count = self._count if self._count is not None else len(self._data)
        return result


class MockSupabaseClient:
    """Mock Supabase Client that returns configurable query builders."""

    def __init__(self):
        self._tables: dict[str, MockQueryBuilder] = {}
        self._table_insert_data: dict[str, list[dict]] = {}
        self._table_responses: dict[str, list[tuple]] = {}
        self._table_call_index: dict[str, int] = {}
        self._rpcs: dict[str, Any] = {}

    def set_table_data(
        self,
        table_name: str,
        data: list[dict],
        count: int | None = None,
        insert_data: list[dict] | None = None,
    ):
        """Pre-configure what a table query returns. Use insert_data for insert().execute()."""
        self._tables[table_name] = MockQueryBuilder(
            data, count, insert_data or self._table_insert_data.get(table_name)
        )
        if insert_data is not None:
            self._table_insert_data[table_name] = insert_data
        self._table_responses[table_name] = [(data, count, insert_data)]
        self._table_call_index[table_name] = 0

    def set_rpc_data(self, rpc_name: str, data: Any):
        """Pre-configure what an RPC call returns."""
        self._rpcs[rpc_name] = data

    def add_table_response(
        self,
        table_name: str,
        data: list[dict],
        count: int | None = None,
    ):
        """Add an additional response for the next query on this table (for sequential calls)."""
        if table_name not in self._table_responses:
            self._table_responses[table_name] = []
        self._table_responses[table_name].append((data, count, None))

    def table(self, name: str) -> MockQueryBuilder:
        if name in self._tables:
            idx = self._table_call_index.get(name, 0)
            responses = self._table_responses.get(name, [])
            if responses and idx < len(responses):
                data, count, insert_data = responses[idx]
                self._table_call_index[name] = idx + 1
                insert_data = insert_data or self._table_insert_data.get(name)
                return MockQueryBuilder(data, count, insert_data)
            qb = self._tables[name]
            insert_data = self._table_insert_data.get(name, qb._insert_data)
            return MockQueryBuilder(qb._data, qb._count, insert_data)
        return MockQueryBuilder([])

    def rpc(self, name: str, params: dict | None = None) -> MockQueryBuilder:
        if name in self._rpcs:
            return MockQueryBuilder(self._rpcs[name])
        return MockQueryBuilder([])


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_db():
    """Returns a MockSupabaseClient for use in tests."""
    return MockSupabaseClient()


TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001"


@pytest.fixture
def test_settings():
    """Returns a Settings object with safe test defaults (no real API keys)."""
    from app.config import Settings

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
    """Returns Settings with GCP project ID set (for AI-enabled tests)."""
    test_settings.gcp_project_id = "test-gcp-project"
    return test_settings


@pytest.fixture
def auth_headers():
    """Returns mock auth headers."""
    return {"Authorization": "Bearer test-token-123"}


@pytest.fixture
def client(mock_db, test_settings):
    """Returns a FastAPI TestClient with mocked DB and auth dependencies."""
    from app.main import app
    from app.dependencies import get_current_user, get_supabase
    from app.config import get_settings

    mock_db.set_table_data("profiles", [{"role": "admin"}])
    app.dependency_overrides[get_current_user] = lambda: TEST_USER_ID
    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[get_settings] = lambda: test_settings

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c

    app.dependency_overrides.clear()
