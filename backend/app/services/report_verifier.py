"""
Report Verification Service
Uses LiDAR data to verify community reports
"""
from app.schemas import ReportVerificationResult
from app.services.lidar_processor import get_elevation_at_point


async def verify_report(
    latitude: float,
    longitude: float,
    altitude: float | None,
    category: str,
) -> ReportVerificationResult:
    """
    Verify a community report using AI and LiDAR cross-checking
    
    Verification checks:
    1. GPS altitude vs LiDAR elevation (detect location spoofing)
    2. Category plausibility (e.g., flood at hilltop = suspicious)
    3. Photo analysis (future: computer vision)
    
    Args:
        latitude: Report GPS latitude
        longitude: Report GPS longitude
        altitude: GPS-reported altitude (if available)
        category: Report category (flood, pollution, etc.)
    
    Returns:
        ReportVerificationResult with verification status
    """
    flags = []
    confidence = 1.0
    notes_parts = []
    
    # Get LiDAR elevation at location
    lidar_elevation = await get_elevation_at_point(latitude, longitude)
    
    # Check 1: GPS altitude vs LiDAR elevation
    if altitude is not None:
        elevation_diff = abs(altitude - lidar_elevation)
        
        if elevation_diff > 50:
            flags.append("SEVERE_LOCATION_MISMATCH")
            confidence -= 0.5
            notes_parts.append(f"GPS altitude ({altitude:.1f}m) differs significantly from LiDAR ({lidar_elevation:.1f}m)")
        elif elevation_diff > 20:
            flags.append("LOCATION_MISMATCH")
            confidence -= 0.2
            notes_parts.append(f"Moderate discrepancy between GPS and LiDAR elevation ({elevation_diff:.1f}m)")
        else:
            notes_parts.append("GPS altitude matches LiDAR data")
    else:
        notes_parts.append("No GPS altitude provided, verification limited")
        confidence -= 0.1
    
    # Check 2: Category plausibility based on terrain
    if category == "flood":
        if lidar_elevation > 100:
            flags.append("UNLIKELY_FLOOD_LOCATION")
            confidence -= 0.3
            notes_parts.append(f"Flood report at high elevation ({lidar_elevation:.1f}m) is unlikely")
        elif lidar_elevation < 50:
            notes_parts.append("Location is in plausible flood-prone area")
            confidence += 0.1
    
    elif category == "erosion":
        # Erosion is more likely on slopes
        # In production, we'd check actual slope data
        notes_parts.append("Erosion report noted, terrain analysis pending")
    
    elif category == "pollution":
        # Pollution can occur anywhere
        notes_parts.append("Pollution report registered for investigation")
    
    # Check 3: Coordinate validity
    if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
        flags.append("INVALID_COORDINATES")
        confidence = 0
        notes_parts.append("Invalid GPS coordinates")
    
    # Check 4: Location within expected region (Ganga corridor)
    # Approximate Ganga corridor bounds
    if not (23 <= latitude <= 32) or not (77 <= longitude <= 89):
        flags.append("OUT_OF_REGION")
        confidence -= 0.2
        notes_parts.append("Location outside typical Ganga corridor")
    
    # Normalize confidence
    confidence = max(0, min(1, confidence))
    
    # Determine verification status
    is_verified = confidence >= 0.6 and "SEVERE_LOCATION_MISMATCH" not in flags
    
    return ReportVerificationResult(
        is_verified=is_verified,
        confidence_score=round(confidence, 2),
        flags=flags,
        notes="; ".join(notes_parts),
    )
