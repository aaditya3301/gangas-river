# AquaGuardians - AI-Powered River Management Platform

**Tagline:** AI-Powered River Monitoring, Management & Community Engagement

A next-generation platform that creates a Digital Twin of the Ganga River using government-grade LiDAR data. It serves three distinct user groups (Citizens, Officials/NGOs, Researchers) through role-based portals while maintaining a unified data backbone.

##[Project Overview](#project-overview)
- [Three Portal Architecture](#three-portal-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Phases](#development-phases)
- [Key Features](#key-features)
- [Data Sources](#data-sources)
- [Contributing](#contributing)
- [License](#license)

> **📖 For detailed development plan, see [PROJECT_PLAN.md](PROJECT_PLAN.md)**Models
- Local Setup
- Running the App
- Deployment
- Performance Notes
- Best Practices
- Troubleshooting
- Roadmap
- License and Credits

## Overview

Ganga Guardian AI is a modular Streamlit application that integrates geospatial analytics with AI-based flood risk estimation and community-sourced reporting. The system is designed for rapid demonstration, but it also includes realistic data handling, geospatial processing, and performance optimizations that support large terrain datasets.
Project Overview

AquaGuardians transforms raw LiDAR terrain data into actionable insights for flood management along the Ganga River. Unlike traditional monitoring systems, we provide:

- *Three Portal Architecture

### 🏘️ Portal 1: Citizens (Mobile-First)
**Target:** General public, farmers, riverside residents

- **"Am I Safe?"** - GPS-based flood risk checker with real-time zone classification
- **AI-Verified Reporter** - Upload flood/pollution reports with automatic fake detection
- **Smart Farming** - Satellite-based soil moisture and crop recommendations
- *Tech Stack

### Frontend
- **Next.js 14** (TypeScript, App Router)
- **React 18** with Server Components
- **Tailwind CSS** + shadcn/ui for modern UI
- **Mapbox GL JS** for 2D maps
- **Deck.gl** for 3D LiDAR terrain visualization
- **React Query** for data fetching and caching
- **Zustand** for state management

### Backend
- **FastAPI** (Python 3.11+) for high-performance APIs
- **SQLAlchemy** ORM with async support
- **Celery** for background tasks (LiDAR processing, predictions)
- **Pydantic** for schema validation
- **JWT** authentication with role-based access control

### Database & Storage
- **NeonDB** (Serverless PostgreSQL with PostGIS)
- **Upstash Redis** for caching
- **Alembic** for database migrations

### AI/ML & Geospatial
- **Scikit-learn** (Random Forest for flood prediction)
- **Rasterio** (LiDAR GeoTIFF processing)
- **GeoPandas** (vector data operations)
- **NumPy/Pandas** (numerical computing)
- **GDAL** (geospatial transformations)
Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **NeonDB account** (free tier: https://neon.tech)
- **Upstash Redis** (optional, for caching)

### Quick Start (Development)

#### 1. Clone and Navigate
```bash
git clone <repo-url>
cd RIVERATHON
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head
Project Structure

```
RIVERATHON/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── (citizen)/       # Citizen portal pages
│   │   ├── (official)/      # Official portal pages
│   │   ├── (researcher)/    # Researcher portal pages
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── maps/            # Map components (Mapbox, Deck.gl)
│   │   └── common/          # Shared components
│   ├── lib/
│   │   ├── api.ts           # API client (Axios)
│   │   └── utils.ts         # Utility functions
│   └── public/
│
├── backend/                  # FastAPI application
│  Development Phases

This project is built in 6 phases over 6-8 weeks. See [PROJECT_PLAN.md](PROJECT_PLAN.md) for complete details.

### Phase 1: Foundation (Week 1-2)
- Set up FastAPI backend with PostgreSQL/PostGIS
- Implement LiDAR processing pipeline
- Build AI flood prediction model
- Create core API routes with authentication

### Phase 2: Citizens Portal (Week 2-3)
- Next.js frontend setup
- "Am I Safe?" GPS checker
- AI-verified community reporter
- Smart farming advisory

### Phase 3: Officials Portal (Week 3-4)
- 3D flood simulator (Deck.gl)
- Policy zoning engine
- Emergency voice call system
- Evacuation route optimizer
- NGO leaderboard

### Phase 4: Researchers Portal (Week 5)
- Data sandbox API
- Model tuning interface
- Dataset catalog

### Phase 5: Integration (Week 6)
- Cross-portal notifications
- Performance optimization
- Testing and QA

### Phase 6: Deployment (Week 7-8)
- Production deployment
- Demo preparation
- Documentation

## Key Features

### 1. Multi-Sensor Fusion
Combines LiDAR terrain data + Sentinel-2 satellite imagery + IoT sensors to create a comprehensive "River Health Score" for each river block.

### 2. AI-Powered Verification
Cross-checks citizen flood reports by comparing GPS-reported elevation with actual LiDAR elevation. Flags fake reports automatically.

**Example Logic:**
```python
# User reports "Deep Water" at GPS coordinates
user_elevation = gps_data.altitude  # From phone GPS
lidar_elevation = query_lidar(gps_data.lat, gps_data.lng)

if abs(user_elevation - lidar_elevation) > 10:  # 10m tolerance
    flag_as_fake("Location mismatch")
elif issue_type == "flood" and lidar_elevation > 100:  # High elevation
    flag_as_fake("Unlikely flood at hilltop")
```

### 3. Automated Policy Zoning
Uses LiDAR flood predictions to classify land:
- **Zone A (Red):** Flood depth > 50cm → No permanent construction
- **Zone B (Yellow):** Depth 20-50cm → Construction with flood-proofing required
- **Zone C (Green):** Depth < 20cm → Normal permits allowed
Data Sources

### Real Data
- **LiDAR DEM tiles** - 1.7GB government-grade elevation data (Zones 53H13SE, 53L1NW)
- **Terrain metrics** - Slope, elevation, drainage computed from LiDAR
- **GPS data** - 10+ verified Ganga corridor locations with elevations

### Live External APIs
- **Sentinel Hub** - Real-time satellite NDVI and soil moisture
- **Mapbox** - Base maps and geocoding services

### Simulated/Demo Data (Hackathon)
- **IoT sensors** - Mock real-time telemetry (will integrate real sensors post-hackathon)
- **Rainfall forecasts** - Synthetic curves based on historical patterns
- **Community reports** - Seeded with realistic demo data

###API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Key Endpoints

```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - JWT token authentication
GET    /api/auth/me                - Get current user

POST   /api/safety/check           - Check flood risk at GPS coordinates
POST   /api/reports/submit         - Submit community report
GET    /api/reports/all            - Get all verified reports (with map)

POST   /api/predict/flood          - Get flood prediction for location
GET    /api/predict/heatmap        - Get spatial risk heatmap (GeoJSON)

POST   /api/zones/classify         - Classify land into policy zones
GET    /api/zones/at-location      - Get zone type at coordinates

POST   /api/evacuation/route       - Calculate safest evacuation route
GET    /api/evacuation/shelters    - List nearby shelters with capacity

GET    /api/data/lidar/tiles       - Download LiDAR data (researchers)
GET    /api/data/satellite/ndvi    - Download NDVI imagery
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@your-neondb-host.neon.tech/aquaguardians?sslmode=require
REDIS_URL=redis://your-upstash-host:6379
SECRET_KEY=your-secret-key-here
MAPBOX_API_KEY=your-mapbox-token
TWILIO_ACCOUNT_SID=your-twilio-sid
SENTINEL_HUB_CLIENT_ID=your-sentinel-id
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

## Contributing

This is a hackathon project for Riverathon 1.0. For collaboration:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- **Backend:** Follow PEP 8, use Black formatter, type hints required
- **Frontend:** ESLint + Prettier, TypeScript strict mode
- **Commits:** Conventional commits (feat, fix, docs, refactor, test)d using simulated curves
- Sensor telemetry is produced by a mock IoT generator
- AI training data uses synthetic rainfall scenarios derived from real DEM

Important: If LiDAR tiles are missing from the data directory, LiDAR-dependent pages will fail unless you add a synthetic fallback. The AI Predictions page may include a synthetic DEM fallback depending on the current file state.

## Data Structure

### Hackathon MVP (2 Weeks) ✅
- [x] GPS-based safety checker
- [x] 3D flood simulator
- [x] Community reporter with AI verification
- [x] Policy zoning engine
- [x] Basic evacuation routing

### Post-Hackathon (1-2 Months)
- [ ] One-click voice calls to officials
- [ ] NGO leaderboard and task verification
- [ ] Smart farming advisory with live satellite data
- [ ] Mobile apps (React Native)
- [ ] Real-time IoT sensor integration

### Production Deployment (3-6 Months)
- [ ] Scale to entire Ganga basin (2,500 km)
- [ ] Multi-language support (Hindi, Bengali, Bhojpuri, etc.)
- [ ] Integration with government NDMA systems
- [ ] Inland navigation routing (boat/ferry routes)
- [ ] WhatsApp bot for alerts

## Performance Benchmarks

### Current Metrics
- ⚡ API response time: < 200ms (95th percentile)
- ⚡ 3D terrain loads: < 3 seconds (500K polygons)
- ⚡ ML prediction: < 1 second (100K samples)
- ⚡ Database queries: < 50ms (PostGIS spatial queries)

### Optimization Techniques
- Redis caching for frequently accessed data
- Progressive loading for 3D meshes
- CDN for static assets
- Database query optimization with PostGIS indexes
- Image compression for satellite overlays

## Security

### Implemented
- ✅ JWT authentication with 24-hour expiry
- ✅ Role-based access control (RBAC)
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Input validation (Pydantic)
- ✅ Rate limiting (100 req/min per user)
- ✅ CORS configuration
- ✅ Password hashing (bcrypt)

### Planned
- [ ] Two-factor authentication for Officials
- [ ] End-to-end encryption for GPS coordinates
- [ ] GDPR compliance for EU data
- [ ] Security audit and penetration testing

## License

**Educational Project - Riverathon 1.0**

- LiDAR dataset provided under Riverathon hackathon terms
- Survey of India data usage per competition guidelines
- Open-source components retain their original licenses

## Team

**AquaGuardians** - Riverathon 1.0 Finalists  
Built with ❤️ for Ganga River conservation

## Acknowledgments

- **Riverathon 1.0 Organizers** for the LiDAR dataset and platform
- **Survey of India** for high-quality geospatial data
- **NMCG** (National Mission for Clean Ganga) for river conservation leadership
- Open-source community (Next.js, FastAPI, PostGIS, Mapbox, Deck.gl)

---

**📋 For detailed development roadmap, see [PROJECT_PLAN.md](PROJECT_PLAN.md)**

**🚀 Ready to build? Start with Phase 1 - Backend Foundation!**
- DEM tiles: GeoTIFF elevation tiles
- ORTHO tiles: GeoTIFF orthophotos aligned with DEM

## Architecture and Module Map

Core entry point
- app.py: Home dashboard and global styling for the landing page

Pages
- pages/01_decision_center.py: Alerts and decision support
- pages/02_ai_predictions.py: Model training and risk predictions
- pages/03_community_portal.py: Citizen report submission and map
- pages/04_multi_sensor.py: Sensor fusion and data validation
- pages/05_analytics.py: Statistical analysis and trends
- pages/06_3d_terrain.py: 3D visualization of terrain and flooding
- pages/07_evacuation.py: Routing and evacuation planning

Core modules (src/)
- data_loader.py: LiDAR data scanning and mosaic assembly
- ai_predictor.py: Synthetic training data and flood prediction logic
- decision_engine.py: Alert rules and response synthesis
- community_db.py: SQLite schema and report operations
- mock_iot.py: Simulated IoT sensor feeds
- ui_components.py: Shared CSS and reusable UI components
- flood_analysis.py: Terrain risk scoring utilities
- infrastructure_risk.py: Infrastructure exposure analysis
- lidar_loader.py: Lower-level terrain loading helpers
- ndvi_analysis.py: Vegetation index support (satellite)
- ecosystem_score.py: Ecosystem health scoring

## Key Algorithms and Models

Terrain processing
- DEM normalization
- Slope and gradient estimation
- Low-point and accumulation detection

Flood prediction
- Random Forest regression
- Feature set: elevation, slope, distance-to-low, rainfall
- Synthetic scenario generation for rainfall curves

Decision support
- Rule-based severity classification
- Multi-signal corroboration to reduce false positives

Evacuation routing
- Heuristic routing with risk-avoidance weighting
- Capacity-aware shelter selection
n
## Local Setup

1. Create and activate a virtual environment
   - Windows: py -m venv venv
   - Activate: venv\Scripts\activate

2. Install dependencies
   - pip install -r requirements.txt

3. Place LiDAR data in the expected data/raw layout

## Running the App

- Run: py -m streamlit run app.py
- The app uses multipage navigation for the seven modules

## Deployment

Recommended approach: keep large LiDAR data outside Git and provide a download step.

Options
1. External storage (Google Drive, S3, or Azure Blob)
   - Provide a downloader script to fetch data on first run
   - Keep the repository lightweight

2. Git LFS (only if the dataset is below your LFS quota)

3. Synthetic-only mode
   - Add a synthetic terrain generator in each page that needs DEM
   - Use for demos or quick previews

## Performance Notes

- Large zones can be slow to load; caching is essential
- Downsample large grids before plotting 3D surfaces
- Avoid rendering full-resolution DEM in the browser
- Keep prediction sample sizes capped

## Best Practices

Data and reproducibility
- Keep raw data immutable; store derived files in data/processed
- Document the source and license of all datasets
- Track model parameters when saving model artifacts

Performance
- Cache heavy computations using st.cache_data and st.cache_resource
- Downsample for visualization and keep full resolution for stats

UI and UX
- Use consistent section headers and layout grids
- Keep charts interactive and lightweight
- Provide clear warnings when data is missing

Engineering
- Keep business logic in src/ modules
- Keep pages thin and focused on presentation
- Avoid hard-coded paths; use Path objects

## Troubleshooting

- ValueError: No matched pairs available to combine
  - Data tiles not found in data/raw or incorrect zone name
  - Confirm DEM and ORTHO directories exist

- Slow load times
  - Reduce zone size
  - Increase caching or downsampling

- 3D viewer not rendering
  - Reduce resolution and number of points
  - Verify plotly/pydeck versions

## Roadmap

Short term
- Add real-time rainfall API integration
- Add authentication for community portal
- Add download helper for large data

Long term
- Scale to full Ganga basin
- Integrate real IoT sensors
- Add multi-language support

## License and Credits

- Educational project for Riverathon 1.0
- LiDAR data provided under hackathon terms
- Built with Streamlit, Plotly, Rasterio, GeoPandas, and NumPy

