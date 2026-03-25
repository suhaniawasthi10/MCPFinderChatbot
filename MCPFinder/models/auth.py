from pydantic import BaseModel
from typing import Optional

class SignupRequest(BaseModel):
    username: str
    name: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    user: dict

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
