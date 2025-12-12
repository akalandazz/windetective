from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # App settings
    app_title: str = Field(default="Car History AI Agent", env="APP_TITLE")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    app_host: str = Field(default="0.0.0.0", env="APP_HOST")
    app_port: int = Field(default=8000, env="APP_PORT")

    # CORS settings
    cors_origins: List[str] = Field(
        default=["http://localhost:3000"],
        env="CORS_ORIGINS"
    )
    cors_allow_credentials: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")
    cors_allow_methods: List[str] = Field(default=["*"], env="CORS_ALLOW_METHODS")
    cors_allow_headers: List[str] = Field(default=["*"], env="CORS_ALLOW_HEADERS")

    # API Keys
    deepseek_api_key: str = Field(..., env="DEEPSEEK_API_KEY")
    carfax_api_key: Optional[str] = Field(default=None, env="CARFAX_API_KEY")
    clearwin_api_key: Optional[str] = Field(default=None, env="CLEARWIN_API_KEY")
    nhtsa_api_key: Optional[str] = Field(default=None, env="NHTSA_API_KEY")

    # AI Model settings
    ai_model: str = Field(default="deepseek-chat", env="AI_MODEL")
    ai_base_url: str = Field(default="https://api.deepseek.com", env="AI_BASE_URL")
    ai_max_tokens: int = Field(default=2000, env="AI_MAX_TOKENS")
    ai_mock_response: bool = Field(default=False, env="AI_MOCK_RESPONSE")

    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")

    # Celery settings
    celery_broker_url: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")

    class Config:
        env_file = ".env"
        case_sensitive = False


# Create global settings instance
settings = Settings()