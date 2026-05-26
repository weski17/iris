#!/bin/bash

# Jenkins Installation Script (Docker)

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Jenkins Installation (Docker)                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found"
    exit 1
fi

echo "✅ Docker found"

# Create Jenkins volume
echo ""
echo "📦 Creating Jenkins volume..."
docker volume create jenkins_data

# Start Jenkins container
echo ""
echo "🚀 Starting Jenkins container..."
docker run -d \
  --name jenkins \
  -p 8000:8080 \
  -p 50000:50000 \
  -v jenkins_data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/.kube/config:/var/jenkins_home/.kube/config:ro \
  jenkins/jenkins:lts

echo "✅ Jenkins started"

# Wait for Jenkins
echo ""
echo "⏳ Waiting for Jenkins to start..."
sleep 10

# Get initial password
echo ""
echo "🔑 Retrieving initial admin password..."
INITIAL_PASSWORD=$(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword)
echo "Initial password: $INITIAL_PASSWORD"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              ✅ Setup Complete!                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Access Jenkins:"
echo "  URL: http://localhost:8000"
echo "  Password: $INITIAL_PASSWORD"
echo ""
echo "Setup Steps:"
echo "1. Open http://localhost:8000"
echo "2. Enter password: $INITIAL_PASSWORD"
echo "3. Install suggested plugins"
echo "4. Create admin user"
echo "5. Create new Pipeline job"
echo "6. Use Pipeline script from SCM (Git)"
echo "7. Set Git repository: https://github.com/your-repo/iris.git"
echo "8. Set Script path: ci-cd/jenkins/Jenkinsfile"
echo ""
echo "Required Jenkins Plugins:"
echo "  - Pipeline"
echo "  - Docker"
echo "  - Kubernetes"
echo "  - Git"
echo "  - Blue Ocean"
echo ""
echo "Required Credentials:"
echo "  - docker-registry-url"
echo "  - docker-registry-user"
echo "  - docker-registry-pass"
echo "  - kubeconfig (K8s config file)"
echo "  - slack-webhook (for notifications)"
echo ""
