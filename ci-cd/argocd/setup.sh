#!/bin/bash

# ArgoCD Installation & Setup Script

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        ArgoCD Installation & Configuration                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found"
    exit 1
fi

echo "✅ kubectl found"

# 1. Create namespace
echo ""
echo "📦 Creating argocd namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Namespace created"

# 2. Install ArgoCD
echo ""
echo "📦 Installing ArgoCD..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
echo "✅ ArgoCD installed"

# 3. Wait for ArgoCD to be ready
echo ""
echo "⏳ Waiting for ArgoCD to be ready..."
kubectl wait --for=condition=available --timeout=300s -n argocd deployment/argocd-server || true
kubectl wait --for=condition=available --timeout=300s -n argocd deployment/argocd-application-controller || true
echo "✅ ArgoCD ready"

# 4. Get initial password
echo ""
echo "🔑 Retrieving initial admin password..."
INITIAL_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "Initial password: $INITIAL_PASSWORD"

# 5. Create secret for GitHub/Git
echo ""
echo "🔐 Setting up Git repository access..."
read -p "Enter your GitHub token (or press Enter to skip): " GITHUB_TOKEN

if [ -n "$GITHUB_TOKEN" ]; then
    kubectl create secret generic -n argocd github-credentials \
        --from-literal=username=git \
        --from-literal=password="$GITHUB_TOKEN" \
        --dry-run=client -o yaml | kubectl apply -f -
    echo "✅ GitHub credentials configured"
fi

# 6. Apply Applications
echo ""
echo "📋 Applying ArgoCD Applications..."

kubectl apply -f ci-cd/argocd/iris-staging.yaml
echo "✅ Staging application created"

kubectl apply -f ci-cd/argocd/iris-prod.yaml
echo "✅ Production application created"

# 7. Port forward
echo ""
echo "🌐 Setting up port forwarding..."
echo "Access ArgoCD UI: http://localhost:8443"
echo "Username: admin"
echo "Password: $INITIAL_PASSWORD"
echo ""
echo "Run this in another terminal:"
echo "  kubectl port-forward -n argocd svc/argocd-server -n argocd 8443:443"
echo ""

# 8. Show status
echo "📊 ArgoCD Status:"
kubectl get all -n argocd
echo ""
echo "📋 Applications:"
kubectl get applications -n argocd
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              ✅ Setup Complete!                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Port forward: kubectl port-forward -n argocd svc/argocd-server -n argocd 8443:443"
echo "2. Open: https://localhost:8443"
echo "3. Login: admin / $INITIAL_PASSWORD"
echo "4. Change password in UI"
echo ""
