import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib

# Load historical flood data
print("Loading dataset: historical_flood_data.csv...")
df = pd.read_csv('historical_flood_data.csv')

# Feature engineering
X = df[['rainfall_mm', 'river_level_m', 'soil_moisture_idx', 'upstream_discharge_cusecs']]
y = df['flood_risk_label'] # 0: Safe, 1: Warning, 2: Critical

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize XGBoost Classifier
model = xgb.XGBClassifier(
    objective='multi:softmax',
    num_class=3,
    learning_rate=0.1,
    max_depth=5,
    n_estimators=100
)

# Train model
print("Training XGBoost model...")
model.fit(X_train, y_train)

# Evaluate
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"Model Training Complete.")
print(f"Test Set Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, predictions))

# Save model
joblib.dump(model, 'flood_prediction_v1.pkl')
print("Model saved to flood_prediction_v1.pkl")
