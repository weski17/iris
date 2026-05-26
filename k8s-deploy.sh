#!/bin/bash

# Kubernetes Deployment Script
# Deploy Iris API to different environments

set -e

usage() {
    echo ""
    echo "Usage: ./k8s-deploy.sh [environment] [action]"
    echo ""
    echo "Environments:"
    echo "  dev              - Development (1 replica)"
    echo "  staging          - Staging (3 replicas)"
    echo "  prod             - Production (5 replicas)"
    echo ""
    echo "Actions:"
    echo "  apply            - Apply/Update deployment"
    echo "  delete           - Delete deployment"
    echo "  status           - Show deployment status"
    echo "  logs             - Show pod logs"
    echo "  port-forward     - Port forward (8080:80)"
    echo "  scale [n]        - Scale to N replicas"
    echo ""
    echo "Examples:"
    echo "  ./k8s-deploy.sh dev apply"
    echo "  ./k8s-deploy.sh prod status"
    echo "  ./k8s-deploy.sh staging logs"
    echo "  ./k8s-deploy.sh prod scale 10"
    echo ""
}

if [ $# -lt 2 ]; then
    usage
    exit 1
fi

ENV=$1
ACTION=$2
NAMESPACE="iris-${ENV}"
OVERLAY_PATH="k8s/overlays/${ENV}"

if [ ! -d "$OVERLAY_PATH" ]; then
    echo "❌ Invalid environment: $ENV"
    usage
    exit 1
fi

case $ACTION in
    apply)
        echo "🚀 Deploying Iris API to $ENV..."
        kubectl apply -k "$OVERLAY_PATH"
        echo "✅ Deployment applied"
        echo ""
        echo "Checking rollout status..."
        kubectl rollout status -n "$NAMESPACE" deployment/iris-api --timeout=5m
        echo "✅ Rollout complete"
        ;;

    delete)
        echo "🗑️  Deleting Iris API from $ENV..."
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            kubectl delete -k "$OVERLAY_PATH"
            echo "✅ Deployment deleted"
        else
            echo "❌ Cancelled"
            exit 1
        fi
        ;;

    status)
        echo "📊 Deployment Status ($ENV):"
        echo ""
        kubectl get deployment -n "$NAMESPACE" iris-api
        echo ""
        echo "Pods:"
        kubectl get pods -n "$NAMESPACE" -l app=iris-api
        echo ""
        echo "Services:"
        kubectl get svc -n "$NAMESPACE"
        echo ""
        echo "HPA:"
        kubectl get hpa -n "$NAMESPACE"
        ;;

    logs)
        echo "📝 Logs for $ENV:"
        echo ""
        kubectl logs -n "$NAMESPACE" deployment/iris-api -f --all-containers
        ;;

    port-forward)
        echo "🔌 Port forwarding 8080:80 ($ENV)..."
        kubectl port-forward -n "$NAMESPACE" svc/iris-api 8080:80
        ;;

    scale)
        if [ -z "$3" ]; then
            echo "❌ Replicas count required"
            echo "Usage: ./k8s-deploy.sh $ENV scale [count]"
            exit 1
        fi
        REPLICAS=$3
        echo "📈 Scaling to $REPLICAS replicas..."
        kubectl scale -n "$NAMESPACE" deployment/iris-api --replicas="$REPLICAS"
        echo "✅ Scaled to $REPLICAS replicas"
        ;;

    *)
        echo "❌ Invalid action: $ACTION"
        usage
        exit 1
        ;;
esac
