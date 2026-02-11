# AquaGuardians - Project Development Plan

**Version:** 1.0  
**Last Updated:** February 11, 2026  
**Project Type:** Next.js + FastAPI Microservices Architecture  
**Timeline:** 6-8 Weeks (Hackathon-Ready MVP in 2 weeks)

---

## 🎯 Project Vision

**AquaGuardians** is a comprehensive AI-powered river management platform that creates a Digital Twin of the Ganga River using government-grade LiDAR data. It serves three distinct user groups through role-based portals while maintaining a unified data backbone.

### Tagline
"AI-Powered River Monitoring, Management & Community Engagement"

### Core Value Proposition
Transform raw geospatial data (LiDAR, Satellite) into actionable insights for citizens, government officials, NGOs, and researchers through intelligent automation and visualization.

---

## 🏗️ System Architecture

### Tech Stack

**Frontend**
- Next.js 14 (App Router with TypeScript)
- React 18
- Tailwind CSS + shadcn/ui
- Mapbox GL JS (2D maps)
- Deck.gl (3D LiDAR terrain)
- React Query (data fetching)
- Zustand (state management)

**Backend**
- FastAPI (Python 3.11+)
- Uvicorn (ASGI server)
- Pydantic (validation)
- SQLAlchemy (ORM)
- Celery (async tasks)

**Database**
- PostgreSQL 15
- PostGIS extension (spatial queries)
- Redis (caching + task queue)

**AI/ML & Geospatial**
- Scikit-learn (Random Forest)
- Rasterio (LiDAR processing)
- GeoPandas (vector operations)
- NumPy/Pandas (data manipulation)
- GDAL (geospatial transformations)

**Infrastructure**
- NeonDB (Serverless PostgreSQL with PostGIS)
- Upstash Redis (Serverless caching)
- Vercel (Frontend deployment)
- Render/Railway (Backend deployment)
- Twilio/Exotel (voice calls)
- Mapbox API (maps)
- Sentinel Hub API (satellite data)

---

## 📊 Three Portal Architecture

### Portal 1: Citizens (Mobile-First, Low Bandwidth)
**Target Users:** General public, farmers, riverside residents  
**Focus:** Safety alerts, livelihood support, community engagement  

**Features:**
1. "Am I Safe?" - GPS-based flood risk checker
2. AI-Verified Community Reporter
3. Smart Farming Advisory
4. Real-time flood alerts
5. Emergency evacuation info

### Portal 2: Officials & NGOs (Command Center)
**Target Users:** Government officials, disaster management teams, NGOs  
**Focus:** Decision support, crisis management, policy enforcement  

**Features:**
1. Live Flood Monitor with 3D Terrain
2. Policy & Zoning Engine (Zone A/B/C classification)
3. One-Click Emergency Voice Calls
4. Evacuation Route Optimizer
5. NGO Task Management & Leaderboard
6. Infrastructure Risk Assessment

### Portal 3: Researchers (Data Access)
**Target Users:** Academic researchers, data scientists  
**Focus:** Raw data access, model experimentation  

**Features:**
1. Data Sandbox (LiDAR, Satellite downloads)
2. API Documentation
3. Model Parameter Tuning Interface
4. Historical Data Analysis
5. Custom Query Builder

---

## 🚀 Phase-Wise Development Plan

---

## **PHASE 1: Foundation & Core Backend (Week 1-2)**

### Objective
Set up the development environment, database, and core API structure. Process LiDAR data into usable formats.

### 1.1 Environment Setup (Day 1)
**Tasks:**
- [x] Initialize Git repository structure
- [x] Create backend/ folder structure
  ```
  backend/
  ├── app/
  │   ├── api/
  │   │   ├── routes/
  │   │   └── dependencies.py
  │   ├── core/
  │   │   ├── config.py
  │   │   └── security.py
  │   ├── db/
  │   │   ├── models.py
  │   │   └── session.py
  │   ├── services/
  │   │   ├── lidar_processor.py
  │   │   ├── flood_predictor.py
  │   │   └── zone_classifier.py
  │   └── schemas/
  ├── tests/
  └── requirements.txt
  ```
