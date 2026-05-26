# Iris Classifier - End-to-End ML Project 🌸

Vollständiges Machine Learning Projekt mit Python (ML), FastAPI (Backend), React Native (Frontend), Docker, Kubernetes und CI/CD.

```
iris/
├── ml/                          # ML Model (Python)
│   ├── train.py
│   ├── config.yaml
│   ├── requirements.txt
│   └── models/
├── api/                         # REST API (FastAPI)
│   ├── main.py
│   ├── test_api.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                    # iOS UI (React Native)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── monitoring/                  # Prometheus + Grafana
│   ├── prometheus.yml
│   └── grafana/
├── docker-compose.yml           # Local Development
├── Makefile                     # Commands
└── README.md                    # This file
```

---

## 🚀 Quick Start (Docker Compose)

### 1. Voraussetzungen

- Docker & Docker Compose
- Python 3.10+ (für lokale Entwicklung)
- Node.js 18+ (für Frontend)

### 2. Setup

```bash
# Clone/Download Projekt
cd iris

# Installiere Dependencies (lokal)
make setup

# Trainiere Modell
make train
```

### 3. Starte alle Services

```bash
# Build Docker Images
make build

# Start Services
make up
```

**Services laufen dann auf:**

| Service | URL | Credentials |
|---------|-----|-------------|
| **API Docs** | http://localhost:8080/docs | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin/admin |
| **MLflow** | http://localhost:5000 | - |

---

## 📋 Makefile Commands

```bash
# Setup & Build
make setup              # Install all dependencies
make build              # Build Docker images
make train              # Train ML model

# Running
make up                 # Start all services
make down               # Stop all services
make logs               # Show logs

# Testing
make test-api           # Test API
make test-ml            # Test ML model
make health             # Check API health

# Development
make api-dev            # Run API locally
make frontend-dev       # Run Frontend locally
make mlflow             # Open MLflow UI

# Utilities
make ps                 # Show running containers
make shell-api          # Bash into API container
make predict            # Make test prediction
```

---

## 📊 Services Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Native Frontend              │
│              (iOS Design, Dark Mode)                │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼───────────────────────────────┐
│              FastAPI (Python) - :8080               │
│      (/health, /predict, /model/info, /metrics)    │
└─────────────────────┬───────────────────────────────┘
                      │ scikit-learn
┌─────────────────────▼───────────────────────────────┐
│         ML Model (RandomForestClassifier)           │
│         (iris_model_latest.pkl - 100KB)             │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Prometheus :9090        Grafana :3000               │
│  (Metrics Collection)    (Dashboards & Alerts)       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  MLflow UI :5000 (Experiment Tracking)               │
└──────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### API Tests

```bash
# Alle Tests
make test-api

# Oder manuell
cd api && pytest test_api.py -v

# Mit Coverage
pytest test_api.py --cov=main --cov-report=html
```

### Test Prediction

```bash
# Health Check
make health

# Get Model Info
make model-info

# Make Prediction
make predict

# oder manuell:
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{
    "sepal_length": 5.1,
    "sepal_width": 3.5,
    "petal_length": 1.4,
    "petal_width": 0.2
  }'
```

---

## 🛠️ Local Development

### Nur API entwickeln

```bash
cd api
pip install -r requirements.txt
python main.py
```

API läuft auf: http://localhost:8080/docs

### Nur Frontend entwickeln

```bash
cd frontend
npm install
npm start
```

Wähle: `i` (iOS Simulator), `a` (Android), oder `w` (Web)

### Nur ML entwickeln

```bash
cd ml
pip install -r requirements.txt
python train.py
```

---

## 📊 Monitoring

### Prometheus Queries

```promql
# Request Rate (5m avg)
rate(http_requests_total[5m])

# Predictions by Species
sum(iris_predictions_total) by (species)

# Prediction Latency (p99)
histogram_quantile(0.99, rate(iris_prediction_duration_seconds_bucket[5m]))

# Error Rate
rate(http_requests_total{status=~"5.."}[5m])
```

### Grafana Dashboards

