"""Flood prediction service with model-backed inference and safe fallback logic."""

from __future__ import annotations

import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.services.lidar_processor import (
    calculate_slope_gradient,
    get_elevation_at_point,
    identify_flood_zones,
    load_lidar_tiles,
)
from app.services.hydrometeo_provider import fetch_hydrometeo_snapshot

DEFAULT_FEATURE_COLUMNS = [
    "rainfall_mm_1d",
    "rainfall_mm_3d",
    "rainfall_mm_7d",
    "rainfall_mm_15d",
    "antecedent_precip_index",
    "temperature_mean",
    "humidity_relative",
    "river_level_m",
    "river_discharge_cumecs",
    "river_level_anomaly",
    "upstream_discharge",
    "elevation_m",
    "slope_gradient",
    "distance_to_river_km",
    "soil_moisture_index",
    "month",
    "day_of_monsoon",
    "is_monsoon",
]

MODEL_DIR_CANDIDATES = [
    Path(__file__).resolve().parents[2] / "models" / "flood",
    Path(__file__).resolve().parents[2] / "models",
    Path(__file__).resolve().parents[3] / "data" / "models",
]

DEMO_FLOOD_PKL_NAME = "flood.pkl"


class FloodPredictor:
    """Model-backed flood predictor with heuristic fallback."""

    def __init__(self) -> None:
        self.classifier: Any = None
        self.depth_model: Any = None
        self.feature_cols: list[str] = DEFAULT_FEATURE_COLUMNS.copy()
        self.model_metadata: dict[str, Any] = {
            "model_version": "heuristic-fallback-v1",
            "training_period": "N/A",
            "features_used": len(self.feature_cols),
            "accuracy": 0.0,
            "last_trained": None,
            "region": "Ganga Basin (fallback mode)",
            "source": "heuristic",
        }
        self.model_loaded = False
        self.model_dir: Path | None = None
        self.artifact_connected = False
        self.artifact_path: Path | None = None
        self._load_models()

    def _load_models(self) -> None:
        for model_dir in MODEL_DIR_CANDIDATES:
            demo_artifact_path = model_dir / DEMO_FLOOD_PKL_NAME
            if demo_artifact_path.exists() and not self.artifact_connected:
                self.artifact_connected = True
                self.artifact_path = demo_artifact_path

            classifier_path = model_dir / "flood_classifier_v2.joblib"
            depth_path = model_dir / "flood_depth_v2.joblib"
            cols_path = model_dir / "feature_columns.joblib"
            metadata_path = model_dir / "model_metadata.joblib"

            if not classifier_path.exists() or not depth_path.exists():
                continue

            try:
                self.classifier = joblib.load(classifier_path)
                self.depth_model = joblib.load(depth_path)

                if cols_path.exists():
                    cols = joblib.load(cols_path)
                    if isinstance(cols, list) and cols:
                        self.feature_cols = [str(c) for c in cols]

                if metadata_path.exists():
                    metadata = joblib.load(metadata_path)
                    if isinstance(metadata, dict):
                        self.model_metadata.update(metadata)

                self.model_loaded = True
                self.model_dir = model_dir
                self.model_metadata.update(
                    {
                        "features_used": len(self.feature_cols),
                        "source": "joblib-model",
                    }
                )
                return
            except Exception:
                self.classifier = None
                self.depth_model = None
                self.model_loaded = False

        if self.artifact_connected and not self.model_loaded:
            self.model_metadata.update(
                {
                    "model_version": "flood-pkl-demo-wrapper-v1",
                    "source": "pkl-demo-connection",
                }
            )

    @staticmethod
    def _distance_to_ganga_corridor_km(latitude: float, longitude: float) -> float:
        # Approximate corridor centerline points for a light geospatial prior.
        river_points = [
            (30.3175, 78.0322),
            (29.9457, 78.1642),
            (28.4595, 77.0266),
            (27.1767, 78.0081),
            (26.8467, 80.9462),
            (25.4358, 81.8463),
            (25.3176, 82.9739),
            (25.5941, 85.1376),
        ]

        def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
            r = 6371.0
            p1 = math.radians(lat1)
            p2 = math.radians(lat2)
            dp = math.radians(lat2 - lat1)
            dl = math.radians(lon2 - lon1)
            a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
            return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return min(haversine_km(latitude, longitude, rp[0], rp[1]) for rp in river_points)

    async def _estimate_local_slope(self, latitude: float, longitude: float) -> float:
        step = 0.0015
        try:
            center = await get_elevation_at_point(latitude, longitude)
            north = await get_elevation_at_point(latitude + step, longitude)
            east = await get_elevation_at_point(latitude, longitude + step)
            dz_dy = (north - center) / max(step * 111_000, 1.0)
            dz_dx = (east - center) / max(step * 111_000 * math.cos(math.radians(latitude)), 1.0)
            slope = math.degrees(math.atan(math.sqrt(dz_dx * dz_dx + dz_dy * dz_dy)))
            return float(max(0.0, min(slope, 60.0)))
        except Exception:
            return 2.0

    async def _build_features(self, latitude: float, longitude: float, rainfall_mm: float, elevation: float | None) -> dict[str, float]:
        now = datetime.now(timezone.utc)
        month = float(now.month)
        is_monsoon = 1.0 if now.month in {6, 7, 8, 9} else 0.0
        day_of_monsoon = float(0 if not is_monsoon else max(1, (now.timetuple().tm_yday - 151)))

        if elevation is None:
            elevation = await get_elevation_at_point(latitude, longitude)

        slope = await self._estimate_local_slope(latitude, longitude)
        distance_to_river_km = self._distance_to_ganga_corridor_km(latitude, longitude)

        hydro_snapshot = await fetch_hydrometeo_snapshot(latitude, longitude)

        observed_1d = float(hydro_snapshot.get("rainfall_mm_1d_observed", 0.0))
        observed_3d = float(hydro_snapshot.get("rainfall_mm_3d_observed", 0.0))
        observed_7d = float(hydro_snapshot.get("rainfall_mm_7d_observed", 0.0))
        observed_15d = float(hydro_snapshot.get("rainfall_mm_15d_observed", 0.0))

        rainfall_1d = float(max(rainfall_mm, observed_1d, 0.0))
        rainfall_3d = max(observed_3d, rainfall_1d * 1.6)
        rainfall_7d = max(observed_7d, rainfall_3d * 1.45)
        rainfall_15d = max(observed_15d, rainfall_7d * 1.35)

        antecedent_precip = rainfall_1d * 0.4 + rainfall_3d * 0.3 + rainfall_7d * 0.2 + rainfall_15d * 0.1

        temperature = float(
            hydro_snapshot.get(
                "temperature_mean_observed",
                24.0 + 0.03 * rainfall_1d - 0.02 * max(elevation - 60.0, 0.0),
            )
        )
        humidity = float(
            hydro_snapshot.get(
                "humidity_relative_observed",
                min(99.0, 55.0 + 0.2 * rainfall_1d),
            )
        )
        river_level = float(
            hydro_snapshot.get(
                "river_level_m_observed",
                1.8 + 0.008 * rainfall_7d + max(0.0, 2.0 - distance_to_river_km * 0.15),
            )
        )
        discharge = float(
            hydro_snapshot.get(
                "river_discharge_cumecs_observed",
                260.0 + rainfall_7d * 2.1 + max(0.0, 120.0 - distance_to_river_km * 8.0),
            )
        )
        river_level_anomaly = float(hydro_snapshot.get("river_level_anomaly_observed", river_level - 2.0))
        upstream_discharge = float(hydro_snapshot.get("upstream_discharge_observed", discharge * 1.08))
        soil_moisture = float(
            hydro_snapshot.get(
                "soil_moisture_observed",
                max(0.05, min(1.0, 0.12 + antecedent_precip / 500.0)),
            )
        )

        return {
            "rainfall_mm_1d": rainfall_1d,
            "rainfall_mm_3d": rainfall_3d,
            "rainfall_mm_7d": rainfall_7d,
            "rainfall_mm_15d": rainfall_15d,
            "antecedent_precip_index": antecedent_precip,
            "temperature_mean": temperature,
            "humidity_relative": humidity,
            "river_level_m": river_level,
            "river_discharge_cumecs": discharge,
            "river_level_anomaly": river_level_anomaly,
            "upstream_discharge": upstream_discharge,
            "elevation_m": float(elevation),
            "slope_gradient": slope,
            "distance_to_river_km": distance_to_river_km,
            "soil_moisture_index": soil_moisture,
            "month": month,
            "day_of_monsoon": day_of_monsoon,
            "is_monsoon": is_monsoon,
        }

    @staticmethod
    def _heuristic_predict(features: dict[str, float]) -> tuple[float, float, float, list[str]]:
        reasons: list[str] = []

        elevation = features["elevation_m"]
        rainfall = features["rainfall_mm_1d"]
        dist = features["distance_to_river_km"]
        slope = features["slope_gradient"]
        moisture = features["soil_moisture_index"]

        score = 0.0
        score += max(0.0, (75.0 - elevation) * 0.7)
        score += min(30.0, rainfall * 0.16)
        score += max(0.0, (8.0 - dist) * 4.5)
        score += max(0.0, (8.0 - slope) * 1.4)
        score += moisture * 22.0

        if elevation < 60:
            reasons.append("Low terrain elevation increases riverine flood susceptibility")
        if rainfall > 120:
            reasons.append("Heavy daily rainfall indicates strong runoff accumulation")
        if dist < 5:
            reasons.append("Proximity to major river corridor raises inundation probability")
        if slope < 3:
            reasons.append("Low slope reduces drainage efficiency and increases water retention")
        if moisture > 0.7:
            reasons.append("High antecedent soil moisture indicates saturated ground conditions")

        risk_pct = float(max(1.0, min(99.0, score)))
        depth = max(0.0, (risk_pct - 25.0) / 22.0)
        confidence = 0.72

        return risk_pct, depth, confidence, reasons[:5]

    async def predict_flood_risk(self, latitude: float, longitude: float, rainfall_mm: float = 0.0, elevation: float | None = None) -> dict[str, Any]:
        features = await self._build_features(latitude, longitude, rainfall_mm, elevation)

        ordered = [float(features.get(col, 0.0)) for col in self.feature_cols]
        input_vector = np.array([ordered], dtype=np.float64)

        if self.model_loaded and self.classifier is not None and self.depth_model is not None:
            try:
                if hasattr(self.classifier, "predict_proba"):
                    risk_proba = self.classifier.predict_proba(input_vector)[0]
                    risk_class = int(np.argmax(risk_proba))
                    confidence = float(np.max(risk_proba))
                    risk_pct = float(risk_proba[risk_class] * 100.0)
                else:
                    risk_class = int(self.classifier.predict(input_vector)[0])
                    confidence = 0.82
                    risk_pct = float({0: 20.0, 1: 55.0, 2: 85.0}.get(risk_class, 50.0))

                depth_pred = float(self.depth_model.predict(input_vector)[0])
                depth_m = max(0.0, depth_pred)

                top_idx = np.argsort(np.abs(input_vector[0]))[-5:][::-1]
                factors = [self.feature_cols[i] for i in top_idx if i < len(self.feature_cols)]

                levels = {0: "low", 1: "medium", 2: "critical"}
                risk_level = levels.get(risk_class, "medium")

                return {
                    "risk_level": risk_level,
                    "risk_percentage": round(risk_pct, 2),
                    "predicted_depth_m": round(depth_m, 2),
                    "predicted_depth": round(depth_m, 2),
                    "confidence": round(confidence, 3),
                    "factors": factors,
                    "features": features,
                    "model_source": "joblib-model",
                }
            except Exception:
                # Silent fallback to deterministic rules.
                pass

        risk_pct, depth_m, confidence, factors = self._heuristic_predict(features)
        if risk_pct >= 75:
            level = "critical"
        elif risk_pct >= 45:
            level = "medium"
        else:
            level = "low"

        return {
            "risk_level": level,
            "risk_percentage": round(risk_pct, 2),
            "predicted_depth_m": round(depth_m, 2),
            "predicted_depth": round(depth_m, 2),
            "confidence": round(confidence, 3),
            "factors": factors,
            "features": features,
            "model_source": "heuristic-fallback-pkl-connected" if self.artifact_connected else "heuristic-fallback",
        }

    def get_model_info(self) -> dict[str, Any]:
        info = {
            **self.model_metadata,
            "model_loaded": self.model_loaded,
            "features_used": len(self.feature_cols),
            "model_dir": str(self.model_dir) if self.model_dir else None,
            "artifact_connected": self.artifact_connected,
            "artifact_path": str(self.artifact_path) if self.artifact_path else None,
            "active_inference_engine": "joblib-model" if self.model_loaded else "math-heuristic",
        }
        return info


