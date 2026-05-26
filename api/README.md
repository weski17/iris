# Iris Prediction API - FastAPI (Python)

REST-API für Iris-Klassifikation mit FastAPI, Pydantic und Prometheus Monitoring.

## Features

✅ **Endpoints:**
- `GET /health` — Health Check
- `POST /predict` — Prediction (JSON)
- `GET /model/info` — Model Information
- `GET /metrics` — Prometheus Metriken

✅ **Dokumentation:**
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`
- OpenAPI JSON: `http://localhost:8080/openapi.json`

✅ **Features:**
- Automatische Input-Validierung (Pydantic)
- Type Hints & Schema Generation
- Prometheus Metriken für Monitoring
- CORS Support
- Async/Await
- Error Handling

## Quick Start

```bash
# 1. Dependencies
cd api && pip install -r requirements.txt

# 2. Modell trainieren (falls noch nicht geschehen)
cd .. && python ml/train.py

# 3. API starten
cd api && python main.py
```

Die API läuft dann auf: **http://127.0.0.1:8080**

## API Examples

### Health Check
```bash
curl http://127.0.0.1:8080/health
```

### Predict
```bash
curl -X POST http://127.0.0.1:8080/predict \
  -H "Content-Type: application/json" \
  -d '{
    "sepal_length": 5.1,
    "sepal_width": 3.5,
    "petal_length": 1.4,
    "petal_width": 0.2
  }'
```

### Model Info
```bash
curl http://127.0.0.1:8080/model/info
```

## Documentation

- **Swagger UI**: http://127.0.0.1:8080/docs
- **ReDoc**: http://127.0.0.1:8080/redoc

## Tests

```bash
pytest test_api.py -v
```

## Docker

```bash
# Build
docker build -f api/Dockerfile -t iris-api:latest .

# Run
docker run -p 8080:8080 iris-api:latest
```
