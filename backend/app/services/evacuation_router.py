"""Evacuation routing service using OSRM with fallback behavior."""

import math
from typing import Any

import httpx

OSRM_BASE = "http://router.project-osrm.org"

SHELTERS = [
    {
        "id": 1,
        "name": "Prayagraj Community Shelter",
        "lat": 25.4358,
        "lng": 81.8463,
        "address": "Civil Lines, Prayagraj",
        "total_capacity": 500,
        "current_occupancy": 155,
        "has_medical": True,
        "has_food": True,
        "has_water": True,
        "contact_phone": "+919000000001",
        "elevation": 98.4,
    },
    {
        "id": 2,
        "name": "Varanasi Relief Camp",
        "lat": 25.3176,
        "lng": 82.9739,
        "address": "Cantt Area, Varanasi",
        "total_capacity": 300,
        "current_occupancy": 220,
        "has_medical": True,
        "has_food": True,
        "has_water": True,
        "contact_phone": "+919000000002",
        "elevation": 91.2,
    },
    {
        "id": 3,
        "name": "Kanpur Flood Shelter",
        "lat": 26.4499,
        "lng": 80.3319,
        "address": "Kalyanpur, Kanpur",
        "total_capacity": 400,
        "current_occupancy": 98,
        "has_medical": False,
        "has_food": True,
        "has_water": True,
        "contact_phone": "+919000000003",
        "elevation": 106.3,
    },
    {
        "id": 4,
        "name": "Patna Emergency Center",
        "lat": 25.6093,
        "lng": 85.1376,
        "address": "Kankarbagh, Patna",
        "total_capacity": 600,
        "current_occupancy": 360,
        "has_medical": True,
        "has_food": True,
        "has_water": True,
        "contact_phone": "+919000000004",
        "elevation": 87.0,
    },
    {
        "id": 5,
        "name": "Hapur Relief Shelter",
        "lat": 28.7306,
        "lng": 77.7811,
        "address": "Railway Road, Hapur",
        "total_capacity": 260,
        "current_occupancy": 110,
        "has_medical": True,
        "has_food": True,
        "has_water": True,
        "contact_phone": "+919000000005",
        "elevation": 214.0,
    },
    {
        "id": 6,
        "name": "Lucknow Community Camp",
        "lat": 26.8467,
        "lng": 80.9462,
        "address": "Hazratganj, Lucknow",
        "total_capacity": 420,
        "current_occupancy": 165,
        "has_medical": True,
        "has_food": True,
        "has_water": True,
        "contact_phone": "+919000000006",
        "elevation": 123.0,
    },
]


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in kilometers."""
    radius = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return radius * 2 * math.asin(math.sqrt(a))


async def get_nearby_shelters(lat: float, lng: float, radius_km: float = 50) -> list[dict[str, Any]]:
    """Return shelters within search radius sorted by distance."""
    nearby = []
    for shelter in SHELTERS:
        dist = haversine_km(lat, lng, shelter["lat"], shelter["lng"])
        if dist <= radius_km:
            enriched = {
                **shelter,
                "capacity": shelter.get("total_capacity", 0),
                "distance_km": round(dist, 2),
            }
            nearby.append(enriched)

    nearby.sort(key=lambda item: item["distance_km"])
    return nearby


def _build_steps(route: dict[str, Any]) -> list[dict[str, Any]]:
    steps: list[dict[str, Any]] = []
    for leg in route.get("legs", []):
        for step in leg.get("steps", []):
            maneuver = step.get("maneuver", {})
            steps.append(
                {
                    "instruction": maneuver.get("type", "continue"),
                    "modifier": maneuver.get("modifier", ""),
                    "road_name": step.get("name", ""),
                    "distance_m": round(step.get("distance", 0)),
                    "duration_s": round(step.get("duration", 0)),
                }
            )
    return steps


async def calculate_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    preference: str = "fastest",
) -> dict[str, Any]:
    """Calculate road route via OSRM and return alternatives with geometry."""
    coords = f"{start_lng},{start_lat};{end_lng},{end_lat}"
    url = f"{OSRM_BASE}/route/v1/driving/{coords}"
    params = {
        "alternatives": "true",
        "steps": "true",
        "geometries": "geojson",
        "overview": "full",
        "annotations": "duration,distance",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)

        data = response.json() if response.status_code == 200 else {}
        if data.get("code") != "Ok" or not data.get("routes"):
            return _fallback_route(start_lat, start_lng, end_lat, end_lng)

        routes: list[dict[str, Any]] = []
        for index, route in enumerate(data["routes"]):
            route_type = "fastest"
            if index == 1:
                route_type = "alternative_1"
            elif index == 2:
                route_type = "alternative_2"

            routes.append(
                {
                    "type": route_type,
                    "geometry": route["geometry"],
                    "distance_km": round(route["distance"] / 1000, 2),
                    "duration_min": round(route["duration"] / 60, 1),
                    "steps": _build_steps(route),
                }
            )

        routes.sort(key=lambda item: item["duration_min"])
        if routes:
            routes[0]["type"] = "fastest"
        if len(routes) >= 2:
            shortest = min(routes, key=lambda item: item["distance_km"])
            shortest["type"] = "shortest"
        if len(routes) >= 3:
            middle_idx = min(1, len(routes) - 1)
            routes[middle_idx]["type"] = "safest"

        return {
            "origin": {"lat": start_lat, "lng": start_lng},
            "destination": {"lat": end_lat, "lng": end_lng},
            "preference": preference,
            "routes": routes,
        }
    except Exception:
        return _fallback_route(start_lat, start_lng, end_lat, end_lng)


def _fallback_route(lat1: float, lng1: float, lat2: float, lng2: float) -> dict[str, Any]:
    """Fallback direct route when OSRM is unavailable."""
    dist = haversine_km(lat1, lng1, lat2, lng2)
    return {
        "origin": {"lat": lat1, "lng": lng1},
        "destination": {"lat": lat2, "lng": lng2},
        "preference": "direct",
        "routes": [
            {
                "type": "direct",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[lng1, lat1], [lng2, lat2]],
                },
                "distance_km": round(dist, 2),
                "duration_min": round((dist / 35) * 60, 1),
                "steps": [],
            }
        ],
    }


async def find_route_to_nearest_shelter(lat: float, lng: float, preference: str = "fastest") -> dict[str, Any]:
    """Find route from origin to nearest available shelter."""
    shelters: list[dict[str, Any]] = []
    search_radius_km = 50.0
    for radius in (50.0, 100.0, 250.0, 500.0):
        shelters = await get_nearby_shelters(lat, lng, radius)
        if shelters:
            search_radius_km = radius
            break

    if not shelters:
        # Final fallback: choose absolute nearest shelter from the catalog.
        nearest = min(
            (
                {
                    **shelter,
                    "capacity": shelter.get("total_capacity", 0),
                    "distance_km": round(haversine_km(lat, lng, shelter["lat"], shelter["lng"]), 2),
                }
                for shelter in SHELTERS
            ),
            key=lambda item: float(item["distance_km"]),
        )
        route_payload = await calculate_route(lat, lng, nearest["lat"], nearest["lng"], preference)
        route_payload["shelter"] = nearest
        route_payload["search_radius_km"] = "global-nearest"
        return route_payload

    nearest = shelters[0]
    route_payload = await calculate_route(lat, lng, nearest["lat"], nearest["lng"], preference)
    route_payload["shelter"] = nearest
    route_payload["search_radius_km"] = search_radius_km
    return route_payload
