from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import uuid

class User(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
        json_encoders={datetime: lambda v: v.isoformat()}
    )
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    name: str
    password_hash: str = Field(exclude=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
