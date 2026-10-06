
import uuid
from sqlalchemy import Text, Uuid, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from pgvector.sqlalchemy import VECTOR
from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy import Integer

class ServiceEmbedding(Base):
    __tablename__ = "service_embeddings"

    service_id : Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    embedding: Mapped[list[float] | None] = mapped_column(VECTOR(768), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    embedding_version: Mapped[int] = mapped_column(Integer, server_default=None, nullable=True)

    __table_args__ = (
        CheckConstraint("status <> 'completed' OR embedding IS NOT NULL", name="service_embeddings_embedding_check"),
    )