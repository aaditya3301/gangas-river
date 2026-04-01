"""
AquaGuardians API - Main Application Entry Point
FastAPI application with CORS, routing, and lifecycle management
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import init_db, close_db
from app.api.routes import auth, safety, reports, predict, zones, evacuation, health, emergency, chatbot, data, models, api_docs, insights


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager
    - Startup: Initialize database connection
    - Shutdown: Close database connections
    """
    # Startup
    print("[*] Starting AquaGuardians API...")
    
    try:
        await init_db()
        print("[OK] Database initialized")
    except Exception as e:
        print(f"[WARN] Database connection failed: {e}")
        print("[INFO] Running in demo mode without database")
        print("       Configure DATABASE_URL in .env for full functionality")
    
    yield
    
    # Shutdown
    print("[*] Shutting down...")
    try:
        await close_db()
        print("[OK] Database connections closed")
    except Exception:
        pass


# Create FastAPI application
app = FastAPI(
    title="AquaGuardians API",
    description="AI-Powered River Monitoring, Management & Community Engagement Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(safety.router, prefix="/api/safety", tags=["Safety Check"])
app.include_router(reports.router, prefix="/api/reports", tags=["Community Reports"])
app.include_router(predict.router, prefix="/api/predict", tags=["Flood Prediction"])
app.include_router(zones.router, prefix="/api/zones", tags=["Policy Zones"])
app.include_router(evacuation.router, prefix="/api/evacuation", tags=["Evacuation"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency Alerts"])
app.include_router(chatbot.router, prefix="/api/chat", tags=["Voice Assistant"])
app.include_router(data.router, prefix="/api/data", tags=["Data Catalog"])
app.include_router(models.router, prefix="/api/models", tags=["Model Lab"])
app.include_router(api_docs.router, prefix="/api/api-docs", tags=["API Documentation"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])



@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "AquaGuardians API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }
