"""Evacuation routes - shelters and road routing APIs."""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.services.evacuation_router import (
    calculate_route,
    find_route_to_nearest_shelter,
    get_nearby_shelters,
)

router = APIRouter()


class RouteRequest(BaseModel):
    start_lat: float = Field(..., ge=-90, le=90)
    start_lng: float = Field(..., ge=-180, le=180)
    end_lat: float = Field(..., ge=-90, le=90)
    end_lng: float = Field(..., ge=-180, le=180)
    preference: str = Field(default="fastest", pattern="^(fastest|safest|shortest)$")


class ShelterRouteRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    preference: str = Field(default="fastest", pattern="^(fastest|safest|shortest)$")


@router.get("/shelters")
async def shelters(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(50),
):
    """Get nearby shelters sorted by distance."""
    return await get_nearby_shelters(latitude, longitude, radius_km)


@router.post("/route")
async def route(data: RouteRequest):
    """Calculate route between two points using OSRM + fallback."""
    return await calculate_route(
        start_lat=data.start_lat,
        start_lng=data.start_lng,
        end_lat=data.end_lat,
        end_lng=data.end_lng,
        preference=data.preference,
    )


@router.post("/route-to-shelter")
async def route_to_shelter(data: ShelterRouteRequest):
    """Calculate route from current location to nearest shelter."""
    return await find_route_to_nearest_shelter(
        lat=data.latitude,
        lng=data.longitude,
        preference=data.preference,
    )
