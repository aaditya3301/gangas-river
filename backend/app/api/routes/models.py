"""
Researcher model lab routes.

Provides a curated model registry and test inference endpoint.
"""
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.flood_predictor import predict_flood_risk_at_point

router = APIRouter()

MODEL_REGISTRY = [
    {
        "id": "lightgbm-classifier",
        "name": "LightGBM Classifier",
        "category": "tree_based",
        "status": "active",
        "task": "Multi-class classification (Safe / Warning / Critical)",
        "description": "Histogram-based gradient boosted trees for production flood risk classification.",
        "architecture": {
            "type": "Gradient Boosted Decision Trees",
            "library": "lightgbm",
            "learning_method": "Histogram-based",
            "typical_params": {
                "n_estimators": "500-2000",
                "max_depth": "5-12",
                "learning_rate": "0.01-0.1",
                "subsample": "0.6-0.9",
                "num_leaves": "31-127",
            },
        },
        "input_features": [
            "rainfall_1d_mm",
            "rainfall_3d_mm",
            "rainfall_7d_mm",
            "rainfall_15d_mm",
            "rainfall_anomaly",
            "antecedent_precip_index",
            "river_level_m",
            "river_discharge_cumecs",
            "river_level_anomaly",
            "elevation_m",
            "slope_gradient",
            "distance_to_river_km",
            "topographic_wetness_index",
            "soil_moisture_index",
            "month",
            "is_monsoon",
        ],
        "output": "risk label + class probabilities",
        "strengths": [
            "Strong tabular performance",
            "Fast training and inference",
            "Handles missing values",
            "Feature importance friendly",
        ],
        "weaknesses": [
            "Not sequence-aware",
            "Needs feature engineering",
        ],
        "best_for": "Production flood risk classification.",
        "training_data": "IFI-Impacts + IMD + CWC + DEM features",
        "expected_metrics": {
            "accuracy": "82-88%",
            "f1_macro": "0.78-0.85",
            "training_time": "~30s on CPU (50K samples)",
        },
        "paper_reference": "Ke et al. (2017) LightGBM.",
    },
    {
        "id": "xgboost-classifier",
        "name": "XGBoost Classifier",
        "category": "tree_based",
        "status": "available",
        "task": "Multi-class classification (Safe / Warning / Critical)",
        "description": "Well-established gradient boosting baseline with mature tooling.",
        "architecture": {
            "type": "Gradient Boosted Decision Trees",
            "library": "xgboost",
            "learning_method": "Exact/Approx greedy split finding",
            "typical_params": {
                "n_estimators": "500-3000",
                "max_depth": "4-10",
                "learning_rate": "0.01-0.1",
                "subsample": "0.6-0.9",
                "colsample_bytree": "0.6-0.9",
            },
        },
        "input_features": "Same as LightGBM",
        "output": "risk label + class probabilities",
        "strengths": [
            "Battle-tested baseline",
            "Strong regularization support",
            "GPU training option",
        ],
        "weaknesses": [
            "Usually slower than LightGBM",
            "Higher memory usage",
        ],
        "best_for": "Baseline comparison against LightGBM.",
        "expected_metrics": {
            "accuracy": "80-87%",
            "f1_macro": "0.76-0.84",
            "training_time": "~60s on CPU (50K samples)",
        },
        "paper_reference": "Chen and Guestrin (2016) XGBoost.",
    },
    {
        "id": "random-forest",
        "name": "Random Forest Classifier",
        "category": "tree_based",
        "status": "available",
        "task": "Multi-class classification",
        "description": "Robust bagging baseline with low tuning overhead.",
        "architecture": {
            "type": "Bagging Ensemble",
            "library": "scikit-learn",
            "typical_params": {
                "n_estimators": "100-500",
                "max_depth": "10-30",
                "min_samples_leaf": "5-20",
            },
        },
        "input_features": "Same as LightGBM",
        "output": "risk label + class probabilities",
        "strengths": [
            "Stable baseline",
            "Difficult to overfit",
            "Parallel training",
        ],
        "weaknesses": [
            "Usually lower accuracy than boosted trees",
            "Large model files",
        ],
        "best_for": "Feature sanity-check baseline.",
        "expected_metrics": {
            "accuracy": "78-84%",
            "f1_macro": "0.73-0.80",
            "training_time": "~15s on CPU (50K samples)",
        },
        "paper_reference": "Breiman (2001) Random Forests.",
    },
    {
        "id": "lstm",
        "name": "LSTM",
        "category": "deep_learning",
        "status": "experimental",
        "task": "River level forecasting (1-7 day horizon)",
        "description": "Sequence model for temporal dependencies in hydro-meteorological time series.",
        "architecture": {
            "type": "Recurrent Neural Network",
            "library": "PyTorch",
            "typical_params": {
                "hidden_size": "64-256",
                "num_layers": "2-3",
                "dropout": "0.2-0.4",
                "sequence_length": "30 days",
                "forecast_horizon": "1-7 days",
            },
        },
        "input_features": "Time-series windows of rainfall, river level, temperature, humidity, soil moisture",
        "output": "forecasted river levels",
        "strengths": [
            "Captures temporal lag effects",
            "Useful for sequence forecasting",
        ],
        "weaknesses": [
            "Needs more data",
            "Harder interpretability",
            "GPU recommended",
        ],
        "best_for": "Time-series forecasting research.",
        "expected_metrics": {
            "mae_river_level": "0.15-0.30m",
            "rmse": "0.20-0.40m",
            "training_time": "~10 min GPU",
        },
        "paper_reference": "Hochreiter and Schmidhuber (1997) LSTM.",
    },
    {
        "id": "temporal-fusion-transformer",
        "name": "Temporal Fusion Transformer",
        "category": "deep_learning",
        "status": "experimental",
        "task": "Interpretable multi-horizon forecasting",
        "description": "Attention-based architecture for accurate multi-step forecasts with variable attribution.",
        "architecture": {
            "type": "LSTM + Multi-Head Attention",
            "library": "pytorch-forecasting",
            "typical_params": {
                "hidden_size": "32-128",
                "attention_head_size": "4",
                "dropout": "0.1-0.3",
                "encode_length": "30 days",
                "prediction_length": "7 days",
            },
        },
        "input_features": "Static + time-varying known + time-varying observed features",
        "output": "quantile river level forecasts",
        "strengths": [
            "Strong multi-step forecasting",
            "Built-in interpretability",
            "Uncertainty quantification",
        ],
        "weaknesses": [
            "High implementation complexity",
            "Needs large datasets and GPU",
        ],
        "best_for": "Research-grade forecasting.",
        "expected_metrics": {
            "mae_river_level": "0.10-0.25m",
            "quantile_loss": "0.08-0.15",
            "training_time": "~30 min GPU",
        },
        "paper_reference": "Lim et al. (2021) TFT.",
    },
    {
        "id": "lightgbm-regressor",
        "name": "LightGBM Regressor (Flood Depth)",
        "category": "regression",
        "status": "active",
        "task": "Flood depth regression",
        "description": "Continuous depth estimator for downstream economic loss modeling.",
        "architecture": {
            "type": "Gradient Boosted Decision Trees (regression)",
            "library": "lightgbm",
            "typical_params": {
                "objective": "regression",
                "metric": "rmse",
                "n_estimators": "500-2000",
                "max_depth": "5-12",
            },
        },
        "input_features": "Same as LightGBM classifier",
        "output": "predicted flood depth in meters",
        "strengths": [
            "Directly useful for PPP loss estimation",
            "Easy extension from classifier pipeline",
        ],
        "weaknesses": [
            "Depth labels are harder to obtain",
        ],
        "best_for": "Depth-driven impact modeling.",
        "expected_metrics": {
            "mae": "0.3-0.6m",
            "rmse": "0.5-0.9m",
            "r_squared": "0.65-0.80",
        },
    },
]

