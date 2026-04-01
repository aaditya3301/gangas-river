"""Officials command center aggregate endpoint."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import TokenData, get_current_user
from app.db import AlertLog, CommunityReport, NGOTask, ReportCategory, ReportStatus, User, get_db

router = APIRouter()


@router.get("/command-center")
async def command_center_data(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Aggregated data payload for officials dashboard home."""
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")

    now = datetime.utcnow()
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)

    pending_reports = await db.execute(
        select(func.count(CommunityReport.id)).where(CommunityReport.status == ReportStatus.PENDING)
    )
    reports_24h = await db.execute(
        select(func.count(CommunityReport.id)).where(CommunityReport.reported_at >= last_24h)
    )
    verified_reports = await db.execute(
        select(func.count(CommunityReport.id)).where(CommunityReport.status == ReportStatus.VERIFIED)
    )
    active_flood_reports = await db.execute(
        select(func.count(CommunityReport.id)).where(
            CommunityReport.category == ReportCategory.FLOOD,
            CommunityReport.status.in_([ReportStatus.PENDING, ReportStatus.VERIFIED]),
        )
    )
    total_users = await db.execute(
        select(func.count(User.id)).where(User.is_active.is_(True))
    )
    alerts_this_week = await db.execute(
        select(func.count(AlertLog.id)).where(AlertLog.sent_at >= last_7d)
    )

    reports_result = await db.execute(
        select(
            CommunityReport,
            ST_Y(CommunityReport.location).label("latitude"),
            ST_X(CommunityReport.location).label("longitude"),
        )
        .where(CommunityReport.status == ReportStatus.PENDING)
        .order_by(CommunityReport.reported_at.desc())
        .limit(10)
    )

    recent_reports = []
    for row in reports_result.all():
        recent_reports.append(
            {
                "id": row.CommunityReport.id,
                "category": row.CommunityReport.category.value,
                "description": (row.CommunityReport.description or "")[:100],
                "latitude": float(row.latitude) if row.latitude is not None else None,
                "longitude": float(row.longitude) if row.longitude is not None else None,
                "status": row.CommunityReport.status.value,
                "verification_score": float(row.CommunityReport.verification_score or 0),
                "reported_at": row.CommunityReport.reported_at.isoformat() if row.CommunityReport.reported_at else None,
            }
        )

    alerts_result = await db.execute(
        select(AlertLog).order_by(AlertLog.sent_at.desc()).limit(5)
    )
    recent_alerts = []
    for alert in alerts_result.scalars().all():
        recent_alerts.append(
            {
                "id": alert.id,
                "message": (alert.message or "")[:120],
                "severity": alert.severity,
                "recipient_count": int(getattr(alert, "recipient_count", 0) or 0),
                "sent_at": alert.sent_at.isoformat() if alert.sent_at else None,
            }
        )

    ngo_result = await db.execute(
        select(
            NGOTask.ngo_user_id,
            func.sum(NGOTask.points_awarded).label("points"),
            func.count(NGOTask.id).label("tasks"),
        )
        .where(NGOTask.status == "verified")
        .group_by(NGOTask.ngo_user_id)
        .order_by(func.sum(NGOTask.points_awarded).desc())
        .limit(5)
    )

    top_ngos = []
    for row in ngo_result.fetchall():
        user_res = await db.execute(select(User.full_name).where(User.id == row.ngo_user_id))
        top_ngos.append(
            {
                "user_id": int(row.ngo_user_id),
                "name": user_res.scalar_one_or_none() or "Unknown NGO",
                "points": int(row.points or 0),
                "tasks": int(row.tasks or 0),
            }
        )

    map_reports = await db.execute(
        select(
            ST_Y(CommunityReport.location).label("latitude"),
            ST_X(CommunityReport.location).label("longitude"),
            CommunityReport.category,
            CommunityReport.status,
        )
        .where(CommunityReport.reported_at >= last_7d)
        .limit(100)
    )

    map_points = []
    for row in map_reports.fetchall():
        if row.latitude is None or row.longitude is None:
            continue
        map_points.append(
            {
                "lat": float(row.latitude),
                "lng": float(row.longitude),
                "category": row.category.value,
                "status": row.status.value,
            }
        )

    official_name = "Official"
    if current_user.user_id:
        user_row = await db.execute(select(User.full_name).where(User.id == current_user.user_id))
        maybe_name = user_row.scalar_one_or_none()
        if maybe_name:
            official_name = maybe_name

    return {
        "stats": {
            "pending_reports": int(pending_reports.scalar() or 0),
            "reports_24h": int(reports_24h.scalar() or 0),
            "verified_reports": int(verified_reports.scalar() or 0),
            "active_flood_reports": int(active_flood_reports.scalar() or 0),
            "total_users": int(total_users.scalar() or 0),
            "alerts_this_week": int(alerts_this_week.scalar() or 0),
        },
        "recent_reports": recent_reports,
        "recent_alerts": recent_alerts,
        "top_ngos": top_ngos,
        "map_points": map_points,
        "system_status": "operational",
        "official_name": official_name,
    }
