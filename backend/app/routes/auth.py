"""Authentication routes – demo login / logout."""

from __future__ import annotations

import hashlib
import time

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import LoginRequest, LoginResponse, UserInfo

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Demo credentials
_DEMO_EMAIL = "admin@dataclean.pro"
_DEMO_PASSWORD = "admin123"


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest) -> LoginResponse:
    """Validate demo credentials and return a mock JWT token."""
    if body.email != _DEMO_EMAIL or body.password != _DEMO_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Use admin@dataclean.pro / admin123",
        )

    # Deterministic mock token
    raw = f"{body.email}:{time.time()}"
    token = hashlib.sha256(raw.encode()).hexdigest()

    return LoginResponse(
        token=f"dcp_{token}",
        user=UserInfo(
            name="Admin User",
            email=_DEMO_EMAIL,
            avatar="https://ui-avatars.com/api/?name=Admin+User&background=2962ff&color=fff",
        ),
    )


@router.post("/logout")
async def logout() -> dict[str, str]:
    return {"message": "Logged out successfully"}
