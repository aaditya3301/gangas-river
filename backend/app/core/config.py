"""
Core configuration for AquaGuardians API
Loads environment variables and provides app settings
"""
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://localhost/aquaguardians"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        """Normalize pasted DB URLs into an asyncpg-compatible SQLAlchemy URL."""
        if not isinstance(value, str):
            return value

        url = value.strip()
        if url.lower().startswith("psql "):
            url = url[5:].strip()

        if (url.startswith("'") and url.endswith("'")) or (url.startswith('"') and url.endswith('"')):
            url = url[1:-1].strip()

        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]

        if url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]

        parts = urlsplit(url)
        if parts.query:
            params: list[tuple[str, str]] = []
            for key, val in parse_qsl(parts.query, keep_blank_values=True):
                lower_key = key.lower()
                if lower_key == "channel_binding":
                    continue
                if lower_key == "sslmode":
                    params.append(("ssl", val.lower()))
                    continue
                params.append((key, val))

            url = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), parts.fragment))

        return url
    
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
    FAST2SMS_API_KEY: str | None = None
    BACKEND_PUBLIC_URL: str | None = None
    SENTINEL_HUB_CLIENT_ID: str | None = None
    SENTINEL_HUB_CLIENT_SECRET: str | None = None
    
    # App Settings
    DEBUG: bool = False
    PPP_DEV_ALLOW_NON_OFFICIAL: bool = False
    HYDROMETEO_PROVIDER_ENABLED: bool = True
    HYDROMETEO_TIMEOUT_SECONDS: float = 8.0
    OPEN_METEO_WEATHER_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_FLOOD_URL: str = "https://flood-api.open-meteo.com/v1/flood"

    # CORS configuration (comma-separated)
    # Local defaults keep frontend dev on 3000 working out of the box.
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Emergency Contacts (comma-separated phone numbers with country code)
    EMERGENCY_CONTACTS: str = ""

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
