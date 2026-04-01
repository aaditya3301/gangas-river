"""Evaluate exported flood models on the latest holdout split."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, f1_score, mean_absolute_error, mean_squared_error, r2_score


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _load_features(processed_dir: Path) -> pd.DataFrame:
    parquet_path = processed_dir / "features.parquet"
    csv_path = processed_dir / "features.csv"
    if parquet_path.exists():
        try:
            return pd.read_parquet(parquet_path)
        except Exception:
            pass
    return pd.read_csv(csv_path)


def main() -> None:
    backend = _backend_root()
    processed_dir = backend / "data" / "processed"
    model_dir = backend / "models"
    report_dir = backend / "data" / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)

    df = _load_features(processed_dir)

    classifier = joblib.load(model_dir / "flood_classifier_v2.joblib")
    depth_model = joblib.load(model_dir / "flood_depth_v2.joblib")
    feature_columns = joblib.load(model_dir / "feature_columns.joblib")

    if "year" in df.columns:
        test_year = int(df["year"].max())
        test = df[df["year"] == test_year]
        if test.empty:
            test = df.tail(max(1, int(len(df) * 0.2)))
    else:
        test = df.tail(max(1, int(len(df) * 0.2)))

    x_test = test[feature_columns]
    y_test_class = test["flood_risk_label"].astype(int)
    y_test_depth = test["flood_depth_m"].astype(float)

    pred_class = classifier.predict(x_test)
    pred_depth = depth_model.predict(x_test)

    summary = {
        "rows_tested": int(len(test)),
        "accuracy": float(accuracy_score(y_test_class, pred_class)),
        "f1_macro": float(f1_score(y_test_class, pred_class, average="macro", zero_division=0)),
        "depth_mae": float(mean_absolute_error(y_test_depth, pred_depth)),
        "depth_rmse": float(np.sqrt(mean_squared_error(y_test_depth, pred_depth))),
        "depth_r2": float(r2_score(y_test_depth, pred_depth)),
        "classification_report": classification_report(y_test_class, pred_class, output_dict=True, zero_division=0),
    }

    json_path = report_dir / "flood_model_eval.json"
    md_path = report_dir / "flood_model_eval.md"

    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    md_path.write_text(
        "\n".join(
            [
                "# Flood Model Evaluation",
                f"- Rows tested: {summary['rows_tested']}",
                f"- Accuracy: {summary['accuracy']:.4f}",
                f"- F1 Macro: {summary['f1_macro']:.4f}",
                f"- Depth MAE: {summary['depth_mae']:.4f}",
                f"- Depth RMSE: {summary['depth_rmse']:.4f}",
                f"- Depth R2: {summary['depth_r2']:.4f}",
            ]
        ),
        encoding="utf-8",
    )

    print(f"Saved evaluation report: {json_path}")
    print(f"Saved evaluation markdown: {md_path}")


if __name__ == "__main__":
    main()
