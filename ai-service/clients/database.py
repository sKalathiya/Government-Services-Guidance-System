from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings
from sqlalchemy.engine.url import URL
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
)

url = URL.create(
    drivername="postgresql+psycopg",
    username=settings.postgres_user,
    password=settings.postgres_password.get_secret_value(),
    host=settings.postgres_host,
    port=settings.postgres_port,
    database=settings.postgres_db
)

engine = create_async_engine(url)   # Create an asynchronous engine

session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db_session():
    async with session_maker() as session:
        yield session
        