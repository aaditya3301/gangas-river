"""
Zone Classification Service
Automated land classification for policy zoning
"""
from app.services.lidar_processor import get_elevation_at_point
from app.services.flood_predictor import predict_flood_risk_at_point


async def classify_location(
    latitude: float,
    longitude: float,
    elevation: float | None = None,
) -> dict:
    """
    Classify a location into policy zones based on terrain analysis
    
    Zone Classification:
    - Zone A (Red): High flood risk, flood depth > 50cm
        - No permanent construction allowed
        - Only temporary/removable structures
    
    - Zone B (Yellow): Moderate risk, flood depth 20-50cm
        - Construction requires flood-proofing
        - Elevated foundations mandatory
    
    - Zone C (Green): Low risk, flood depth < 20cm
        - Normal building permits allowed
        - Standard construction codes apply
    
    Args:
        latitude: GPS latitude
        longitude: GPS longitude
        elevation: Pre-fetched elevation (optional)
    
    Returns:
        Dict with zone_type, restrictions, message, rationale
    """
    # Get elevation if not provided
    if elevation is None:
        elevation = await get_elevation_at_point(latitude, longitude)
    
    # Get flood prediction
    prediction = await predict_flood_risk_at_point(latitude, longitude, elevation)
    
    risk_percentage = prediction["risk_percentage"]
    predicted_depth = prediction["predicted_depth"]
    
    rationale = []
    
    # Classify based on predicted flood depth
    if predicted_depth > 0.5:  # > 50cm
        zone_type = "zone_a"
        restrictions = {
            "construction": "prohibited",
            "temporary_structures": "allowed",
            "agriculture": "seasonal_only",
            "habitation": "prohibited",
        }
        message = "ZONE A: High flood risk area. Permanent construction is prohibited. Only temporary, removable structures are permitted."
        rationale.append(f"Predicted flood depth: {predicted_depth:.2f}m (>0.5m threshold)")
        rationale.append(f"Flood risk: {risk_percentage:.0f}%")
        rationale.append(f"Terrain elevation: {elevation:.1f}m (below safe threshold)")
    
    elif predicted_depth > 0.2:  # 20-50cm
        zone_type = "zone_b"
        restrictions = {
            "construction": "conditional",
            "elevated_foundation": "required",
            "flood_proofing": "mandatory",
            "agriculture": "allowed",
        }
        message = "ZONE B: Moderate flood risk area. Construction requires flood-proofing measures and elevated foundations (minimum 1m above ground)."
        rationale.append(f"Predicted flood depth: {predicted_depth:.2f}m (0.2-0.5m range)")
        rationale.append(f"Flood risk: {risk_percentage:.0f}%")
        rationale.append("Flood-proofing can mitigate risks")
    
    else:  # < 20cm
        zone_type = "zone_c"
        restrictions = {
            "construction": "allowed",
            "standard_codes": "apply",
            "agriculture": "allowed",
        }
        message = "ZONE C: Low flood risk area. Standard building permits and construction codes apply."
        rationale.append(f"Predicted flood depth: {predicted_depth:.2f}m (<0.2m threshold)")
        rationale.append(f"Flood risk: {risk_percentage:.0f}%")
        rationale.append("Area is relatively safe from flooding")
    
    # Additional factors
    if elevation < 40:
        rationale.append("Low-lying terrain detected")
    elif elevation > 100:
        rationale.append("Elevated terrain provides natural protection")
    
    return {
        "zone_type": zone_type,
        "restrictions": restrictions,
        "message": message,
        "rationale": rationale,
        "terrain_data": {
            "elevation": elevation,
            "risk_percentage": risk_percentage,
            "predicted_flood_depth": predicted_depth,
        }
    }


async def batch_classify_area(
    min_lat: float,
    max_lat: float,
    min_lng: float,
    max_lng: float,
    grid_resolution: int = 20,
) -> dict:
    """
    Classify an entire area into policy zones
    
    Used for generating zone maps for officials
    
    Returns:
        GeoJSON FeatureCollection with zone polygons
    """
    features = []
    
    lat_step = (max_lat - min_lat) / grid_resolution
    lng_step = (max_lng - min_lng) / grid_resolution
    
    for i in range(grid_resolution):
        for j in range(grid_resolution):
            cell_lat = min_lat + i * lat_step + lat_step / 2
            cell_lng = min_lng + j * lng_step + lng_step / 2
            
            classification = await classify_location(cell_lat, cell_lng)
            
            # Determine color based on zone
            zone_colors = {
                "zone_a": "#dc2626",  # Red
                "zone_b": "#f59e0b",  # Amber
                "zone_c": "#22c55e",  # Green
            }
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [min_lng + j * lng_step, min_lat + i * lat_step],
                        [min_lng + (j + 1) * lng_step, min_lat + i * lat_step],
                        [min_lng + (j + 1) * lng_step, min_lat + (i + 1) * lat_step],
                        [min_lng + j * lng_step, min_lat + (i + 1) * lat_step],
                        [min_lng + j * lng_step, min_lat + i * lat_step],
                    ]]
                },
                "properties": {
                    "zone_type": classification["zone_type"],
                    "color": zone_colors.get(classification["zone_type"], "#gray"),
                    "elevation": classification["terrain_data"]["elevation"],
                    "risk_percentage": classification["terrain_data"]["risk_percentage"],
                }
            }
            
            features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "bounds": {
                "min_lat": min_lat,
                "max_lat": max_lat,
                "min_lng": min_lng,
                "max_lng": max_lng,
            },
            "resolution": grid_resolution,
            "total_cells": len(features),
        }
    }
