"""Collect and normalize seed data for flood model training."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _load_seed_dataset(seed_path: Path) -> pd.DataFrame:
    if not seed_path.exists():
        return pd.DataFrame()

    df = pd.read_csv(seed_path)
    rename_map = {
        "soil_moisture_idx": "soil_moisture_index",
        "upstream_discharge_cusecs": "upstream_discharge",
    }
    df = df.rename(columns=rename_map)

    for col in ["rainfall_mm", "river_level_m", "soil_moisture_index", "upstream_discharge", "flood_risk_label"]:
        if col not in df.columns:
            df[col] = 0

    return df[["rainfall_mm", "river_level_m", "soil_moisture_index", "upstream_discharge", "flood_risk_label"]]


def _generate_synthetic_rows(n_rows: int = 1500, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    rainfall = rng.gamma(shape=2.2, scale=45.0, size=n_rows)
    river = 6.8 + rainfall * 0.025 + rng.normal(0, 0.7, n_rows)
    soil = np.clip(0.18 + rainfall / 450.0 + rng.normal(0, 0.05, n_rows), 0.05, 0.99)
    upstream = np.clip(9000 + rainfall * 130 + rng.normal(0, 2500, n_rows), 4000, None)

    risk = np.zeros(n_rows, dtype=int)
    risk[(rainfall > 120) | (river > 10.5)] = 1
    risk[(rainfall > 220) | (river > 12.6)] = 2

    return pd.DataFrame(
        {
            "rainfall_mm": rainfall.round(2),
            "river_level_m": river.round(2),
            "soil_moisture_index": soil.round(4),
            "upstream_discharge": upstream.round(2),
            "flood_risk_label": risk,
        }
    )


def main() -> None:
    repo = _repo_root()
    backend = _backend_root()

    seed_path = repo / "docs" / "Old_Docs" / "historical_flood_data.csv"
    raw_output = backend / "data" / "raw" / "flood_events_merged.csv"
    raw_output.parent.mkdir(parents=True, exist_ok=True)

    seed_df = _load_seed_dataset(seed_path)
    synthetic_df = _generate_synthetic_rows()

    if seed_df.empty:
        merged = synthetic_df
    else:
        merged = pd.concat([seed_df, synthetic_df], ignore_index=True)

    merged.to_csv(raw_output, index=False)
    print(f"Saved merged training seed data: {raw_output}")
    print(f"Rows: {len(merged)}")


if __name__ == "__main__":
    main()
