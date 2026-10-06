import signal
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from clients.ai_client import get_ai_client 
from clients.database import session_maker, engine
from services.embedding import JobStatus, process_embedding_request
import google.genai as genai
import asyncio
from bullmq  import Job, Worker
from core.config import settings
from exceptions.embedding_worker_exception import ServiceNotFoundException, BadJobDataException , RetryableException, PermanentException



class EmbeddingWorker:
    def __init__(self, ai_client: genai.Client) -> None:
        self.ai_client = ai_client
        

#worker process function
    async def process(self, job: Job, job_token) -> None:
        try:
            service_id = uuid.UUID(job.data.get("service_id"))
            job_version = int(job.data.get("job_version"))

            if job_version <= 0:
                raise ValueError("Jobversion cannot be negative!")
        except (ValueError , TypeError) as e:
            raise BadJobDataException("Invalid job data!") from e
        
        async with session_maker() as session:
            async with session.begin():
                status =  await process_embedding_request(service_id, job_version, session, self.ai_client)
                if status == JobStatus.NOT_FOUND:
                    raise ServiceNotFoundException("Service not found!")
       


async def main():
    
    shutdown_event = asyncio.Event()

    def signal_handler (signal, frame):
        shutdown_event.set()
    
    signal.signal(signal.SIGTERM , signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    ai_client = get_ai_client()
    embedding_worker = EmbeddingWorker(ai_client)
    try:
        worker = Worker("embedding_queue", embedding_worker.process , {"connection":{
            "host": settings.redis_host,
            "port": settings.redis_port,
            "password": settings.redis_password.get_secret_value(),
        },  
            "concurrency": 2
        })

        await shutdown_event.wait()

    finally:
        await worker.close()
        await ai_client.aio.close()
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
