# API routes package
from app.api.routes import auth, safety, reports, predict, zones, evacuation, health, chatbot, emergency, data, models, api_docs, insights
from app.api.routes import citizen_dashboard

__all__ = [
    "auth",
    "safety", 
    "reports",
    "predict",
    "zones",
    "evacuation",
    "health",
    "chatbot",
    "emergency",
    "data",
    "models",
    "api_docs",
    "insights",
    "citizen_dashboard",
]
