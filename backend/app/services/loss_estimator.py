"""Economic loss estimation service for PPP flood risk analysis."""

from __future__ import annotations

import math
import random
from typing import Any

SCENARIOS = [
    {"name": "frequent", "return_period": 5, "probability": 0.20, "depth_multiplier": 0.5},
    {"name": "moderate", "return_period": 25, "probability": 0.04, "depth_multiplier": 1.0},
    {"name": "severe", "return_period": 50, "probability": 0.02, "depth_multiplier": 1.5},
    {"name": "extreme", "return_period": 100, "probability": 0.01, "depth_multiplier": 2.0},
]

DAMAGE_CURVES: dict[str, dict[float, float]] = {
    "residential_pucca": {
        0.0: 0.00,
        0.5: 0.15,
        1.0: 0.30,
        1.5: 0.45,
        2.0: 0.55,
        3.0: 0.70,
        4.0: 0.80,
        5.0: 0.90,
        6.0: 1.00,
    },
    "residential_kutcha": {
        0.0: 0.00,
        0.5: 0.30,
        1.0: 0.55,
        1.5: 0.70,
        2.0: 0.85,
        3.0: 0.95,
        4.0: 1.00,
    },
    "commercial": {
        0.0: 0.00,
        0.5: 0.15,
        1.0: 0.35,
        1.5: 0.50,
        2.0: 0.60,
        3.0: 0.75,
        4.0: 0.85,
        5.0: 0.95,
    },
    "agriculture": {
        0.0: 0.00,
        0.3: 0.20,
        0.5: 0.40,
        1.0: 0.65,
        1.5: 0.80,
        2.0: 0.90,
        3.0: 1.00,
    },
    "roads": {
        0.0: 0.00,
        0.5: 0.05,
        1.0: 0.15,
        2.0: 0.30,
        3.0: 0.50,
        5.0: 0.70,
    },
    "infrastructure": {
        0.0: 0.00,
        0.5: 0.10,
        1.0: 0.25,
        2.0: 0.45,
        3.0: 0.60,
        5.0: 0.80,
    },
}


def _crore_to_rupees(value_crore: float) -> float:
    return value_crore * 1e7


def _rupees_to_crore(value_rupees: float) -> float:
    return value_rupees / 1e7


def build_region_label(latitude: float, longitude: float, radius_km: float) -> str:
    return f"Region around ({latitude:.4f}, {longitude:.4f}) within {radius_km:.1f} km"


def get_damage_fraction(depth_m: float, asset_type: str) -> float:
    """Interpolate damage fraction from a depth-damage curve."""
    curve = DAMAGE_CURVES.get(asset_type)
    if not curve:
        return 0.0

    depths = sorted(curve.keys())
    if depth_m <= depths[0]:
        return 0.0
    if depth_m >= depths[-1]:
        return float(curve[depths[-1]])

    for idx in range(len(depths) - 1):
        d0, d1 = depths[idx], depths[idx + 1]
        if d0 <= depth_m <= d1:
            f0, f1 = curve[d0], curve[d1]
            return float(f0 + (f1 - f0) * (depth_m - d0) / (d1 - d0))

    return 0.0


def estimate_exposure_profile(latitude: float, longitude: float, radius_km: float) -> dict[str, Any]:
    """Create a deterministic exposure profile for a selected region.

    This acts as a practical baseline where fine-grained asset inventories
    are not yet available in the repository.
    """
    area_sqkm = math.pi * max(radius_km, 1.0) ** 2
    rng = random.Random(f"{latitude:.4f}:{longitude:.4f}:{radius_km:.2f}")

    # Higher values for larger search radii and denser/urbanized corridors.
    urban_factor = max(0.35, min(0.9, 0.56 + (latitude - 24.0) * 0.04 - abs(longitude - 82.0) * 0.01))
    base_asset_crore = area_sqkm * (20 + 32 * urban_factor) * (0.85 + rng.random() * 0.3)

    shares = {
        "residential_pucca": 0.34,
        "residential_kutcha": 0.13,
        "commercial": 0.16,
        "agriculture": 0.21,
        "roads": 0.09,
        "infrastructure": 0.07,
    }

    exposure_values_rupees = {
        f"{asset}_value": _crore_to_rupees(base_asset_crore * share)
        for asset, share in shares.items()
    }

    summary = {
        "area_sqkm": round(area_sqkm, 2),
        "total_asset_value_crore": round(base_asset_crore, 2),
        "total_residential_value_crore": round(base_asset_crore * (shares["residential_pucca"] + shares["residential_kutcha"]), 2),
        "total_agriculture_value_crore": round(base_asset_crore * shares["agriculture"], 2),
        "total_infrastructure_value_crore": round(base_asset_crore * (shares["roads"] + shares["infrastructure"]), 2),
    }

    return {
        "region": build_region_label(latitude, longitude, radius_km),
        "exposure_values_rupees": exposure_values_rupees,
        "exposure_summary": summary,
    }


def calculate_eal(base_flood_depth_m: float, exposure_values_rupees: dict[str, float]) -> dict[str, Any]:
    """Calculate expected annual loss using scenario-based analysis."""
    eal_rupees = 0.0
    scenario_breakdown: list[dict[str, Any]] = []

    for scenario in SCENARIOS:
        depth = max(0.0, base_flood_depth_m * float(scenario["depth_multiplier"]))
        total_loss_rupees = 0.0

        for asset_key, asset_value_rupees in exposure_values_rupees.items():
            if not asset_key.endswith("_value"):
                continue
            asset_type = asset_key.replace("_value", "")
            damage_fraction = get_damage_fraction(depth, asset_type)
            total_loss_rupees += max(0.0, asset_value_rupees) * damage_fraction

        expected_loss_rupees = float(scenario["probability"]) * total_loss_rupees
        eal_rupees += expected_loss_rupees

        scenario_breakdown.append(
            {
                "scenario": scenario["name"],
                "return_period": scenario["return_period"],
                "probability": scenario["probability"],
                "flood_depth_m": round(depth, 2),
                "total_loss_crore": round(_rupees_to_crore(total_loss_rupees), 2),
                "expected_loss_crore": round(_rupees_to_crore(expected_loss_rupees), 2),
            }
        )

    eal_crore = _rupees_to_crore(eal_rupees)
    return {
        "expected_annual_loss_crore": round(eal_crore, 2),
        "scenario_breakdown": scenario_breakdown,
        "confidence_interval": {
            "low": round(eal_crore * 0.7, 2),
            "high": round(eal_crore * 1.3, 2),
        },
    }
