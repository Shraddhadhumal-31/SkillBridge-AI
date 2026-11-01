from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.security import decode_access_token
from app.database import users_col

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)):
    """Validates the Bearer JWT token and returns the authenticated user document."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid authentication token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = users_col.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with this token does not exist.",
        )
    
    # Return user data without hashed password
    user_safe = dict(user)
    user_safe.pop("password", None)
    return user_safe

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)):
    """Optionally returns the current user if logged in, or None if guest."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except Exception:
        return None
