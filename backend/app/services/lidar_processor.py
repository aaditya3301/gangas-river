"""
LiDAR data processor service
Handles loading and analyzing LiDAR elevation data
"""
import os
from pathlib import Path
from typing import Optional
import numpy as np

from app.core.config import settings


# Cache for loaded LiDAR data
_lidar_cache: dict = {}


async def get_elevation_at_point(latitude: float, longitude: float) -> float:
    """
    Get elevation at a specific GPS coordinate from LiDAR data
    
    Args:
        latitude: GPS latitude
        longitude: GPS longitude
    
    Returns:
        Elevation in meters
    """
    # Try to load LiDAR data and query elevation
    try:
        # For MVP, we'll use a simplified approach
        # In production, this would query actual GeoTIFF data
        
        data_path = Path(settings.LIDAR_DATA_PATH)
        
        # Check if we have cached data
        cache_key = f"{latitude:.4f}_{longitude:.4f}"
        if cache_key in _lidar_cache:
            return _lidar_cache[cache_key]
        
        # Try to load rasterio if available
        try:
            import rasterio
            from rasterio.windows import Window
            
            # Find relevant DEM file based on coordinates
            dem_files = list(data_path.rglob("*.tif"))
            
            for dem_file in dem_files:
                with rasterio.open(dem_file) as src:
                    # Check if point is within bounds
                    if (src.bounds.left <= longitude <= src.bounds.right and
                        src.bounds.bottom <= latitude <= src.bounds.top):
                        
                        # Get pixel coordinates
                        row, col = src.index(longitude, latitude)
                        
                        # Read elevation value
                        window = Window(col, row, 1, 1)
                        elevation = src.read(1, window=window)[0, 0]
                        
                        # Cache and return
                        _lidar_cache[cache_key] = float(elevation)
                        return float(elevation)
        
        except ImportError:
            pass
        
        # Fallback: Return synthetic elevation based on coordinates
        # This simulates realistic Ganga corridor elevations (40-120m)
        base_elevation = 60 + (latitude - 25) * 10 + (longitude - 84) * 5
        noise = np.sin(latitude * 100) * 5 + np.cos(longitude * 100) * 3
        elevation = max(30, min(150, base_elevation + noise))
        
        _lidar_cache[cache_key] = elevation
        return elevation
    
    except Exception as e:
        # Default elevation for error cases
        return 50.0


async def load_lidar_tiles(zone_name: str) -> dict:
    """
    Load LiDAR DEM tiles for a specific zone
    
    Args:
        zone_name: Zone identifier (e.g., "zone_53H13SE")
    
    Returns:
        Dict with elevation array and metadata
    """
    data_path = Path(settings.LIDAR_DATA_PATH) / zone_name / "DEM"
    
    if not data_path.exists():
        raise FileNotFoundError(f"LiDAR data not found for zone: {zone_name}")
    
    try:
        import rasterio
        from rasterio.merge import merge
        
        # Find all GeoTIFF files
        dem_files = list(data_path.glob("*.tif"))
        
        if not dem_files:
            raise FileNotFoundError(f"No DEM files found in {data_path}")
        
        # If single file, load directly
        if len(dem_files) == 1:
            with rasterio.open(dem_files[0]) as src:
                elevation = src.read(1)
                bounds = src.bounds
                crs = str(src.crs)
                transform = src.transform
        else:
            # Merge multiple tiles
            src_files = [rasterio.open(f) for f in dem_files]
            mosaic, mosaic_transform = merge(src_files)
            elevation = mosaic[0]
            bounds = src_files[0].bounds
            crs = str(src_files[0].crs)
            transform = mosaic_transform
            
            for src in src_files:
                src.close()
        
        return {
            "elevation": elevation,
            "bounds": {
                "min_lat": bounds.bottom,
                "max_lat": bounds.top,
                "min_lng": bounds.left,
                "max_lng": bounds.right,
            },
            "crs": crs,
            "shape": elevation.shape,
            "stats": {
                "min": float(np.nanmin(elevation)),
                "max": float(np.nanmax(elevation)),
                "mean": float(np.nanmean(elevation)),
                "std": float(np.nanstd(elevation)),
            },
        }
    
    except ImportError:
        # Return synthetic data if rasterio not available
        return _generate_synthetic_lidar(zone_name)


def _generate_synthetic_lidar(zone_name: str) -> dict:
    """Generate synthetic LiDAR data for demo purposes"""
    
    # Create synthetic elevation grid
    size = 500
    x = np.linspace(0, 10, size)
    y = np.linspace(0, 10, size)
    X, Y = np.meshgrid(x, y)
    
    # Generate realistic terrain
    elevation = (
        50 +  # Base elevation
        20 * np.sin(X * 0.5) * np.cos(Y * 0.3) +  # Large hills
        5 * np.sin(X * 2) * np.cos(Y * 2) +  # Smaller features
        np.random.randn(size, size) * 2  # Noise
    )
    
    # Add river valley
    river_x = size // 2
    for i in range(size):
        valley_width = 30 + 10 * np.sin(i * 0.05)
        for j in range(int(river_x - valley_width), int(river_x + valley_width)):
            if 0 <= j < size:
                dist = abs(j - river_x)
                depth = 15 * (1 - dist / valley_width)
                elevation[i, j] -= depth
    
    return {
        "elevation": elevation,
        "bounds": {
            "min_lat": 25.0,
            "max_lat": 26.0,
            "min_lng": 84.0,
            "max_lng": 85.0,
        },
        "crs": "EPSG:4326",
        "shape": elevation.shape,
        "stats": {
            "min": float(np.min(elevation)),
            "max": float(np.max(elevation)),
            "mean": float(np.mean(elevation)),
            "std": float(np.std(elevation)),
        },
    }


async def calculate_slope_gradient(elevation: np.ndarray, cell_size: float = 30.0) -> np.ndarray:
    """
    Calculate slope gradient from elevation data
    
    Args:
        elevation: 2D numpy array of elevations
        cell_size: Size of each cell in meters
    
    Returns:
        2D array of slope values in degrees
    """
    # Calculate gradients
    dy, dx = np.gradient(elevation, cell_size)
    
    # Calculate slope in degrees
    slope = np.degrees(np.arctan(np.sqrt(dx**2 + dy**2)))
    
    return slope


async def identify_flood_zones(
    elevation: np.ndarray,
    water_level_rise: float,
    base_water_level: float = 0.0
) -> np.ndarray:
    """
    Identify areas that would be flooded at a given water level
    
    Args:
        elevation: 2D elevation array
        water_level_rise: Meters of water level rise
        base_water_level: Current water level
    
    Returns:
        Boolean array where True = flooded
    """
    flood_level = base_water_level + water_level_rise
    flooded = elevation < flood_level
    
    return flooded


async def extract_elevation_grid(
    zone_name: str,
    resolution: int = 100
) -> dict:
    """
    Extract a resampled elevation grid for visualization
    
    Args:
        zone_name: Zone identifier
        resolution: Output grid resolution
    
    Returns:
        Dict with resampled grid and metadata
    """
    lidar_data = await load_lidar_tiles(zone_name)
    elevation = lidar_data["elevation"]
    
    # Resample to lower resolution for visualization
    from scipy.ndimage import zoom
    
    zoom_factor = resolution / max(elevation.shape)
    resampled = zoom(elevation, zoom_factor, order=1)
    
    return {
        "grid": resampled.tolist(),
        "shape": resampled.shape,
        "bounds": lidar_data["bounds"],
        "original_stats": lidar_data["stats"],
    }
