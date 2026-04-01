"""Alerts API: SMS blasts, voice broadcast calls, and alert history."""

from datetime import datetime
from typing import Optional
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import TokenData, get_current_user
from app.core.config import settings
from app.db import User, get_db
from app.services.sms_service import send_bulk_sms
from app.services.voice_service import broadcast_emergency_calls

router = APIRouter()


class AlertRequest(BaseModel):
    message: str = Field(..., min_length=10, max_length=320)
    severity: str = Field(..., pattern="^(info|warning|critical|emergency)$")
    region: Optional[str] = None


class AlertResponse(BaseModel):
    alert_id: int
    sent_count: int
    failed_count: int
    message: str
    severity: str
    sent_at: datetime


class BroadcastCallRequest(BaseModel):
    message: str = Field(..., min_length=10, max_length=600)
    language: str = Field(default="hi-IN", pattern="^(hi-IN|en-IN)$")
    region: Optional[str] = None


async def _get_recipients(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(User.phone).where(
            User.phone.isnot(None),
            User.is_active.is_(True),
        )
    )
    db_numbers = [row[0] for row in result.fetchall() if row[0]]
    configured_numbers = settings.emergency_contacts_list
    # Keep order stable while removing duplicates from both sources.
    return list(dict.fromkeys([*db_numbers, *configured_numbers]))


async def _alert_log_columns(db: AsyncSession) -> set[str]:
    try:
        result = await db.execute(
            text(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'alert_logs'
                """
            )
        )
        return {row[0] for row in result.fetchall()}
    except Exception:
        return set()


async def _insert_alert_log(
    db: AsyncSession,
    *,
    message: str,
    severity: str,
    region: Optional[str],
    recipient_count: int,
    sent_count: int,
    failed_count: int,
) -> int:
    columns = await _alert_log_columns(db)
    if not columns:
        return 0

    insert_cols = ["message", "severity", "sent_at"]
    params: dict[str, object] = {
        "message": message,
        "severity": severity,
        "sent_at": datetime.utcnow(),
    }

    if "region" in columns:
        insert_cols.append("region")
        params["region"] = region
    if "recipient_count" in columns:
        insert_cols.append("recipient_count")
        params["recipient_count"] = recipient_count
    if "sent_count" in columns:
        insert_cols.append("sent_count")
        params["sent_count"] = sent_count
    if "failed_count" in columns:
        insert_cols.append("failed_count")
        params["failed_count"] = failed_count

    placeholders = ", ".join(f":{col}" for col in insert_cols)
    sql = f"INSERT INTO alert_logs ({', '.join(insert_cols)}) VALUES ({placeholders}) RETURNING id"

    try:
        result = await db.execute(text(sql), params)
        inserted_id = result.scalar_one_or_none()
        return int(inserted_id) if inserted_id is not None else 0
    except Exception:
        return 0


@router.get("/recipients-count")
async def recipients_count(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")

    numbers = await _get_recipients(db)
    return {"count": len(numbers)}


@router.post("/send-sms", response_model=AlertResponse)
async def send_sms_alert(
    alert: AlertRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Send SMS alert to active users. Officials/Admin only."""
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")

    numbers = await _get_recipients(db)
    if not numbers:
        raise HTTPException(status_code=400, detail="No users with phone numbers found")

    prefixes = {
        "info": "AquaGuardians Info",
        "warning": "AquaGuardians Warning",
        "critical": "AquaGuardians Critical",
        "emergency": "AquaGuardians Emergency",
    }
    full_message = f"{prefixes.get(alert.severity, 'Alert')}: {alert.message}"

    sms_result = await send_bulk_sms(numbers, full_message)
    sent_count = int(sms_result.get("sent", 0))
    failed_count = int(sms_result.get("failed", 0))

    alert_id = await _insert_alert_log(
        db,
        message=alert.message,
        severity=alert.severity,
        region=alert.region,
        recipient_count=len(numbers),
        sent_count=sent_count,
        failed_count=failed_count,
    )

    return AlertResponse(
        alert_id=alert_id,
        sent_count=sent_count,
        failed_count=failed_count,
        message=alert.message,
        severity=alert.severity,
        sent_at=datetime.utcnow(),
    )


@router.get("/history")
async def get_alert_history(
    severity: Optional[str] = Query(default=None, pattern="^(info|warning|critical|emergency)$"),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Read latest alert history. Officials/Admin only."""
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")

    columns = await _alert_log_columns(db)
    if not columns:
        return []

    select_cols = ["id", "message", "severity", "sent_at"]
    for optional_col in ("region", "recipient_count", "sent_count", "failed_count"):
        if optional_col in columns:
            select_cols.append(optional_col)

    where_clause = ""
    params: dict[str, object] = {}
    if severity:
        where_clause = "WHERE severity = :severity"
        params["severity"] = severity

    sql = f"SELECT {', '.join(select_cols)} FROM alert_logs {where_clause} ORDER BY sent_at DESC LIMIT 50"

    try:
        result = await db.execute(text(sql), params)
        rows = []
        for row in result.fetchall():
            payload = dict(row._mapping)
            if isinstance(payload.get("sent_at"), datetime):
                payload["sent_at"] = payload["sent_at"].isoformat()
            rows.append(payload)
        return rows
    except Exception:
        return []


@router.get("/twiml")
async def twiml_response(
    message: str = Query(..., min_length=3, max_length=600),
    lang: str = Query("hi-IN", pattern="^(hi-IN|en-IN)$"),
):
    """Return TwiML XML for Twilio voice calls."""
    safe_message = escape(message)
    safe_lang = escape(lang)

    voice_map = {
        "hi-IN": "Polly.Aditi",
        "en-IN": "Polly.Raveena",
    }
    voice = voice_map.get(lang, "Polly.Aditi")

    twiml = f"""<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
    <Say voice=\"{voice}\" language=\"{safe_lang}\">{safe_message}</Say>
    <Pause length=\"1\"/>
    <Say voice=\"{voice}\" language=\"{safe_lang}\">I repeat: {safe_message}</Say>
    <Pause length=\"1\"/>
    <Say voice=\"{voice}\" language=\"{safe_lang}\">Stay safe. This was an automated alert from AquaGuardians.</Say>
</Response>"""

    return Response(content=twiml, media_type="application/xml")


@router.post("/broadcast-call")
async def broadcast_call(
    data: BroadcastCallRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Trigger emergency voice calls to active users. Officials/Admin only."""
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")

    numbers = await _get_recipients(db)
    if not numbers:
        raise HTTPException(status_code=400, detail="No users with phone numbers found")

    call_result = await broadcast_emergency_calls(numbers, data.message, data.language)
    called = int(call_result.get("called", 0))
    failed = int(call_result.get("failed", 0))

    await _insert_alert_log(
        db,
        message=f"[VOICE CALL] {data.message}",
        severity="emergency",
        region=data.region,
        recipient_count=len(numbers),
        sent_count=called,
        failed_count=failed,
    )

    return {
        "total_recipients": len(numbers),
        "calls_initiated": called,
        "calls_failed": failed,
        "message": data.message,
        "language": data.language,
        "errors": call_result.get("errors", []),
    }