- [x] Create requirements.txt with core dependencies
- [x] Set up NeonDB (serverless PostgreSQL with PostGIS)
- [x] Configure environment variables (.env)

**Deliverable:** Working local development environment with NeonDB connection ✅

---

### 1.2 Database Schema Design (Day 2)
**Tasks:**
- [x] Design PostgreSQL schema with PostGIS extensions
  - **users** table (id, email, role, phone, gps_location)
  - **flood_zones** table (geometry, zone_type, risk_level, lidar_elevation)
  - **community_reports** table (id, user_id, location, photo_url, verified, timestamp)
  - **iot_sensors** table (sensor_id, location, latest_reading, status)
  - **evacuation_routes** table (route_geometry, start_point, end_point, shelters)
  - **ngo_tasks** table (task_id, ngo_id, status, verification_score)
  - **policy_zones** table (zone_geometry, classification, restrictions)

- [x] Create SQLAlchemy models (app/db/models.py)
- [ ] Write Alembic migration scripts
- [ ] Seed database with test data

**Deliverable:** Fully normalized database with spatial indexing ✅

---

### 1.3 LiDAR Data Processing Pipeline (Day 3-4)
**Tasks:**
- [x] Create `services/lidar_processor.py`
  - Function: `load_lidar_tiles(zone_name)` → Loads DEM GeoTIFF
  - Function: `extract_elevation_grid()` → Returns NumPy array
  - Function: `calculate_slope_gradient()` → Terrain analysis
  - Function: `identify_flood_zones(water_level)` → Classify risk areas
  
- [x] Create API endpoint: `POST /api/lidar/process`
  - Input: Zone name, water level threshold
  - Output: GeoJSON of flood zones

- [x] Reuse old code from `data_loader.py` and adapt for FastAPI
- [ ] Optimize for performance (downsample large datasets)
- [ ] Store processed results in PostgreSQL/PostGIS

**Deliverable:** Working LiDAR processing API with flood zone extraction

---

### 1.4 Core FastAPI Routes (Day 5)
**Tasks:**
- [x] Create route structure:
  - `routes/auth.py` - Login, Register, JWT tokens
  - `routes/flood.py` - Flood predictions, zone checks
  - `routes/reports.py` - Community reports CRUD
  - `routes/admin.py` - Official dashboard data
  - `routes/data.py` - Researcher data access

- [x] Implement JWT authentication middleware
- [x] Add role-based access control (RBAC)
- [x] Create Pydantic schemas for request/response validation

**Deliverable:** RESTful API with authentication and RBAC ✅

---

### 1.5 AI Flood Prediction Model (Day 6-7)
**Tasks:**
- [x] Create `services/flood_predictor.py`
  - Reuse Random Forest model from old project
  - Function: `train_model(dem_data, rainfall_scenarios)` → Trained model
  - Function: `predict_flood_risk(location, rainfall)` → Risk percentage
  - Function: `generate_risk_heatmap()` → GeoJSON heatmap

- [x] Create API endpoints:
  - `POST /api/predict/flood` - Get flood risk for coordinates
  - `GET /api/predict/heatmap` - Get spatial risk visualization

- [ ] Implement model caching (Redis) to avoid re-training
- [ ] Add confidence intervals to predictions

**Deliverable:** Working AI prediction API with 72-hour forecast capability

---

## **PHASE 2: Portal 1 - Citizens App (Week 2-3)**

### Objective
Build the citizen-facing features with mobile-first UI

### 2.1 Next.js Frontend Setup (Day 8)
**Tasks:**
- [x] Initialize Next.js 14 with TypeScript in `frontend/`
- [ ] Install dependencies:
  ```bash
  npm install mapbox-gl deck.gl react-query zustand tailwindcss
  npm install @shadcn/ui lucide-react
  ```
- [ ] Create folder structure:
  ```
  frontend/
  ├── app/
  │   ├── (citizen)/
  │   ├── (official)/
  │   ├── (researcher)/
  │   └── layout.tsx
  ├── components/
  │   ├── ui/ (shadcn components)
  │   ├── maps/
  │   └── common/
  ├── lib/
  │   ├── api.ts (Axios client)
  │   └── utils.ts
  └── public/
  ```
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up React Query for API calls

