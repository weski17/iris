#!/bin/bash

# Kubernetes Quick Reference
# Use this script to understand the K8s deployment structure

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════════════╗
║                     KUBERNETES DEPLOYMENT ARCHITECTURE                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

├─ IRIS-DEV (Development)
│  ├─ Namespace: iris-dev
│  ├─ Replicas: 1
│  ├─ Resources: 50m CPU, 128Mi RAM
│  ├─ Logging: DEBUG
│  ├─ HPA: 2-10 (CPU 70%, Memory 80%)
│  └─ Image: iris-api:latest
│
├─ IRIS-STAGING (Staging)
│  ├─ Namespace: iris-staging
│  ├─ Replicas: 3
│  ├─ Resources: 100m CPU, 256Mi RAM
│  ├─ Logging: INFO
│  ├─ HPA: 2-10 (CPU 70%, Memory 80%)
│  └─ Image: iris-api:staging
│
└─ IRIS-PROD (Production)
   ├─ Namespace: iris-prod
   ├─ Replicas: 5
   ├─ Resources: 200m CPU, 512Mi RAM
   ├─ Logging: WARN
   ├─ HPA: 5-20 (CPU 70%, Memory 80%)
   ├─ Pod Anti-Affinity: REQUIRED
   └─ Image: iris-api:v1.0.0

╔═══════════════════════════════════════════════════════════════════════════╗
║                           COMPONENTS                                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌─ DEPLOYMENT
│  ├─ Rolling Update Strategy (maxSurge: 1, maxUnavailable: 0)
│  ├─ Health Checks
│  │  ├─ Liveness Probe (port 8080, /health, 10s interval)
│  │  └─ Readiness Probe (port 8080, /health, 5s interval)
│  ├─ PreStop Hook (15s graceful shutdown)
│  └─ Pod Anti-Affinity (spread across nodes)
│
├─ SERVICE
│  ├─ Cluster IP (internal access)
│  └─ LoadBalancer (external access)
│
├─ HPA (Horizontal Pod Autoscaler)
│  ├─ Target: CPU 70%
│  ├─ Target: Memory 80%
│  └─ Scaling: 30s up, 300s down
│
├─ CONFIGMAP
│  ├─ API_HOST
│  ├─ API_PORT
│  ├─ API_LOG_LEVEL
│  └─ MODEL_PATH
│
├─ SERVICEACCOUNT + RBAC
│  ├─ Read ConfigMaps
│  └─ Read Secrets
│
├─ NETWORK POLICY
│  ├─ Ingress: nginx-ingress, prometheus
│  └─ Egress: DNS only
│
├─ PROMETHEUS RULES
│  ├─ Alert: API Down (>5min)
│  ├─ Alert: High Error Rate (>5% for 5min)
│  ├─ Alert: High Latency (p99 >500ms)
│  ├─ Alert: Pod Crash Loop
│  └─ Alert: Out of Memory (>90%)
│
└─ INGRESS
   ├─ Host: api.iris.local
   ├─ SSL/TLS: auto (cert-manager)
   └─ Rate Limit: 100 req/s

╔═══════════════════════════════════════════════════════════════════════════╗
║                          KEY COMMANDS                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝

DEPLOY:
  ./k8s-deploy.sh dev apply               # Deploy to dev
  ./k8s-deploy.sh staging apply           # Deploy to staging
  ./k8s-deploy.sh prod apply              # Deploy to production

STATUS:
  ./k8s-deploy.sh prod status             # Check deployment status
  kubectl rollout status -n iris-prod deployment/iris-api

SCALING:
  ./k8s-deploy.sh prod scale 8            # Scale to 8 replicas
  kubectl autoscale deployment iris-api --min=2 --max=10

DEBUGGING:
  ./k8s-deploy.sh dev logs                # View logs
  kubectl exec -it -n iris-dev <pod-name> -- /bin/bash
  kubectl describe pod -n iris-dev <pod-name>

CLEANUP:
  ./k8s-deploy.sh prod delete             # Delete production deployment
  kubectl delete namespace iris-prod

VERIFICATION:
  kubectl kustomize k8s/overlays/prod | less  # Review manifests
  kubectl apply -k k8s/overlays/prod --dry-run=client

╔═══════════════════════════════════════════════════════════════════════════╗
║                      KUSTOMIZE STRUCTURE                                  ║
╚═══════════════════════════════════════════════════════════════════════════╝

BASE (k8s/base/)
  │
  ├─ namespaces.yaml ────────────── All 3 namespaces
  ├─ configmap.yaml ─────────────── Config per env
  ├─ deployment.yaml ────────────── Main deployment (3 replicas)
  ├─ service.yaml ───────────────── ClusterIP + LoadBalancer
  ├─ hpa.yaml ───────────────────── Autoscaling config
  ├─ serviceaccount.yaml ────────── RBAC
  ├─ prometheus-rules.yaml ──────── Alert rules
  ├─ ingress.yaml ───────────────── External access
  ├─ networkpolicy.yaml ─────────── Network security
  └─ kustomization.yaml ─────────── Base config
         │
         ├─ Patches ──────────────┬─── overlays/dev
         │                       ├─── overlays/staging
         │                       └─── overlays/prod
         │
         └─ Customizations:
            ├─ replicas
            ├─ resources
            ├─ logging level
            └─ image tag

╔═══════════════════════════════════════════════════════════════════════════╗
║                      FILE TREE                                             ║
╚═══════════════════════════════════════════════════════════════════════════╝

k8s/
├── README.md ────────────────────── Documentation
├── base/
│   ├── namespaces.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── serviceaccount.yaml
│   ├── prometheus-rules.yaml
│   ├── ingress.yaml
│   ├── networkpolicy.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── deployment-patch.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── deployment-patch.yaml
    └── prod/
        ├── kustomization.yaml
        └── deployment-patch.yaml

EOF
