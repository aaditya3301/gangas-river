"""Community reports routes - submit, query, stats, and official moderation."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from geoalchemy2.functions import ST_MakePoint, ST_SetSRID, ST_X, ST_Y
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import TokenData, get_current_user, get_current_user_optional
from app.db import CommunityReport, ReportCategory, ReportStatus, User, get_db
from app.schemas import ReportCreate, ReportResponse, ReportStatusUpdate
from app.services.report_verifier import verify_report

router = APIRouter()

MOCK_REPORTS = [
    {
        "id": 9001,
        "category": "flood",
        "description": "Hapur: Waterlogging near NH-9 low-lying stretch after overnight rain.",
        "status": "verified",
        "verification_score": 0.91,
        "verification_notes": "Matches low-elevation flood-prone segment and rainfall spike.",
        "reported_at": datetime(2026, 1, 12, 10, 30, 0),
        "verified_at": datetime(2026, 1, 12, 11, 0, 0),
        "latitude": 28.7306,
        "longitude": 77.7807,
        "reporter_name": "Demo Citizen",
        "photo_url": None,
    },
    {
        "id": 9002,
        "category": "erosion",
        "description": "Varanasi: Bank-side soil erosion observed near ghat steps after high flow.",
        "status": "pending",
        "verification_score": 0.74,
        "verification_notes": "Needs secondary visual confirmation.",
        "reported_at": datetime(2026, 2, 6, 8, 45, 0),
        "verified_at": None,
        "latitude": 25.3176,
        "longitude": 82.9739,
        "reporter_name": "Demo Citizen",
        "photo_url": None,
    },
    {
        "id": 9003,
        "category": "infrastructure",
        "description": "Prayagraj: Drain choke and road shoulder collapse reported post heavy rainfall.",
        "status": "verified",
        "verification_score": 0.86,
        "verification_notes": "Pattern is consistent with nearby validated reports.",
        "reported_at": datetime(2026, 2, 28, 16, 5, 0),
        "verified_at": datetime(2026, 2, 28, 16, 40, 0),
        "latitude": 25.4358,
        "longitude": 81.8463,
        "reporter_name": "Demo Citizen",
        "photo_url": None,
    },
    {
        "id": 9004,
        "category": "flood",
        "description": "Bijnor: Localized overflow around embankment service lane.",
        "status": "resolved",
        "verification_score": 0.79,
        "verification_notes": "Resolved after temporary pumping and barricading.",
        "reported_at": datetime(2026, 3, 18, 12, 20, 0),
        "verified_at": datetime(2026, 3, 18, 14, 0, 0),
        "latitude": 29.3732,
        "longitude": 78.1352,
        "reporter_name": "Demo Citizen",
        "photo_url": None,
    },
]


def _get_mock_reports(status_filter: str | None = None, category_filter: str | None = None) -> list[ReportResponse]:
    rows = MOCK_REPORTS
    if status_filter:
        rows = [row for row in rows if row["status"] == status_filter]
    if category_filter:
        rows = [row for row in rows if row["category"] == category_filter]
    rows = sorted(rows, key=lambda x: x["reported_at"], reverse=True)
    return [ReportResponse(**row) for row in rows]


async def _resolve_reporter_name(db: AsyncSession, user_id: Optional[int]) -> str:
    if not user_id:
        return "Anonymous"
    result = await db.execute(select(User.full_name).where(User.id == user_id))
    name = result.scalar_one_or_none()
    return name or "Citizen"


async def _resolve_fallback_user_id(db: AsyncSession) -> Optional[int]:
    result = await db.execute(select(User.id).order_by(User.id.asc()).limit(1))
    return result.scalar_one_or_none()


@router.post("/submit", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(
    report_data: ReportCreate,
    current_user: TokenData | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Submit a new community report and run AI verification."""
    lat, lng = report_data.latitude, report_data.longitude

    user_id = current_user.user_id if current_user else await _resolve_fallback_user_id(db)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authenticated user found. Please login or register first.",
        )

    verification = await verify_report(
        latitude=lat,
        longitude=lng,
        altitude=report_data.altitude,
        category=report_data.category,
    )

    if verification.is_verified:
        initial_status = ReportStatus.VERIFIED
    elif verification.confidence_score < 0.3:
        initial_status = ReportStatus.REJECTED
    else:
        initial_status = ReportStatus.PENDING

    location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)

    report = CommunityReport(
        user_id=user_id,
        location=location,
        category=ReportCategory(report_data.category),
        description=report_data.description,
        photo_url=report_data.photo_url,
        status=initial_status,
        verification_score=verification.confidence_score,
        verification_notes=verification.notes,
        reported_altitude=report_data.altitude,
        reported_at=datetime.utcnow(),
        verified_at=datetime.utcnow() if initial_status in (ReportStatus.VERIFIED, ReportStatus.REJECTED) else None,
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    reporter_name = await _resolve_reporter_name(db, report.user_id)

    return ReportResponse(
        id=report.id,
        latitude=lat,
        longitude=lng,
        category=report.category.value,
        description=report.description,
        photo_url=report.photo_url,
        status=report.status.value,
        verification_score=report.verification_score,
        verification_notes=report.verification_notes,
        reported_at=report.reported_at,
        verified_at=report.verified_at,
        reporter_name=reporter_name,
    )


@router.get("/all", response_model=list[ReportResponse])
async def get_all_reports(
    status: str | None = Query(None, description="Filter by status"),
    category: str | None = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get all reports with optional filters and reporter names."""
    query = select(
        CommunityReport,
        ST_X(CommunityReport.location).label("longitude"),
        ST_Y(CommunityReport.location).label("latitude"),
    )

    if status:
        try:
            query = query.where(CommunityReport.status == ReportStatus(status))
        except ValueError as err:
            raise HTTPException(status_code=400, detail="Invalid status filter") from err

    if category:
        try:
            query = query.where(CommunityReport.category == ReportCategory(category))
        except ValueError as err:
            raise HTTPException(status_code=400, detail="Invalid category filter") from err

    query = query.order_by(CommunityReport.reported_at.desc()).limit(limit).offset(offset)

    try:
        result = await db.execute(query)
        rows = result.all()
    except Exception:
        mock_reports = _get_mock_reports(status, category)
        return mock_reports[offset:offset + limit]

    if not rows:
        mock_reports = _get_mock_reports(status, category)
        return mock_reports[offset:offset + limit]

    response = []
    for row in rows:
        reporter_name = await _resolve_reporter_name(db, row.CommunityReport.user_id)
        response.append(
            ReportResponse(
                id=row.CommunityReport.id,
                latitude=float(row.latitude),
                longitude=float(row.longitude),
                category=row.CommunityReport.category.value,
                description=row.CommunityReport.description,
                photo_url=row.CommunityReport.photo_url,
                status=row.CommunityReport.status.value,
                verification_score=float(row.CommunityReport.verification_score or 0),
                verification_notes=row.CommunityReport.verification_notes,
                reported_at=row.CommunityReport.reported_at,
                verified_at=row.CommunityReport.verified_at,
                reporter_name=reporter_name,
            )
        )
    return response


@router.get("/my-reports", response_model=list[ReportResponse])
async def get_my_reports(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the authenticated user's submitted reports."""
    query = (
        select(
            CommunityReport,
            ST_X(CommunityReport.location).label("longitude"),
            ST_Y(CommunityReport.location).label("latitude"),
        )
        .where(CommunityReport.user_id == current_user.user_id)
        .order_by(CommunityReport.reported_at.desc())
    )

    result = await db.execute(query)
    rows = result.all()

    reporter_name = await _resolve_reporter_name(db, current_user.user_id)
    return [
        ReportResponse(
            id=row.CommunityReport.id,
            latitude=float(row.latitude),
            longitude=float(row.longitude),
            category=row.CommunityReport.category.value,
            description=row.CommunityReport.description,
            photo_url=row.CommunityReport.photo_url,
            status=row.CommunityReport.status.value,
            verification_score=float(row.CommunityReport.verification_score or 0),
            verification_notes=row.CommunityReport.verification_notes,
            reported_at=row.CommunityReport.reported_at,
            verified_at=row.CommunityReport.verified_at,
            reporter_name=reporter_name,
        )
        for row in rows
    ]


@router.get("/stats")
async def get_report_stats(db: AsyncSession = Depends(get_db)):
    """Get aggregate report stats for dashboard cards and filters."""
    try:
        total = int((await db.execute(select(func.count(CommunityReport.id)))).scalar() or 0)

        status_rows = (
            await db.execute(
                select(CommunityReport.status, func.count(CommunityReport.id)).group_by(CommunityReport.status)
            )
        ).all()
        category_rows = (
            await db.execute(
                select(CommunityReport.category, func.count(CommunityReport.id)).group_by(CommunityReport.category)
            )
        ).all()

        if total > 0:
            by_status = {row[0].value: int(row[1]) for row in status_rows}
            by_category = {row[0].value: int(row[1]) for row in category_rows}
            return {
                "total": total,
                "pending": by_status.get("pending", 0),
                "verified": by_status.get("verified", 0),
                "rejected": by_status.get("rejected", 0),
                "resolved": by_status.get("resolved", 0),
                "by_status": by_status,
                "by_category": by_category,
            }
    except Exception:
        pass

    mock_reports = _get_mock_reports()
    by_status: dict[str, int] = {}
    by_category: dict[str, int] = {}
    for report in mock_reports:
        by_status[report.status] = by_status.get(report.status, 0) + 1
        by_category[report.category] = by_category.get(report.category, 0) + 1

    return {
        "total": len(mock_reports),
        "pending": by_status.get("pending", 0),
        "verified": by_status.get("verified", 0),
        "rejected": by_status.get("rejected", 0),
        "resolved": by_status.get("resolved", 0),
        "by_status": by_status,
        "by_category": by_category,
    }


@router.patch("/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: int,
    update_data: ReportStatusUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update report moderation status (official/admin only)."""
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")

    result = await db.execute(
        select(
            CommunityReport,
            ST_X(CommunityReport.location).label("longitude"),
            ST_Y(CommunityReport.location).label("latitude"),
        ).where(CommunityReport.id == report_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Report not found")

    try:
        new_status = ReportStatus(update_data.status)
    except ValueError as err:
        raise HTTPException(status_code=400, detail="Invalid status value") from err

    row.CommunityReport.status = new_status
    if update_data.notes:
        row.CommunityReport.verification_notes = update_data.notes
    row.CommunityReport.verified_at = datetime.utcnow()

    await db.commit()
    await db.refresh(row.CommunityReport)

    reporter_name = await _resolve_reporter_name(db, row.CommunityReport.user_id)
    return ReportResponse(
        id=row.CommunityReport.id,
        latitude=float(row.latitude),
        longitude=float(row.longitude),
        category=row.CommunityReport.category.value,
        description=row.CommunityReport.description,
        photo_url=row.CommunityReport.photo_url,
        status=row.CommunityReport.status.value,
        verification_score=float(row.CommunityReport.verification_score or 0),
        verification_notes=row.CommunityReport.verification_notes,
        reported_at=row.CommunityReport.reported_at,
        verified_at=row.CommunityReport.verified_at,
        reporter_name=reporter_name,
    )
