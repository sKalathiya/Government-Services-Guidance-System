import psycopg
from core.config import settings



def connect():
    conn = psycopg.connect(
        host=settings.postgres_host,
        port=settings.postgres_port,
        user=settings.postgres_user,    
        password=settings.postgres_password,
        dbname=settings.postgres_db
    )
    return conn

def init_db():
    with connect() as connection:
        connection.execute("CREATE EXTENSION IF NOT EXISTS vector")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS service_embeddings (
                service_id uuid PRIMARY KEY,
                embedding vector(768),
                status text NOT NULL,
                error text,
                updated_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT service_embeddings_status_check
                    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
                CONSTRAINT service_embeddings_completed_has_vector
                    CHECK (status <> 'completed' OR embedding IS NOT NULL)
            )
            """
        )