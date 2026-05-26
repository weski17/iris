#!/usr/bin/env python3
"""
Iris Classification Model Training Pipeline
Trains a RandomForestClassifier with MLflow experiment tracking
"""
import re
import os
import json
import yaml
import logging
from pathlib import Path
from datetime import datetime
from typing import Tuple, Dict, Any

import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
import joblib
import mlflow
import mlflow.sklearn

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class IrisModelTrainer:
    def __init__(self, config_path: str = "ml/config.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.model = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.feature_names = None
        self.target_names = None
        self.metrics = {}

    def _load_config(self) -> Dict[str, Any]:
        """Load YAML configuration"""
        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)

    def load_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Load Iris dataset"""
        logger.info("Loading Iris dataset...")
        iris = load_iris()
        X = iris.data
        y = iris.target
        self.feature_names = iris.feature_names
        self.target_names = iris.target_names
        logger.info(f"Dataset loaded: {X.shape[0]} samples, {X.shape[1]} features")
        return X, y

    def split_data(self, X: np.ndarray, y: np.ndarray) -> None:
        """Split data into train/test sets with stratification"""
        config = self.config['data']
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y,
            test_size=config['test_size'],
            random_state=config['random_state'],
            stratify=y if config['stratify'] else None
        )
        logger.info(
            f"Data split: {self.X_train.shape[0]} train, "
            f"{self.X_test.shape[0]} test samples"
        )

    def train(self) -> None:
        """Train RandomForestClassifier"""
        logger.info("Training RandomForestClassifier...")
        model_config = self.config['model']['hyperparameters']
        self.model = RandomForestClassifier(**model_config)
        self.model.fit(self.X_train, self.y_train)
        logger.info("Model training completed")

    def cross_validate(self) -> Dict[str, float]:
        """Perform k-fold cross-validation"""
        logger.info(f"Running {self.config['training']['cv_folds']}-fold cross-validation...")
        cv_scores = cross_val_score(
            self.model,
            self.X_train,
            self.y_train,
            cv=self.config['training']['cv_folds'],
            scoring='accuracy'
        )
        cv_metrics = {
            'cv_mean_accuracy': float(cv_scores.mean()),
            'cv_std_accuracy': float(cv_scores.std()),
            'cv_scores': cv_scores.tolist()
        }
        logger.info(f"CV Accuracy: {cv_metrics['cv_mean_accuracy']:.4f} (+/- {cv_metrics['cv_std_accuracy']:.4f})")
        return cv_metrics

    def evaluate(self) -> Dict[str, Any]:
        """Evaluate model on test set"""
        logger.info("Evaluating model on test set...")
        y_pred = self.model.predict(self.X_test)
        y_pred_proba = self.model.predict_proba(self.X_test)

        self.metrics = {
            'accuracy': float(accuracy_score(self.y_test, y_pred)),
            'precision_weighted': float(precision_score(self.y_test, y_pred, average='weighted')),
            'recall_weighted': float(recall_score(self.y_test, y_pred, average='weighted')),
            'f1_weighted': float(f1_score(self.y_test, y_pred, average='weighted')),
        }

        # Per-class metrics
        for i, class_name in enumerate(self.target_names):
            precision_class = precision_score(self.y_test, y_pred, labels=[i], average='macro')
            recall_class = recall_score(self.y_test, y_pred, labels=[i], average='macro')
            self.metrics[f'precision_{class_name}'] = float(precision_class)
            self.metrics[f'recall_{class_name}'] = float(recall_class)

        logger.info(f"Test Accuracy: {self.metrics['accuracy']:.4f}")
        logger.info(f"Precision (weighted): {self.metrics['precision_weighted']:.4f}")
        logger.info(f"Recall (weighted): {self.metrics['recall_weighted']:.4f}")

        return {
            'metrics': self.metrics,
            'predictions': y_pred.tolist(),
            'probabilities': y_pred_proba.tolist(),
            'confusion_matrix': confusion_matrix(self.y_test, y_pred).tolist(),
            'classification_report': classification_report(self.y_test, y_pred, output_dict=True)
        }

    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importances from the model"""
        importance_dict = {}
        for feature_name, importance in zip(self.feature_names, self.model.feature_importances_):
            importance_dict[feature_name] = float(importance)
        return importance_dict

    def save_model(self, output_dir: str = "ml/models") -> str:
        """Save model using joblib"""
        Path(output_dir).mkdir(exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_path = f"{output_dir}/iris_model_{timestamp}.pkl"
        joblib.dump(self.model, model_path)
        logger.info(f"Model saved to {model_path}")

        # Also save the latest model
        latest_path = f"{output_dir}/iris_model_latest.pkl"
        joblib.dump(self.model, latest_path)
        logger.info(f"Latest model saved to {latest_path}")

        return model_path

    def save_metadata(self, model_path: str, output_dir: str = "ml/models") -> None:
        """Save model metadata"""
        metadata = {
            'model_path': model_path,
            'training_date': datetime.now().isoformat(),
            'feature_names': list(self.feature_names),
            'target_names': list(self.target_names),
            'metrics': self.metrics,
            'feature_importance': self.get_feature_importance(),
            'data_split': {
                'test_size': self.config['data']['test_size'],
                'random_state': self.config['data']['random_state'],
                'train_samples': int(self.X_train.shape[0]),
                'test_samples': int(self.X_test.shape[0])
            },
            'hyperparameters': self.config['model']['hyperparameters']
        }

        metadata_path = f"{output_dir}/iris_model_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"Metadata saved to {metadata_path}")

    def run(self) -> None:
        """Full training pipeline with MLflow tracking"""
        mlflow.set_tracking_uri(self.config['mlflow']['tracking_uri'])
        mlflow.set_experiment(self.config['mlflow']['experiment_name'])

        with mlflow.start_run():
            # Load and split data
            X, y = self.load_data()
            self.split_data(X, y)

            # Train model
            self.train()

            # Cross-validation
            cv_metrics = self.cross_validate()

            # Evaluate
            eval_results = self.evaluate()

            # Get feature importance
            feature_importance = self.get_feature_importance()

            # Log to MLflow
            logger.info("Logging metrics and artifacts to MLflow...")

            # Log hyperparameters
            for key, value in self.config['model']['hyperparameters'].items():
                mlflow.log_param(f"model_{key}", value)

            # Log metrics
            for metric_name, metric_value in self.metrics.items():
                mlflow.log_metric(metric_name, metric_value)

            for cv_metric_name, cv_metric_value in cv_metrics.items():
                if cv_metric_name != 'cv_scores':
                    mlflow.log_metric(cv_metric_name, cv_metric_value)

            # Log feature importance
            for feature, importance in feature_importance.items():
                safe_feature = re.sub(r"[^a-zA-Z0-9_.\-/ ]", "", feature)
                safe_feature = safe_feature.replace(" ", "_")

                mlflow.log_metric(
                    f"feature_importance_{safe_feature}",
                    importance
                )

            # Log model
            mlflow.sklearn.log_model(self.model, "model")

            # Save locally
            model_path = self.save_model()
            self.save_metadata(model_path)

            # Log artifacts
            mlflow.log_artifact("ml/config.yaml")
            mlflow.log_artifact("ml/models/iris_model_metadata.json")

            # Log evaluation results as artifact
            eval_artifact_path = "ml/models/evaluation_results.json"
            with open(eval_artifact_path, 'w') as f:
                json.dump(eval_results, f, indent=2)
            mlflow.log_artifact(eval_artifact_path)

            logger.info(f"MLflow Run ID: {mlflow.active_run().info.run_id}")
            logger.info("✅ Training pipeline completed successfully")


if __name__ == "__main__":
    trainer = IrisModelTrainer("ml/config.yaml")
    trainer.run()
