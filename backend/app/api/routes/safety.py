"""
Safety check routes - "Am I Safe?" feature
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.functions import ST_Contains, ST_SetSRID, ST_MakePoint
from sqlalchemy import select

from app.db import get_db, FloodZone, PolicyZone
from app.schemas import SafetyCheckRequest, SafetyCheckResponse
from app.services.lidar_processor import get_elevation_at_point
from app.services.flood_predictor import predict_flood_risk_at_point

router = APIRouter()


@router.post("/check", response_model=SafetyCheckResponse)
async def check_safety(
    request: SafetyCheckRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Check if a location is safe from flooding
    
    Uses:
    1. LiDAR elevation data
    2. Flood zone classification
    3. AI flood prediction model
    
    Returns risk level and recommendations
    """
    lat, lng = request.latitude, request.longitude
    
    # Create PostGIS point
    point = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
    
    # Get elevation from LiDAR
    try:
        elevation = await get_elevation_at_point(lat, lng)
    except Exception:
        # Fallback if LiDAR data not available
        elevation = request.altitude or 0.0
    
    # Check if location falls in a flood zone
    flood_zone_query = select(FloodZone).where(
        ST_Contains(FloodZone.geometry, point)
    )
    result = await db.execute(flood_zone_query)
    flood_zone = result.scalar_one_or_none()
    
    # Check policy zone
    policy_zone_query = select(PolicyZone).where(
        ST_Contains(PolicyZone.geometry, point)
    )
    result = await db.execute(policy_zone_query)
    policy_zone = result.scalar_one_or_none()
    
    # Get flood prediction
    try:
        prediction = await predict_flood_risk_at_point(lat, lng, elevation)
        risk_percentage = prediction.get("risk_percentage", 0)
        flood_depth = prediction.get("predicted_depth", 0)
    except Exception:
        risk_percentage = 0
        flood_depth = 0
    
    # Determine risk level
    if risk_percentage > 80 or (flood_zone and flood_zone.risk_level.value == "critical"):
        risk_level = "critical"
        is_safe = False
        message = "HIGH RISK AREA - Immediate evacuation recommended"
    elif risk_percentage > 50 or (flood_zone and flood_zone.risk_level.value == "high"):
        risk_level = "high"
        is_safe = False
        message = "High flood risk - Move to higher ground if water levels rise"
    elif risk_percentage > 25 or (flood_zone and flood_zone.risk_level.value == "medium"):
        risk_level = "medium"
        is_safe = True
        message = "Moderate flood risk - Stay alert and monitor water levels"
    else:
        risk_level = "low"
        is_safe = True
        message = "You are in a safe zone"
    
    # Build recommendations
    recommendations = []
    if not is_safe:
        recommendations.append("Identify nearest evacuation shelter")
        recommendations.append("Keep emergency supplies ready")
        recommendations.append("Monitor official flood warnings")
    
    if policy_zone and policy_zone.zone_type.value == "zone_a":
        recommendations.append("This area has construction restrictions")
    
    if elevation < 10:  # Low elevation
        recommendations.append("Low-lying area - avoid during heavy rainfall")
    
    return SafetyCheckResponse(
        is_safe=is_safe,
        risk_level=risk_level,
        zone_type=flood_zone.zone_type.value if flood_zone else None,
        elevation=elevation,
        flood_depth_prediction=flood_depth,
        message=message,
        recommendations=recommendations,
    )
