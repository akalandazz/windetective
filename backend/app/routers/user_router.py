from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from models import User
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    LoginRequest,
)
from services.user_service import create_user, get_user_by_email

router = APIRouter()

@router.post("/signup", response_model=Token, tags=["user"])
def signup(email: str, password: str, name: str, phone: str):
    # Check if user already exists
    existing_user = get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_password = get_password_hash(password)
    
    # Create the user
    user = create_user(email=email, password=hashed_password, name=name, phone=phone)
    
    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token, tags=["user"])
def login(login_request: LoginRequest):
    # Get user by email
    user = get_user_by_email(login_request.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Verify password
    if not verify_password(login_request.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", tags=["user"])
def get_current_user_info(current_user: str = Depends(get_current_user)):
    user = get_user_by_email(current_user.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "phone": user.phone}