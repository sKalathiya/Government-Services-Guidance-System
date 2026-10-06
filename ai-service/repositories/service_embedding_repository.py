

import uuid

from sqlalchemy import literal, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession
from models.service_embedding import ServiceEmbedding
from models.service import Service
from exceptions.embedding_worker_exception import RetryableDatabaseException


async def save_embedding_if_current_job(service_id: uuid.UUID, job_version: int, session: AsyncSession, embedding: list[float]) -> bool:
    source_select = (
        select(
            Service.id,
            literal(embedding , type_=ServiceEmbedding.embedding.type),
            literal(job_version),
            literal("completed"),
            literal(None)
        ).where(
            Service.id == service_id,
            Service.version == job_version
        )
    )

    insert_stmt = (
        insert(ServiceEmbedding).from_select(
            [
                "service_id",
                "embedding",
                "embedding_version",
                "status",
                "error"
            ],
            source_select
        )
    )

    update_values = dict(embedding=embedding, embedding_version = job_version, error_version=None , error=None)

    where_clause = (
       select(Service).where(Service.id == service_id, Service.version == job_version).exists()
    )


    stmt = insert_stmt.on_conflict_do_update(
        index_elements=[ServiceEmbedding.service_id],
        set_=update_values,
        where=where_clause,
    ).returning(ServiceEmbedding.service_id)

    try:
        response = await session.execute(stmt)
        return response.scalar_one_or_none() is not None
    except OperationalError as e:
        raise RetryableDatabaseException("Database operational failure while saving embedding") from e



