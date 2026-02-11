"""
Core configuration for AquaGuardians API
Loads environment variables and provides app settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://localhost/aquaguardians"
    
    # Redis (optional)
    REDIS_URL: str | None = None
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # API Keys
    MAPBOX_API_KEY: str | None = None
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_PHONE_NUMBER: str | None = None
    TWILIO_WHATSAPP_NUMBER: str | None = None  # e.g. whatsapp:+14155238886
    SENTINEL_HUB_CLIENT_ID: str | None = None
    SENTINEL_HUB_CLIENT_SECRET: str | None = None
    
    # Emergency Contacts (comma-separated phone numbers with country code)
    EMERGENCY_CONTACTS: str = ""
    
    # App Settings
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # LiDAR Data Path
    LIDAR_DATA_PATH: str = "../data/raw"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def emergency_contacts_list(self) -> List[str]:
        """Parse emergency contacts string into list"""
        if not self.EMERGENCY_CONTACTS:
            return []
        return [c.strip() for c in self.EMERGENCY_CONTACTS.split(",") if c.strip()]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Global settings instance
settings = Settings()
