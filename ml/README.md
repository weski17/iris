# ML Module - Iris Classification

Trainings-Pipeline für Iris-Klassifikation mit scikit-learn und MLflow.

## Setup

```bash
# Python venv erstellen
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oder: venv\Scripts\activate  # Windows

# Dependencies installieren
pip install -r requirements.txt
```

## Modell trainieren

```bash
python ml/train.py
```

**Output:**
- ✅ `ml/models/iris_model_latest.pkl` — Trainiertes Modell
- ✅ `ml/models/iris_model_TIMESTAMP.pkl` — Versioniertes Modell
- ✅ `ml/models/iris_model_metadata.json` — Metadaten (Metriken, Features, Hyperparameter)
- ✅ `ml/mlruns/` — MLflow Experiment Tracking
- ✅ `ml/models/evaluation_results.json` — Detaillierte Evaluierung

## Evaluierung durchführen

```bash
python ml/evaluate.py
```

**Output:**
- 📊 Confusion Matrix Heatmap
- 📊 Feature Importance Bar Chart
- 📄 `ml/models/evaluation_report.json`

## Tests ausführen

```bash
# Alle Tests
pytest ml/test_train.py -v

# Mit Coverage Report
pytest ml/test_train.py --cov=ml --cov-report=html
```

## MLflow UI starten

```bash
mlflow ui --backend-store-uri ./ml/mlruns
```

Öffne dann: `http://localhost:5000`

## Key Metriken

Das trainierte Modell erreicht typischerweise:
- **Accuracy**: ~96% (auf Iris-Testset)
- **Precision (weighted)**: ~96%
- **Recall (weighted)**: ~96%

## Modell laden und verwenden

```python
import joblib

model = joblib.load('ml/models/iris_model_latest.pkl')

# Single Prediction
sepal_length, sepal_width, petal_length, petal_width = 5.1, 3.5, 1.4, 0.2
prediction = model.predict([[sepal_length, sepal_width, petal_length, petal_width]])
probabilities = model.predict_proba([[sepal_length, sepal_width, petal_length, petal_width]])

print(f"Predicted class: {prediction[0]}")  # 0, 1 oder 2
print(f"Class probabilities: {probabilities[0]}")
```

## Dateistruktur

```
ml/
├── train.py                          # Trainings-Pipeline
├── evaluate.py                       # Evaluierungs-Skript
├── test_train.py                     # Unit Tests
├── config.yaml                       # Hyperparameter
├── requirements.txt                  # Dependencies
├── models/
│   ├── iris_model_latest.pkl        # Aktuelles Modell
│   ├── iris_model_TIMESTAMP.pkl     # Versionierte Modelle
│   ├── iris_model_metadata.json     # Metadaten
│   ├── evaluation_results.json      # Eval-Details
│   ├── evaluation_report.json       # Eval-Report
│   ├── confusion_matrix.png         # Plot
│   └── feature_importance.png       # Plot
├── mlruns/                           # MLflow Tracking
└── data/                             # Datenspeicher (leer, nutzt sklearn)
```

## Nächster Schritt: TEIL 2 – RUST REST API

Das trainierte Modell wird in Teil 2 via REST-API bereitgestellt.
