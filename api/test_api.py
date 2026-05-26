#!/usr/bin/env python3
"""
API Tests
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["version"] == "0.1.0"


def test_model_info():
    """Test model info endpoint"""
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "feature_names" in data
    assert "target_names" in data
    assert len(data["feature_names"]) == 4
    assert len(data["target_names"]) == 3


def test_predict_setosa():
    """Test prediction for Setosa"""
    response = client.post(
        "/predict",
        json={
            "sepal_length": 5.1,
            "sepal_width": 3.5,
            "petal_length": 1.4,
            "petal_width": 0.2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["species"] == "setosa"
    assert data["confidence"] > 0
    assert "probabilities" in data
    assert data["probabilities"]["setosa"] > 0


def test_predict_versicolor():
    """Test prediction for Versicolor"""
    response = client.post(
        "/predict",
        json={
            "sepal_length": 5.9,
            "sepal_width": 3.0,
            "petal_length": 4.2,
            "petal_width": 1.5
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] > 0


def test_predict_virginica():
    """Test prediction for Virginica"""
    response = client.post(
        "/predict",
        json={
            "sepal_length": 6.3,
            "sepal_width": 3.3,
            "petal_length": 6.0,
            "petal_width": 2.5
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] > 0


def test_predict_invalid_input():
    """Test prediction with invalid input (out of bounds)"""
    response = client.post(
        "/predict",
        json={
            "sepal_length": 25.0,  # Out of bounds
            "sepal_width": 3.5,
            "petal_length": 1.4,
            "petal_width": 0.2
        }
    )
    assert response.status_code == 422  # Validation error


def test_predict_missing_field():
    """Test prediction with missing field"""
    response = client.post(
        "/predict",
        json={
            "sepal_length": 5.1,
            "sepal_width": 3.5,
            # Missing petal_length
            "petal_width": 0.2
        }
    )
    assert response.status_code == 422  # Validation error


def test_metrics_endpoint():
    """Test metrics endpoint"""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "iris_predictions_total" in response.text
