# Iris Classifier - ML Project 🌸

End-to-End Machine Learning Klassifikation: **ML Model** → **REST API** → **Web Frontend** → **Monitoring**

```
iris/
├── ml/                  # ML Model (scikit-learn)
│   ├── train.py         # RandomForest Classifier
│   ├── config.yaml      # Hyperparameters
│   └── models/          # Trained model + metadata
├── api/                 # REST API (FastAPI)
│   ├── main.py          # 3 endpoints
│   ├── test_api.py      # Tests
│   └── Dockerfile       # Multi-stage build
├── frontend/            # Web Frontend (React)
│   ├── src/
│   ├── index.html
│   └── package.json
├── monitoring/          # Prometheus + Grafana
├── docker-compose.yml   # All services
└── Makefile            # Commands
```

---

## 🚀 Quick Start (5 Min Setup)

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 18+ (nur für Frontend-Dev)

### 2. Start Everything

```bash
cd iris
docker-compose up
```

**Services laufen dann:**

| Service | URL |
|---------|-----|
| **API Docs** | http://localhost:8080/docs |
| **Frontend** | http://localhost:3000 |
| **Prometheus** | http://localhost:9090 |
| **Grafana** | http://localhost:3000 (admin/admin) |
| **MLflow** | http://localhost:5000 |

---

## 🎮 Quick Commands

```bash
# Start everything
make up

# Stop everything
make down

# View logs
make logs

# Test API
make predict

# Check health
make health

# Full setup (first time)
make setup
make train
make build
make up
```

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│   React Web Frontend    │  ← http://localhost:3000
│   (iPhone-style UI)     │
└────────────┬────────────┘
             │ REST API (Axios)
┌────────────▼────────────┐
│    FastAPI :8080        │
│  /predict → ML Model    │
└────────────┬────────────┘
             │ scikit-learn
┌────────────▼────────────┐
│   Iris Classifier       │
│   RandomForest (96%)     │
└─────────────────────────┘

Monitoring:
┌──────────────────────────┐
│ Prometheus :9090         │
│ Grafana :3000            │
│ MLflow :5000             │
└──────────────────────────┘
```

---

## 📱 Frontend (React Web)

**Features:**
- 🎨 iPhone-style Design (Tailwind CSS)
- 🎚️ 4 Interactive Sliders
- 📊 Real-time Predictions
- ⚡ Live API Status

**Dev Mode:**
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

---

## 🧪 Testing

```bash
# API Tests
make test-api

# ML Tests
make test-ml

# Test Prediction
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

## 📊 Monitoring

### Prometheus
- Metrics: http://localhost:9090
- Query examples:
  ```promql
  rate(http_requests_total[5m])
  sum(iris_predictions_total) by (species)
  histogram_quantile(0.99, iris_prediction_duration_seconds_bucket)
  ```

### Grafana
- Dashboard: http://localhost:3000
- Login: `admin` / `admin`
- Dashboards: Iris Classifier Metrics (auto-imported)

### MLflow
- UI: http://localhost:5000
- View experiments & model versions

---

## 🛠️ Local Development

### Just ML
```bash
cd ml
pip install -r requirements.txt
python train.py
```

### Just API
```bash
cd api
pip install -r requirements.txt
python main.py  # http://localhost:8080/docs
```

### Just Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

---

## 📋 Makefile

```bash
# Setup
make setup              # Install dependencies
make build              # Build Docker images
make train              # Train ML model

# Running
make up                 # Start services
make down               # Stop services
make logs               # View logs

# Testing
make test-api           # Run API tests
make test-ml            # Run ML tests
make health             # Health check
make predict            # Test prediction
make model-info         # Get model info

# Development
make api-dev            # API locally
make frontend-dev       # Frontend locally
make ps                 # Show containers
make shell-api          # Bash into API
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
docker-compose down -v
docker-compose up
```

### Model Not Found
```bash
make train
docker-compose up
```

### Frontend Won't Connect
Check `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080';  // ← Muss stimmen
```

---

## 📊 Project Stats

```
ML Model:        RandomForest (96% accuracy)
API Latency:     ~30ms/prediction
Frontend:        React 18 + TypeScript + Tailwind
Monitoring:      Prometheus + Grafana + MLflow
```

---

## ✨ That's It!

**Everything is local. Everything is simple. No Kubernetes. No CI/CD. Just code.** 🚀

```bash
make setup
make up
# Open http://localhost:3000
# Done ✓
```