MODEL_CATEGORIES = {
    "tree_based": {
        "label": "Tree-Based Models",
        "icon": "tree",
        "description": "Best starting point for structured/tabular data.",
    },
    "deep_learning": {
        "label": "Deep Learning / Sequence Models",
        "icon": "brain",
        "description": "Time-series forecasting models with higher data/compute demand.",
    },
    "regression": {
        "label": "Regression Models",
        "icon": "chart-line",
        "description": "Continuous output models (depth/loss).",
    },
}

STATUS_INFO = {
    "active": {
        "label": "Deployed",
        "color": "green",
        "description": "Currently running in platform",
    },
    "available": {
        "label": "Available",
        "color": "blue",
        "description": "Ready to evaluate",
    },
    "experimental": {
        "label": "Experimental",
        "color": "amber",
        "description": "Research-stage setup",
    },
}


class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    rainfall_mm: float = 50.0
    model_id: str = "lightgbm-classifier"


@router.get("/registry")
async def get_model_registry() -> dict[str, Any]:
    """Return model registry metadata."""
    return {
        "models": MODEL_REGISTRY,
        "categories": MODEL_CATEGORIES,
        "status_info": STATUS_INFO,
    }


@router.get("/registry/{model_id}")
async def get_model_detail(model_id: str):
    """Return details for one model from registry."""
    for model in MODEL_REGISTRY:
        if model["id"] == model_id:
            return model
    raise HTTPException(status_code=404, detail="Model not found")


@router.post("/predict")
async def run_prediction(req: PredictionRequest):
    """Run a quick test prediction through the existing flood predictor."""
    prediction = await predict_flood_risk_at_point(
        latitude=req.latitude,
        longitude=req.longitude,
        rainfall_mm=req.rainfall_mm,
    )

    risk_percentage = float(prediction.get("risk_percentage", 0))
    if risk_percentage > 80:
        risk_level = "critical"
    elif risk_percentage > 50:
        risk_level = "high"
    elif risk_percentage > 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "model_used": req.model_id,
        "prediction": {
            "risk_level": risk_level,
            "risk_percentage": round(risk_percentage, 2),
            "predicted_depth_m": round(float(prediction.get("predicted_depth", 0)), 2),
            "confidence": round(float(prediction.get("confidence", 0.8)) * 100, 2),
            "contributing_factors": prediction.get("factors", []),
        },
    }
