"""Live hydro-meteo data provider for flood feature engineering.

This service fetches weather and river-flow indicators from Open-Meteo APIs.
If upstream services are unavailable, callers should fall back to deterministic proxies.
"""

from __future__ import annotations

import asyncio
from statistics import mean
from typing import Any

import httpx

from app.core.config import settings


def _to_float_list(values: Any) -> list[float]:
    if not isinstance(values, list):
        return []
    result: list[float] = []
    for value in values:
        try:
            result.append(float(value))
        except (TypeError, ValueError):
            continue
    return result


def _tail_sum(values: list[float], count: int) -> float:
    if not values:
        return 0.0
    return float(sum(values[-count:]))


def _tail_mean(values: list[float], count: int) -> float:
    if not values:
        return 0.0
    sample = values[-count:] if len(values) >= count else values
    return float(mean(sample)) if sample else 0.0


def _last_value(values: list[float], fallback: float = 0.0) -> float:
    if not values:
        return fallback
    return float(values[-1])


class HydroMeteoProvider:
    """Fetch rainfall, weather, and river discharge indicators for a location."""

    async def fetch_snapshot(self, latitude: float, longitude: float) -> dict[str, float | str]:
        if not settings.HYDROMETEO_PROVIDER_ENABLED:
            return {}

        weather_task = self._fetch_weather(latitude, longitude)
        river_task = self._fetch_river_flow(latitude, longitude)
        weather_result, river_result = await asyncio.gather(
            weather_task,
            river_task,
            return_exceptions=True,
        )

        snapshot: dict[str, float | str] = {}
        if isinstance(weather_result, dict):
            snapshot.update(weather_result)
        if isinstance(river_result, dict):
            snapshot.update(river_result)

        return snapshot

    async def _fetch_weather(self, latitude: float, longitude: float) -> dict[str, float | str]:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": "precipitation,temperature_2m,relative_humidity_2m,soil_moisture_0_to_7cm",
            "past_days": 16,
            "forecast_days": 1,
            "timezone": "UTC",
        }

        timeout = httpx.Timeout(settings.HYDROMETEO_TIMEOUT_SECONDS)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(settings.OPEN_METEO_WEATHER_URL, params=params)
            response.raise_for_status()
            payload = response.json()

        hourly = payload.get("hourly", {}) if isinstance(payload, dict) else {}
        precipitation = _to_float_list(hourly.get("precipitation"))
        temperature = _to_float_list(hourly.get("temperature_2m"))
        humidity = _to_float_list(hourly.get("relative_humidity_2m"))
        soil_moisture = _to_float_list(hourly.get("soil_moisture_0_to_7cm"))

        rainfall_1d = _tail_sum(precipitation, 24)
        rainfall_3d = _tail_sum(precipitation, 72)
        rainfall_7d = _tail_sum(precipitation, 24 * 7)
        rainfall_15d = _tail_sum(precipitation, 24 * 15)

        moisture = _last_value(soil_moisture, fallback=0.25)
        if moisture > 1.0:
            moisture = moisture / 100.0

        return {
            "rainfall_mm_1d_observed": max(0.0, rainfall_1d),
            "rainfall_mm_3d_observed": max(0.0, rainfall_3d),
            "rainfall_mm_7d_observed": max(0.0, rainfall_7d),
            "rainfall_mm_15d_observed": max(0.0, rainfall_15d),
            "temperature_mean_observed": _tail_mean(temperature, 24),
            "humidity_relative_observed": _tail_mean(humidity, 24),
            "soil_moisture_observed": max(0.0, min(1.0, moisture)),
            "weather_source": "open-meteo",
        }

    async def _fetch_river_flow(self, latitude: float, longitude: float) -> dict[str, float | str]:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "river_discharge_mean,river_discharge_max",
            "past_days": 14,
            "forecast_days": 1,
            "timezone": "UTC",
        }

        timeout = httpx.Timeout(settings.HYDROMETEO_TIMEOUT_SECONDS)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(settings.OPEN_METEO_FLOOD_URL, params=params)
            response.raise_for_status()
            payload = response.json()

        daily = payload.get("daily", {}) if isinstance(payload, dict) else {}
        discharge_mean = _to_float_list(daily.get("river_discharge_mean"))
        discharge_max = _to_float_list(daily.get("river_discharge_max"))

        if not discharge_mean and not discharge_max:
            return {}

        current_discharge = _last_value(discharge_mean, fallback=_last_value(discharge_max, fallback=220.0))
        current_max = _last_value(discharge_max, fallback=current_discharge * 1.08)

        history = discharge_mean[:-1] if len(discharge_mean) > 1 else discharge_mean
        baseline = float(mean(history)) if history else current_discharge
        anomaly = current_discharge - baseline

        # Lightweight conversion to water level proxy for model compatibility.
        river_level = max(0.4, min(12.0, 0.9 + current_discharge / 280.0))

        return {
            "river_discharge_cumecs_observed": current_discharge,
            "upstream_discharge_observed": current_max,
            "river_level_m_observed": river_level,
            "river_level_anomaly_observed": anomaly / 280.0,
            "hydrology_source": "open-meteo-flood",
        }


_PROVIDER = HydroMeteoProvider()


async def fetch_hydrometeo_snapshot(latitude: float, longitude: float) -> dict[str, float | str]:
    """Fetch live weather and hydrology indicators for feature building."""
    return await _PROVIDER.fetch_snapshot(latitude=latitude, longitude=longitude)
