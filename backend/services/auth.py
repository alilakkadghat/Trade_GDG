"""
Supabase token validation dependency for FastAPI routes.
"""

from typing import Any, Dict

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.config import SUPABASE_ANON_KEY, SUPABASE_URL

bearer_scheme = HTTPBearer(auto_error=False)


async def _fetch_user_from_supabase(access_token: str) -> Dict[str, Any]:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Backend auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
        )

    auth_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "apikey": SUPABASE_ANON_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(auth_url, headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Auth provider unavailable: {exc}",
        ) from exc

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )

    return response.json()


async def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Dict[str, Any]:
    if not credentials or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
        )
    return await _fetch_user_from_supabase(credentials.credentials)
