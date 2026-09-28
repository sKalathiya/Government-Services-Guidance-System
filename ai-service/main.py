from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from core.config import settings
from core.database import init_db


@asynccontextmanager
async def lifespan (app : FastAPI):
    init_db()
    yield

app = FastAPI(title="AI Service", description="AI service for gov guide" , lifespan=lifespan)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=settings.ai_service_port)