**Deliverable:** Next.js app with routing and styling framework

---

### 2.2 "Am I Safe?" Feature (Day 9-10)
**Tasks:**
- [ ] Create UI: `/app/(citizen)/safety-check/page.tsx`
  - "Locate Me" button → Get GPS from browser
  - Display current location on Mapbox
  - Show risk indicator (Green/Yellow/Red)
  - Display policy zone restrictions if applicable

- [x] Create API endpoint: `POST /api/safety/check`
  - Input: `{latitude, longitude}`
  - Logic:
    1. Query PostGIS for flood zone at coordinates
    2. Check LiDAR elevation
    3. Get current flood prediction
    4. Return risk level + policy message
  - Output: `{safe: boolean, risk_level: string, zone: string, message: string}`

- [ ] Add offline support (cache last known safe zones)

**Deliverable:** Working GPS-based safety checker

---

### 2.3 AI-Verified Community Reporter (Day 11-12)
**Tasks:**
- [ ] Create UI: `/app/(citizen)/report/page.tsx`
  - Photo upload (camera or gallery)
  - Issue category dropdown (Flood, Pollution, Infrastructure)
  - Auto-captured GPS coordinates
  - Description text area

- [x] Create verification logic in backend:
  ```python
  # services/report_verifier.py
  def verify_report(gps_coords, photo, issue_type):
      # 1. Get user's reported elevation from GPS
      user_elevation = gps_coords['altitude']
      
      # 2. Get LiDAR elevation at same coordinates
      lidar_elevation = get_lidar_elevation(gps_coords['lat'], gps_coords['lng'])
      
      # 3. Cross-check
      if abs(user_elevation - lidar_elevation) > 10:  # 10m tolerance
          return {"verified": False, "reason": "Location mismatch"}
      
      # 4. If reporting "Deep Water", check if area is low-lying
      if issue_type == "flood" and lidar_elevation > flood_threshold:
          return {"verified": False, "reason": "Unlikely flood at high elevation"}
      
      return {"verified": True}
  ```

- [x] Create API: `POST /api/reports/submit`
- [ ] Display reports on community map with verification badges

**Deliverable:** AI-powered fake report detection system

---

### 2.4 Smart Farming Advisory (Day 13)
**Tasks:**
- [ ] Integrate Sentinel Hub API for soil moisture data
- [ ] Create API: `GET /api/farming/advisory?location=lat,lng`
  - Fetch NDVI (vegetation health)
  - Fetch Soil Moisture Index (SMI)
  - Cross-reference with groundwater data
  - Return crop recommendations

- [ ] Create UI: Simple card with advice
  - "Soil Moisture: Low → Irrigate wheat fields"
  - "NDVI: Good → Crops healthy"

**Deliverable:** Satellite-based farming advice feature

---

## **PHASE 3: Portal 2 - Officials Command Center (Week 3-4)**

### Objective
Build the official/NGO dashboard with advanced visualizations

### 3.1 3D Flood Simulator (Day 14-16)
**Tasks:**
- [ ] Create 3D terrain viewer using Deck.gl
  - Component: `components/maps/TerrainViewer3D.tsx`
  - Load LiDAR DEM as mesh
  - Color-code by elevation (blue=low, green=medium, brown=high)

- [ ] Add flood simulation slider
  - User drags slider: 0m → 10m water level rise
  - Dynamically re-color terrain (submerged areas turn blue)
  - Show affected area statistics (km², population estimate)

- [ ] Reuse logic from old `pages/06_3d_terrain.py` but convert to JavaScript/Deck.gl
- [ ] Add layer toggle: Satellite imagery overlay

**Deliverable:** Interactive 3D flood simulator

---

### 3.2 Policy Zoning Engine (Day 17-18)
**Tasks:**
- [x] Create zone classification algorithm:
  ```python
  # services/zone_classifier.py
  def classify_land_zones(dem_data, flood_model):
      zones = []
      for pixel in dem_data:
          flood_depth = flood_model.predict(pixel.elevation, rainfall=heavy)
          
          if flood_depth > 0.5:  # 50cm
              zone = "Zone A - High Risk"
              restrictions = "No permanent construction allowed"
          elif flood_depth > 0.2:
              zone = "Zone B - Moderate Risk"
              restrictions = "Construction allowed with flood-proofing"
          else:
              zone = "Zone C - Low Risk"
              restrictions = "Normal construction permitted"
          
          zones.append({
              "geometry": pixel.coordinates,
              "zone": zone,
              "restrictions": restrictions
          })
      
      return zones
  ```

