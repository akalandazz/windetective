from pydantic import BaseModel
from typing import Optional

# User model for authentication
class User(BaseModel):
    email: str
    password: str
    name: str
    phone: str

# Token model
class Token(BaseModel):
    access_token: str
    token_type: str

# Token data model
class TokenData(BaseModel):
    email: Optional[str] = None

# Custom login request model
class LoginRequest(BaseModel):
    username: str
    password: str