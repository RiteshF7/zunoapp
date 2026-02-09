"""Application configuration via environment variables."""

from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


def _read_dotenv() -> dict[str, str]:
    """Read key=value pairs from the .env file (authoritative source of truth)."""
    values: dict[str, str] = {}
    if not _ENV_FILE.exists():
        return values
    for line in _ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        # Strip inline comments (e.g.  value  # comment)
        if "#" in val:
            val = val[: val.index("#")]
        values[key.upper()] = val.strip()
    return values


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # AI Providers
    openai_api_key: str = ""
    gemini_api_key: str = ""
    ai_provider: str = "openai"  # "openai" or "gemini"

    # Server
    backend_port: int = 8000
    cors_origins: str = "http://localhost:8081,http://localhost:19006"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    # .env file values take priority over shell env vars to prevent stale overrides
    dotenv = _read_dotenv()
    return Settings(**{k.lower(): v for k, v in dotenv.items() if v})
