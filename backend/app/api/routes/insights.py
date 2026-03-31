"""Researcher insights and analytics routes."""

from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import CommunityReport, get_db

router = APIRouter()

MOCK_REPORTS = [
    {
        "id": "mock-hapur-flood-1",
        "city": "Hapur",
        "latitude": 28.7306,
        "longitude": 77.7807,
        "category": "flood",
        "status": "verified",
        "verification_score": 0.91,
        "reported_at": datetime(2026, 1, 12, 10, 30, 0),
    },
    {
        "id": "mock-varanasi-erosion-1",
        "city": "Varanasi",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "category": "erosion",
        "status": "pending",
        "verification_score": 0.74,
        "reported_at": datetime(2026, 2, 6, 8, 45, 0),
    },
    {
        "id": "mock-prayagraj-infra-1",
        "city": "Prayagraj",
        "latitude": 25.4358,
        "longitude": 81.8463,
        "category": "infrastructure",
        "status": "verified",
        "verification_score": 0.86,
        "reported_at": datetime(2026, 2, 28, 16, 5, 0),
    },
    {
        "id": "mock-bijnor-flood-1",
        "city": "Bijnor",
        "latitude": 29.3732,
        "longitude": 78.1352,
        "category": "flood",
        "status": "resolved",
        "verification_score": 0.79,
        "reported_at": datetime(2026, 3, 18, 12, 20, 0),
    },
]

FLOOD_INSIGHTS = [
    {
        "id": "monsoon-peak",
        "title": "Monsoon Peak Flooding Pattern",
        "description": "Most recorded flood events are concentrated in June-September, with July at peak intensity.",
        "source": "IFI-Impacts v3 (1967-2023)",
        "type": "seasonal",
    },
    {
        "id": "up-bihar-hotspot",
        "title": "UP and Bihar Hotspot",
        "description": "Uttar Pradesh and Bihar consistently rank among the highest flood exposure regions in the basin.",
        "source": "IFI-Impacts v3, EM-DAT",
        "type": "regional",
    },
    {
        "id": "damage-trend",
        "title": "Rising Economic Losses",
        "description": "Estimated annual flood losses have trended upward with urbanization and climate variability.",
        "source": "NDMA and CWC summaries",
        "type": "economic",
    },
    {
        "id": "depth-damage",
        "title": "Depth-Damage Relationship",
        "description": "Damage severity rises sharply after 1m inundation depth, especially for vulnerable structures.",
        "source": "JRC Global Flood Depth-Damage Functions",
        "type": "vulnerability",
    },
    {
        "id": "early-warning-impact",
        "title": "Early Warning Cuts Losses",
        "description": "Reliable 24h warning windows can reduce flood-related losses through pre-emptive action.",
        "source": "WMO, UNDRR",
        "type": "intervention",
    },
]


def _mock_trends() -> list[dict]:
    month_counts: dict[str, int] = defaultdict(int)
    for report in MOCK_REPORTS:
        month_key = report["reported_at"].strftime("%Y-%m")
        month_counts[month_key] += 1
    return [{"month": month, "reports": count} for month, count in sorted(month_counts.items())]


def _mock_categories() -> list[dict]:
    counts: dict[str, int] = defaultdict(int)
    for report in MOCK_REPORTS:
        counts[str(report["category"])] += 1
    return [{"name": name, "count": count} for name, count in sorted(counts.items())]


def _mock_statuses() -> list[dict]:
    counts: dict[str, int] = defaultdict(int)
    for report in MOCK_REPORTS:
        counts[str(report["status"])] += 1
    return [{"name": name, "count": count} for name, count in sorted(counts.items())]


def _mock_verification_scores() -> list[float]:
    return [float(report["verification_score"]) for report in MOCK_REPORTS]


def _mock_regions() -> list[dict]:
    bins: dict[tuple[float, float], dict[str, float]] = {}
    for report in MOCK_REPORTS:
        lat_bin = round(float(report["latitude"]), 1)
        lng_bin = round(float(report["longitude"]), 1)
        key = (lat_bin, lng_bin)
        if key not in bins:
            bins[key] = {"count": 0.0, "score_sum": 0.0}
        bins[key]["count"] += 1
        bins[key]["score_sum"] += float(report["verification_score"])

    regions = []
    for (lat, lng), agg in bins.items():
        count = int(agg["count"])
        avg_score = round(agg["score_sum"] / count, 2) if count else 0
        regions.append(
            {
                "lat": lat,
                "lng": lng,
                "report_count": count,
                "avg_verification": avg_score,
            }
        )

    regions.sort(key=lambda item: item["report_count"], reverse=True)
    return regions


