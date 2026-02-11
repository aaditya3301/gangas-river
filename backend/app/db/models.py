"""
SQLAlchemy models for AquaGuardians
Includes PostGIS geometry types for spatial data
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Integer, String, Float, Boolean, DateTime, Text, 
    ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
import enum

from app.db.session import Base


# Enums
class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    OFFICIAL = "official"
    NGO = "ngo"
    RESEARCHER = "researcher"
    ADMIN = "admin"


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    RESOLVED = "resolved"


class ReportCategory(str, enum.Enum):
    FLOOD = "flood"
    POLLUTION = "pollution"
    INFRASTRUCTURE = "infrastructure"
    EROSION = "erosion"
    OTHER = "other"


class ZoneType(str, enum.Enum):
    ZONE_A = "zone_a"  # High risk - no construction
    ZONE_B = "zone_b"  # Medium risk - flood-proofing required
    ZONE_C = "zone_c"  # Low risk - normal permits


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Models
class User(Base):
    """User accounts with role-based access"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.CITIZEN)
    
    # Location (for citizens - their home/farm location)
    location: Mapped[Optional[str]] = mapped_column(
        Geometry("POINT", srid=4326), nullable=True
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    reports: Mapped[list["CommunityReport"]] = relationship(back_populates="user")


class CommunityReport(Base):
    """Citizen-submitted reports with AI verification"""
    __tablename__ = "community_reports"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Location (PostGIS point)
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    
    # Report details
    category: Mapped[ReportCategory] = mapped_column(SQLEnum(ReportCategory), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Verification
    status: Mapped[ReportStatus] = mapped_column(SQLEnum(ReportStatus), default=ReportStatus.PENDING)
    verification_score: Mapped[float] = mapped_column(Float, default=0.0)  # AI confidence score
    verification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    reported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # User's reported GPS altitude (for cross-checking with LiDAR)
    reported_altitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="reports")


class FloodZone(Base):
    """Flood risk zones derived from LiDAR analysis"""
    __tablename__ = "flood_zones"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Zone geometry (polygon)
    geometry: Mapped[str] = mapped_column(Geometry("POLYGON", srid=4326), nullable=False)
    
    # Zone classification
    zone_type: Mapped[ZoneType] = mapped_column(SQLEnum(ZoneType), nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(SQLEnum(RiskLevel), nullable=False)
    
    # LiDAR-derived metrics
    min_elevation: Mapped[float] = mapped_column(Float, nullable=False)
    max_elevation: Mapped[float] = mapped_column(Float, nullable=False)
    avg_elevation: Mapped[float] = mapped_column(Float, nullable=False)
    slope_gradient: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Flood predictions
    flood_depth_1m: Mapped[float] = mapped_column(Float, nullable=True)  # Depth if river rises 1m
    flood_depth_3m: Mapped[float] = mapped_column(Float, nullable=True)  # Depth if river rises 3m
    flood_depth_5m: Mapped[float] = mapped_column(Float, nullable=True)  # Depth if river rises 5m
    
    # Metadata
    source_lidar_zone: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PolicyZone(Base):
    """Administrative policy zones for land use regulation"""
    __tablename__ = "policy_zones"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Zone geometry
    geometry: Mapped[str] = mapped_column(Geometry("POLYGON", srid=4326), nullable=False)
    
    # Classification
    zone_type: Mapped[ZoneType] = mapped_column(SQLEnum(ZoneType), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Restrictions (JSON for flexibility)
    restrictions: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {"construction": "prohibited", "agriculture": "allowed", "max_floor_area_ratio": 0.5}
    
    # Official details
    notification_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    effective_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class IoTSensor(Base):
    """IoT sensor locations and latest readings"""
    __tablename__ = "iot_sensors"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sensor_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    
    # Location
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Sensor type
    sensor_type: Mapped[str] = mapped_column(String(50), nullable=False)  # water_level, rainfall, etc.
    
    # Latest reading
    latest_value: Mapped[float] = mapped_column(Float, nullable=True)
    latest_reading_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    battery_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Timestamps
    installed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class EvacuationShelter(Base):
    """Evacuation shelters with capacity tracking"""
    __tablename__ = "evacuation_shelters"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Location
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Capacity
    total_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0)
    
    # Facilities
    has_medical: Mapped[bool] = mapped_column(Boolean, default=False)
    has_food: Mapped[bool] = mapped_column(Boolean, default=False)
    has_water: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Contact
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Elevation (important for flood safety)
    elevation: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class NGOTask(Base):
    """NGO task management with gamification"""
    __tablename__ = "ngo_tasks"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Assignment
    ngo_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Task details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=True)
    
    # Status
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, in_progress, completed, verified
    
    # Verification
    proof_photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    satellite_verification_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Points/Gamification
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