- [x] Create API: `POST /api/zones/classify`
  - Input: Area boundary (GeoJSON polygon)
  - Output: Classified zones with restrictions

- [ ] Create UI: Map with zone overlays (Red/Yellow/Green polygons)
- [ ] Add permit checker: Officials enter address → System shows zone classification

**Deliverable:** Automated policy zoning system

---

### 3.3 One-Click Emergency Calls (Day 19)
**Tasks:**
- [ ] Integrate Twilio/Exotel API for voice calls
- [ ] Create call logic:
  ```python
  # services/emergency_caller.py
  def trigger_emergency_calls(affected_area_polygon):
      # 1. Query database for all Village Heads in affected area
      contacts = db.query(Officials).filter(
          ST_Within(Officials.location, affected_area_polygon)
      ).all()
      
      # 2. Generate voice message in Hindi
      message = "यह गंगा रक्षक प्रणाली से एक आपातकालीन सूचना है। आपके क्षेत्र में बाढ़ का खतरा है।"
      
      # 3. Trigger parallel calls
      for contact in contacts:
          twilio_client.calls.create(
              to=contact.phone,
              from_=TWILIO_NUMBER,
              twiml=f"<Response><Say language='hi-IN'>{message}</Say></Response>"
          )
  ```

- [ ] Create UI: Big red button "Alert All Officials"
- [ ] Add call log and confirmation tracking

**Deliverable:** Automated emergency notification system

---

### 3.4 Evacuation Route Optimizer (Day 20)
**Tasks:**
- [x] Reuse A* pathfinding logic from old project
- [x] Modify to avoid:
  - Low-lying areas (LiDAR elevation < threshold)
  - Current flood zones
  - Roads with high traffic (simulated)

- [x] Create API: `POST /api/evacuation/route`
  - Input: `{start: [lat, lng], destination: "nearest_shelter"}`
  - Output: GeoJSON linestring with:
    - Route geometry
    - Distance (km)
    - Estimated time
    - Safety score (0-100)

- [ ] Create UI: Display 3 route options (Fastest, Safest, Shortest)
- [ ] Show shelter capacity and available beds

**Deliverable:** LiDAR-aware evacuation routing

---

### 3.5 NGO Leaderboard & Gamification (Day 21)
**Tasks:**
- [ ] Create NGO task system:
  - NGOs claim tasks (e.g., "Clean Ghat XYZ")
  - Upload before/after photos
  - System verifies using satellite imagery change detection

- [ ] Verification logic:
  ```python
  def verify_ngo_task(task_id):
      task = db.query(NGOTask).get(task_id)
      
      # Get satellite images before/after task date
      before_ndvi = get_sentinel_ndvi(task.location, task.start_date)
      after_ndvi = get_sentinel_ndvi(task.location, task.end_date)
      
      # If NDVI improved (greener), award points
      if after_ndvi > before_ndvi + 0.1:
          task.verification_score = 100
          task.points_awarded = 50
      else:
          task.verification_score = 30
          task.points_awarded = 10
  ```

- [ ] Create leaderboard UI with top NGOs

**Deliverable:** Gamified NGO collaboration system

---

## **PHASE 4: Portal 3 - Researchers (Week 5)**

### Objective
Provide data access and model experimentation tools

### 4.1 Data Sandbox API (Day 22-23)
**Tasks:**
- [ ] Create download endpoints:
  - `GET /api/data/lidar/tiles` - Download processed LiDAR
  - `GET /api/data/satellite/ndvi` - Download NDVI rasters
  - `GET /api/data/sensors/timeseries` - Export IoT sensor data

- [ ] Add authentication and rate limiting
- [ ] Generate pre-signed S3 URLs for large files
- [ ] Create UI with dataset catalog

