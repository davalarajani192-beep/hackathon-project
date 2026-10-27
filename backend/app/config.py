import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EASY – Food-Expiry Rescue and Local Surplus Exchange"
    TEAM_NAME: str = "Decoders"
    TAGLINE: str = "Surplus today. A meal tonight."
    VERSION: str = "1.0.0"
    
    # Database URL: PostGIS/PostgreSQL in Docker, with sqlite fallback for standalone dev
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/easy_rescue"
    )
    
    # JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_decoders_hackathon_jwt_key_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Geofence & Feasibility Settings
    DEFAULT_AVG_SPEED_KMH: float = 30.0  # Urban transit average speed
    PICKUP_BUFFER_MINUTES: float = 15.0  # Buffer for loading/handling
    
    class Config:
        case_sensitive = True

settings = Settings()
