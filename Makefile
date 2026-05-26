.PHONY: help up down logs clean build train test

help:
	@echo "═══════════════════════════════════════════"
	@echo "Iris Classifier - Development Commands"
	@echo "═══════════════════════════════════════════"
	@echo ""
	@echo "Setup & Build:"
	@echo "  make setup       - Install all dependencies"
	@echo "  make build       - Build Docker images"
	@echo "  make train       - Train ML model"
	@echo ""
	@echo "Running:"
	@echo "  make up          - Start all services (docker-compose)"
	@echo "  make down        - Stop all services"
	@echo "  make logs        - Show service logs"
	@echo ""
	@echo "Testing:"
	@echo "  make test-api    - Test API endpoints"
	@echo "  make test-ml     - Test ML model"
	@echo ""
	@echo "Development:"
	@echo "  make api-dev     - Run API in development mode"
	@echo "  make frontend-dev - Run Frontend in development mode"
	@echo "  make mlflow      - Open MLflow UI"
	@echo ""
	@echo "URLs:"
	@echo "  API Docs:     http://localhost:8080/docs"
	@echo "  Prometheus:   http://localhost:9090"
	@echo "  Grafana:      http://localhost:3000 (admin/admin)"
	@echo "  MLflow:       http://localhost:5000"
	@echo "═══════════════════════════════════════════"

setup:
	@echo "Installing ML dependencies..."
	pip install -r ml/requirements.txt
	@echo "Installing API dependencies..."
	pip install -r api/requirements.txt
	@echo "Installing Frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Setup complete!"

train:
	@echo "Training ML model..."
	python ml/train.py
	@echo "✅ Model training complete!"

build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "✅ Images built!"

up:
	@echo "Starting services..."
	docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo ""
	@echo "Access points:"
	@echo "  API Docs:    http://localhost:8080/docs"
	@echo "  Prometheus:  http://localhost:9090"
	@echo "  Grafana:     http://localhost:3000 (admin/admin)"
	@echo "  MLflow:      http://localhost:5000"

down:
	@echo "Stopping services..."
	docker-compose down
	@echo "✅ Services stopped!"

logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-prometheus:
	docker-compose logs -f prometheus

logs-grafana:
	docker-compose logs -f grafana

clean:
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf ml/models/*.pkl
	rm -rf api/__pycache__
	rm -rf frontend/node_modules
	@echo "✅ Cleanup complete!"

test-api:
	@echo "Testing API..."
	cd api && pytest test_api.py -v

test-ml:
	@echo "Testing ML model..."
	cd ml && pytest test_train.py -v

api-dev:
	@echo "Starting API in development mode..."
	cd api && python main.py

frontend-dev:
	@echo "Starting Frontend in development mode..."
	cd frontend && npm start

mlflow:
	@echo "Starting MLflow UI..."
	mlflow ui --backend-store-uri ./ml/mlruns

health:
	@echo "Checking API health..."
	curl -s http://localhost:8080/health | python -m json.tool

model-info:
	@echo "Getting model info..."
	curl -s http://localhost:8080/model/info | python -m json.tool

predict:
	@echo "Making prediction..."
	curl -s -X POST http://localhost:8080/predict \
		-H "Content-Type: application/json" \
		-d '{"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2}' | python -m json.tool

ps:
	docker-compose ps

shell-api:
	docker-compose exec api bash

shell-prometheus:
	docker-compose exec prometheus sh
