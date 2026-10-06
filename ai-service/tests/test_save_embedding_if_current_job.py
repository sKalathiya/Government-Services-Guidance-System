import asyncio
import selectors
import uuid

from sqlalchemy import text

from database import engine, session_maker
from repositories.service_embedding_repository import save_embedding_if_current_job

EMBEDDING = [0.01] * 768


def selector_loop():
    return asyncio.SelectorEventLoop(selectors.SelectSelector())


def run(test):
    return asyncio.run(test(), loop_factory=selector_loop)


async def insert_service(session, service_id: uuid.UUID, embedding_version: int) -> None:
    jurisdiction_id = uuid.uuid4()
    await session.execute(
        text(
            """
            INSERT INTO jurisdictions (id, name, code)
            VALUES (:id, :name, :code)
            """
        ),
        {
            "id": jurisdiction_id,
            "name": "Test jurisdiction",
            "code": f"TEST-{jurisdiction_id.hex[:12]}",
        },
    )
    await session.execute(
        text(
            """
            INSERT INTO services (
                id,
                name,
                description,
                eligibility,
                embedding_version,
                "sourceUrl",
                "officialUrl",
                "feesType",
                "lastVerifiedAt",
                "jurisdictionId"
            )
            VALUES (
                :id,
                :name,
                :description,
                :eligibility,
                :embedding_version,
                :source_url,
                :official_url,
                'FREE',
                now(),
                :jurisdiction_id
            )
            """
        ),
        {
            "id": service_id,
            "name": "Test service",
            "description": "A service used only by this test.",
            "eligibility": "Test eligibility.",
            "embedding_version": embedding_version,
            "source_url": "https://example.test/source",
            "official_url": "https://example.test/official",
            "jurisdiction_id": jurisdiction_id,
        },
    )


async def embedding_status(session, service_id: uuid.UUID):
    result = await session.execute(
        text(
            """
            SELECT status, embedding_version
            FROM service_embeddings
            WHERE service_id = :service_id
            """
        ),
        {"service_id": service_id},
    )
    return result.one_or_none()


def test_returns_true_when_the_job_version_matches():
    assert run(matching_version_is_saved) is True


async def matching_version_is_saved():
    service_id = uuid.uuid4()
    async with session_maker() as session:
        await session.begin()
        try:
            await insert_service(session, service_id, embedding_version=3)
            saved = await save_embedding_if_current_job(
                service_id, 3, session, EMBEDDING
            )
            stored = await embedding_status(session, service_id)
            assert saved is True
            assert stored is not None
            assert stored.status == "completed"
            assert stored.embedding_version == 3
            return saved
        finally:
            await session.rollback()


def test_returns_false_when_the_job_version_is_stale():
    assert run(stale_version_is_not_saved) is False


async def stale_version_is_not_saved():
    service_id = uuid.uuid4()
    async with session_maker() as session:
        await session.begin()
        try:
            await insert_service(session, service_id, embedding_version=4)
            saved = await save_embedding_if_current_job(
                service_id, 2, session, EMBEDDING
            )
            stored = await embedding_status(session, service_id)
            assert saved is False
            assert stored is None
            return saved
        finally:
            await session.rollback()


def test_returns_false_when_the_service_does_not_exist():
    assert run(missing_service_is_not_saved) is False


async def missing_service_is_not_saved():
    async with session_maker() as session:
        await session.begin()
        try:
            saved = await save_embedding_if_current_job(
                uuid.uuid4(), 1, session, EMBEDDING
            )
            assert saved is False
            return saved
        finally:
            await session.rollback()


def teardown_module():
    asyncio.run(engine.dispose(), loop_factory=selector_loop)
