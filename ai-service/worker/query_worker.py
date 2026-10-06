from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings
from clients.database import get_db_session , engine
from sqlalchemy.exc import SQLAlchemyError

@asynccontextmanager
async def lifespan (app : FastAPI):
    try:
        yield
    finally:
        await engine.dispose()

app = FastAPI(title=settings.app_name, description=settings.app_description, version=settings.app_version, lifespan=lifespan)


@app.get("/health")
def health_check():
    return {"message": "AI Service is running"}

@app.get('/ready')
async def database_ready(session: AsyncSession = Depends(get_db_session)):
    try:
        result = await session.execute(text("SELECT 1"))
        response = result.scalar_one()
        return {"status" : "ready"}
    except SQLAlchemyError:
        raise HTTPException(503, "Database Unavailbale")
  

    
        