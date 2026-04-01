"""Train classifier + depth regressor and export model artifacts."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, mean_squared_error, r2_score

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


def _load_features(path_parquet: Path, path_csv: Path) -> pd.DataFrame:
    if path_parquet.exists():
        try:
            return pd.read_parquet(path_parquet)
        except Exception:
            pass
    if not path_csv.exists():
        raise FileNotFoundError("No processed features found. Run 02_build_features.py first.")
    return pd.read_csv(path_csv)


def _split(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    if "year" not in df.columns:
        n = len(df)
        train_end = int(n * 0.7)
        val_end = int(n * 0.85)
        return df.iloc[:train_end], df.iloc[train_end:val_end], df.iloc[val_end:]

    years = sorted(df["year"].dropna().astype(int).unique().tolist())
    if len(years) < 3:
        n = len(df)
        train_end = int(n * 0.7)
        val_end = int(n * 0.85)
        return df.iloc[:train_end], df.iloc[train_end:val_end], df.iloc[val_end:]

    train_years = years[:-2]
    val_year = years[-2]
    test_year = years[-1]

    train = df[df["year"].isin(train_years)]
    val = df[df["year"] == val_year]
    test = df[df["year"] == test_year]

    if train.empty or val.empty or test.empty:
        n = len(df)
        train_end = int(n * 0.7)
        val_end = int(n * 0.85)
        return df.iloc[:train_end], df.iloc[train_end:val_end], df.iloc[val_end:]

    return train, val, test


def _fit_lightgbm_if_available(x_train: pd.DataFrame, y_train: pd.Series):
    try:
        import lightgbm as lgb  # type: ignore
    except Exception:
        return None, None

    clf = lgb.LGBMClassifier(
        objective="multiclass",
        num_class=3,
        n_estimators=700,
        max_depth=8,
        learning_rate=0.045,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_samples=30,
        reg_alpha=0.01,
        reg_lambda=0.1,
        random_state=42,
        verbosity=-1,
    )
    clf.fit(x_train, y_train)

    reg = lgb.LGBMRegressor(
        n_estimators=800,
        max_depth=8,
        learning_rate=0.04,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=-1,
    )

    return clf, reg


def main() -> None:
    backend = _backend_root()
    processed_dir = backend / "data" / "processed"
    model_dir = backend / "models"
    model_dir.mkdir(parents=True, exist_ok=True)

    df = _load_features(processed_dir / "features.parquet", processed_dir / "features.csv")
    for col in FEATURE_COLUMNS + ["flood_risk_label", "flood_depth_m"]:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    train, val, test = _split(df)

    x_train = train[FEATURE_COLUMNS]
    x_val = val[FEATURE_COLUMNS]
    x_test = test[FEATURE_COLUMNS]

    y_train_class = train["flood_risk_label"].astype(int)
    y_val_class = val["flood_risk_label"].astype(int)
    y_test_class = test["flood_risk_label"].astype(int)

    y_train_depth = train["flood_depth_m"].astype(float)
    y_val_depth = val["flood_depth_m"].astype(float)
    y_test_depth = test["flood_depth_m"].astype(float)

    classifier, depth_model = _fit_lightgbm_if_available(x_train, y_train_class)
    model_family = "lightgbm"

    if classifier is None or depth_model is None:
        model_family = "random-forest-fallback"
        classifier = RandomForestClassifier(
            n_estimators=500,
            max_depth=12,
            min_samples_leaf=4,
            random_state=42,
        )
        depth_model = RandomForestRegressor(
            n_estimators=450,
            max_depth=12,
            min_samples_leaf=4,
            random_state=42,
        )

    classifier.fit(x_train, y_train_class)
    depth_model.fit(x_train, y_train_depth)

    val_pred_class = classifier.predict(x_val)
    test_pred_class = classifier.predict(x_test)

    val_pred_depth = depth_model.predict(x_val)
    test_pred_depth = depth_model.predict(x_test)

    accuracy = float(accuracy_score(y_val_class, val_pred_class))
    f1_macro = float(f1_score(y_val_class, val_pred_class, average="macro", zero_division=0))

    val_mae = float(mean_absolute_error(y_val_depth, val_pred_depth))
    val_rmse = float(np.sqrt(mean_squared_error(y_val_depth, val_pred_depth)))
    val_r2 = float(r2_score(y_val_depth, val_pred_depth))

    test_accuracy = float(accuracy_score(y_test_class, test_pred_class))
    test_f1_macro = float(f1_score(y_test_class, test_pred_class, average="macro", zero_division=0))
    test_mae = float(mean_absolute_error(y_test_depth, test_pred_depth))
    test_rmse = float(np.sqrt(mean_squared_error(y_test_depth, test_pred_depth)))
    test_r2 = float(r2_score(y_test_depth, test_pred_depth))

    classifier_path = model_dir / "flood_classifier_v2.joblib"
    depth_path = model_dir / "flood_depth_v2.joblib"
    cols_path = model_dir / "feature_columns.joblib"
    meta_path = model_dir / "model_metadata.joblib"

    metadata = {
        "model_version": "v2.0",
        "training_period": f"{int(train['year'].min()) if 'year' in train else 'N/A'}-{int(test['year'].max()) if 'year' in test else 'N/A'}",
        "features_used": len(FEATURE_COLUMNS),
        "accuracy": round(accuracy, 4),
        "f1_macro": round(f1_macro, 4),
        "depth_mae": round(val_mae, 4),
        "depth_rmse": round(val_rmse, 4),
        "depth_r2": round(val_r2, 4),
        "test_accuracy": round(test_accuracy, 4),
        "test_f1_macro": round(test_f1_macro, 4),
        "test_depth_mae": round(test_mae, 4),
        "test_depth_rmse": round(test_rmse, 4),
        "test_depth_r2": round(test_r2, 4),
        "last_trained": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "region": "Ganga Basin (UP, Bihar, Uttarakhand)",
        "source": model_family,
    }

    joblib.dump(classifier, classifier_path)
    joblib.dump(depth_model, depth_path)
    joblib.dump(FEATURE_COLUMNS, cols_path)
    joblib.dump(metadata, meta_path)

    print(f"Model family: {model_family}")
    print(f"Validation accuracy: {accuracy:.4f}")
    print(f"Validation F1 macro: {f1_macro:.4f}")
    print(f"Saved classifier: {classifier_path}")
    print(f"Saved depth model: {depth_path}")


if __name__ == "__main__":
    main()
