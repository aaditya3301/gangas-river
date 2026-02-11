"""
Emergency Alert API Routes
Handles activating emergency WhatsApp messages via Twilio
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.twilio_caller import twilio_emergency
from app.core.config import settings

router = APIRouter()


class EmergencyActivateRequest(BaseModel):
    """Optional overrides for emergency alert — all fields have defaults"""
    message: str = Field(
        default="Flood water levels rising rapidly. Please evacuate to higher ground immediately. Move to your nearest shelter.",
        max_length=500,
    )
    severity: str = Field(default="critical", pattern="^(info|warning|critical)$")


class EmergencyActivateResponse(BaseModel):
    success: bool
    total: int
    successful: int
    failed: int
    contacts_used: list[str]
    details: list[dict] = []


@router.post("/activate", response_model=EmergencyActivateResponse)
async def activate_emergency_alert(request: EmergencyActivateRequest = EmergencyActivateRequest()):
    """
    One-click emergency alert: sends WhatsApp messages to all
    pre-configured emergency contacts from EMERGENCY_CONTACTS in .env.
    
    No phone numbers needed in the request — they're loaded from config.
    """
    contacts = settings.emergency_contacts_list
    if not contacts:
        raise HTTPException(
            status_code=400,
            detail="No emergency contacts configured. Set EMERGENCY_CONTACTS in backend .env file."
        )

    try:
        result = twilio_emergency.broadcast(
            alert_message=request.message,
            severity=request.severity,
        )

        return EmergencyActivateResponse(
            success=result["successful"] > 0,
            total=result["total"],
            successful=result["successful"],
            failed=result["failed"],
            contacts_used=contacts,
            details=result["details"],
        )

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emergency alert failed: {str(e)}")


@router.get("/contacts")
async def get_emergency_contacts():
    """Get the list of pre-configured emergency contacts"""
    contacts = settings.emergency_contacts_list
    return {
        "contacts": contacts,
        "count": len(contacts),
        "whatsapp_enabled": bool(settings.TWILIO_WHATSAPP_NUMBER),
    }
