# CI/CD Pipeline - Jenkins + ArgoCD

Production-ready CI/CD mit Jenkins (Build/Test) und ArgoCD (Deploy/GitOps).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub / Git Repo                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │        Jenkins (CI)                    │
        ├───────────────────────────────────────┤
        │ Stage 1: Test (pytest, cargo test)   │
        │ Stage 2: Build (Docker Image)        │
        │ Stage 3: Push (Registry)             │
        │ Stage 4: Deploy Staging              │
        │ Stage 5: Integration Tests           │
        │ Stage 6: Deploy Prod (Manual)        │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │   Docker Registry (Hub/ECR)           │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │      ArgoCD (GitOps)                  │
        ├───────────────────────────────────────┤
        │ Monitoring: K8s Repo (Git)           │
        │ Auto-sync: Staging                   │
        │ Manual-sync: Production              │
        │ Rollback: Available                  │
        └───────────────┬───────────────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────────┐   ┌──────────────────┐
    │  iris-staging    │   │   iris-prod      │
    │  (Auto-deploy)   │   │  (Manual-deploy) │
    └──────────────────┘   └──────────────────┘
```

---

## 📋 Jenkins Pipeline Stages

| Stage | Action | Duration |
|-------|--------|----------|
| **Checkout** | Clone Git repo | ~10s |
| **Test ML** | pytest ml/ | ~30s |
| **Test API** | pytest api/ | ~30s |
| **Lint** | flake8, pylint | ~20s |
| **Build** | docker build | ~2min |
| **Push** | docker push | ~1min |
| **Deploy Staging** | kubectl apply | ~1min |
| **Integration Tests** | smoke tests | ~1min |
| **Approval** | Manual approval | ⏸️ |
| **Deploy Prod** | kubectl apply | ~2min |
| **Smoke Tests Prod** | verify prod | ~1min |

**Total Duration:** ~8 minutes (excl. approval wait)

---

## 🚀 Quick Start

### Option 1: Docker Compose (Local)

```bash
cd ci-cd

# Start Jenkins + ArgoCD
docker-compose up -d

# Access Jenkins
# http://localhost:8000

# Access ArgoCD
# https://localhost:8443
```

### Option 2: Manual Setup

**Jenkins:**
```bash
chmod +x ci-cd/jenkins/setup.sh
./ci-cd/jenkins/setup.sh
```

**ArgoCD:**
```bash
chmod +x ci-cd/argocd/setup.sh
./ci-cd/argocd/setup.sh
```

---

## 🔧 Jenkins Setup

### 1. Initial Access

```bash
# Get password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Access: http://localhost:8000
```

### 2. Install Plugins

**Recommended Plugins:**
- Pipeline
- Docker
- Kubernetes
- Git
- Blue Ocean
- Slack Notification
- Email Extension
- AnsiColor

### 3. Create Credentials

```bash
# In Jenkins UI: Manage Jenkins → Credentials

docker-registry-url      # docker.io
docker-registry-user     # your-docker-user
docker-registry-pass     # your-docker-token
kubeconfig              # ~/.kube/config (file)
slack-webhook           # https://hooks.slack.com/...
```

### 4. Create Pipeline Job

1. **New Item** → **Pipeline**
2. **Name:** iris-api-pipeline
3. **Pipeline** section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/your-repo/iris.git`
   - Script Path: `ci-cd/jenkins/Jenkinsfile`
4. **Build Triggers**: GitHub hook trigger
5. **Save**

### 5. GitHub Webhook

In GitHub → Settings → Webhooks → Add webhook:

```
Payload URL: http://jenkins.your-domain/github-webhook/
Content type: application/json
Events: Push events
```

---

## 🎯 ArgoCD Setup

### 1. Create Namespace

```bash
kubectl create namespace argocd
```

### 2. Install ArgoCD

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Get Initial Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 4. Port Forward

```bash
kubectl port-forward -n argocd svc/argocd-server -n argocd 8443:443
```

### 5. Access UI

```
https://localhost:8443
Username: admin
Password: (from step 3)
```

### 6. Add Applications

```bash
# Staging (Auto-sync)
kubectl apply -f ci-cd/argocd/iris-staging.yaml

# Production (Manual-sync)
kubectl apply -f ci-cd/argocd/iris-prod.yaml
```

