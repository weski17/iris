#!/usr/bin/env python3
"""
Model Evaluation Script
Generates detailed evaluation reports with visualizations
"""

import json
import logging
from pathlib import Path

import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris
from sklearn.metrics import (
    confusion_matrix, classification_report, accuracy_score,
    precision_recall_fscore_support
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)


def load_model_and_metadata(model_path: str = "ml/models/iris_model_latest.pkl"):
    """Load model and metadata"""
    model = joblib.load(model_path)
    metadata_path = model_path.replace('iris_model_latest.pkl', 'iris_model_metadata.json')

    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

    return model, metadata


def generate_confusion_matrix_plot(y_true, y_pred, target_names, output_path="ml/models/confusion_matrix.png"):
    """Generate and save confusion matrix heatmap"""
    cm = confusion_matrix(y_true, y_pred)

    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=target_names, yticklabels=target_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    logger.info(f"Confusion matrix saved to {output_path}")
    plt.close()


def generate_feature_importance_plot(model, feature_names, output_path="ml/models/feature_importance.png"):
    """Generate and save feature importance plot"""
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]

    plt.figure(figsize=(10, 6))
    plt.title('Feature Importance')
    plt.bar(range(len(importances)), importances[indices])
    plt.xticks(range(len(importances)), [feature_names[i] for i in indices], rotation=45, ha='right')
    plt.ylabel('Importance')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    logger.info(f"Feature importance plot saved to {output_path}")
    plt.close()


def generate_evaluation_report(model_path: str = "ml/models/iris_model_latest.pkl"):
    """Generate comprehensive evaluation report"""
    logger.info("Loading model and data...")
    model, metadata = load_model_and_metadata(model_path)

    iris = load_iris()
    X, y = iris.data, iris.target
    feature_names = iris.feature_names
    target_names = iris.target_names

    # Get predictions
    y_pred = model.predict(X)
    y_pred_proba = model.predict_proba(X)

    logger.info("Generating evaluation metrics...")

    # Metrics
    accuracy = accuracy_score(y, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y, y_pred, average='weighted')

    report = {
        'overall_metrics': {
            'accuracy': float(accuracy),
            'precision_weighted': float(precision),
            'recall_weighted': float(recall),
            'f1_weighted': float(f1),
        },
        'confusion_matrix': confusion_matrix(y, y_pred).tolist(),
        'classification_report': classification_report(y, y_pred, output_dict=True, target_names=target_names),
        'model_metadata': metadata
    }

    # Save report
    report_path = "ml/models/evaluation_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    logger.info(f"Evaluation report saved to {report_path}")

    # Generate plots
    logger.info("Generating visualizations...")
    generate_confusion_matrix_plot(y, y_pred, target_names)
    generate_feature_importance_plot(model, feature_names)

    # Print report
    print("\n" + "="*60)
    print("IRIS CLASSIFICATION MODEL - EVALUATION REPORT")
    print("="*60)
    print(f"\nOverall Accuracy: {accuracy:.4f}")
    print(f"Precision (weighted): {precision:.4f}")
    print(f"Recall (weighted): {recall:.4f}")
    print(f"F1-Score (weighted): {f1:.4f}")
    print("\nPer-Class Performance:")
    print(classification_report(y, y_pred, target_names=target_names))
    print("="*60 + "\n")


if __name__ == "__main__":
    generate_evaluation_report()