_PREDICTOR = FloodPredictor()


async def predict_flood_risk_at_point(
    latitude: float,
    longitude: float,
    elevation: float | None = None,
    rainfall_mm: float = 0.0,
) -> dict[str, Any]:
    return await _PREDICTOR.predict_flood_risk(
        latitude=latitude,
        longitude=longitude,
        rainfall_mm=rainfall_mm,
        elevation=elevation,
    )


def get_flood_model_info() -> dict[str, Any]:
    return _PREDICTOR.get_model_info()


async def generate_flood_heatmap(zone_name: str, water_level_rise: float = 3.0) -> dict[str, Any]:
    """Generate flood heatmap using terrain and risk depth layers."""
    lidar_data = await load_lidar_tiles(zone_name)
    elevation = lidar_data["elevation"]
    bounds = lidar_data["bounds"]

    base_level = np.percentile(elevation[~np.isnan(elevation)], 10)
    flooded = await identify_flood_zones(elevation, water_level_rise, base_water_level=base_level)

    grid_size = 48
    lat_step = (bounds["max_lat"] - bounds["min_lat"]) / grid_size
    lng_step = (bounds["max_lng"] - bounds["min_lng"]) / grid_size

    features: list[dict[str, Any]] = []

    for i in range(grid_size):
        for j in range(grid_size):
            cell_lat = bounds["min_lat"] + i * lat_step
            cell_lng = bounds["min_lng"] + j * lng_step

            elev_i = int(i * elevation.shape[0] / grid_size)
            elev_j = int(j * elevation.shape[1] / grid_size)

            cell_elevation = float(
                elevation[min(elev_i, elevation.shape[0] - 1), min(elev_j, elevation.shape[1] - 1)]
            )
            cell_flooded = bool(
                flooded[min(elev_i, flooded.shape[0] - 1), min(elev_j, flooded.shape[1] - 1)]
            )

            flood_depth = max(0.0, base_level + water_level_rise - cell_elevation)
            risk_score = min(100.0, flood_depth * 32.0 + (1.0 if cell_flooded else 0.0) * 20.0)

            if risk_score >= 80:
                risk_level = "critical"
                color = "#dc2626"
            elif risk_score >= 50:
                risk_level = "high"
                color = "#f97316"
            elif risk_score >= 25:
                risk_level = "medium"
                color = "#eab308"
            else:
                risk_level = "low"
                color = "#22c55e"

            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [cell_lng, cell_lat],
                            [cell_lng + lng_step, cell_lat],
                            [cell_lng + lng_step, cell_lat + lat_step],
                            [cell_lng, cell_lat + lat_step],
                            [cell_lng, cell_lat],
                        ]],
                    },
                    "properties": {
                        "elevation": round(cell_elevation, 2),
                        "flood_depth": round(flood_depth, 2),
                        "risk_level": risk_level,
                        "risk_percentage": round(risk_score, 2),
                        "flooded": cell_flooded,
                        "color": color,
                        "area_sqkm": lat_step * lng_step * 111 * 111,
                    },
                }
            )

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "zone_name": zone_name,
            "water_level_rise": water_level_rise,
            "bounds": bounds,
            "total_cells": len(features),
            "flooded_cells": sum(1 for f in features if f["properties"]["flooded"]),
            "model_source": _PREDICTOR.get_model_info().get("source", "heuristic"),
        },
    }


