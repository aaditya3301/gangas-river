"""Voice broadcast service for emergency calls via Twilio."""

from urllib.parse import quote

import httpx

from app.core.config import settings


def _public_backend_url() -> str:
    if settings.BACKEND_PUBLIC_URL:
        return settings.BACKEND_PUBLIC_URL.rstrip("/")
    return "http://localhost:8000"


async def make_emergency_call(to_number: str, message: str, language: str = "hi-IN") -> dict:
    """Initiate an automated voice call through Twilio."""
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        return {"success": False, "error": "Twilio is not configured"}

    twiml_url = f"{_public_backend_url()}/api/alerts/twiml?message={quote(message)}&lang={quote(language)}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Calls.json"

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(
                url,
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                data={
                    "From": settings.TWILIO_PHONE_NUMBER,
                    "To": to_number,
                    "Url": twiml_url,
                    "Method": "GET",
                },
            )

        if response.status_code == 201:
            payload = response.json()
            return {"success": True, "call_sid": payload.get("sid")}

        return {"success": False, "error": response.text[:300]}
    except Exception as exc:
        return {"success": False, "error": str(exc)}


async def broadcast_emergency_calls(phone_numbers: list[str], message: str, language: str = "hi-IN") -> dict:
    """Call every recipient with an automated emergency voice message."""
    numbers = [n.strip() for n in phone_numbers if n and n.strip()]
    results = {"called": 0, "failed": 0, "errors": []}

    for number in numbers:
        call_result = await make_emergency_call(number, message, language)
        if call_result.get("success"):
            results["called"] += 1
        else:
            results["failed"] += 1
            masked = number[-4:] if len(number) >= 4 else number
            results["errors"].append(
                {
                    "number": masked,
                    "error": str(call_result.get("error", "Unknown error"))[:200],
                }
            )

    return results
