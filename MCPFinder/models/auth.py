from pydantic import BaseModel
from typing import Optional
from models.user import User

class GoogleAuthRequest(BaseModel):
    token: str

class AuthResponse(BaseModel):
    access_token: str
    user: User

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None