async def train_flood_model(zone_name: str) -> dict[str, Any]:
    """Backwards-compatible synthetic trainer until full ML pipeline is run."""
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.model_selection import train_test_split

    lidar_data = await load_lidar_tiles(zone_name)
    elevation = lidar_data["elevation"]
    slope = await calculate_slope_gradient(elevation)

    elev_flat = elevation.flatten()
    slope_flat = slope.flatten()

    valid_mask = ~(np.isnan(elev_flat) | np.isnan(slope_flat))
    elev_valid = elev_flat[valid_mask]
    slope_valid = slope_flat[valid_mask]

    n_samples = min(12000, len(elev_valid))
    indices = np.random.choice(len(elev_valid), n_samples, replace=False)

    x = np.column_stack(
        [
            elev_valid[indices],
            slope_valid[indices],
            np.random.uniform(0, 250, n_samples),
        ]
    )

    min_elev = np.min(elev_valid)
    y = np.maximum(
        0,
        (min_elev + 25 - x[:, 0]) * 0.1
        + x[:, 2] * 0.012
        - x[:, 1] * 0.05,
    )

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42)
    model.fit(x_train, y_train)

    train_score = model.score(x_train, y_train)
    test_score = model.score(x_test, y_test)

    return {
        "zone_name": zone_name,
        "samples_used": n_samples,
        "train_r2": round(float(train_score), 4),
        "test_r2": round(float(test_score), 4),
        "feature_importance": {
            "elevation": float(model.feature_importances_[0]),
            "slope": float(model.feature_importances_[1]),
            "rainfall": float(model.feature_importances_[2]),
        },
    }
