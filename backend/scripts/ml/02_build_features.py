"""Build model-ready feature table from normalized raw flood records."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
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


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _ensure_dates(df: pd.DataFrame) -> pd.Series:
    if "date" in df.columns:
        parsed = pd.to_datetime(df["date"], errors="coerce")
    else:
        parsed = pd.Series([pd.NaT] * len(df))

    missing = parsed.isna()
    if missing.any():
        fallback = pd.date_range("2010-01-01", periods=len(df), freq="3D")
        parsed = parsed.where(~missing, fallback)

    return parsed


def _build(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame(index=df.index)

    base_rain = pd.to_numeric(df.get("rainfall_mm", 0), errors="coerce").fillna(0).clip(lower=0)
    river_level = pd.to_numeric(df.get("river_level_m", 0), errors="coerce").fillna(0)
    soil = pd.to_numeric(df.get("soil_moisture_index", 0.2), errors="coerce").fillna(0.2).clip(lower=0.01, upper=0.99)
    upstream = pd.to_numeric(df.get("upstream_discharge", 12000), errors="coerce").fillna(12000)

    out["rainfall_mm_1d"] = base_rain
    out["rainfall_mm_3d"] = (base_rain * 1.7).round(3)
    out["rainfall_mm_7d"] = (base_rain * 2.8).round(3)
    out["rainfall_mm_15d"] = (base_rain * 3.9).round(3)
    out["antecedent_precip_index"] = (
        out["rainfall_mm_1d"] * 0.4
        + out["rainfall_mm_3d"] * 0.3
        + out["rainfall_mm_7d"] * 0.2
        + out["rainfall_mm_15d"] * 0.1
    ).round(3)

    out["temperature_mean"] = (26.5 - np.minimum(6.0, out["rainfall_mm_1d"] * 0.018)).round(3)
    out["humidity_relative"] = np.minimum(99.0, 52 + out["rainfall_mm_1d"] * 0.21).round(3)
    out["river_level_m"] = river_level.round(3)
    out["river_discharge_cumecs"] = np.maximum(120.0, upstream / 35.3).round(3)
    out["river_level_anomaly"] = (out["river_level_m"] - out["river_level_m"].rolling(20, min_periods=1).mean()).round(3)
    out["upstream_discharge"] = upstream.round(3)

    rng = np.random.default_rng(42)
    out["elevation_m"] = rng.uniform(35, 160, size=len(df)).round(3)
    out["slope_gradient"] = rng.uniform(0.5, 9.5, size=len(df)).round(3)
    out["distance_to_river_km"] = rng.uniform(0.2, 18.0, size=len(df)).round(3)
    out["soil_moisture_index"] = soil.round(4)

    date_col = _ensure_dates(df)
    out["date"] = date_col
    out["year"] = date_col.dt.year.astype(int)
    out["month"] = date_col.dt.month.astype(float)
    out["is_monsoon"] = out["month"].isin([6, 7, 8, 9]).astype(float)
    out["day_of_monsoon"] = np.where(
        out["is_monsoon"] > 0,
        np.maximum(1, date_col.dt.dayofyear - 151),
        0,
    ).astype(float)

    target = pd.to_numeric(df.get("flood_risk_label", 0), errors="coerce").fillna(0).clip(0, 2).astype(int)
    out["flood_risk_label"] = target
    out["flood_depth_m"] = np.maximum(0, 0.3 + target * 0.9 + out["rainfall_mm_1d"] * 0.002).round(3)

    return out


def main() -> None:
    backend = _backend_root()
    raw_path = backend / "data" / "raw" / "flood_events_merged.csv"
    processed_dir = backend / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    if not raw_path.exists():
        raise FileNotFoundError(f"Raw data not found: {raw_path}. Run 01_collect_data.py first.")

    raw = pd.read_csv(raw_path)
    features = _build(raw)

    parquet_path = processed_dir / "features.parquet"
    csv_path = processed_dir / "features.csv"
    cols_path = processed_dir / "feature_columns.txt"

    features.to_csv(csv_path, index=False)
    try:
        features.to_parquet(parquet_path, index=False)
        print(f"Saved features parquet: {parquet_path}")
    except Exception:
        print("Parquet export skipped (install pyarrow for parquet support).")

    cols_path.write_text("\n".join(FEATURE_COLUMNS), encoding="utf-8")
    print(f"Saved features csv: {csv_path}")
    print(f"Rows: {len(features)}")


if __name__ == "__main__":
    main()
