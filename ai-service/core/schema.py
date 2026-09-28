from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal

class ServiceEmbedding(BaseModel):
    service_id: str
    embedding: list[float]
    status: Literal["pending", "processing", "completed", "failed"]
    error: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)