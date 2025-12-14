from pydantic import BaseModel, field_validator, Field, EmailStr
from typing import Optional
import re

# User model for authentication
class User(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str

# Token model
class Token(BaseModel):
    access_token: str
    token_type: str

# Token data model
class TokenData(BaseModel):
    email: Optional[EmailStr] = None

# Custom login request model
class LoginRequest(BaseModel):
    email: str
    password: str

# Signup request model
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    password_confirm: str = Field(..., min_length=8)
    name: str
    phone: str

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Validate password meets security requirements:
        - At least 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')

        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')

        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')

        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)')

        return v

    @field_validator('password_confirm')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        """Validate that password and password_confirm match"""
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v