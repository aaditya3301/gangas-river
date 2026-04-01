"""PPP calculator service for with-vs-without intervention loss analysis."""

from __future__ import annotations

import math
from typing import Any

from app.services.loss_estimator import calculate_eal

INFRASTRUCTURE_OPTIONS: dict[str, dict[str, Any]] = {
    "embankment": {
        "id": "embankment",
        "name": "Raised Embankment",
        "description": "Raised embankment along riverbank to reduce inundation depth.",
        "effect": "reduces_depth",
        "typical_cost_per_km_crore": 5.0,
        "default_depth_reduction_m": 1.0,
    },
    "drainage_improvement": {
        "id": "drainage_improvement",
        "name": "Drainage Improvement",
        "description": "Improved drainage capacity in flood-prone urban pockets.",
        "effect": "reduces_depth",
        "typical_cost_per_sqkm_crore": 10.0,
        "default_depth_reduction_m": 0.5,
    },
    "flood_wall": {
        "id": "flood_wall",
        "name": "Flood Wall",
        "description": "Concrete flood wall for dense urban edges.",
        "effect": "reduces_depth",
        "typical_cost_per_km_crore": 15.0,
        "default_depth_reduction_m": 1.8,
    },
    "early_warning_system": {
        "id": "early_warning_system",
        "name": "Early Warning System",
        "description": "Sensors and response readiness to reduce vulnerability impact.",
        "effect": "reduces_vulnerability",
        "default_vulnerability_reduction": 0.15,
        "typical_cost_crore": 2.0,
    },
}

# Mocked historical events used for similarity matching until full historical merge.
HISTORICAL_EVENTS = [
    {
        "year": 2013,
        "location": "Uttarakhand",
        "latitude": 30.3165,
        "longitude": 78.0322,
        "flood_depth_m": 3.8,
        "rainfall_mm": 340,
        "actual_damage_crore": 9000,
        "source": "IFI-Impacts",
    },
    {
        "year": 2017,
        "location": "Patna",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "flood_depth_m": 2.9,
        "rainfall_mm": 265,
        "actual_damage_crore": 1200,
        "source": "IFI-Impacts",
    },
    {
        "year": 2019,
        "location": "Prayagraj",
        "latitude": 25.4358,
        "longitude": 81.8463,
        "flood_depth_m": 2.8,
        "rainfall_mm": 300,
        "actual_damage_crore": 580,
        "source": "IFI-Impacts",
    },
    {
        "year": 2021,
        "location": "Varanasi",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "flood_depth_m": 2.1,
        "rainfall_mm": 220,
        "actual_damage_crore": 430,
        "source": "NDMA Compilation",
    },
    {
        "year": 2023,
        "location": "Buxar",
        "latitude": 25.5647,
        "longitude": 83.9777,
        "flood_depth_m": 1.9,
        "rainfall_mm": 210,
        "actual_damage_crore": 260,
        "source": "State Disaster Report",
    },
]


def get_infrastructure_options() -> list[dict[str, Any]]:
    return list(INFRASTRUCTURE_OPTIONS.values())


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)

    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _calculate_infra_cost_crore(
    infra_type: str,
    infra_params: dict[str, float],
    radius_km: float,
) -> float:
    if "cost_crore" in infra_params and infra_params["cost_crore"] > 0:
        return float(infra_params["cost_crore"])

    if infra_type == "embankment":
        length_km = float(infra_params.get("length_km", max(5.0, radius_km * 2.2)))
        return round(length_km * float(INFRASTRUCTURE_OPTIONS[infra_type]["typical_cost_per_km_crore"]), 2)

    if infra_type == "flood_wall":
        length_km = float(infra_params.get("length_km", max(3.0, radius_km * 1.4)))
        return round(length_km * float(INFRASTRUCTURE_OPTIONS[infra_type]["typical_cost_per_km_crore"]), 2)

    if infra_type == "drainage_improvement":
        area_sqkm = math.pi * max(radius_km, 1.0) ** 2
        return round(area_sqkm * float(INFRASTRUCTURE_OPTIONS[infra_type]["typical_cost_per_sqkm_crore"]) * 0.12, 2)

    return float(INFRASTRUCTURE_OPTIONS[infra_type].get("typical_cost_crore", 2.0))


