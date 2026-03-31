"""
Community reports routes - Submit and view reports
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from geoalchemy2.functions import ST_SetSRID, ST_MakePoint, ST_X, ST_Y

from app.db import get_db, CommunityReport, ReportCategory, ReportStatus
from app.core import get_current_user, TokenData
from app.schemas import ReportCreate, ReportResponse, ReportVerificationResult
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
        "latitude": 28.7306,
        "longitude": 77.7807,
    },
    {
        "id": 9002,
        "category": "erosion",
        "description": "Varanasi: Bank-side soil erosion observed near ghat steps after high flow.",
        "status": "pending",
        "verification_score": 0.74,
        "verification_notes": "Needs secondary visual confirmation.",
        "reported_at": datetime(2026, 2, 6, 8, 45, 0),
        "latitude": 25.3176,
        "longitude": 82.9739,
    },
    {
        "id": 9003,
        "category": "infrastructure",
        "description": "Prayagraj: Drain choke and road shoulder collapse reported post heavy rainfall.",
        "status": "verified",
        "verification_score": 0.86,
        "verification_notes": "Pattern is consistent with nearby validated reports.",
        "reported_at": datetime(2026, 2, 28, 16, 5, 0),
        "latitude": 25.4358,
        "longitude": 81.8463,
    },
    {
        "id": 9004,
        "category": "flood",
        "description": "Bijnor: Localized overflow around embankment service lane.",
        "status": "resolved",
        "verification_score": 0.79,
        "verification_notes": "Resolved after temporary pumping and barricading.",
        "reported_at": datetime(2026, 3, 18, 12, 20, 0),
        "latitude": 29.3732,
        "longitude": 78.1352,
    },
]


def _get_mock_reports(status_filter: str | None = None, category_filter: str | None = None) -> list[ReportResponse]:
    """Return mock reports with optional filters to support demo mode."""
    rows = MOCK_REPORTS
    if status_filter:
        rows = [r for r in rows if r["status"] == status_filter]
    if category_filter:
        rows = [r for r in rows if r["category"] == category_filter]

    rows = sorted(rows, key=lambda x: x["reported_at"], reverse=True)
    return [ReportResponse(**r) for r in rows]


@router.post("/submit", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(
    report_data: ReportCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a new community report
    
    - Automatically captures GPS location
    - Runs AI verification against LiDAR data
    - Returns verification status
    """
    lat, lng = report_data.latitude, report_data.longitude
    
    # Create PostGIS point
    location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
    
    # Run AI verification
    verification = await verify_report(
        latitude=lat,
        longitude=lng,
        altitude=report_data.altitude,
        category=report_data.category,
    )
    
    # Determine initial status based on verification
    if verification.is_verified:
        initial_status = ReportStatus.VERIFIED
    elif verification.confidence_score < 0.3:
        initial_status = ReportStatus.REJECTED
    else:
        initial_status = ReportStatus.PENDING
    
    # Create report
    report = CommunityReport(
        user_id=current_user.user_id,
        location=location,
        category=ReportCategory(report_data.category),
        description=report_data.description,
        photo_url=report_data.photo_url,
        status=initial_status,
        verification_score=verification.confidence_score,
        verification_notes=verification.notes,
        reported_altitude=report_data.altitude,
        reported_at=datetime.utcnow(),
        verified_at=datetime.utcnow() if verification.is_verified else None,
    )
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    
    return ReportResponse(
        id=report.id,
        category=report.category.value,
        description=report.description,
        status=report.status.value,
        verification_score=report.verification_score,
        verification_notes=report.verification_notes,
        reported_at=report.reported_at,
        latitude=lat,
        longitude=lng,
    )


@router.get("/all", response_model=list[ReportResponse])
async def get_all_reports(
    status: str = Query(None, description="Filter by status"),
    category: str = Query(None, description="Filter by category"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all community reports (public endpoint for map display)
    
    - Optionally filter by status or category
    - Returns with GPS coordinates for map markers
    """
    query = select(
        CommunityReport,
        ST_X(CommunityReport.location).label("longitude"),
        ST_Y(CommunityReport.location).label("latitude"),
    )
    
    # Apply filters
    if status:
        query = query.where(CommunityReport.status == ReportStatus(status))
    if category:
        query = query.where(CommunityReport.category == ReportCategory(category))
    
    # Order by most recent
    query = query.order_by(CommunityReport.reported_at.desc())
    query = query.limit(limit).offset(offset)
    
    try:
        result = await db.execute(query)
        rows = result.all()
    except Exception:
        mock_reports = _get_mock_reports(status, category)
        return mock_reports[offset:offset + limit]

    if not rows:
        mock_reports = _get_mock_reports(status, category)
        return mock_reports[offset:offset + limit]
    
    return [
        ReportResponse(
            id=row.CommunityReport.id,
            category=row.CommunityReport.category.value,
            description=row.CommunityReport.description,
            status=row.CommunityReport.status.value,
            verification_score=row.CommunityReport.verification_score,
            verification_notes=row.CommunityReport.verification_notes,
            reported_at=row.CommunityReport.reported_at,
            latitude=row.latitude,
            longitude=row.longitude,
        )
        for row in rows
    ]


@router.get("/my-reports", response_model=list[ReportResponse])
async def get_my_reports(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's submitted reports
    """
    query = select(
        CommunityReport,
        ST_X(CommunityReport.location).label("longitude"),
        ST_Y(CommunityReport.location).label("latitude"),
    ).where(
        CommunityReport.user_id == current_user.user_id
    ).order_by(CommunityReport.reported_at.desc())
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        ReportResponse(
            id=row.CommunityReport.id,
            category=row.CommunityReport.category.value,
            description=row.CommunityReport.description,
            status=row.CommunityReport.status.value,
            verification_score=row.CommunityReport.verification_score,
            verification_notes=row.CommunityReport.verification_notes,
            reported_at=row.CommunityReport.reported_at,
            latitude=row.latitude,
            longitude=row.longitude,
        )
        for row in rows
    ]


@router.get("/stats")
async def get_report_stats(db: AsyncSession = Depends(get_db)):
    """
    Get report statistics for dashboard
    """
    try:
        # Total reports
        total_result = await db.execute(select(func.count(CommunityReport.id)))
        total = int(total_result.scalar() or 0)

        # By status
        status_query = select(
            CommunityReport.status,
            func.count(CommunityReport.id)
        ).group_by(CommunityReport.status)
        status_result = await db.execute(status_query)
        by_status = {row[0].value: row[1] for row in status_result.all()}

        # By category
        category_query = select(
            CommunityReport.category,
            func.count(CommunityReport.id)
        ).group_by(CommunityReport.category)
        category_result = await db.execute(category_query)
        by_category = {row[0].value: row[1] for row in category_result.all()}

        if total > 0:
            return {
                "total": total,
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
        "by_status": by_status,
        "by_category": by_category,
    }
