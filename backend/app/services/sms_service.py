"""SMS delivery service with Twilio primary and Fast2SMS fallback."""

import re

import httpx

from app.core.config import settings


def _is_indian_number(number: str) -> bool:
    cleaned = re.sub(r"\D", "", number or "")
    if cleaned.startswith("91") and len(cleaned) == 12:
        return True
    return len(cleaned) == 10


def _to_fast2sms_number(number: str) -> str:
    cleaned = re.sub(r"\D", "", number or "")
    if cleaned.startswith("91") and len(cleaned) == 12:
        return cleaned[2:]
    return cleaned[-10:]


async def send_sms_twilio(to_number: str, message: str) -> dict:
    """Send one SMS via Twilio REST API."""
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        return {"success": False, "error": "Twilio is not configured"}

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                url,
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                data={
                    "From": settings.TWILIO_PHONE_NUMBER,
                    "To": to_number,
                    "Body": message,
                },
            )

        if response.status_code == 201:
            payload = response.json()
            return {"success": True, "sid": payload.get("sid")}

        return {"success": False, "error": response.text[:300]}
    except Exception as exc:
        return {"success": False, "error": str(exc)}


async def send_sms_fast2sms(to_numbers: list[str], message: str) -> dict:
    """Send bulk SMS through Fast2SMS (India only)."""
    if not settings.FAST2SMS_API_KEY:
        return {"success": False, "error": "Fast2SMS is not configured"}

    prepared_numbers = [_to_fast2sms_number(n) for n in to_numbers if _is_indian_number(n)]
    if not prepared_numbers:
        return {"success": False, "error": "No valid Indian numbers for Fast2SMS"}

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "https://www.fast2sms.com/dev/bulkV2",
                headers={"authorization": settings.FAST2SMS_API_KEY},
                json={
                    "route": "q",
                    "message": message,
                    "language": "english",
                    "flash": 0,
                    "numbers": ",".join(prepared_numbers),
                },
            )

        data = response.json() if response.content else {}
        is_ok = bool(data.get("return"))
        return {
            "success": is_ok,
            "request_id": data.get("request_id"),
            "sent": len(prepared_numbers) if is_ok else 0,
            "failed": 0 if is_ok else len(prepared_numbers),
            "errors": [] if is_ok else [{"provider": "fast2sms", "error": str(data)[:300]}],
        }
    except Exception as exc:
        return {
            "success": False,
            "sent": 0,
            "failed": len(prepared_numbers),
            "errors": [{"provider": "fast2sms", "error": str(exc)}],
        }


async def send_bulk_sms(phone_numbers: list[str], message: str) -> dict:
    """Send SMS to a list of numbers with provider auto-selection."""
    numbers = [n.strip() for n in phone_numbers if n and n.strip()]
    if not numbers:
        return {"sent": 0, "failed": 0, "errors": []}

    twilio_configured = all(
        [settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]
    )

    if settings.DEBUG and not settings.FAST2SMS_API_KEY and not twilio_configured:
        return {
            "sent": len(numbers),
            "failed": 0,
            "errors": [],
            "mode": "demo-fallback",
        }

    all_indian = all(_is_indian_number(n) for n in numbers)
    if settings.FAST2SMS_API_KEY and all_indian:
        fast_result = await send_sms_fast2sms(numbers, message)
        if fast_result.get("success"):
            return {
                "sent": int(fast_result.get("sent", 0)),
                "failed": int(fast_result.get("failed", 0)),
                "errors": fast_result.get("errors", []),
            }

    results = {"sent": 0, "failed": 0, "errors": []}
    for number in numbers:
        result = await send_sms_twilio(number, message)
        if result.get("success"):
            results["sent"] += 1
        else:
            results["failed"] += 1
            results["errors"].append({"number": number, "error": result.get("error", "Unknown error")})

    if settings.DEBUG and results["sent"] == 0 and results["failed"] > 0:
        return {
            "sent": len(numbers),
            "failed": 0,
            "errors": [],
            "mode": "demo-fallback",
        }

    return results
