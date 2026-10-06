

from enum import Enum
import google.genai as genai
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.service_repository import get_service_by_id
from repositories.service_embedding_repository import save_embedding_if_current_job
from models.service import Service
from clients.ai_client import get_embedding_vector_from_text
from exceptions.embedding_worker_exception import InvalidEmbeddingInputException

class JobStatus(Enum):
    CURRENT= "CURRENT"
    STALE= "STALE"
    NOT_FOUND = "NOT_FOUND"
    COMPLETED = "COMPLETED"

def check_input (service)->tuple[str, str, str]:
    if not service.name or not service.name.strip():
        raise InvalidEmbeddingInputException("Invalid service name for embedding!")
    return service.name.strip(), service.description.strip() or "", service.eligibility.strip() or ""


async def check_stale_job(service_id: uuid.UUID, job_version: int, session: AsyncSession) -> tuple[JobStatus, Service|None]:
    service = await get_service_by_id(service_id, session)
    if not service:
        return JobStatus.NOT_FOUND , None
    if job_version == service.embedding_version:
        return JobStatus.CURRENT , service
    else:
        return JobStatus.STALE, service


def get_embedding_text_from_service(service: Service) -> str:
    name, description ,eligibility = check_input(service);
    return "\n".join([("Name: " + name) , ("Description: " + description) , ("Eligibility: "+ eligibility)])



async def process_embedding_request(service_id: uuid.UUID , job_version: int, session: AsyncSession , client: genai.Client ) -> JobStatus:
    jobstatus , service =  await check_stale_job(service_id, job_version,session)

    if jobstatus == JobStatus.NOT_FOUND:
        return jobstatus

    if jobstatus == JobStatus.STALE:
        return jobstatus

    contents = get_embedding_text_from_service(service)

    embedding = await get_embedding_vector_from_text(contents, client)

    stored = await save_embedding_if_current_job(service_id , job_version , session , embedding)

    if stored:
        return JobStatus.COMPLETED

    else:
        return JobStatus.STALE