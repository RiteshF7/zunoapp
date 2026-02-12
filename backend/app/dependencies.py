"""Shared dependencies: JWT auth middleware and Supabase client (PyJWT)."""

import json
import logging
from pathlib import Path
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt as pyjwt
from jwt import PyJWK
from supabase import create_client, Client

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

# ---------------------------------------------------------------------------
# Supabase client (singleton, service-role to bypass RLS)
# ---------------------------------------------------------------------------
_supabase_client: Client | None = None


def get_supabase(settings: Settings = Depends(get_settings)) -> Client:
    global _supabase_client
    if _supabase_client is None:
        logger.info("Creating Supabase client → %s", settings.supabase_url)
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _supabase_client


# ---------------------------------------------------------------------------
# JWKS public keys — loaded once from local jwks.json (no network needed)
# ---------------------------------------------------------------------------
_JWKS_PATH = Path(__file__).resolve().parent.parent / "jwks.json"
_jwks_keys: dict[str, PyJWK] = {}


def _load_jwks_keys() -> dict[str, PyJWK]:
    """Load JWKS public keys from the local jwks.json file."""
    global _jwks_keys
    if _jwks_keys:
        return _jwks_keys

    if not _JWKS_PATH.exists():
        raise RuntimeError(
            f"jwks.json not found at {_JWKS_PATH}. "
            "Download it: curl <SUPABASE_URL>/auth/v1/.well-known/jwks.json > backend/jwks.json"
        )

    jwks_data = json.loads(_JWKS_PATH.read_text())
    for key_data in jwks_data.get("keys", []):
        kid = key_data.get("kid", "default")
        _jwks_keys[kid] = PyJWK.from_dict(key_data)
        logger.info("Loaded JWKS key: kid=%s alg=%s", kid, key_data.get("alg"))

    return _jwks_keys


def _get_signing_key(token: str) -> PyJWK:
    """Get the signing key for a JWT by matching its kid header."""
    keys = _load_jwks_keys()
    header = pyjwt.get_unverified_header(token)
    kid = header.get("kid")

    if kid and kid in keys:
        return keys[kid]
    if keys:
        return next(iter(keys.values()))
    raise ValueError("No JWKS keys available")


# ---------------------------------------------------------------------------
# JWT auth — extracts user_id from Supabase-issued JWT
# ---------------------------------------------------------------------------
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    settings: Settings = Depends(get_settings),
) -> str:
    """Validate Supabase JWT and return the user ID (sub claim)."""
    token = credentials.credentials
    try:
        header = pyjwt.get_unverified_header(token)
        alg = header.get("alg", "unknown")

        # Leeway for iat/exp to tolerate clock skew between this server and Supabase
        leeway_seconds = 10
        if alg in ("ES256", "ES384", "ES512", "RS256", "RS384", "RS512"):
            # Asymmetric algorithm → verify with local JWKS public key
            signing_key = _get_signing_key(token)
            payload = pyjwt.decode(
                token,
                signing_key.key,
                algorithms=[alg],
                audience="authenticated",
                leeway=leeway_seconds,
            )
        else:
            # Symmetric HMAC algorithm → verify with JWT secret
            payload = pyjwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256", "HS384", "HS512"],
                audience="authenticated",
                leeway=leeway_seconds,
            )

        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing sub claim",
            )
        return user_id
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except pyjwt.InvalidTokenError as exc:
        alg = "unknown"
        try:
            alg = pyjwt.get_unverified_header(token).get("alg", "unknown")
        except Exception:
            pass
        logger.warning("JWT validation failed (alg=%s): %s", alg, exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token (alg={alg}): {exc}",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Unexpected auth error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {exc}",
        )
