import google.genai as genai
from google.genai import types, errors
from exceptions.embedding_worker_exception import AiApiBadRequestException, AiApiRateLimitException, AiApiServerException, AiApiNetworkException, AiApiInvalidResponseException
from core.config import settings
import httpx
import asyncio

def get_ai_client()-> genai.Client:
    return genai.Client(api_key=settings.ai_key.get_secret_value())

async def get_embedding_vector_from_text(input: str , client: genai.Client) -> list[float]:
    try:
        config = types.EmbedContentConfig(output_dimensionality=768, task_type="RETRIEVAL_DOCUMENT")
        async with asyncio.timeout(30):
            response = await client.aio.models.embed_content(model = settings.ai_model , contents = input , config=config)
        
        if not (response and len(response.embeddings) > 0 and response.embeddings[0].values):
            raise AiApiInvalidResponseException("Ai sent bad response for embedding!")
        
        res = response.embeddings[0].values
        if len(res) != 768:
            raise AiApiInvalidResponseException("Embedding is not of correct length!")
        
        return res
    except TimeoutError as e:
        raise AiApiNetworkException("Request Timed out!") from e

    except errors.ClientError as e:
        if e.code == 429:
            raise AiApiRateLimitException("Gemini rate limit exceeded") from e

        raise AiApiBadRequestException(
            f"Gemini client error: {e.code} {e.message}"
        ) from e

    except errors.ServerError as e:
        raise AiApiServerException(
            f"Gemini server error: {e.code} {e.message}"
        ) from e

    
    except httpx.RequestError as e:
        raise AiApiNetworkException( "Network error while communicating with Gemini") from e


