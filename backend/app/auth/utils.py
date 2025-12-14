from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status

from .config import SECRET_KEY, ALGORITHM, pwd_context, oauth2_scheme
from .models import TokenData

# Refresh token expiration (7 days)
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
def get_password_hash(password: str):
    return pwd_context.hash(password)

# Password verification
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Get current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    return token_data

# Decode token without verification (for refresh)
def decode_token_for_refresh(token: str):
    """
    Decode a JWT token for refresh purposes.
    Validates the signature but allows expired tokens within a grace period.
    """
    try:
        # First, try to decode with verification to check signature
        # We use options to validate signature but ignore expiration
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": False}  # Don't verify expiration
        )

        # Extract the expiration time
        exp = payload.get("exp")
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject"
            )

        # Check if token is expired and within grace period (e.g., 7 days)
        if exp:
            exp_datetime = datetime.fromtimestamp(exp, tz=timezone.utc)
            now = datetime.now(timezone.utc)
            grace_period = timedelta(days=7)

            # Token must not be expired for more than the grace period
            if now > exp_datetime + grace_period:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired beyond grace period"
                )

        return TokenData(email=email)

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate token: {str(e)}"
        )

# Create refresh token with longer expiration
def create_refresh_token(data: dict) -> str:
    """
    Create a refresh token with 7-day expiration.
    Refresh tokens are stored in httpOnly cookies and used to obtain new access tokens.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Decode refresh token from cookie
def decode_refresh_token(token: str) -> TokenData:
    """
    Decode and validate a refresh token from httpOnly cookie.
    Verifies signature and ensures it's a refresh token type.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Verify this is a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        return TokenData(email=email)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )