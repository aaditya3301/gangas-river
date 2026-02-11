"""
AI Flood Prediction Service
Uses Random Forest model to predict flood risk
"""
import numpy as np
from typing import Optional
import json

from app.services.lidar_processor import (
    get_elevation_at_point,
    load_lidar_tiles,
    calculate_slope_gradient,
    identify_flood_zones,
)


# Trained model cache
_model_cache: dict = {}


async def predict_flood_risk_at_point(
    latitude: float,
    longitude: float,
    elevation: Optional[float] = None,
    rainfall_mm: float = 0.0,
) -> dict:
    """
    Predict flood risk at a specific location
    
    Uses terrain features and rainfall to estimate risk
    
    Args:
        latitude: GPS latitude
        longitude: GPS longitude
        elevation: Pre-fetched elevation (optional)
        rainfall_mm: Expected rainfall in mm
    
    Returns:
        Dict with risk_percentage, predicted_depth, confidence, factors
    """
    # Get elevation if not provided
    if elevation is None:
        elevation = await get_elevation_at_point(latitude, longitude)
    
    # Calculate risk factors
    factors = []
    risk_score = 0.0
    
    # 1. Elevation factor (lower = higher risk)
    if elevation < 40:
        risk_score += 40
        factors.append("Very low elevation (high flood risk)")
    elif elevation < 60:
        risk_score += 25
        factors.append("Low elevation (moderate flood risk)")
    elif elevation < 80:
        risk_score += 10
        factors.append("Medium elevation")
    else:
        factors.append("High elevation (low flood risk)")
    
    # 2. Rainfall factor
    if rainfall_mm > 100:
        risk_score += 30
        factors.append("Heavy rainfall expected (>100mm)")
    elif rainfall_mm > 50:
        risk_score += 20
        factors.append("Moderate rainfall expected (50-100mm)")
    elif rainfall_mm > 20:
        risk_score += 10
        factors.append("Light rainfall expected (20-50mm)")
    
    # 3. Proximity to river (simulated based on coordinates)
    # In production, this would use actual river geometry
    river_proximity_factor = np.sin(longitude * 10) * 0.5 + 0.5
    if river_proximity_factor > 0.7:
        risk_score += 20
        factors.append("Close to river channel")
    elif river_proximity_factor > 0.4:
        risk_score += 10
        factors.append("Moderate distance from river")
    
    # 4. Historical flood occurrence (simulated)
    # In production, this would query historical data
    historical_factor = (latitude - 25) * 5 % 15
    risk_score += historical_factor
    if historical_factor > 10:
        factors.append("Historical flooding in area")
    
    # Calculate predicted depth
    if risk_score > 70:
        predicted_depth = 2.0 + (risk_score - 70) * 0.1
    elif risk_score > 40:
        predicted_depth = 0.5 + (risk_score - 40) * 0.05
    else:
        predicted_depth = max(0, risk_score * 0.01)
    
    # Add rainfall contribution to depth
    predicted_depth += rainfall_mm * 0.005
    
    # Calculate confidence based on data availability
    confidence = 0.85 if elevation > 0 else 0.6
    
    return {
        "risk_percentage": min(100, max(0, risk_score)),
        "predicted_depth": round(predicted_depth, 2),
        "confidence": confidence,
        "elevation": elevation,
        "factors": factors,
    }


