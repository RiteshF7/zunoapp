"""Shared dependencies: JWT auth middleware and Supabase client (PyJWT)."""

import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt as pyjwt
from jwt import PyJWKClient
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
# JWKS — fetched from Supabase URL at runtime (cached by PyJWKClient)
# ---------------------------------------------------------------------------
_jwks_client: PyJWKClient | None = None
_jwks_client_url: str | None = None


def _get_jwks_client(supabase_url: str) -> PyJWKClient:
    """Get or create a cached PyJWKClient for the given Supabase URL."""
    global _jwks_client, _jwks_client_url
    base = supabase_url.rstrip("/")
    jwks_uri = f"{base}/auth/v1/.well-known/jwks.json"
    if _jwks_client is None or _jwks_client_url != jwks_uri:
        logger.info("Creating JWKS client → %s", jwks_uri)
        _jwks_client = PyJWKClient(
            jwks_uri,
            cache_keys=True,
            cache_jwk_set=True,
            lifespan=300,
        )
        _jwks_client_url = jwks_uri
    return _jwks_client


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
            # Asymmetric algorithm → fetch JWKS from Supabase URL and verify
            jwks_client = _get_jwks_client(settings.supabase_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
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


# ---------------------------------------------------------------------------
# Admin: require profile.role == 'admin' (DB as source of truth)
# ---------------------------------------------------------------------------
async def get_admin_user(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
) -> str:
    """Require current user's profile.role to be 'admin'; else 403."""
    result = (
        db.table("profiles")
        .select("role")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    role = (result.data or {}).get("role") if result.data is not None else None
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user_id


async def get_current_user_role(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
) -> str:
    """Return current user's profile role ('user' or 'admin'). Defaults to 'user' if no profile."""
    result = (
        db.table("profiles")
        .select("role")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    role = (result.data or {}).get("role") if result.data is not None else None
    return role if role in ("user", "admin") else "user"
