#!/usr/bin/env python3
"""
Iris Prediction API - FastAPI
REST API für Iris-Klassifikation mit OpenAPI/Swagger Dokumentation
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

import joblib
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, ConfigDict
from prometheus_client import Counter, Histogram, generate_latest, REGISTRY

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Iris Prediction API starting...")
    if model_manager:
        logger.info("✅ Model ready for predictions")
    else:
        logger.error("❌ Model initialization failed")
    yield
    logger.info("🛑 Iris Prediction API shutting down")


# FastAPI App
app = FastAPI(
    title="Iris Classifier API",
    description="REST API für Iris-Blumen-Klassifikation mit Machine Learning",
    version="0.1.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Metrics
# ============================================================================

PREDICTION_COUNTER = Counter(
    'iris_predictions_total',
    'Total number of predictions',
    ['species']
)

PREDICTION_DURATION = Histogram(
    'iris_prediction_duration_seconds',
    'Prediction duration in seconds',
    ['model_version']
)

HTTP_REQUESTS = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# ============================================================================
# Models (Pydantic)
# ============================================================================

class PredictRequest(BaseModel):
    """Prediction Request Schema"""
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "sepal_length": 5.1,
            "sepal_width": 3.5,
            "petal_length": 1.4,
            "petal_width": 0.2
        }
    })

    sepal_length: float = Field(..., ge=0.0, le=10.0, description="Sepal length in cm")
    sepal_width: float = Field(..., ge=0.0, le=10.0, description="Sepal width in cm")
    petal_length: float = Field(..., ge=0.0, le=10.0, description="Petal length in cm")
    petal_width: float = Field(..., ge=0.0, le=10.0, description="Petal width in cm")

    @field_validator('sepal_length', 'sepal_width', 'petal_length', 'petal_width')
    @classmethod
    def validate_positive(cls, v):
        if v <= 0:
            raise ValueError('must be positive')
        return v


class ProbabilityDistribution(BaseModel):
    """Probability Distribution"""
    setosa: float
    versicolor: float
    virginica: float


class PredictResponse(BaseModel):
    """Prediction Response Schema"""
    species: str
    confidence: float
    probabilities: ProbabilityDistribution
    timestamp: str


class HealthResponse(BaseModel):
    """Health Check Response"""
    status: str
    timestamp: str
    version: str


class ModelInfoResponse(BaseModel):
    """Model Information Response"""
    model_config = ConfigDict(protected_namespaces=())

    model_version: str
    accuracy: float
    training_date: str
    feature_names: list[str]
    target_names: list[str]
    n_estimators: int


# ============================================================================
# Model Loader
# ============================================================================

class ModelManager:
    """Handles model loading and predictions"""

    def __init__(self, model_path: str = "ml/models/iris_model_latest.pkl"):
        self.model_path = model_path
        self.model = None
        self.metadata = None
        self.load_model()

    def load_model(self):
        """Load model and metadata"""
        if not Path(self.model_path).exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")

        self.model = joblib.load(self.model_path)
        logger.info(f"✅ Model loaded from {self.model_path}")

        # Load metadata
        metadata_path = self.model_path.replace(
            "iris_model_latest.pkl",
            "iris_model_metadata.json"
        )
        with open(metadata_path, 'r') as f:
            self.metadata = json.load(f)
        logger.info(f"✅ Metadata loaded from {metadata_path}")

    def predict(self, features: list[float]) -> dict:
        """Make prediction"""
        if self.model is None:
            raise RuntimeError("Model not loaded")

        X = np.array([features], dtype=np.float32)
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]

        species_name = self.metadata['target_names'][int(prediction)]
        confidence = float(probabilities[int(prediction)])

        return {
            'class_index': int(prediction),
            'species': species_name,
            'probabilities': probabilities.tolist(),
            'confidence': confidence
        }


# Initialize model
try:
    model_manager = ModelManager("ml/models/iris_model_latest.pkl")
    logger.info("🚀 Model Manager initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Model Manager: {e}")
    model_manager = None


# ============================================================================
# Endpoints
# ============================================================================

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["health"],
    summary="Health Check",
    description="Check if API is running"
)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat() + "Z",
        version="0.1.0"
    )


@app.post(
    "/predict",
    response_model=PredictResponse,
    tags=["predict"],
    summary="Classify Iris",
    description="Predict iris species based on flower measurements"
)
async def predict(request: PredictRequest):
    """Predict iris species from flower features"""
    if model_manager is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not initialized"
        )

    try:
        features = [
            request.sepal_length,
            request.sepal_width,
            request.petal_length,
            request.petal_width
        ]

        result = model_manager.predict(features)

        # Record metrics
        PREDICTION_COUNTER.labels(species=result['species']).inc()
        PREDICTION_DURATION.labels(model_version="0.1.0").observe(0.01)  # Approximate

        response = PredictResponse(
            species=result['species'],
            confidence=result['confidence'],
            probabilities=ProbabilityDistribution(
                setosa=result['probabilities'][0],
                versicolor=result['probabilities'][1],
                virginica=result['probabilities'][2]
            ),
            timestamp=datetime.utcnow().isoformat() + "Z"
        )

        logger.info(f"✅ Prediction: {result['species']} (confidence: {result['confidence']:.2%})")
        return response

    except Exception as e:
        logger.error(f"❌ Prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get(
    "/model/info",
    response_model=ModelInfoResponse,
    tags=["model"],
    summary="Model Information",
    description="Get model metadata and performance metrics"
)
async def model_info():
    """Get model information"""
    if model_manager is None or model_manager.metadata is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metadata not available"
        )

    metadata = model_manager.metadata
    return ModelInfoResponse(
        model_version="0.1.0",
        accuracy=metadata['metrics']['accuracy'],
        training_date=metadata['training_date'],
        feature_names=metadata['feature_names'],
        target_names=metadata['target_names'],
        n_estimators=metadata['hyperparameters']['n_estimators']
    )


@app.get(
    "/metrics",
    tags=["monitoring"],
    summary="Prometheus Metrics",
    description="Get Prometheus metrics for monitoring"
)
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(REGISTRY).decode('utf-8')


# ============================================================================
# Custom OpenAPI Schema
# ============================================================================

def custom_openapi():
    """Custom OpenAPI schema"""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Iris Classifier API",
        version="0.1.0",
        description="ML-powered REST API für Iris-Blumen-Klassifikation",
        routes=app.routes,
    )

    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# ============================================================================
# Root
# ============================================================================

@app.get("/", tags=["info"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Iris Classifier API",
        "version": "0.1.0",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
        "redoc_url": "/redoc"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8080,
        reload=True,
        log_level="info"
    )