**Deliverable:** Data download portal

---

### 4.2 Model Tuning Interface (Day 24)
**Tasks:**
- [ ] Create interactive UI to adjust:
  - Random Forest parameters (n_trees, max_depth)
  - Rainfall threshold values
  - Zone classification cutoffs

- [ ] Show live prediction changes as parameters adjust
- [ ] Allow researchers to export custom models

**Deliverable:** Live model experimentation tool

---

## **PHASE 5: Integration & Polish (Week 6)**

### 5.1 Cross-Portal Integration (Day 25-26)
**Tasks:**
- [ ] Implement unified notification system
  - Officials create alert → Citizens receive push notification
  - NGO completes task → Officials get update

- [ ] Add admin dashboard showing all portal activities
- [ ] Create analytics: Track user engagement, report accuracy, NGO performance

**Deliverable:** Unified multi-portal system

---

### 5.2 Performance Optimization (Day 27)
**Tasks:**
- [ ] Add Redis caching for:
  - LiDAR processed data
  - ML model predictions
  - Map tile requests

- [ ] Optimize database queries with indexes
- [ ] Implement lazy loading for 3D terrain
- [ ] Add CDN for static assets

**Deliverable:** Fast, production-ready app

---

### 5.3 Testing & Quality Assurance (Day 28-29)
**Tasks:**
- [ ] Write unit tests (pytest for backend, Jest for frontend)
- [ ] Test all API endpoints (Postman/Bruno)
- [ ] Test map interactions on mobile devices
- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Security audit (SQL injection, XSS, CSRF)

**Deliverable:** Test coverage >80%

---

### 5.4 Documentation (Day 30)
**Tasks:**
- [ ] Write API documentation (FastAPI auto-docs + Swagger)
- [ ] Create user guides for each portal
- [ ] Record demo video (5-minute walkthrough)
- [ ] Update README.md with setup instructions

**Deliverable:** Complete documentation package

---

## **PHASE 6: Deployment (Week 7-8)**

### 6.1 Deployment Setup (Day 31-32)
**Tasks:**
- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Vercel
- [ ] NeonDB already configured (serverless, scales automatically)
- [ ] Set up Upstash Redis for caching
- [ ] Configure Cloudflare R2 or similar for large file storage (if needed)

**Deliverable:** Live production environment

---

### 6.2 Final Demo Preparation (Day 33-35)
**Tasks:**
- [ ] Prepare 10-minute demo script
- [ ] Create demo data (realistic scenarios)
- [ ] Practice live demo with all three portals
- [ ] Prepare backup slides (in case of internet issues)
- [ ] Test on judges' devices (mobile, tablet, laptop)

**Deliverable:** Polished hackathon demo

---

## 📋 Feature Priority Matrix

### Must-Have (Hackathon MVP - 2 Weeks)
- ✅ GPS-based safety checker
- ✅ 3D flood simulator
- ✅ Community reporter with AI verification
- ✅ Policy zoning engine
- ✅ Basic evacuation routing
- ✅ Role-based authentication

### Should-Have (Post-MVP)
- ✅ One-click voice calls
- ✅ NGO leaderboard
- ✅ Smart farming advisory
- ✅ Researcher data sandbox

### Nice-to-Have (Future)
- ⏳ Mobile apps (React Native)
- ⏳ Real-time IoT sensor integration
- ⏳ Multi-language support (10+ Indian languages)
- ⏳ Inland navigation routing

---

## 🎯 Success Metrics

### Technical Metrics
- API response time < 200ms (95th percentile)
- 3D map loads in < 3 seconds
- ML prediction accuracy > 85%
- Zero critical security vulnerabilities

### User Metrics
- Citizens: 10,000+ safety checks in first month
- Officials: Reduce flood response time by 50%
- NGOs: 100+ verified tasks completed
- Researchers: 50+ dataset downloads

---

## 🚧 Known Challenges & Solutions

### Challenge 1: Large LiDAR Files (1.7GB)
**Solution:** 
- Store raw files in S3
- Pre-process and downsample for web
- Use progressive loading for 3D viewer

