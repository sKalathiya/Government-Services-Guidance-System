

import uuid
from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from models.service import Service
from sqlalchemy.ext.asyncio import AsyncSession
from exceptions.embedding_worker_exception import RetryableDatabaseException



async def get_service_by_id(service_id: uuid.UUID, session: AsyncSession) -> Service | None:
    try:
        service = await session.execute(select(Service).where(Service.id == service_id))
        return service.scalar_one_or_none()
    except OperationalError as e:
        raise RetryableDatabaseException("Database operational failure while finding service") from e
