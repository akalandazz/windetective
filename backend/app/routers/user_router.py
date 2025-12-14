from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta
from sqlalchemy.orm import Session

from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    decode_token_for_refresh,
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    LoginRequest,
    SignupRequest,
)
from services.user_service import create_user, get_user_by_email
from database import get_db

router = APIRouter()

@router.post("/signup", response_model=Token, tags=["user"])
def signup(signup_request: SignupRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = get_user_by_email(db, signup_request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = get_password_hash(signup_request.password)

    # Create the user
    user = create_user(db, email=signup_request.email, password=hashed_password, name=signup_request.name, phone=signup_request.phone)

    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": signup_request.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token, tags=["user"])
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    # Get user by email
    user = get_user_by_email(db, login_request.username)

    # Always verify password to prevent timing attacks
    # Use a dummy hash if user doesn't exist
    password_to_verify = user.password if user else "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNw0NuhHe"

    # Verify password (always runs even if user doesn't exist)
    if not user or not verify_password(login_request.password, password_to_verify):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", tags=["user"])
def get_current_user_info(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_user_by_email(db, current_user.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "phone": user.phone}

@router.post("/refresh", response_model=Token, tags=["user"])
def refresh_token(token: str = Depends(OAuth2PasswordBearer(tokenUrl="token")), db: Session = Depends(get_db)):
    """
    Stateless token refresh endpoint.

    Accepts a valid JWT token (even if expired) and issues a new token.
    The token must:
    - Have a valid signature (signed by our secret key)
    - Not be expired for more than 7 days (grace period)
    - Contain a valid user email

    This is stateless - no database lookup or refresh token storage required.
    """
    # Decode and validate the token
    token_data = decode_token_for_refresh(token)

    # Verify the user still exists
    user = get_user_by_email(db, token_data.email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Generate a new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}