@router.get("/report-trends")
async def report_trends(db: AsyncSession = Depends(get_db)) -> dict:
    """Monthly report submission trends for charting."""
    try:
        result = await db.execute(select(CommunityReport.reported_at).order_by(CommunityReport.reported_at))
        rows = result.fetchall()
    except Exception:
        return {"trend": _mock_trends()}

    if not rows:
        return {"trend": _mock_trends()}

    month_counts: dict[str, int] = defaultdict(int)
    for row in rows:
        reported_at = row[0]
        if isinstance(reported_at, datetime):
            key = reported_at.strftime("%Y-%m")
            month_counts[key] += 1

    trend = [{"month": month, "reports": count} for month, count in sorted(month_counts.items())]
    return {"trend": trend}


@router.get("/category-distribution")
async def category_distribution(db: AsyncSession = Depends(get_db)) -> dict:
    """Category distribution for reports."""
    try:
        result = await db.execute(
            select(CommunityReport.category, func.count(CommunityReport.id)).group_by(CommunityReport.category)
        )
        rows = result.fetchall()
    except Exception:
        return {"categories": _mock_categories()}

    if not rows:
        return {"categories": _mock_categories()}

    categories = []
    for category, count in rows:
        name = category.value if hasattr(category, "value") else str(category)
        categories.append({"name": name, "count": int(count)})
    return {"categories": categories}


@router.get("/verification-stats")
async def verification_stats(db: AsyncSession = Depends(get_db)) -> dict:
    """Verification score distribution histogram and summary."""
    try:
        result = await db.execute(
            select(CommunityReport.verification_score).where(CommunityReport.verification_score.isnot(None))
        )
        scores = [float(row[0]) for row in result.fetchall() if row[0] is not None]
    except Exception:
        scores = _mock_verification_scores()

    if not scores:
        scores = _mock_verification_scores()

    buckets = [0] * 10
    for score in scores:
        idx = min(max(int(score * 10), 0), 9)
        buckets[idx] += 1

    distribution = [
        {"range": f"{i/10:.1f}-{(i+1)/10:.1f}", "count": buckets[i]}
        for i in range(10)
    ]

    return {
        "distribution": distribution,
        "avg_score": round(sum(scores) / len(scores), 3),
        "total_verified": len(scores),
    }


@router.get("/status-breakdown")
async def status_breakdown(db: AsyncSession = Depends(get_db)) -> dict:
    """Report status breakdown for donut chart."""
    try:
        result = await db.execute(
            select(CommunityReport.status, func.count(CommunityReport.id)).group_by(CommunityReport.status)
        )
        rows = result.fetchall()
    except Exception:
        return {"statuses": _mock_statuses()}

    if not rows:
        return {"statuses": _mock_statuses()}

    statuses = []
    for status, count in rows:
        name = status.value if hasattr(status, "value") else str(status)
        statuses.append({"name": name, "count": int(count)})
    return {"statuses": statuses}


@router.get("/regional-summary")
async def regional_summary(db: AsyncSession = Depends(get_db)) -> dict:
    """Lightweight regional clustering from existing report locations."""
    try:
        result = await db.execute(
            select(
                func.round(func.ST_Y(CommunityReport.location), 1).label("lat_bin"),
                func.round(func.ST_X(CommunityReport.location), 1).label("lng_bin"),
                func.count(CommunityReport.id).label("count"),
                func.avg(CommunityReport.verification_score).label("avg_score"),
            )
            .group_by("lat_bin", "lng_bin")
            .order_by(func.count(CommunityReport.id).desc())
            .limit(20)
        )
        rows = result.fetchall()
    except Exception:
        return {"regions": _mock_regions()}

    if not rows:
        return {"regions": _mock_regions()}

    regions = []
    for row in rows:
        regions.append(
            {
                "lat": float(row.lat_bin),
                "lng": float(row.lng_bin),
                "report_count": int(row.count),
                "avg_verification": round(float(row.avg_score or 0), 2),
            }
        )
    return {"regions": regions}


@router.get("/curated-insights")
async def get_curated_insights() -> dict:
    """Curated insight cards for researcher view."""
    return {"insights": FLOOD_INSIGHTS}
