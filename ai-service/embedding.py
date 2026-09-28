from core.config import settings
import google.genai as genai

AI_EMBEDDING_KEY = settings.ai_embedding_key

class Service():
    id: str
    name: str
    description: str
    eligibility: str

def get_embedding(service: Service):
    client = genai.Client(api_key=AI_EMBEDDING_KEY)
    response = client.embed_content(
        model="gemini-embedding-001",
        task_type="RETRIEVAL_DOCUMENT",
        contents=[f"Name: {service.name}\nDescription: {service.description}\nEligibility: {service.eligibility}"],
        output_dimensionality=768,
    )
    return response.embeddings.values