# AquaGuardians Backend Documentation

**Version:** 1.0.0  
**Framework:** FastAPI + SQLAlchemy (Async)  
**Database:** NeonDB (Serverless PostgreSQL + PostGIS)  
**Created:** February 11, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Core Services](#core-services)
6. [Authentication](#authentication)
7. [Configuration](#configuration)
8. [Running the Server](#running-the-server)
9. [Environment Variables](#environment-variables)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FastAPI Server                          │
│                    (Uvicorn ASGI Server)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │   Auth   │  │  Safety  │  │ Reports  │  │   Predictions    ││
│  │  Routes  │  │  Routes  │  │  Routes  │  │     Routes       ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘│
│       │             │             │                 │          │
│  ┌────┴─────────────┴─────────────┴─────────────────┴────────┐ │
│  │                     Core Services                          │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐             │ │
│  │  │   LiDAR    │ │   Flood    │ │   Zone     │             │ │
│  │  │ Processor  │ │ Predictor  │ │ Classifier │             │ │
│  │  └────────────┘ └────────────┘ └────────────┘             │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────────┐ │
│  │              SQLAlchemy Async ORM + GeoAlchemy2           │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
                 ┌─────────────────────────────┐
                 │   NeonDB (PostgreSQL 15)    │
                 │      + PostGIS Extension    │
                 └─────────────────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Web Framework | FastAPI 0.109.2 |
| ASGI Server | Uvicorn 0.27.1 |
| ORM | SQLAlchemy 2.0 (Async) |
| Spatial Data | GeoAlchemy2 + PostGIS |
| Database | NeonDB (Serverless PostgreSQL) |
| Authentication | JWT (python-jose) |
| Password Hashing | bcrypt (passlib) |
| Validation | Pydantic 2.6 |

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py         # User registration, login, JWT
│   │       ├── evacuation.py   # Evacuation routes & shelters
│   │       ├── health.py       # Health check endpoint
│   │       ├── predict.py      # AI flood predictions
│   │       ├── reports.py      # Community reports CRUD
│   │       ├── safety.py       # "Am I Safe?" GPS checker
│   │       └── zones.py        # Policy zone classification
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Environment configuration
│   │   └── security.py         # JWT tokens, password hashing, RBAC
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── models.py           # SQLAlchemy models (7 tables)
│   │   └── session.py          # Async database session management
│   │
│   ├── schemas/
│   │   └── __init__.py         # Pydantic request/response models
│   │
│   └── services/
│       ├── __init__.py
│       ├── evacuation_router.py  # Route calculation with Haversine
│       ├── flood_predictor.py    # AI flood risk prediction
│       ├── lidar_processor.py    # LiDAR data processing
│       ├── report_verifier.py    # AI verification of reports
│       └── zone_classifier.py    # Policy zone classification
│
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment template
├── .gitignore
└── requirements.txt            # Python dependencies
```

---

## Database Schema

### Entity Relationship

```
┌──────────────┐       ┌───────────────────┐
│    users     │───────│ community_reports │
└──────────────┘       └───────────────────┘
       │
       │
       ▼
┌──────────────┐
│  ngo_tasks   │
└──────────────┘

┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐
│ flood_zones  │  │ policy_zones │  │ evacuation_shelters │
└──────────────┘  └──────────────┘  └─────────────────────┘

┌──────────────┐
│ iot_sensors  │
└──────────────┘
```

### Tables

#### 1. users
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Unique, indexed |
| hashed_password | VARCHAR(255) | bcrypt hash |
| full_name | VARCHAR(255) | Optional |
| phone | VARCHAR(20) | Optional |
| role | ENUM | citizen, official, ngo, researcher, admin |
| location | GEOMETRY(POINT) | User's home/farm location |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |
| is_active | BOOLEAN | Account status |

#### 2. community_reports
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | Foreign key → users |
| location | GEOMETRY(POINT) | Report GPS location |
| category | ENUM | flood, pollution, infrastructure, erosion, other |
| description | TEXT | Report details |
| photo_url | VARCHAR(500) | Photo link |
| status | ENUM | pending, verified, rejected, resolved |
| verification_score | FLOAT | AI confidence (0-1) |
| verification_notes | TEXT | AI verification notes |
| reported_at | TIMESTAMP | Submission time |
| verified_at | TIMESTAMP | Verification time |
| reported_altitude | FLOAT | GPS altitude for verification |

#### 3. flood_zones
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| geometry | GEOMETRY(POLYGON) | Zone boundary |
| zone_type | ENUM | zone_a, zone_b, zone_c |
| risk_level | ENUM | low, medium, high, critical |
| min_elevation | FLOAT | Minimum elevation in zone |
| max_elevation | FLOAT | Maximum elevation |
| avg_elevation | FLOAT | Average elevation |
| slope_gradient | FLOAT | Terrain slope |
| flood_depth_1m | FLOAT | Depth if river rises 1m |
| flood_depth_3m | FLOAT | Depth if river rises 3m |
| flood_depth_5m | FLOAT | Depth if river rises 5m |
| source_lidar_zone | VARCHAR(50) | LiDAR tile source |

#### 4. policy_zones
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| geometry | GEOMETRY(POLYGON) | Zone boundary |
| zone_type | ENUM | zone_a (no build), zone_b (conditional), zone_c (allowed) |
| name | VARCHAR(255) | Zone name |
| restrictions | JSON | Building restrictions |
| notification_number | VARCHAR(100) | Official notification |
| effective_date | TIMESTAMP | When restrictions apply |

#### 5. iot_sensors
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| sensor_id | VARCHAR(50) | Unique sensor identifier |
| location | GEOMETRY(POINT) | Sensor location |
| name | VARCHAR(255) | Sensor name |
| sensor_type | VARCHAR(50) | water_level, rainfall, etc. |
| latest_value | FLOAT | Most recent reading |
| latest_reading_at | TIMESTAMP | Reading timestamp |
| is_active | BOOLEAN | Sensor status |
| battery_level | FLOAT | Battery percentage |

#### 6. evacuation_shelters
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| location | GEOMETRY(POINT) | Shelter location |
| name | VARCHAR(255) | Shelter name |
| address | TEXT | Full address |
| total_capacity | INTEGER | Max capacity |
| current_occupancy | INTEGER | Current occupants |
| has_medical | BOOLEAN | Medical facilities |
| has_food | BOOLEAN | Food available |
| has_water | BOOLEAN | Water available |
| contact_phone | VARCHAR(20) | Contact number |
| elevation | FLOAT | Shelter elevation |
| is_active | BOOLEAN | Shelter status |

#### 7. ngo_tasks
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| ngo_user_id | INTEGER | Foreign key → users |
| title | VARCHAR(255) | Task title |
| description | TEXT | Task details |
| location | GEOMETRY(POINT) | Task location |
| status | VARCHAR(50) | pending, in_progress, completed, verified |
| proof_photo_url | VARCHAR(500) | Completion proof |
| satellite_verification_score | FLOAT | Satellite verification |
| points_awarded | INTEGER | Gamification points |
| created_at | TIMESTAMP | Task creation |
| completed_at | TIMESTAMP | Completion time |

---

## API Endpoints

### Base URL: `http://localhost:8000`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |
| GET | `/` | API info |

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Get JWT token | No |
| GET | `/me` | Get current user info | Yes |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "phone": "+91-9876543210"
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Token Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "citizen"
  }
}
```

### Safety Check (`/api/safety`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/check` | Check flood risk at GPS location | No |

**Request:**
```json
{
  "latitude": 25.4358,
  "longitude": 81.8463,
  "altitude": 65.0
}
```

**Response:**
```json
{
  "is_safe": true,
  "risk_level": "low",
  "zone_type": "zone_c",
  "elevation": 67.5,
  "flood_depth_prediction": 0.0,
  "message": "You are in a safe zone",
  "recommendations": []
}
```

### Community Reports (`/api/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/submit` | Submit new report | Yes |
| GET | `/all` | Get all reports (with filters) | No |
| GET | `/my-reports` | Get user's own reports | Yes |
| GET | `/stats` | Get report statistics | No |

**Submit Report Request:**
```json
{
  "latitude": 25.4358,
  "longitude": 81.8463,
  "altitude": 65.0,
  "category": "flood",
  "description": "Water level rising near riverbank",
  "photo_url": "https://..."
}
```

**Response includes AI verification:**
```json
{
  "id": 1,
  "category": "flood",
  "status": "verified",
  "verification_score": 0.85,
  "verification_notes": "GPS altitude matches LiDAR data; Location is in plausible flood-prone area"
}
```

### Flood Predictions (`/api/predict`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/flood` | Predict flood risk at location | No |
| GET | `/heatmap` | Get flood risk heatmap (GeoJSON) | No |
| POST | `/simulate` | Simulate flood scenario | No |

**Prediction Request:**
```json
{
  "latitude": 25.4358,
  "longitude": 81.8463,
  "rainfall_mm": 100
}
```

**Response:**
```json
{
  "location": {"lat": 25.4358, "lng": 81.8463},
  "risk_percentage": 45.0,
  "risk_level": "medium",
  "predicted_depth_m": 0.35,
  "confidence": 0.85,
  "contributing_factors": [
    "Low elevation (moderate flood risk)",
    "Heavy rainfall expected (>100mm)",
    "Close to river channel"
  ]
}
```

### Policy Zones (`/api/zones`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/at-location` | Get zone at coordinates | No |
| POST | `/classify` | Classify land for zoning | No |
| GET | `/summary` | Get zones summary | No |

**Zone Classification:**
- **Zone A (Red):** >50cm flood depth → No construction
- **Zone B (Yellow):** 20-50cm flood depth → Flood-proofing required
- **Zone C (Green):** <20cm flood depth → Normal permits

### Evacuation (`/api/evacuation`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/shelters` | Get nearby shelters | No |
| POST | `/route` | Calculate evacuation route | No |

**Route Options:**
- `fastest`: Shortest time (may pass through risky areas)
- `safest`: Avoids flood zones (longer)
- `shortest`: Minimum distance

---

## Core Services

### 1. LiDAR Processor (`services/lidar_processor.py`)

Handles LiDAR DEM data processing:

```python
# Get elevation at a point
elevation = await get_elevation_at_point(lat, lng)

# Load LiDAR tiles for a zone
data = await load_lidar_tiles("zone_53H13SE")

# Calculate slope gradient
slope = await calculate_slope_gradient(elevation_array)

# Identify flood zones
flooded = await identify_flood_zones(elevation, water_level_rise=5.0)
```

### 2. Flood Predictor (`services/flood_predictor.py`)

AI-powered flood risk prediction:

```python
# Predict risk at a point
prediction = await predict_flood_risk_at_point(lat, lng, elevation, rainfall_mm=100)

# Generate heatmap for visualization
heatmap = await generate_flood_heatmap("zone_53H13SE", water_level_rise=3.0)

# Train model on new data
metrics = await train_flood_model("zone_53H13SE")
```

**Prediction Factors:**
- Elevation (lower = higher risk)
- Slope gradient (flatter = pooling)
- Distance to river
- Rainfall amount
- Historical flood patterns

### 3. Report Verifier (`services/report_verifier.py`)

AI verification of community reports:

```python
result = await verify_report(lat, lng, altitude, category)
```

**Verification Checks:**
1. GPS altitude vs LiDAR elevation (detect spoofing)
2. Category plausibility (flood at hilltop = suspicious)
3. Location within expected region (Ganga corridor)
4. Coordinate validity

**Flags:**
- `SEVERE_LOCATION_MISMATCH`: >50m altitude difference
- `LOCATION_MISMATCH`: >20m altitude difference
- `UNLIKELY_FLOOD_LOCATION`: Flood report at high elevation
- `OUT_OF_REGION`: Outside Ganga corridor

### 4. Zone Classifier (`services/zone_classifier.py`)

Automated policy zone classification:

```python
classification = await classify_location(lat, lng)
```

**Zone Rules:**
| Zone | Flood Depth | Restrictions |
|------|-------------|--------------|
| Zone A | >50cm | No permanent construction |
| Zone B | 20-50cm | Elevated foundations required |
| Zone C | <20cm | Normal permits allowed |

### 5. Evacuation Router (`services/evacuation_router.py`)

LiDAR-aware route calculation:

```python
route = await calculate_evacuation_route(
    start_lat, start_lng,
    end_lat, end_lng,
    preference="safest"
)
```

**Uses Haversine formula for distance calculation.**

---

## Authentication

### JWT Token Flow

1. User registers or logs in
2. Server returns JWT token (24-hour expiry)
3. Client includes token in Authorization header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```
4. Server validates token and extracts user info

### Role-Based Access Control (RBAC)

```python
from app.core import require_role, require_admin

# Only admins
@router.get("/admin-only")
async def admin_route(user = Depends(require_admin)):
    pass

# Officials and admins
@router.get("/official-data")
async def official_route(user = Depends(require_role(["admin", "official"]))):
    pass
```

**Roles Hierarchy:**
1. `admin` - Full access
2. `official` - Government officials
3. `ngo` - NGO workers
4. `researcher` - Data access
5. `citizen` - Basic access

---

## Configuration

### `app/core/config.py`

```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Redis (optional)
    REDIS_URL: str | None = None
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # API Keys
    MAPBOX_API_KEY: str | None = None
    TWILIO_ACCOUNT_SID: str | None = None
    
    # Settings
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:3000"
    LIDAR_DATA_PATH: str = "../data/raw"
```

---

## Running the Server

### Development

```bash
cd backend
source venv/Scripts/activate  # Windows
# source venv/bin/activate    # Linux/Mac

uvicorn app.main:app --reload --port 8000
```

### Production

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Environment Variables

### Required

```bash
# Database (NeonDB with asyncpg)
DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/db?ssl=require

# Security
SECRET_KEY=your-super-secret-key-minimum-32-chars
```

### Optional

```bash
# Redis caching
REDIS_URL=redis://localhost:6379

# External APIs
MAPBOX_API_KEY=pk.xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
SENTINEL_HUB_CLIENT_ID=xxx
SENTINEL_HUB_CLIENT_SECRET=xxx

# Settings
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Testing the API

### Health Check
```bash
curl http://localhost:8000/health
```

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'
```

### Safety Check
```bash
curl -X POST http://localhost:8000/api/safety/check \
  -H "Content-Type: application/json" \
  -d '{"latitude": 25.4358, "longitude": 81.8463}'
```

### Flood Prediction
```bash
curl -X POST http://localhost:8000/api/predict/flood \
  -H "Content-Type: application/json" \
  -d '{"latitude": 25.4358, "longitude": 81.8463, "rainfall_mm": 50}'
```

---

## What's Next

1. **Frontend Integration** - Connect Next.js to these endpoints
2. **Real LiDAR Processing** - Process actual 1.7GB LiDAR data
3. **Celery Workers** - Background tasks for heavy processing
4. **Redis Caching** - Cache predictions and heatmaps
5. **Twilio Integration** - Emergency voice calls
6. **Sentinel Hub** - Satellite imagery for farming advice

---

**Built for Riverathon 1.0** | AquaGuardians Team
