"""
Health check endpoint
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    Returns service status
    """
    return {
        "status": "healthy",
        "service": "aquaguardians-api",
        "version": "1.0.0",
    }
