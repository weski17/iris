#!/usr/bin/env python3
"""
Unit tests for model training pipeline
"""

import pytest
import numpy as np
from pathlib import Path
from ml.train import IrisModelTrainer


@pytest.fixture
def trainer():
    """Fixture for IrisModelTrainer instance"""
    return IrisModelTrainer("ml/config.yaml")


def test_load_config(trainer):
    """Test configuration loading"""
    assert trainer.config is not None
    assert 'model' in trainer.config
    assert 'data' in trainer.config
    assert trainer.config['model']['type'] == 'RandomForestClassifier'


def test_load_data(trainer):
    """Test data loading"""
    X, y = trainer.load_data()
    assert X.shape == (150, 4), "Iris dataset should have 150 samples and 4 features"
    assert y.shape == (150,), "Target should have 150 labels"
    assert len(trainer.target_names) == 3, "Should have 3 iris species"


def test_data_split(trainer):
    """Test data splitting"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)

    assert trainer.X_train is not None
    assert trainer.X_test is not None
    assert trainer.y_train is not None
    assert trainer.y_test is not None

    test_ratio = len(trainer.X_test) / len(X)
    assert 0.19 < test_ratio < 0.21, "Test set should be ~20% of data"


def test_model_training(trainer):
    """Test model training"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)
    trainer.train()

    assert trainer.model is not None
    assert hasattr(trainer.model, 'predict')
    assert hasattr(trainer.model, 'predict_proba')


def test_model_predictions(trainer):
    """Test model predictions"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)
    trainer.train()

    y_pred = trainer.model.predict(trainer.X_test)
    assert y_pred.shape == trainer.y_test.shape
    assert np.all((y_pred >= 0) & (y_pred < 3)), "Predictions should be class indices 0-2"

    y_proba = trainer.model.predict_proba(trainer.X_test)
    assert y_proba.shape == (trainer.X_test.shape[0], 3)
    assert np.allclose(y_proba.sum(axis=1), 1.0), "Probabilities should sum to 1"


def test_evaluation_metrics(trainer):
    """Test evaluation metrics calculation"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)
    trainer.train()

    eval_results = trainer.evaluate()

    assert 'metrics' in eval_results
    assert 'accuracy' in trainer.metrics
    assert 0 <= trainer.metrics['accuracy'] <= 1
    assert 'confusion_matrix' in eval_results
    assert 'classification_report' in eval_results


def test_cross_validation(trainer):
    """Test cross-validation"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)
    trainer.train()

    cv_metrics = trainer.cross_validate()

    assert 'cv_mean_accuracy' in cv_metrics
    assert 'cv_std_accuracy' in cv_metrics
    assert 'cv_scores' in cv_metrics
    assert 0 <= cv_metrics['cv_mean_accuracy'] <= 1


def test_feature_importance(trainer):
    """Test feature importance extraction"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)
    trainer.train()

    importance = trainer.get_feature_importance()

    assert len(importance) == 4, "Should have 4 feature importances"
    assert all(0 <= v <= 1 for v in importance.values()), "Importances should be between 0 and 1"
    assert np.isclose(sum(importance.values()), 1.0), "Importances should sum to 1"


def test_model_save(trainer, tmp_path):
    """Test model saving"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)
    trainer.train()
    trainer.evaluate()

    output_dir = str(tmp_path)
    model_path = trainer.save_model(output_dir)

    assert Path(model_path).exists(), "Model file should exist"
    assert model_path.endswith('.pkl'), "Model should be saved as .pkl"


def test_metadata_save(trainer, tmp_path):
    """Test metadata saving"""
    X, y = trainer.load_data()
    trainer.split_data(X, y)
    trainer.train()
    trainer.evaluate()

    output_dir = str(tmp_path)
    model_path = trainer.save_model(output_dir)
    trainer.save_metadata(model_path, output_dir)

    metadata_path = Path(output_dir) / "iris_model_metadata.json"
    assert metadata_path.exists(), "Metadata file should exist"
