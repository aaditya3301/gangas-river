"""
Security utilities for authentication and authorization
JWT token handling, password hashing, and RBAC
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.core.config import settings


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer token extraction
security = HTTPBearer(auto_error=False)
optional_security = HTTPBearer(auto_error=False)


class TokenData(BaseModel):
    """Token payload data"""
    user_id: int | None = None
    email: str | None = None
    role: str | None = None


class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"


def _get_bypass_user() -> TokenData:
    """Synthetic admin user used when auth bypass is enabled for demos/dev."""
    return TokenData(user_id=1, email="open-access@local", role="admin")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Payload data (should include user_id, email, role)
        expires_delta: Token expiration time
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    """
    Decode and validate JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        TokenData with user information
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("user_id")
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if email is None:
            raise credentials_exception
        
        return TokenData(user_id=user_id, email=email, role=role)
    
    except JWTError:
        raise credentials_exception


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security)
) -> TokenData:
    """
    Dependency to get current authenticated user from JWT token
    
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: TokenData = Depends(get_current_user)):
            return {"user": current_user.email}
    """
    if settings.AUTH_BYPASS_ENABLED:
        return _get_bypass_user()

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    return decode_token(token)


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security)
) -> TokenData | None:
    """Optional auth dependency that returns None when no bearer token is provided."""
    if settings.AUTH_BYPASS_ENABLED:
        return _get_bypass_user()

    if credentials is None:
        return None
    return decode_token(credentials.credentials)


def require_role(allowed_roles: list[str]):
    """
    Dependency factory for role-based access control
    
    Usage:
        @router.get("/admin-only")
        async def admin_route(user: TokenData = Depends(require_role(["admin", "official"]))):
            return {"message": "Welcome admin!"}
    """
    async def role_checker(current_user: TokenData = Depends(get_current_user)) -> TokenData:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}"
            )
        return current_user
    
    return role_checker


# Convenience role checkers
require_admin = require_role(["admin"])
require_official = require_role(["admin", "official"])
require_researcher = require_role(["admin", "official", "researcher"])
require_citizen = require_role(["admin", "official", "researcher", "citizen"])
