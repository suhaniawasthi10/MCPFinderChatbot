from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import uuid

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender: str  # 'user' or 'ai'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))