#!/bin/bash

# IRIS CLASSIFIER - QUICK START SCRIPT
#
# Dieses Script setzt das gesamte Projekt auf und startet es.

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           IRIS CLASSIFIER - Quick Start Setup              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+."
    exit 1
fi

echo "✅ Python found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo ""

pip install -r ml/requirements.txt > /dev/null 2>&1 && echo "  ✅ ML dependencies installed"
pip install -r api/requirements.txt > /dev/null 2>&1 && echo "  ✅ API dependencies installed"

# Train model
echo ""
echo "🧠 Training ML model..."
echo ""

python ml/train.py

echo ""
echo "✅ Model training complete!"
echo ""

# Build Docker images
echo ""
echo "🐳 Building Docker images..."
echo ""

docker-compose build --quiet

echo ""
echo "✅ Docker images built!"
echo ""

# Start services
echo ""
echo "🚀 Starting services..."
echo ""

docker-compose up -d

# Wait for services
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Health check
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ API is healthy"
else
    echo "⚠️  API is not responding yet, try again in a few seconds"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    🎉 ALL READY!                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Access points:"
echo ""
echo "   📊 API Docs (Swagger UI)"
echo "      👉 http://localhost:8080/docs"
echo ""
echo "   📈 Prometheus"
echo "      👉 http://localhost:9090"
echo ""
echo "   📉 Grafana (Dashboard)"
echo "      👉 http://localhost:3000"
echo "      Login: admin / admin"
echo ""
echo "   🔬 MLflow (Experiments)"
echo "      👉 http://localhost:5000"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🛑 To stop services:"
echo "   make down"
echo ""
echo "📝 Useful commands:"
echo "   make health          # Check API health"
echo "   make model-info      # Get model info"
echo "   make predict         # Make test prediction"
echo "   make logs            # View service logs"
echo "   make test-api        # Run API tests"
echo ""
echo "📚 Documentation:"
echo "   make help            # Show all commands"
echo ""
