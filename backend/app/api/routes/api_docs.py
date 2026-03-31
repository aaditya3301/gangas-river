"""API catalog routes for the researcher API explorer."""

from fastapi import APIRouter

router = APIRouter()

API_CATALOG = {
    "base_url": "http://localhost:8000",
    "version": "1.0.0",
    "groups": [
        {
            "name": "Authentication",
            "prefix": "/api/auth",
            "description": "User registration, login, and JWT token management.",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/auth/register",
                    "summary": "Register a new user account",
                    "auth_required": False,
                    "request_body": {
                        "email": "user@example.com",
                        "password": "securepassword123",
                        "full_name": "Aaditya Sharma",
                        "phone": "+919876543210",
                    },
                    "response_example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIs...",
                        "token_type": "bearer",
                    },
                    "status_codes": {"201": "Created", "400": "Email already exists"},
                },
                {
                    "method": "POST",
                    "path": "/api/auth/login",
                    "summary": "Get JWT token with email and password",
                    "auth_required": False,
                    "request_body": {
                        "email": "user@example.com",
                        "password": "securepassword123",
                    },
                    "response_example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIs...",
                        "token_type": "bearer",
                    },
                    "status_codes": {"200": "Success", "401": "Invalid credentials"},
                },
                {
                    "method": "GET",
                    "path": "/api/auth/me",
                    "summary": "Get current authenticated user info",
                    "auth_required": True,
                    "request_body": None,
                    "response_example": {
                        "id": 1,
                        "email": "user@example.com",
                        "full_name": "Aaditya Sharma",
                        "role": "citizen",
                        "is_active": True,
                    },
                    "status_codes": {"200": "Success", "401": "Not authenticated"},
                },
            ],
        },
        {
            "name": "Safety Check",
            "prefix": "/api/safety",
            "description": "GPS-based flood risk assessment.",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/safety/check",
                    "summary": "Check flood risk at GPS coordinates",
                    "auth_required": False,
                    "request_body": {
                        "latitude": 25.4358,
                        "longitude": 81.8463,
                        "altitude": 65.0,
                    },
                    "response_example": {
                        "is_safe": True,
                        "risk_level": "low",
                        "zone_type": "zone_c",
                        "elevation": 67.5,
                        "flood_depth_prediction": 0.0,
                    },
                    "status_codes": {"200": "Success", "422": "Invalid coordinates"},
                }
            ],
        },
        {
            "name": "Flood Predictions",
            "prefix": "/api/predict",
            "description": "Flood prediction endpoints for risk, heatmap and simulation.",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/predict/flood",
                    "summary": "Predict flood risk at a location",
                    "auth_required": False,
                    "request_body": {
                        "latitude": 25.4358,
                        "longitude": 81.8463,
                        "rainfall_mm": 150,
                    },
                    "response_example": {
                        "risk_percentage": 72.0,
                        "risk_level": "critical",
                        "predicted_depth_m": 1.2,
                        "confidence": 0.85,
                    },
                    "status_codes": {"200": "Success"},
                },
                {
                    "method": "GET",
                    "path": "/api/predict/heatmap",
                    "summary": "Get flood risk heatmap as GeoJSON",
                    "auth_required": False,
                    "query_params": {"zone": "53H13SE (optional)"},
                    "request_body": None,
                    "response_example": {
                        "type": "FeatureCollection",
                        "features": [],
                    },
                    "status_codes": {"200": "GeoJSON FeatureCollection"},
                },
                {
                    "method": "POST",
                    "path": "/api/predict/simulate",
                    "summary": "Simulate flood scenario with water level rise",
                    "auth_required": False,
                    "request_body": {
                        "zone": "53H13SE",
                        "water_level_rise": 3.0,
                    },
                    "response_example": {
                        "affected_area_km2": 45.2,
                        "max_depth_m": 4.1,
                        "affected_population_estimate": 12500,
                    },
                    "status_codes": {"200": "Success"},
                },
            ],
        },
        {
            "name": "Community Reports",
            "prefix": "/api/reports",
            "description": "Citizen-submitted incident reporting and verification.",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/reports/submit",
                    "summary": "Submit a new community report",
                    "auth_required": True,
                    "request_body": {
                        "latitude": 25.4358,
                        "longitude": 81.8463,
                        "altitude": 65.0,
                        "category": "flood",
                        "description": "Water level rising near riverbank",
                        "photo_url": "https://example.com/photo.jpg",
                    },
                    "response_example": {
                        "id": 42,
                        "category": "flood",
                        "status": "verified",
                        "verification_score": 0.85,
                    },
                    "status_codes": {"201": "Created", "422": "Validation error"},
                },
                {
                    "method": "GET",
                    "path": "/api/reports/all",
                    "summary": "Get all reports with optional filters",
                    "auth_required": False,
                    "query_params": {
                        "category": "flood|pollution|infrastructure|erosion|other",
                        "status": "pending|verified|rejected|resolved",
                        "limit": "100 default",
                        "offset": "0 default",
                    },
                    "request_body": None,
                    "response_example": [],
                    "status_codes": {"200": "List of reports"},
                },
                {
                    "method": "GET",
                    "path": "/api/reports/stats",
                    "summary": "Get aggregate report statistics",
                    "auth_required": False,
                    "request_body": None,
                    "response_example": {
                        "total": 156,
                        "by_status": {"pending": 23, "verified": 112},
                        "by_category": {"flood": 67},
                    },
                    "status_codes": {"200": "Success"},
                },
            ],
        },
        {
            "name": "Policy Zones",
            "prefix": "/api/zones",
            "description": "Land zone classification based on flood risk.",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/api/zones/classify",
                    "summary": "Classify land into policy zone",
                    "auth_required": False,
                    "request_body": {"latitude": 25.4358, "longitude": 81.8463},
                    "response_example": {
                        "zone_type": "zone_b",
                        "risk_level": "medium",
                        "flood_depth_prediction_m": 0.35,
                    },
                    "status_codes": {"200": "Success"},
                }
            ],
        },
        {
            "name": "Evacuation",
            "prefix": "/api/evacuation",
            "description": "Shelter discovery and routing.",
            "endpoints": [
                {
                    "method": "GET",
                    "path": "/api/evacuation/shelters",
                    "summary": "Get nearby shelters",
                    "auth_required": False,
                    "query_params": {
                        "latitude": "required",
                        "longitude": "required",
                        "radius_km": "50 default",
                    },
                    "request_body": None,
                    "response_example": [],
                    "status_codes": {"200": "List of shelters"},
                },
                {
                    "method": "POST",
                    "path": "/api/evacuation/route",
                    "summary": "Calculate route between two points",
                    "auth_required": False,
                    "request_body": {
                        "start_lat": 25.4358,
                        "start_lng": 81.8463,
                        "end_lat": 25.3176,
                        "end_lng": 82.9739,
                        "preference": "fastest",
                    },
                    "response_example": {
                        "routes": [
                            {
                                "type": "fastest",
                                "distance_km": 128.5,
                                "duration_min": 145.2,
                            }
                        ]
                    },
                    "status_codes": {"200": "Route(s)"},
                },
            ],
        },
        {
            "name": "Data & Models",
            "prefix": "/api/data, /api/models",
            "description": "Research dataset catalog and model registry endpoints.",
            "endpoints": [
                {
                    "method": "GET",
                    "path": "/api/data/datasets",
                    "summary": "Get dataset catalog with optional category filter",
                    "auth_required": False,
                    "query_params": {
                        "category": "rainfall|hydrology|flood_events|terrain|exposure|vulnerability"
                    },
                    "request_body": None,
                    "response_example": {"datasets": [], "categories": {}},
                    "status_codes": {"200": "Dataset catalog"},
                },
                {
                    "method": "GET",
                    "path": "/api/models/registry",
                    "summary": "Get all ML models",
                    "auth_required": False,
                    "request_body": None,
                    "response_example": {"models": [], "categories": {}},
                    "status_codes": {"200": "Model registry"},
                },
                {
                    "method": "POST",
                    "path": "/api/models/predict",
                    "summary": "Run test prediction against deployed model",
                    "auth_required": False,
                    "request_body": {
                        "latitude": 25.4358,
                        "longitude": 81.8463,
                        "rainfall_mm": 100,
                        "model_id": "lightgbm-classifier",
                    },
                    "response_example": {
                        "model_used": "lightgbm-classifier",
                        "prediction": {"risk_level": "medium", "risk_percentage": 62.0},
                    },
                    "status_codes": {"200": "Prediction result"},
                },
            ],
        },
    ],
}


@router.get("/catalog")
async def get_api_catalog() -> dict:
    """Return the complete API catalog for the researcher explorer page."""
    return API_CATALOG
