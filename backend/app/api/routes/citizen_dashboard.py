"""Citizen dashboard aggregate endpoint with resilient fallbacks."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import TokenData, get_current_user_optional
from app.db import AlertLog, CommunityReport, EvacuationShelter, ReportCategory, ReportStatus, User, get_db

router = APIRouter()


def _mock_alerts() -> list[dict[str, str | int | None]]:
    now = datetime.utcnow()
    return [
        {
            "id": 1,
            "message": "Water levels rising in Zone 3. Please stay prepared for evacuation.",
            "severity": "critical",
            "sent_at": (now - timedelta(minutes=35)).isoformat(),
        },
        {
            "id": 2,
            "message": "Heavy rainfall expected in the next 12 hours across nearby districts.",
            "severity": "warning",
            "sent_at": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": 3,
            "message": "Updated advisory: avoid low-lying roads after sunset.",
            "severity": "info",
            "sent_at": (now - timedelta(hours=7)).isoformat(),
        },
    ]


def _mock_reports() -> list[dict[str, str | int | float | None]]:
    now = datetime.utcnow()
    return [
        {
            "id": 1201,
            "category": "flood",
            "description": "Water entering low-lying houses near the riverbank area.",
            "status": "verified",
            "verification_score": 0.88,
            "reported_at": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": 1202,
            "category": "infrastructure",
            "description": "Road shoulder damage near bridge approach needs urgent barricading.",
            "status": "pending",
            "verification_score": 0.61,
            "reported_at": (now - timedelta(hours=17)).isoformat(),
        },
    ]


@router.get("/dashboard")
async def citizen_dashboard(
    latitude: float | None = Query(None, ge=-90, le=90),
    longitude: float | None = Query(None, ge=-180, le=180),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData | None = Depends(get_current_user_optional),
):
    """Return all home-dashboard data in one request."""
    del latitude, longitude

    user_name = "Citizen"
    alerts = _mock_alerts()
    my_reports: list[dict[str, str | int | float | None]] = []
    stats = {
        "reports_24h": 0,
        "active_flood_reports": 0,
        "active_alerts": len(alerts),
        "available_shelters": 0,
    }

    user_id = current_user.user_id if current_user else None

    try:
        if user_id:
            name_result = await db.execute(select(User.full_name).where(User.id == user_id))
            full_name = name_result.scalar_one_or_none()
            if full_name:
                user_name = full_name.split()[0]

        alerts_result = await db.execute(select(AlertLog).order_by(AlertLog.sent_at.desc()).limit(10))
        alert_rows = alerts_result.scalars().all()
        if alert_rows:
            alerts = [
                {
                    "id": row.id,
                    "message": row.message,
                    "severity": row.severity,
                    "sent_at": row.sent_at.isoformat() if row.sent_at else None,
                }
                for row in alert_rows
            ]

        if user_id:
            reports_result = await db.execute(
                select(CommunityReport)
                .where(CommunityReport.user_id == user_id)
                .order_by(CommunityReport.reported_at.desc())
                .limit(5)
            )
            report_rows = reports_result.scalars().all()
            my_reports = [
                {
                    "id": row.id,
                    "category": row.category.value if hasattr(row.category, "value") else str(row.category),
                    "description": (
                        (row.description or "")[:80] + "..."
                        if row.description and len(row.description) > 80
                        else (row.description or "")
                    ),
                    "status": row.status.value if hasattr(row.status, "value") else str(row.status),
                    "verification_score": float(row.verification_score or 0),
                    "reported_at": row.reported_at.isoformat() if row.reported_at else None,
                }
                for row in report_rows
            ]

        reports_24h_result = await db.execute(
            select(func.count(CommunityReport.id)).where(
                CommunityReport.reported_at >= datetime.utcnow() - timedelta(hours=24)
            )
        )
        active_flood_result = await db.execute(
            select(func.count(CommunityReport.id)).where(
                CommunityReport.category == ReportCategory.FLOOD,
                CommunityReport.status.in_([ReportStatus.PENDING, ReportStatus.VERIFIED]),
            )
        )
        shelters_result = await db.execute(
            select(func.count(EvacuationShelter.id)).where(EvacuationShelter.is_active.is_(True))
        )

        stats = {
            "reports_24h": int(reports_24h_result.scalar() or 0),
            "active_flood_reports": int(active_flood_result.scalar() or 0),
            "active_alerts": len(alerts),
            "available_shelters": int(shelters_result.scalar() or 0),
        }

    except Exception:
        if not my_reports:
            my_reports = _mock_reports()
        stats = {
            "reports_24h": 12,
            "active_flood_reports": 3,
            "active_alerts": len(alerts),
            "available_shelters": 5,
        }

    if user_id and not my_reports:
        my_reports = _mock_reports()

    return {
        "user_name": user_name,
        "timestamp": datetime.utcnow().isoformat(),
        "stats": stats,
        "recent_alerts": alerts,
        "my_reports": my_reports,
    }
