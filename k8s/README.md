# Kubernetes Deployment für Iris Classifier

Production-ready Kubernetes Manifeste mit Kustomize für 3 Umgebungen (dev, staging, prod).

## Struktur

```
k8s/
├── base/                    # Base Manifeste (gemeinsam für alle Env.)
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
│
└── overlays/                # Umgebungs-spezifische Anpassungen
    ├── dev/                 # Development: 1 Replica
    │   ├── kustomization.yaml
    │   └── deployment-patch.yaml
    ├── staging/             # Staging: 3 Replicas
    │   ├── kustomization.yaml
    │   └── deployment-patch.yaml
    └── prod/                # Production: 5 Replicas
        ├── kustomization.yaml
        └── deployment-patch.yaml
```

## Features

✅ **3 Namespaces** — iris-dev, iris-staging, iris-prod  
✅ **Rolling Updates** — Zero downtime deployments  
✅ **HorizontalPodAutoscaler** — CPU & Memory based scaling  
✅ **Liveness & Readiness Probes** — Health checks  
✅ **Pod Anti-Affinity** — Spread across nodes  
✅ **Resource Limits** — CPU/Memory per environment  
✅ **Prometheus Rules** — Alerting  
✅ **NetworkPolicy** — Security  
✅ **Ingress** — External access  
✅ **ServiceAccount + RBAC** — Least privilege  

## Deployment

### Voraussetzungen

```bash
# Kubernetes Cluster
kubectl cluster-info

# Kustomize (built-in mit kubectl 1.14+)
kubectl version

# Docker Image
docker build -f api/Dockerfile -t iris-api:latest .
docker tag iris-api:latest iris-api:staging
docker tag iris-api:latest iris-api:v1.0.0
```

### Development

```bash
# Preview
kubectl kustomize k8s/overlays/dev

# Apply
kubectl apply -k k8s/overlays/dev

# Check
kubectl get all -n iris-dev
kubectl logs -n iris-dev deployment/iris-api -f

# Test
kubectl port-forward -n iris-dev svc/iris-api 8080:80
curl http://localhost:8080/health
```

### Staging

```bash
# Apply
kubectl apply -k k8s/overlays/staging

# Rollout Status
kubectl rollout status -n iris-staging deployment/iris-api

# Scale manually
kubectl scale -n iris-staging deployment/iris-api --replicas=5
```

### Production

```bash
# Apply
kubectl apply -k k8s/overlays/prod

# Monitor
kubectl get pods -n iris-prod -l app=iris-api -w

# Get LoadBalancer IP
kubectl get svc -n iris-prod iris-api-lb

# Watch HPA
kubectl get hpa -n iris-prod -w
```

## Kustomize Besonderheiten

### Bases (gemeinsam)
- Deployment mit 3 Replicas (default)
- Service (ClusterIP)
- ConfigMap mit allgemeinen Werten
- HPA (2-10 Replicas)
- Probes (liveness, readiness)
- Resource Requests/Limits

### Dev Overlay
- 1 Replica (schnelle Tests)
- Kleine Resources (50m CPU, 128Mi RAM)
- Debug Logging
- Imagepull: Always

### Staging Overlay
- 3 Replicas
- Mittlere Resources (100m CPU, 256Mi RAM)
- Info Logging
- Tag: `staging`

### Prod Overlay
- 5 Replicas
- Große Resources (200m CPU, 512Mi RAM)
- Warn Logging
- Strikte Pod Anti-Affinity
- HPA: 5-20 Replicas
- Image Tag: `v1.0.0`

## Wichtige Kommandos

```bash
# Validate
kubectl kustomize k8s/overlays/dev | kubectl apply --dry-run=client -f -

# Apply
kubectl apply -k k8s/overlays/dev

# Update Image
kubectl set image -n iris-dev deployment/iris-api \
  iris-api=iris-api:v1.0.1

# Rollback
kubectl rollout undo -n iris-dev deployment/iris-api

# Delete
kubectl delete -k k8s/overlays/dev

# Get Events
kubectl get events -n iris-dev --sort-by='.lastTimestamp'

# Describe Pod
kubectl describe pod -n iris-dev <pod-name>

# Exec Shell
kubectl exec -it -n iris-dev <pod-name> -- /bin/bash

# Port Forward
kubectl port-forward -n iris-dev svc/iris-api 8080:80

# Logs
kubectl logs -n iris-dev deployment/iris-api -f --all-containers

# Scale Manual
kubectl scale -n iris-dev deployment/iris-api --replicas=3

# Get Resources
kubectl get all -n iris-prod
kubectl get hpa,networkpolicy,ingress -n iris-prod
```

## Scaling

### HorizontalPodAutoscaler

**Dev:**
- Min: 2, Max: 10
- CPU: 70%, Memory: 80%

**Prod:**
- Min: 5, Max: 20
- CPU: 70%, Memory: 80%

### Manual Scaling

```bash
kubectl scale -n iris-prod deployment/iris-api --replicas=7
```

## Monitoring & Alerting

### Prometheus Rules (alerts aktiviert)

```bash
kubectl apply -f k8s/base/prometheus-rules.yaml
```

### Alerts

- **IrisAPIDown** — API unreachable > 5 min
- **HighErrorRate** — Error rate > 5% für 5 min
- **HighLatency** — p99 latency > 500ms für 10 min
- **PodCrashLooping** — Too many restarts
- **OutOfMemory** — Memory usage > 90%

## Sicherheit

### NetworkPolicy

Nur Traffic erlaubt:
- Ingress: Von nginx-ingress & prometheus
- Egress: DNS (UDP 53)

### Pod Security

- runAsNonRoot: true
- runAsUser: 1000
- readOnlyRootFilesystem: false
- allowPrivilegeEscalation: false
- Capabilities: DROP ALL

### RBAC

- ServiceAccount: iris-api
- Role: read configmaps, read secrets
- RoleBinding: iris-api → ServiceAccount

## Ingress

```bash
# Wenn Nginx Ingress Controller installed:
kubectl apply -f k8s/base/ingress.yaml

# Für Localhost Testing:
echo "127.0.0.1 api.iris.local" >> /etc/hosts

# Access
curl http://api.iris.local/health
```

## Nächste Schritte

### ArgoCD GitOps

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Create Application
kubectl apply -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: iris-api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-repo/iris
    targetRevision: HEAD
    path: k8s/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: iris-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
```

### Helm Chart (optional)

```bash
# Convert zu Helm Chart
helm create iris-api
# Copy manifests in charts/iris-api/templates/
```

## Troubleshooting

### Pod pending

```bash
kubectl describe pod -n iris-dev <pod-name>
# Check: Resource requests, node availability, PVC
```

### Image pull errors

```bash
kubectl describe pod -n iris-dev <pod-name>
# Solution: Sicherstelle Docker Image existiert
docker images | grep iris-api
```

### CrashLoopBackOff

```bash
kubectl logs -n iris-dev deployment/iris-api -f
# Überprüfe: Model Path, Dependencies, Env. Vars
```

### HPA not scaling

```bash
kubectl describe hpa -n iris-prod iris-api-hpa
kubectl get metrics pod -n iris-prod
# Sicherstelle: Metrics Server installed
```

## Referenzen

- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Kustomize](https://kustomize.io/)
- [Kube Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