- **Iris Classifier Metrics** (Auto-provisioned)
  - Request Rate
  - Predictions by Species
  - Prediction Duration
  - Error Rate

---

## 🐳 Docker Commands

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f api

# Into Container
docker-compose exec api bash

# Remove Everything
docker-compose down -v
```

---

## 📱 Frontend Usage

### Screens

1. **Home** 📊
   - API Status
   - Model Metrics
   - Feature Info

2. **Predict** 🌸
   - 4 Sliders (Sepal/Petal)
   - Live Summary
   - Classify Button

3. **Result** 📈
   - Species + Emoji
   - Confidence Badge
   - Probability Distribution
   - Back Button

### API URL Configuration

Bearbeite in `frontend/src/services/api.ts`:

```typescript
// Local Development
const API_BASE_URL = 'http://127.0.0.1:8080';

// Real Device (use local IP)
const API_BASE_URL = 'http://192.168.1.100:8080';
```

---

## 🔄 CI/CD (Nächste Schritte)

Nach TEIL 3 (Frontend):

- **TEIL 4:** Docker & Kubernetes
  - Kubernetes Manifests (Deployment, Service, HPA)
  - Helm Chart

- **TEIL 5:** CI/CD Pipeline
  - Jenkins Jenkinsfile
  - ArgoCD GitOps

- **TEIL 6:** Advanced Monitoring
  - Alert Rules
  - Custom Dashboards

---

## 📚 Komponenten-Übersicht

### ✅ TEIL 1 - ML Model (Python)

**Datei:** `ml/train.py`

- RandomForestClassifier (100 Estimators)
- 5-Fold Cross-Validation
- MLflow Experiment Tracking
- Output: `iris_model_latest.pkl` (100KB)

**Metriken:**
- Accuracy: ~96%
- Precision: ~96%
- Recall: ~96%

### ✅ TEIL 2 - REST API (FastAPI)

**Datei:** `api/main.py`

- `GET /health` → Health Check
- `POST /predict` → Classification
- `GET /model/info` → Model Metadata
- `GET /metrics` → Prometheus Metrics

**Latenz:** ~30ms/request

### ✅ TEIL 3 - Frontend (React Native)

**Datei:** `frontend/src/App.tsx`

- Tab Navigation (Home, Predict, Result)
- 4 Interactive Sliders
- iOS Design System (SF Symbols)
- Dark Mode Support

---

## 🐛 Troubleshooting

### "Port already in use"

```bash
# Find & kill process
lsof -i :8080
kill -9 <PID>

# Oder anderen Port nutzen
docker-compose.yml anpassen:
ports:
  - "8081:8080"  # Use 8081
```

### "Model file not found"

```bash
# Stelle sicher Modell existiert:
ls -la ml/models/
# Sollte anzeigen:
# iris_model_latest.pkl
# iris_model_metadata.json

# Falls nicht:
make train
```

### "Docker images not found"

```bash
docker-compose build --no-cache
```

### "API connection refused"

```bash
# Check if API container is running:
docker-compose ps

# View logs:
docker-compose logs api

# Restart:
docker-compose restart api
```

---

## 📖 Documentation

- **ML:** `ml/README.md`
- **API:** `api/README.md`
- **Frontend:** `frontend/README.md`

---

## 📊 Project Stats

```
Lines of Code:
  ML (train.py):        ~250 lines
  API (main.py):        ~350 lines
  Frontend:             ~800 lines (TypeScript/React Native)
  Total:                ~1400 LOC

Dependencies:
  Python:               15 packages
  Node.js:              20 packages
  Rust (Deprecated):    N/A

Build Times:
  ML Training:          ~10-15 seconds
  Docker Build:         ~3-5 minutes
  Total Setup:          ~20 minutes
```

---

## ✨ Next Steps

1. **Test locally** → `make up` → Open http://localhost:8080/docs
2. **Train model** → `make train`
3. **Run tests** → `make test-api`
4. **Develop frontend** → `make frontend-dev`
5. **Monitor** → Open http://localhost:3000 (Grafana)

---

Viel Spaß mit dem Projekt! 🚀🌸
