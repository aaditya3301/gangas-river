"""
Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ============== Auth Schemas ==============

class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (excludes password)"""
    id: int
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    role: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============== Safety Check Schemas ==============

class SafetyCheckRequest(BaseModel):
    """Request for GPS-based safety check"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = None  # GPS altitude if available


class SafetyCheckResponse(BaseModel):
    """Response from safety check"""
    is_safe: bool
    risk_level: str  # low, medium, high, critical
    zone_type: Optional[str]  # zone_a, zone_b, zone_c
    elevation: float  # LiDAR elevation at location
    flood_depth_prediction: Optional[float]  # Predicted depth if flood occurs
    message: str
    recommendations: list[str] = []


# ============== Community Report Schemas ==============

class ReportCreate(BaseModel):
    """Schema for submitting a community report"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = None
    category: str = Field(..., pattern="^(flood|pollution|infrastructure|erosion|other)$")
    description: Optional[str] = None
    photo_url: Optional[str] = None


class ReportResponse(BaseModel):
    """Schema for report response"""
    id: int
    category: str
    description: Optional[str]
    status: str
    verification_score: float
    verification_notes: Optional[str]
    reported_at: datetime
    latitude: float
    longitude: float
    
    class Config:
        from_attributes = True


class ReportVerificationResult(BaseModel):
    """Result of AI verification on a report"""
    is_verified: bool
    confidence_score: float
    flags: list[str] = []
    notes: str


# ============== Flood Prediction Schemas ==============

class FloodPredictionRequest(BaseModel):
    """Request for flood prediction at a location"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    rainfall_mm: float = Field(0, ge=0)  # Expected rainfall in mm


class FloodPredictionResponse(BaseModel):
    """Flood prediction response"""
    location: dict  # {lat, lng}
    risk_percentage: float
    risk_level: str
    predicted_depth_m: float
    confidence: float
    contributing_factors: list[str] = []


class FloodHeatmapResponse(BaseModel):
    """GeoJSON heatmap of flood risk"""
    type: str = "FeatureCollection"
    features: list[dict]


# ============== Zone Schemas ==============

class ZoneCheckRequest(BaseModel):
    """Check what zone a location falls into"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class ZoneCheckResponse(BaseModel):
    """Zone information for a location"""
    zone_type: Optional[str]
    risk_level: Optional[str]
    restrictions: dict = {}
    elevation: float
    message: str


# ============== Evacuation Schemas ==============

class EvacuationRouteRequest(BaseModel):
    """Request for evacuation route"""
    start_latitude: float = Field(..., ge=-90, le=90)
    start_longitude: float = Field(..., ge=-180, le=180)
    preference: str = Field("safest", pattern="^(fastest|safest|shortest)$")


class ShelterResponse(BaseModel):
    """Evacuation shelter info"""
    id: int
    name: str
    latitude: float
    longitude: float
    distance_km: float
    available_capacity: int
    has_medical: bool
    has_food: bool
    elevation: float
    
    class Config:
        from_attributes = True


class EvacuationRouteResponse(BaseModel):
    """Evacuation route with shelter options"""
    origin: dict
    recommended_shelter: ShelterResponse
    route_geometry: dict  # GeoJSON LineString
    distance_km: float
    estimated_time_minutes: float
    alternative_shelters: list[ShelterResponse] = []


# ============== LiDAR Processing Schemas ==============

class LidarProcessRequest(BaseModel):
    """Request to process LiDAR data for a zone"""
    zone_name: str  # e.g., "zone_53H13SE"
    water_level_rise: float = Field(0, ge=0, le=20)  # Simulated water level rise in meters


class LidarProcessResponse(BaseModel):
    """Processed LiDAR data response"""
    zone_name: str
    bounds: dict  # {min_lat, max_lat, min_lng, max_lng}
    elevation_stats: dict  # {min, max, mean, std}
    flood_zones_geojson: dict  # GeoJSON FeatureCollection
    processing_time_seconds: float


# ============== Pagination ==============

class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    items: list
    total: int
    page: int
    per_page: int
    pages: int