### Challenge 2: Real-time Flood Predictions
**Solution:**
- Cache model predictions hourly
- Use Celery for async processing
- Pre-compute risk zones for common scenarios

### Challenge 3: Mobile Performance
**Solution:**
- Build separate lightweight mobile views
- Use image compression for maps
- Implement offline-first PWA features

### Challenge 4: Voice Call Costs
**Solution:**
- Use free tier initially (Twilio: $15 credit)
- Only trigger for high-severity alerts
- Consider SMS as fallback

---

## 🔐 Security Considerations

### Authentication
- JWT tokens with 24-hour expiry
- Role-based access control (Citizen/Official/NGO/Researcher)
- Two-factor authentication for Officials

### Data Privacy
- Encrypt GPS coordinates at rest
- Anonymize community reports (no personal data displayed)
- GDPR-compliant data handling

### API Security
- Rate limiting (100 requests/minute per user)
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration for frontend

---

## 📚 Reusable Code from Old Project

### Files to Migrate
1. `src/data_loader.py` → `backend/app/services/lidar_processor.py`
2. `src/ai_predictor.py` → `backend/app/services/flood_predictor.py`
3. `pages/06_3d_terrain.py` → Frontend Deck.gl component
4. `src/flood_analysis.py` → `backend/app/services/zone_classifier.py`
5. Evacuation routing logic → `backend/app/services/evacuation_router.py`

### What's Changing
- Streamlit → Next.js (UI framework)
- Monolith → Microservices (architecture)
- SQLite → PostgreSQL (database)
- Function calls → REST API (communication)

---

## ✅ Definition of Done

A feature is considered "done" when:
- [ ] Code is written and committed to Git
- [ ] Unit tests pass
- [ ] API endpoint works in Postman
- [ ] UI component renders correctly on mobile and desktop
- [ ] Feature is documented
- [ ] No critical bugs

---

## 🎓 Learning Resources

### FastAPI
- [Official Docs](https://fastapi.tiangolo.com/)
- [Full Course](https://www.youtube.com/watch?v=7t2alSnE2-I)

### Next.js 14
- [Official Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### PostGIS
- [Spatial Queries](https://postgis.net/workshops/postgis-intro/)

### Deck.gl
- [3D Terrain Tutorial](https://deck.gl/docs/api-reference/geo-layers/terrain-layer)

---

## 🏆 Hackathon Strategy

### Day 1-2: Backend Foundation
Focus: Get API working with LiDAR processing and flood predictions

### Day 3-7: Citizens Portal
Focus: Build the most user-friendly, impactful feature (Safety Checker)

### Day 8-12: Officials Portal
Focus: Show off the tech (3D maps, AI zoning, evacuation)

### Day 13-14: Integration & Demo
Focus: Make everything work together smoothly

### Presentation Focus
- Start with problem statement (Flood deaths in Ganga corridor)
- Demo Citizens Portal (emotional, relatable)
- Show Officials Portal (technical depth, wow factor)
- End with impact numbers (Lives saved, cost savings)

---

## 📝 Notes & Context

### Why This Architecture?
- **Separation of Concerns:** Backend handles heavy computation, frontend handles UX
- **Scalability:** Can add more frontend apps (mobile) without changing backend
- **Reusability:** API can be consumed by third parties (government systems)

### Key Differentiators from Old Project
- **Multi-Stakeholder:** Not just monitoring, but actions for citizens, officials, NGOs
- **AI-Powered Governance:** Policy zoning is unique, addresses real administrative challenge
- **Verified Community Input:** Solves fake report problem with LiDAR cross-checking
- **End-to-End Crisis Response:** From prediction → alert → evacuation in one platform

### What Makes This Hackathon-Winning
1. **Real Data:** Using actual LiDAR (not mock)
2. **Real Problem:** Addresses governance gap in flood management
3. **Real AI:** Not just visualization, but intelligent predictions and verification
4. **Real Impact:** Quantifiable lives saved and costs reduced
5. **Production-Ready:** Modern architecture, can be deployed immediately

---

**This document is the source of truth for the AquaGuardians project. All development decisions, priorities, and technical approaches should reference this plan.**

**Last Updated:** February 11, 2026  
**Next Review:** After Phase 1 completion
