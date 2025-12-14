from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from datetime import timedelta
from sqlalchemy.orm import Session
from typing import Optional

from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user,
    Token,
    TokenResponse,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    LoginRequest,
    SignupRequest,
)
from settings import settings
from services.user_service import create_user, get_user_by_email
from database import get_db

router = APIRouter()

@router.post("/signup", response_model=TokenResponse, tags=["user"])
def signup(signup_request: SignupRequest, response: Response, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = get_user_by_email(db, signup_request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = get_password_hash(signup_request.password)

    # Create the user
    user = create_user(db, email=signup_request.email, password=hashed_password, name=signup_request.name, phone=signup_request.phone)

    # Generate access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": signup_request.email}, expires_delta=access_token_expires
    )

    # Generate refresh token
    refresh_token = create_refresh_token(data={"sub": signup_request.email})

    # Set httpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,  # Use HTTPS in production
        samesite="lax",  # CSRF protection
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # 7 days in seconds
        path="/api/v1/users/refresh"  # Only sent to refresh endpoint
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/login", response_model=TokenResponse, tags=["user"])
def login(login_request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    # Get user by email
    user = get_user_by_email(db, login_request.email)

    # Verify password (always runs even if user doesn't exist)
    if not user or not verify_password(login_request.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # Generate access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    # Generate refresh token
    refresh_token = create_refresh_token(data={"sub": user.email})

    # Set httpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/users/refresh"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", tags=["user"])
def get_current_user_info(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_user_by_email(db, current_user.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "phone": user.phone}

@router.post("/refresh", response_model=TokenResponse, tags=["user"])
def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    """
    Token refresh endpoint using httpOnly cookie.

    Reads the refresh token from httpOnly cookie and issues new access and refresh tokens.
    The refresh token must:
    - Have a valid signature (signed by our secret key)
    - Not be expired
    - Be of type "refresh"
    - Contain a valid user email
    """
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")

    # Decode and validate the refresh token
    token_data = decode_refresh_token(refresh_token)

    # Verify the user still exists
    user = get_user_by_email(db, token_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    # Generate new refresh token
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    # Update cookie with new refresh token
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/users/refresh"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/logout", tags=["user"])
def logout(response: Response):
    """
    Logout endpoint that clears the refresh token cookie.
    """
    # Clear the refresh token cookie
    response.delete_cookie(
        key="refresh_token",
        path="/api/v1/users/refresh"
    )
    return {"message": "Successfully logged out"}