"""FastAPI dependencies shared across routers."""
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..db import get_db
from .security import decode_access_token

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
    )
    if creds is None:
        raise unauthorized
    user_id = decode_access_token(creds.credentials)
    if not user_id or not ObjectId.is_valid(user_id):
        raise unauthorized
    user = await get_db().users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise unauthorized
    return user
