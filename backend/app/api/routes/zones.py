"""
Policy zones routes - Zone classification and restrictions
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2.functions import ST_Contains, ST_SetSRID, ST_MakePoint

from app.db import get_db, PolicyZone, FloodZone
from app.schemas import ZoneCheckRequest, ZoneCheckResponse
from app.services.zone_classifier import classify_location
from app.services.lidar_processor import get_elevation_at_point

router = APIRouter()


@router.post("/at-location", response_model=ZoneCheckResponse)
async def get_zone_at_location(
    request: ZoneCheckRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Get policy zone classification at a specific location
    
    Returns:
    - Zone type (A/B/C)
    - Building restrictions
    - Risk level
    """
    lat, lng = request.latitude, request.longitude
    
    # Create PostGIS point
    point = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
    
    # Query policy zone
    policy_query = select(PolicyZone).where(
        ST_Contains(PolicyZone.geometry, point)
    )
    result = await db.execute(policy_query)
    policy_zone = result.scalar_one_or_none()
    
    # Query flood zone for risk info
    flood_query = select(FloodZone).where(
        ST_Contains(FloodZone.geometry, point)
    )
    result = await db.execute(flood_query)
    flood_zone = result.scalar_one_or_none()
    
    # Get elevation
    try:
        elevation = await get_elevation_at_point(lat, lng)
    except Exception:
        elevation = 0.0
    
    # Build response
    if policy_zone:
        zone_type = policy_zone.zone_type.value
        restrictions = policy_zone.restrictions
        
        # Default restriction messages
        if zone_type == "zone_a":
            message = "ZONE A: High flood risk. Permanent construction prohibited."
        elif zone_type == "zone_b":
            message = "ZONE B: Moderate flood risk. Construction requires flood-proofing."
        else:
            message = "ZONE C: Low flood risk. Normal building permits allowed."
    else:
        # If no policy zone exists, classify using LiDAR
        classification = await classify_location(lat, lng, elevation)
        zone_type = classification.get("zone_type")
        restrictions = classification.get("restrictions", {})
        message = classification.get("message", "Zone classification based on terrain analysis")
    
    risk_level = flood_zone.risk_level.value if flood_zone else "unknown"
    
    return ZoneCheckResponse(
        zone_type=zone_type,
        risk_level=risk_level,
        restrictions=restrictions,
        elevation=elevation,
        message=message,
    )


@router.post("/classify")
async def classify_land(
    request: ZoneCheckRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Classify land for policy zoning using LiDAR analysis
    
    Used by officials for automated permit decisions
    """
    lat, lng = request.latitude, request.longitude
    
    # Get elevation
    try:
        elevation = await get_elevation_at_point(lat, lng)
    except Exception:
        elevation = 0.0
    
    # Run classification
    classification = await classify_location(lat, lng, elevation)
    
    return {
        "location": {"lat": lat, "lng": lng},
        "elevation": elevation,
        "classification": classification,
        "policy_recommendation": classification.get("zone_type"),
        "rationale": classification.get("rationale", []),
    }


@router.get("/summary")
async def get_zones_summary(db: AsyncSession = Depends(get_db)):
    """
    Get summary of all policy zones
    """
    from sqlalchemy import func
    
    query = select(
        PolicyZone.zone_type,
        func.count(PolicyZone.id)
    ).group_by(PolicyZone.zone_type)
    
    result = await db.execute(query)
    zones = {row[0].value: row[1] for row in result.all()}
    
    return {
        "zones": zones,
        "total": sum(zones.values()),
    }
