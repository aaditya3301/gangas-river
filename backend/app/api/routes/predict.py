"""
Flood prediction routes - AI-powered flood risk assessment
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas import (
    FloodPredictionRequest,
    FloodPredictionResponse,
    FloodHeatmapResponse,
)
from app.services.flood_predictor import (
    predict_flood_risk_at_point,
    generate_flood_heatmap,
)

router = APIRouter()


@router.post("/flood", response_model=FloodPredictionResponse)
async def predict_flood_risk(
    request: FloodPredictionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Predict flood risk at a specific location
    
    Uses:
    - LiDAR elevation data
    - Slope analysis
    - Historical patterns
    - Current/expected rainfall
    
    Returns probability and predicted flood depth
    """
    lat, lng = request.latitude, request.longitude
    rainfall = request.rainfall_mm
    
    try:
        prediction = await predict_flood_risk_at_point(
            latitude=lat,
            longitude=lng,
            rainfall_mm=rainfall,
        )
        
        # Determine risk level from percentage
        risk_pct = prediction["risk_percentage"]
        if risk_pct > 80:
            risk_level = "critical"
        elif risk_pct > 50:
            risk_level = "high"
        elif risk_pct > 25:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return FloodPredictionResponse(
            location={"lat": lat, "lng": lng},
            risk_percentage=risk_pct,
            risk_level=risk_level,
            predicted_depth_m=prediction.get("predicted_depth", 0),
            confidence=prediction.get("confidence", 0.8),
            contributing_factors=prediction.get("factors", []),
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/heatmap", response_model=FloodHeatmapResponse)
async def get_flood_heatmap(
    zone_name: str = "zone_53H13SE",
    water_level: float = 3.0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get flood risk heatmap for visualization
    
    Returns GeoJSON FeatureCollection with risk zones
    """
    try:
        geojson = await generate_flood_heatmap(
            zone_name=zone_name,
            water_level_rise=water_level,
        )
        
        return FloodHeatmapResponse(
            type="FeatureCollection",
            features=geojson.get("features", []),
        )
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"LiDAR data for zone '{zone_name}' not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Heatmap generation failed: {str(e)}"
        )


@router.post("/simulate")
async def simulate_flood_scenario(
    zone_name: str = "zone_53H13SE",
    water_level_rise: float = 5.0,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulate flood scenario with specified water level rise
    
    Used by officials for "what-if" analysis
    """
    try:
        # Generate flood simulation
        geojson = await generate_flood_heatmap(
            zone_name=zone_name,
            water_level_rise=water_level_rise,
        )
        
        # Calculate summary statistics
        features = geojson.get("features", [])
        total_area = sum(f.get("properties", {}).get("area_sqkm", 0) for f in features)
        affected_zones = len([f for f in features if f.get("properties", {}).get("flooded", False)])
        
        return {
            "scenario": {
                "zone_name": zone_name,
                "water_level_rise_m": water_level_rise,
            },
            "impact": {
                "total_affected_area_sqkm": round(total_area, 2),
                "affected_zones_count": affected_zones,
            },
            "geojson": geojson,
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {str(e)}"
        )
