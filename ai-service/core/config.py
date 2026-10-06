from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict
from pydantic import SecretStr

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    app_name: str = "AI Service"
    app_description: str = "AI Service for Gov Guide"
    app_version: str = "1.0.0"
    ai_service_port: int = 8000
    environment: str = "development"
    postgres_user: str
    postgres_password: SecretStr
    postgres_db: str
    postgres_host: str
    postgres_port: int
    ai_key: SecretStr
    ai_model: str
    redis_host: str
    redis_port: int
    redis_password: SecretStr


settings = Settings()