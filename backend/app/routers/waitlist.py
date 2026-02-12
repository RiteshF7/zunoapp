"""Public waitlist endpoint for landing page (Pro / Pro Plus signups).

POST /api/v1/waitlist — no auth. Backend inserts into Supabase pro_waitlist via service role.
"""

import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator

from app.dependencies import get_supabase
from supabase import Client

router = APIRouter(prefix="/waitlist", tags=["waitlist"])

EMAIL_RE = re.compile(r"^[^@]+@[^@]+\.[^@]+$")


class WaitlistIn(BaseModel):
    email: str
    tier: str
    discount_code: str | None = None

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if not v or len(v) > 256:
            raise ValueError("Invalid email length")
        if not EMAIL_RE.match(v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("tier")
    @classmethod
    def tier_valid(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if v not in ("pro", "pro_plus"):
            raise ValueError("tier must be 'pro' or 'pro_plus'")
        return v

    @field_validator("discount_code")
    @classmethod
    def discount_code_valid(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        return v if len(v) <= 64 else v[:64]


@router.post("", status_code=201)
async def join_waitlist(
    body: WaitlistIn,
    db: Client = Depends(get_supabase),
):
    """Submit landing waitlist (email + tier + optional discount code). No auth."""
    row = {
        "email": body.email,
        "tier": body.tier,
        "discount_code": body.discount_code,
        "source": "landing",
    }
    try:
        result = db.table("pro_waitlist").insert(row).execute()
        if result.data and len(result.data) > 0:
            return {"ok": True, "message": "You're on the list!"}
        raise HTTPException(status_code=500, detail="Failed to save")
    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            return {"ok": True, "message": "You're already on the list!"}
        raise HTTPException(status_code=500, detail="Failed to save") from e