---

## 🔄 Workflow

### Push to main branch

```
1. Push commit to main
2. GitHub webhook triggers Jenkins
3. Jenkins runs pipeline:
   - ✅ Tests pass
   - ✅ Docker image built
   - ✅ Image pushed to registry
   - ✅ Auto-deploy to staging
   - ✅ Integration tests pass
   - ⏸️ Waits for manual approval
4. Click "Approve" in Jenkins
5. Deploy to production
```

### ArgoCD Auto-Sync (Staging)

```
1. Update k8s/overlays/staging/*.yaml in Git
2. ArgoCD detects change (every 3 minutes)
3. Auto-deploys to iris-staging
4. Health checks pass
```

### ArgoCD Manual-Sync (Production)

```
1. In ArgoCD UI: Applications → iris-api-prod
2. Click "Sync"
3. Confirm deployment
4. ArgoCD deploys to iris-prod
5. Status shown in real-time
```

---

## 📊 Monitoring

### Jenkins

- **Dashboard:** http://localhost:8000
- **Blue Ocean:** http://localhost:8000/blue
- **Build History:** Last 10 builds kept
- **Logs:** Each stage logged

### ArgoCD

- **Dashboard:** https://localhost:8443
- **Applications:** iris-api-staging, iris-api-prod
- **Sync Status:** Real-time
- **Resource Status:** Pods, services, etc.
- **History:** Last 10 syncs

---

## 🚨 Alerts & Notifications

### Jenkins

```groovy
// Slack notifications
curl -X POST ${SLACK_WEBHOOK} \
    -d '{"text":"Build #${BUILD_NUMBER} completed"}'
```

### ArgoCD

- Slack integration
- Email notifications
- GitHub status checks
- Custom webhooks

---

## 🔐 Security Best Practices

### Jenkins

✅ Use credentials manager (never hardcode)
✅ Rotate Docker credentials regularly
✅ Use service accounts for K8s
✅ Enable authentication
✅ Use SSL/TLS

### ArgoCD

✅ Enable RBAC
✅ Use Git over HTTPS
✅ Encrypt secrets at rest
✅ Audit logging
✅ Network policies

---

## 🛠️ Troubleshooting

### Jenkins

```bash
# Logs
docker logs iris-jenkins

# Inside container
docker exec -it iris-jenkins bash

# Clear cache
docker exec iris-jenkins bash -c "rm -rf /var/jenkins_home/.cache"
```

### ArgoCD

```bash
# Check application status
kubectl get applications -n argocd

# View logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server

# Manual sync
kubectl patch app iris-api-prod -p '{"operation":"sync"}' --type merge
```

### Build Failures

```bash
# View Jenkins logs
kubectl logs -f deployment/iris-jenkins -n jenkins

# Check image push
docker images | grep iris-api

# K8s deployment issues
kubectl describe deployment iris-api -n iris-staging
```

---

## 📈 Scaling

### Jenkins

- Use Jenkins Agents for parallel builds
- Docker-in-Docker for containerized builds
- Kubernetes Plugin for dynamic agents

### ArgoCD

- Install ArgoCD at scale for 1000+ apps
- Use AppProject for RBAC
- Enable sharding for high throughput

---

## 🔄 Rollback Strategy

### Manual Rollback (ArgoCD)

```bash
# View sync history
kubectl get application iris-api-prod -o yaml | grep -A5 history

# Rollback to previous sync
argocd app rollback iris-api-prod <revision>
```

### Automatic Rollback

```yaml
# In ArgoCD Application
syncPolicy:
  failurePolicy:
    abort:
      enabled: true
```

---

## 🚀 Next Steps

1. **GitHub Setup:** Add webhook
2. **Configure Jenkins:** Credentials, job
3. **Deploy ArgoCD:** Applications
4. **Test Pipeline:** Push to main
5. **Monitor:** Check Jenkins + ArgoCD
6. **Iterate:** Improve pipeline

---

## 📚 References

- [Jenkins Docs](https://www.jenkins.io/doc/)
- [ArgoCD Docs](https://argo-cd.readthedocs.io/)
- [GitOps Best Practices](https://codefresh.io/learn/gitops/)
- [Kubernetes Deployment Patterns](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
