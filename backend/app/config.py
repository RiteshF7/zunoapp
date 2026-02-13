"""Application configuration via environment variables."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ROOT_DIR = _BACKEND_DIR.parent


def _get_mode() -> str:
    """Current environment mode: development or production (and staging).
    Sources: ZUNO_ENV or ENVIRONMENT env var, then config/env-mode or .env.mode at repo root. Default development.
    """
    mode = os.environ.get("ZUNO_ENV") or os.environ.get("ENVIRONMENT")
    if mode:
        mode = mode.strip().lower()
        if mode in ("development", "production", "staging"):
            return mode
    for path in (_ROOT_DIR / "config" / "env-mode", _ROOT_DIR / ".env.mode"):
        if path.exists():
            raw = path.read_text(encoding="utf-8").strip().lower()
            if raw in ("development", "production", "staging"):
                return raw
    return "development"


def _read_dotenv_file(path: Path) -> dict[str, str]:
    """Read key=value pairs from a .env-style file."""
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        if "#" in val:
            val = val[: val.index("#")]
        values[key.upper()] = val.strip()
    return values


def _read_dotenv() -> dict[str, str]:
    """Load env from backend/.env then backend/.env.<mode>; latter overrides. Mode from env or config/env-mode."""
    mode = _get_mode()
    combined: dict[str, str] = {}
    for env_file in (_BACKEND_DIR / ".env", _BACKEND_DIR / f".env.{mode}"):
        combined.update(_read_dotenv_file(env_file))
    return combined


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # Vertex AI (Google Cloud) — single AI provider
    gcp_project_id: str = ""
    gcp_location: str = "us-central1"
    gcp_credentials_json: str = ""  # Path to service account JSON file
    vertex_embedding_model: str = "text-embedding-005"
    vertex_llm_model: str = "gemini-2.0-flash-001"

    # RAG settings
    rag_chunk_size: int = 500       # Target tokens per chunk
    rag_chunk_overlap: int = 50     # Overlap tokens between chunks
    rag_top_k: int = 8              # Default number of chunks to retrieve

    # Content processing
    max_body_chars: int = 8000      # Max chars of body text to extract from URLs
    max_upload_size_mb: int = 10    # Max file upload size in MB

    # Goal engine
    goal_max_similar_content: int = 15
    goal_similarity_threshold: float = 0.3
    goal_debounce_seconds: int = 30

    # Feed
    suggested_feed_pool_size: int = 500  # Max candidates fetched before scoring

    # Cache
    cache_max_entries: int = 2048   # Max in-memory cache entries

    # Knowledge
    knowledge_similarity_threshold: float = 0.45

    # Logging
    log_level: str = "INFO"           # DEBUG, INFO, WARNING, ERROR, CRITICAL
    log_format: str = "plain"         # "plain" or "json"

    # Environment
    environment: str = "development"   # development, staging, production

    # Server
    backend_port: int = 8000
    cors_origins: str = "http://localhost:8081,http://localhost:19006"

    @property
    def debug(self) -> bool:
        return self.environment == "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def cors_allow_methods(self) -> list[str]:
        if self.environment == "production":
            return ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
        return ["*"]

    @property
    def cors_allow_headers(self) -> list[str]:
        if self.environment == "production":
            return ["Authorization", "Content-Type", "Accept", "X-Request-ID", "Origin"]
        return ["*"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    # .env file values take priority over shell env vars to prevent stale overrides
    dotenv = _read_dotenv()
    return Settings(**{k.lower(): v for k, v in dotenv.items() if v})
