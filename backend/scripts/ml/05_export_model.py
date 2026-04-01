"""Copy model artifacts to runtime locations and print metadata summary."""

from __future__ import annotations

import shutil
from pathlib import Path

import joblib


ARTIFACTS = [
    "flood_classifier_v2.joblib",
    "flood_depth_v2.joblib",
    "feature_columns.joblib",
    "model_metadata.joblib",
]


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def main() -> None:
    backend = _backend_root()
    src_dir = backend / "models"
    dst_dir = backend / "data" / "models"
    dst_dir.mkdir(parents=True, exist_ok=True)

    missing = [name for name in ARTIFACTS if not (src_dir / name).exists()]
    if missing:
        raise FileNotFoundError(f"Missing model artifacts: {', '.join(missing)}. Run 03_train_model.py first.")

    for name in ARTIFACTS:
        shutil.copy2(src_dir / name, dst_dir / name)

    metadata = joblib.load(src_dir / "model_metadata.joblib")
    print(f"Exported artifacts to: {dst_dir}")
    print(f"Model version: {metadata.get('model_version')}")
    print(f"Last trained: {metadata.get('last_trained')}")
    print(f"Validation accuracy: {metadata.get('accuracy')}")


if __name__ == "__main__":
    main()
