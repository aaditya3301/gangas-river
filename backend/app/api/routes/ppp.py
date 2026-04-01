"""PPP economic loss routes for officials."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import TokenData, get_current_user_optional, settings
from app.db import get_db
from app.services.flood_predictor import predict_flood_risk_at_point
from app.services.loss_estimator import estimate_exposure_profile, calculate_eal
from app.services.ppp_calculator import (
    compare_with_without,
    get_infrastructure_options,
    similarity_match,
)

router = APIRouter()


class LossEstimateRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_km: float = Field(default=10.0, ge=1.0, le=100.0)
    rainfall_mm: float = Field(default=0.0, ge=0.0, le=1500.0)


class CompareRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_km: float = Field(default=10.0, ge=1.0, le=100.0)
    rainfall_mm: float = Field(default=0.0, ge=0.0, le=1500.0)
    infrastructure_type: str = Field(..., min_length=2, max_length=80)
    infrastructure_params: dict[str, float] = Field(default_factory=dict)


class SimilarityRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    predicted_depth_m: float = Field(..., ge=0.0, le=20.0)
    rainfall_mm: float = Field(default=0.0, ge=0.0, le=1500.0)


def _require_official(current_user: TokenData | None) -> None:
    if settings.DEBUG and settings.PPP_DEV_ALLOW_NON_OFFICIAL:
        return
    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")


@router.get("/infrastructure-options")
async def infrastructure_options(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData | None = Depends(get_current_user_optional),
):
    _require_official(current_user)
    return get_infrastructure_options()


@router.post("/estimate-loss")
async def estimate_loss(
    request: LossEstimateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData | None = Depends(get_current_user_optional),
):
    _require_official(current_user)

    prediction = await predict_flood_risk_at_point(
        latitude=request.latitude,
        longitude=request.longitude,
        rainfall_mm=request.rainfall_mm,
    )

    base_depth_m = max(0.0, float(prediction.get("predicted_depth", 0.0)))
    exposure = estimate_exposure_profile(request.latitude, request.longitude, request.radius_km)
    eal = calculate_eal(base_depth_m, exposure["exposure_values_rupees"])

    return {
        "region": exposure["region"],
        "predicted_depth_m": round(base_depth_m, 2),
        "risk_percentage": round(float(prediction.get("risk_percentage", 0.0)), 2),
        "expected_annual_loss_crore": eal["expected_annual_loss_crore"],
        "confidence_interval": eal["confidence_interval"],
        "scenario_breakdown": eal["scenario_breakdown"],
        "exposure_summary": exposure["exposure_summary"],
    }


@router.post("/compare")
async def compare_infrastructure(
    request: CompareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData | None = Depends(get_current_user_optional),
):
    _require_official(current_user)

    prediction = await predict_flood_risk_at_point(
        latitude=request.latitude,
        longitude=request.longitude,
        rainfall_mm=request.rainfall_mm,
    )

    base_depth_m = max(0.0, float(prediction.get("predicted_depth", 0.0)))
    exposure = estimate_exposure_profile(request.latitude, request.longitude, request.radius_km)

    try:
        result = compare_with_without(
            base_depth_m=base_depth_m,
            exposure_values_rupees=exposure["exposure_values_rupees"],
            infrastructure_type=request.infrastructure_type,
            infrastructure_params=request.infrastructure_params,
            radius_km=request.radius_km,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "region": exposure["region"],
        "predicted_depth_m": round(base_depth_m, 2),
        "risk_percentage": round(float(prediction.get("risk_percentage", 0.0)), 2),
        **result,
    }


@router.post("/similarity-match")
async def similarity_match_route(
    request: SimilarityRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData | None = Depends(get_current_user_optional),
):
    _require_official(current_user)

    return similarity_match(
        latitude=request.latitude,
        longitude=request.longitude,
        predicted_depth_m=request.predicted_depth_m,
        rainfall_mm=request.rainfall_mm,
    )
