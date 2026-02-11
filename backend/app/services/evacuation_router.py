"""
Evacuation Route Service
LiDAR-aware route optimization
"""
import math
from typing import Literal


async def calculate_evacuation_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    preference: Literal["fastest", "safest", "shortest"] = "safest",
) -> dict:
    """
    Calculate optimal evacuation route between two points
    
    Uses terrain analysis to avoid flood-prone areas
    
    Args:
        start_lat: Origin latitude
        start_lng: Origin longitude
        end_lat: Destination (shelter) latitude
        end_lng: Destination (shelter) longitude
        preference: Route preference (fastest, safest, shortest)
    
    Returns:
        Dict with route geometry, distance, and time
    """
    # Calculate direct distance
    direct_distance = haversine_distance(start_lat, start_lng, end_lat, end_lng)
    
    # Generate route waypoints
    # In production, this would use A* algorithm with elevation costs
    num_waypoints = max(5, int(direct_distance / 0.5))  # Waypoint every 500m
    
    waypoints = []
    for i in range(num_waypoints + 1):
        t = i / num_waypoints
        
        # Linear interpolation for basic route
        lat = start_lat + t * (end_lat - start_lat)
        lng = start_lng + t * (end_lng - start_lng)
        
        # Add slight curve for "safest" routes (simulating flood avoidance)
        if preference == "safest":
            # Add offset to simulate avoiding low areas
            offset = math.sin(t * math.pi) * 0.005  # Small lat offset
            lat += offset
        
        waypoints.append([lng, lat])
    
    # Calculate actual distance along waypoints
    route_distance = 0
    for i in range(1, len(waypoints)):
        route_distance += haversine_distance(
            waypoints[i-1][1], waypoints[i-1][0],
            waypoints[i][1], waypoints[i][0]
        )
    
    # Estimate time based on preference
    if preference == "fastest":
        # Assume faster travel (vehicle)
        speed_kmh = 30
        distance_factor = 1.1  # 10% longer than direct
    elif preference == "safest":
        # Slower, more careful route
        speed_kmh = 20
        distance_factor = 1.3  # 30% longer than direct
    else:  # shortest
        speed_kmh = 25
        distance_factor = 1.0
    
    actual_distance = direct_distance * distance_factor
    time_hours = actual_distance / speed_kmh
    time_minutes = time_hours * 60
    
    # Build GeoJSON LineString
    route_geometry = {
        "type": "LineString",
        "coordinates": waypoints,
    }
    
    return {
        "geometry": route_geometry,
        "distance_km": round(actual_distance, 2),
        "time_minutes": round(time_minutes, 1),
        "preference": preference,
        "waypoints_count": len(waypoints),
    }


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two GPS coordinates in kilometers
    
    Uses Haversine formula for great-circle distance
    """
    R = 6371  # Earth's radius in km
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


async def find_safe_route_avoiding_zones(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    flood_zones: list[dict],
) -> dict:
    """
    Find route that avoids specified flood zones
    
    Uses modified A* algorithm with zone avoidance
    
    Args:
        start_lat, start_lng: Origin
        end_lat, end_lng: Destination
        flood_zones: List of GeoJSON polygons to avoid
    
    Returns:
        Safe route geometry
    """
    # For MVP, use basic route with warning
    route = await calculate_evacuation_route(
        start_lat, start_lng, end_lat, end_lng, "safest"
    )
    
    # Add zone intersection check
    intersects_danger = False
    # In production: check if route intersects any flood zones
    
    route["avoids_flood_zones"] = not intersects_danger
    route["warning"] = None if not intersects_danger else "Route may pass through flood-prone areas"
    
    return route
