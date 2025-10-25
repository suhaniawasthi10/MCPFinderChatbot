from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class User(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
        json_encoders={datetime: lambda v: v.isoformat()}
    )
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))