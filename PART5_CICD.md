# PART 5 – CI/CD Pipeline (Jenkins + ArgoCD) ✅

**Complete CI/CD setup mit 2 Optionen:**

## 📋 Included

```
ci-cd/
├── jenkins/
│   ├── Jenkinsfile          # Multi-stage pipeline
│   ├── setup.sh             # Installation script
│   └── README.md            # Documentation
├── argocd/
│   ├── iris-staging.yaml    # Auto-sync app
│   ├── iris-prod.yaml       # Manual-sync app
│   ├── setup.sh             # Installation script
│   └── README.md            # Documentation
├── docker-compose.yml       # Local Jenkins + ArgoCD
└── README.md                # Full CI/CD guide

.github/
└── workflows/
    └── deploy.yml           # GitHub Actions alternative
```

---

## 🚀 Option 1: Jenkins + ArgoCD (Recommended)

### Setup

```bash
# 1. Install Jenkins
chmod +x ci-cd/jenkins/setup.sh
./ci-cd/jenkins/setup.sh

# 2. Install ArgoCD
chmod +x ci-cd/argocd/setup.sh
./ci-cd/argocd/setup.sh

# Or use docker-compose
cd ci-cd
docker-compose up -d
```

### Pipeline Flow

```
Push → Jenkins (Test, Build, Push) → ArgoCD (Deploy) → K8s
```

**Stages:**
1. ✅ Test ML Model
2. ✅ Test API
3. ✅ Lint Code
4. ✅ Build Docker Image
5. ✅ Push to Registry
6. ✅ Deploy Staging (Auto)
7. ✅ Integration Tests
8. ⏸️ Manual Approval
9. ✅ Deploy Production

---

## 🚀 Option 2: GitHub Actions (Fast)

### No Setup Required!

Just push to `main`:

```bash
git push origin main
```

GitHub Actions automatically runs:
1. ✅ Tests
2. ✅ Build
3. ✅ Push to Docker
4. ✅ Deploy Staging
5. ✅ Deploy Production

**Required GitHub Secrets:**

```
DOCKER_USERNAME
DOCKER_TOKEN
KUBECONFIG (base64)
SLACK_WEBHOOK
```

---

## 📊 Comparison

| Feature | Jenkins | GitHub Actions |
|---------|---------|----------------|
| **Setup** | ~5 min | 0 min (built-in) |
| **Cost** | Self-hosted | Free tier available |
| **UI** | Jenkins, Blue Ocean | GitHub UI |
| **Scaling** | Agents | Runners |
| **GitOps** | ArgoCD separate | Integrated |
| **Learning Curve** | Medium | Easy |

---

## 🎯 Workflow

### Jenkins + ArgoCD Workflow

```
1. Push to main branch
   ↓
2. GitHub webhook triggers Jenkins
   ↓
3. Jenkins runs pipeline (8 mins)
   - Tests ✅
   - Build ✅
   - Deploy Staging ✅
   ↓
4. Wait for approval in Jenkins UI
   ↓
5. Click "Deploy" button
   ↓
6. Jenkins deploys to production
   - ArgoCD syncs automatically
   ↓
7. Slack notification
```

### GitHub Actions Workflow

```
1. Push to main branch
   ↓
2. GitHub Actions trigger automatically
   ↓
3. Run tests & build (2 mins)
   ↓
4. Push Docker image
   ↓
5. Deploy to staging
   ↓
6. Run smoke tests
   ↓
7. Manual environment approval
   ↓
8. Deploy to production
   ↓
9. Slack notification
```

---

## 🔐 Required Credentials

### Jenkins

```
docker-registry-url      # docker.io
docker-registry-user     # your-user
docker-registry-pass     # token
kubeconfig              # ~/.kube/config
slack-webhook           # https://hooks.slack.com/...
```

### GitHub Actions

```
DOCKER_USERNAME         # your-docker-user
DOCKER_TOKEN            # docker access token
KUBECONFIG              # base64 encoded ~/.kube/config
SLACK_WEBHOOK           # slack webhook URL
```

---

## 📈 Project Complete! 🎉

```
✅ TEIL 1 – ML Model (Python/scikit-learn)
✅ TEIL 2 – REST API (FastAPI)
✅ TEIL 3 – Frontend (React Native)
✅ TEIL 4 – Docker & Kubernetes
✅ TEIL 5 – CI/CD (Jenkins + ArgoCD + GitHub Actions)
```

---

## 🚀 Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Repository                     │
│  ├─ main branch (production)                            │
│  ├─ develop branch (staging)                            │
│  └─ .github/workflows/deploy.yml                        │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┴──────────────┐
    │                            │
    ▼                            ▼
┌──────────────┐        ┌──────────────────┐
│ GitHub       │        │ Jenkins / Workflow│
│ Actions      │        │ (CI/CD)           │
└──────────────┘        └──────────────────┘
    │                            │
    │     ┌──────────────────────┘
    │     │
    ▼     ▼
┌──────────────────────────────────┐
│      Docker Registry (Hub)       │
│      iris-api:latest             │
│      iris-api:staging            │
│      iris-api:v1.0.0             │
└─────────────┬────────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │   ArgoCD (GitOps)    │
   │ Monitors K8s repo    │
   │ Auto-sync Staging    │
   │ Manual-sync Prod     │
   └──────────┬───────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
┌────────────────┐  ┌────────────────┐
│ iris-staging   │  │  iris-prod     │
│ 3 replicas     │  │  5 replicas    │
│ Auto-deploy    │  │  Manual-deploy │
└────────────────┘  └────────────────┘
```

---

## 📚 Documentation

- **ML:** `ml/README.md`
- **API:** `api/README.md`
- **Frontend:** `frontend/README.md`
- **Kubernetes:** `k8s/README.md`
- **CI/CD:** `ci-cd/README.md`
- **Project:** `README.md`

---

## 🎓 Learning Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitOps Principles](https://opengitops.dev/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

---

**Congratulations! 🎉**

You now have a **production-ready End-to-End ML project** with:

- 🧠 ML Model Training
- 🔌 REST API
- 📱 Mobile Frontend
- 🐳 Docker Containerization
- ☸️ Kubernetes Orchestration
- 🔄 CI/CD Pipeline
- 📊 Monitoring & Alerting
- 🎯 GitOps Deployment

**Next Steps:**

1. Deploy to your K8s cluster: `./k8s-deploy.sh prod apply`
2. Setup GitHub webhooks for Jenkins
3. Configure Slack notifications
4. Monitor with Prometheus + Grafana
5. Track experiments with MLflow
6. Iterate & improve! 🚀
