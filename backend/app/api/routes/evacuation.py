"""
Evacuation routes - Route planning and shelter management
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2.functions import ST_Distance, ST_SetSRID, ST_MakePoint, ST_X, ST_Y

from app.db import get_db, EvacuationShelter
from app.schemas import (
    EvacuationRouteRequest,
    EvacuationRouteResponse,
    ShelterResponse,
)
from app.services.evacuation_router import calculate_evacuation_route

router = APIRouter()


@router.get("/shelters", response_model=list[ShelterResponse])
async def get_nearby_shelters(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """
    Get nearest evacuation shelters to a location
    
    Returns shelters sorted by distance with capacity info
    """
    # Create PostGIS point
    user_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    
    # Query shelters with distance
    query = select(
        EvacuationShelter,
        ST_Distance(EvacuationShelter.location, user_point).label("distance"),
        ST_X(EvacuationShelter.location).label("lng"),
        ST_Y(EvacuationShelter.location).label("lat"),
    ).where(
        EvacuationShelter.is_active == True
    ).order_by(
        "distance"
    ).limit(limit)
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        ShelterResponse(
            id=row.EvacuationShelter.id,
            name=row.EvacuationShelter.name,
            latitude=row.lat,
            longitude=row.lng,
            distance_km=row.distance * 111,  # Approximate km from degrees
            available_capacity=row.EvacuationShelter.total_capacity - row.EvacuationShelter.current_occupancy,
            has_medical=row.EvacuationShelter.has_medical,
            has_food=row.EvacuationShelter.has_food,
            elevation=row.EvacuationShelter.elevation or 0,
        )
        for row in rows
    ]


@router.post("/route", response_model=EvacuationRouteResponse)
async def get_evacuation_route(
    request: EvacuationRouteRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate optimal evacuation route to nearest safe shelter
    
    Preference options:
    - fastest: Shortest time (may pass through risky areas)
    - safest: Avoids flood zones (may be longer)
    - shortest: Shortest distance
    """
    lat, lng = request.start_latitude, request.start_longitude
    preference = request.preference
    
    # Get nearby shelters first
    user_point = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
    
    query = select(
        EvacuationShelter,
        ST_Distance(EvacuationShelter.location, user_point).label("distance"),
        ST_X(EvacuationShelter.location).label("shelter_lng"),
        ST_Y(EvacuationShelter.location).label("shelter_lat"),
    ).where(
        EvacuationShelter.is_active == True,
        EvacuationShelter.total_capacity > EvacuationShelter.current_occupancy
    ).order_by(
        "distance"
    ).limit(5)
    
    result = await db.execute(query)
    shelters = result.all()
    
    if not shelters:
        raise HTTPException(
            status_code=404,
            detail="No available shelters found nearby"
        )
    
    # Calculate route to recommended shelter
    recommended = shelters[0]
    
    route_data = await calculate_evacuation_route(
        start_lat=lat,
        start_lng=lng,
        end_lat=recommended.shelter_lat,
        end_lng=recommended.shelter_lng,
        preference=preference,
    )
    
    # Build response
    recommended_shelter = ShelterResponse(
        id=recommended.EvacuationShelter.id,
        name=recommended.EvacuationShelter.name,
        latitude=recommended.shelter_lat,
        longitude=recommended.shelter_lng,
        distance_km=recommended.distance * 111,
        available_capacity=recommended.EvacuationShelter.total_capacity - recommended.EvacuationShelter.current_occupancy,
        has_medical=recommended.EvacuationShelter.has_medical,
        has_food=recommended.EvacuationShelter.has_food,
        elevation=recommended.EvacuationShelter.elevation or 0,
    )
    
    alternatives = [
        ShelterResponse(
            id=s.EvacuationShelter.id,
            name=s.EvacuationShelter.name,
            latitude=s.shelter_lat,
            longitude=s.shelter_lng,
            distance_km=s.distance * 111,
            available_capacity=s.EvacuationShelter.total_capacity - s.EvacuationShelter.current_occupancy,
            has_medical=s.EvacuationShelter.has_medical,
            has_food=s.EvacuationShelter.has_food,
            elevation=s.EvacuationShelter.elevation or 0,
        )
        for s in shelters[1:]
    ]
    
    return EvacuationRouteResponse(
        origin={"lat": lat, "lng": lng},
        recommended_shelter=recommended_shelter,
        route_geometry=route_data.get("geometry", {}),
        distance_km=route_data.get("distance_km", 0),
        estimated_time_minutes=route_data.get("time_minutes", 0),
        alternative_shelters=alternatives,
    )
