# Flood Model Pipeline

This folder contains the end-to-end training pipeline for Feature 1 (flood prediction).

## Run Order

1. `python scripts/ml/01_collect_data.py`
2. `python scripts/ml/02_build_features.py`
3. `python scripts/ml/03_train_model.py`
4. `python scripts/ml/04_evaluate.py`
5. `python scripts/ml/05_export_model.py`

## Artifacts

Training writes to:
- `backend/models/flood_classifier_v2.joblib`
- `backend/models/flood_depth_v2.joblib`
- `backend/models/feature_columns.joblib`
- `backend/models/model_metadata.joblib`

Runtime fallback copy (for containers or alternate mount):
- `backend/data/models/*`

## Notes

- `03_train_model.py` uses LightGBM if installed, otherwise falls back to scikit-learn RandomForest.
- Model feature order must match `feature_columns.joblib` exactly.