def compare_with_without(
    base_depth_m: float,
    exposure_values_rupees: dict[str, float],
    infrastructure_type: str,
    infrastructure_params: dict[str, float],
    radius_km: float,
) -> dict[str, Any]:
    """Compare expected annual loss with and without intervention."""
    if infrastructure_type not in INFRASTRUCTURE_OPTIONS:
        raise ValueError("Unsupported infrastructure type")

    without_infra = calculate_eal(base_depth_m, exposure_values_rupees)

    option = INFRASTRUCTURE_OPTIONS[infrastructure_type]
    effect = option["effect"]

    adjusted_depth_m = base_depth_m
    adjusted_exposure = exposure_values_rupees.copy()

    if effect == "reduces_depth":
        depth_reduction = float(
            infrastructure_params.get(
                "depth_reduction_m",
                infrastructure_params.get("height_m", option.get("default_depth_reduction_m", 1.0)),
            )
        )
        # Conservative translation from structure height to effective depth reduction.
        adjusted_depth_m = max(0.0, base_depth_m - max(0.0, depth_reduction) * 0.65)
    else:
        vulnerability_reduction = float(
            infrastructure_params.get(
                "vulnerability_reduction",
                option.get("default_vulnerability_reduction", 0.15),
            )
        )
        vulnerability_reduction = max(0.0, min(0.5, vulnerability_reduction))
        adjusted_exposure = {
            key: value * (1.0 - vulnerability_reduction)
            for key, value in exposure_values_rupees.items()
        }

    with_infra = calculate_eal(adjusted_depth_m, adjusted_exposure)

    avoided_annual_loss_crore = max(
        0.0,
        float(without_infra["expected_annual_loss_crore"]) - float(with_infra["expected_annual_loss_crore"]),
    )

    infra_cost_crore = _calculate_infra_cost_crore(infrastructure_type, infrastructure_params, radius_km)
    benefit_cost_ratio = (avoided_annual_loss_crore * 20 / infra_cost_crore) if infra_cost_crore > 0 else float("inf")
    payback_years = (infra_cost_crore / avoided_annual_loss_crore) if avoided_annual_loss_crore > 0 else None

    fixed_annuity = infra_cost_crore / 20 if infra_cost_crore > 0 else 0.0
    performance_bonus = avoided_annual_loss_crore * 0.30

    return {
        "without_infrastructure": without_infra,
        "with_infrastructure": with_infra,
        "infrastructure": {
            "id": infrastructure_type,
            "name": option["name"],
            "adjusted_depth_m": round(adjusted_depth_m, 2),
        },
        "avoided_annual_loss_crore": round(avoided_annual_loss_crore, 2),
        "infrastructure_cost_crore": round(infra_cost_crore, 2),
        "benefit_cost_ratio": round(benefit_cost_ratio, 2) if math.isfinite(benefit_cost_ratio) else None,
        "payback_period_years": round(payback_years, 1) if payback_years is not None else None,
        "ppp_recommendation": {
            "fixed_annuity_crore": round(fixed_annuity, 2),
            "performance_bonus_crore": round(performance_bonus, 2),
            "total_annual_payment_crore": round(fixed_annuity + performance_bonus, 2),
        },
    }


def similarity_match(
    latitude: float,
    longitude: float,
    predicted_depth_m: float,
    rainfall_mm: float,
    top_k: int = 5,
) -> dict[str, Any]:
    """Return historical events with similarity scores."""
    matches: list[dict[str, Any]] = []

    for event in HISTORICAL_EVENTS:
        depth_score = 1.0 - min(1.0, abs(predicted_depth_m - event["flood_depth_m"]) / max(predicted_depth_m, 1.0))
        rain_score = 1.0 - min(1.0, abs(rainfall_mm - event["rainfall_mm"]) / max(rainfall_mm, 100.0))
        distance_km = _haversine_km(latitude, longitude, event["latitude"], event["longitude"])
        location_score = max(0.0, 1.0 - (distance_km / 1500.0))

        score = 0.50 * depth_score + 0.30 * rain_score + 0.20 * location_score

        matches.append(
            {
                "year": event["year"],
                "location": event["location"],
                "similarity_score": round(score, 2),
                "actual_damage_crore": event["actual_damage_crore"],
                "flood_depth_m": event["flood_depth_m"],
                "rainfall_mm": event["rainfall_mm"],
                "source": event["source"],
            }
        )

    matches.sort(key=lambda item: item["similarity_score"], reverse=True)

    return {
        "matched_events": matches[: max(1, min(top_k, 10))],
    }