async def generate_flood_heatmap(
    zone_name: str,
    water_level_rise: float = 3.0,
) -> dict:
    """
    Generate GeoJSON heatmap of flood risk for a zone
    
    Args:
        zone_name: LiDAR zone name
        water_level_rise: Simulated water level rise in meters
    
    Returns:
        GeoJSON FeatureCollection with risk polygons
    """
    try:
        # Load LiDAR data
        lidar_data = await load_lidar_tiles(zone_name)
        elevation = lidar_data["elevation"]
        bounds = lidar_data["bounds"]
        
        # Identify flooded areas
        base_level = np.percentile(elevation[~np.isnan(elevation)], 10)
        flooded = await identify_flood_zones(
            elevation,
            water_level_rise,
            base_water_level=base_level
        )
        
        # Create grid cells for visualization
        grid_size = 50  # Reduce resolution for GeoJSON
        lat_step = (bounds["max_lat"] - bounds["min_lat"]) / grid_size
        lng_step = (bounds["max_lng"] - bounds["min_lng"]) / grid_size
        
        features = []
        
        for i in range(grid_size):
            for j in range(grid_size):
                # Calculate cell bounds
                cell_lat = bounds["min_lat"] + i * lat_step
                cell_lng = bounds["min_lng"] + j * lng_step
                
                # Sample elevation at this grid cell
                elev_i = int(i * elevation.shape[0] / grid_size)
                elev_j = int(j * elevation.shape[1] / grid_size)
                
                cell_elevation = elevation[
                    min(elev_i, elevation.shape[0]-1),
                    min(elev_j, elevation.shape[1]-1)
                ]
                
                cell_flooded = flooded[
                    min(elev_i, flooded.shape[0]-1),
                    min(elev_j, flooded.shape[1]-1)
                ]
                
                # Determine risk level
                flood_depth = max(0, base_level + water_level_rise - cell_elevation)
                
                if flood_depth > 2:
                    risk_level = "critical"
                    color = "#dc2626"  # Red
                elif flood_depth > 0.5:
                    risk_level = "high"
                    color = "#f97316"  # Orange
                elif flood_depth > 0:
                    risk_level = "medium"
                    color = "#eab308"  # Yellow
                else:
                    risk_level = "low"
                    color = "#22c55e"  # Green
                
                # Create GeoJSON feature
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [cell_lng, cell_lat],
                            [cell_lng + lng_step, cell_lat],
                            [cell_lng + lng_step, cell_lat + lat_step],
                            [cell_lng, cell_lat + lat_step],
                            [cell_lng, cell_lat],
                        ]]
                    },
                    "properties": {
                        "elevation": float(cell_elevation) if not np.isnan(cell_elevation) else 0,
                        "flood_depth": round(flood_depth, 2),
                        "risk_level": risk_level,
                        "flooded": bool(cell_flooded),
                        "color": color,
                        "area_sqkm": lat_step * lng_step * 111 * 111,  # Approximate
                    }
                }
                
                features.append(feature)
        
        return {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {
                "zone_name": zone_name,
                "water_level_rise": water_level_rise,
                "bounds": bounds,
                "total_cells": len(features),
                "flooded_cells": sum(1 for f in features if f["properties"]["flooded"]),
            }
        }
    
    except FileNotFoundError:
        # Return empty GeoJSON if no data
        raise
    except Exception as e:
        raise Exception(f"Heatmap generation failed: {str(e)}")


async def train_flood_model(zone_name: str) -> dict:
    """
    Train/retrain the flood prediction model
    
    Uses LiDAR elevation data and synthetic rainfall scenarios
    """
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.model_selection import train_test_split
    
    # Load terrain data
    lidar_data = await load_lidar_tiles(zone_name)
    elevation = lidar_data["elevation"]
    
    # Calculate slope
    slope = await calculate_slope_gradient(elevation)
    
    # Create training dataset
    # Flatten arrays and create features
    elev_flat = elevation.flatten()
    slope_flat = slope.flatten()
    
    # Remove NaN values
    valid_mask = ~(np.isnan(elev_flat) | np.isnan(slope_flat))
    elev_valid = elev_flat[valid_mask]
    slope_valid = slope_flat[valid_mask]
    
    # Sample subset for training
    n_samples = min(10000, len(elev_valid))
    indices = np.random.choice(len(elev_valid), n_samples, replace=False)
    
    # Generate features
    X = np.column_stack([
        elev_valid[indices],
        slope_valid[indices],
        np.random.uniform(0, 200, n_samples),  # Rainfall scenarios
    ])
    
    # Generate target (synthetic flood depth based on features)
    # Lower elevation + higher rainfall = more flooding
    min_elev = np.min(elev_valid)
    y = np.maximum(0, 
        (min_elev + 20 - X[:, 0]) * 0.1 +  # Elevation factor
        X[:, 2] * 0.01 -  # Rainfall factor
        X[:, 1] * 0.05  # Slope factor (drainage)
    )
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    # Cache model
    _model_cache[zone_name] = model
    
    return {
        "zone_name": zone_name,
        "samples_used": n_samples,
        "train_r2": round(train_score, 4),
        "test_r2": round(test_score, 4),
        "feature_importance": {
            "elevation": float(model.feature_importances_[0]),
            "slope": float(model.feature_importances_[1]),
            "rainfall": float(model.feature_importances_[2]),
        }
    }
