#!/bin/bash

set -e

# Configuration
CLUSTER_NAME="adhd2e-cluster"
REGION="nyc1"
NODE_POOL_NAME="worker-pool"
NODE_SIZE="s-2vcpu-4gb"
NODE_COUNT=3
SPACES_NAME="adhd2e-backups"
REGISTRY_NAME="adhd2e-registry"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}$1 - Success${NC}"
    else
        echo -e "${RED}$1 - Failed${NC}"
        exit 1
    fi
}

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "doctl is not installed. Please install it first."
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is not installed. Please install it first."
    exit 1
fi

# Authenticate with DigitalOcean (assuming you've already authenticated)
echo "Ensuring DigitalOcean authentication..."
doctl account get > /dev/null 2>&1
print_status "DigitalOcean authentication"

# Create Kubernetes cluster
echo "Creating Kubernetes cluster..."
doctl kubernetes cluster create $CLUSTER_NAME \
    --region $REGION \
    --node-pool name=$NODE_POOL_NAME;size=$NODE_SIZE;count=$NODE_COUNT \
    --wait
print_status "Kubernetes cluster creation"

# Configure kubectl
echo "Configuring kubectl..."
doctl kubernetes cluster kubeconfig save $CLUSTER_NAME
print_status "kubectl configuration"

# Create DigitalOcean Spaces for backups
echo "Creating DigitalOcean Spaces for backups..."
doctl spaces create $SPACES_NAME --region $REGION
print_status "DigitalOcean Spaces creation"

# Create DigitalOcean Container Registry
echo "Creating DigitalOcean Container Registry..."
doctl registry create $REGISTRY_NAME
print_status "Container Registry creation"

# Build and push Docker images
echo "Building and pushing Docker images..."
docker-compose build
docker-compose push
print_status "Docker image build and push"

# Apply Kubernetes configurations
echo "Applying Kubernetes configurations..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
print_status "Kubernetes configuration application"

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment --all -n adhd2e
print_status "Deployment readiness"

# Set up monitoring and logging
echo "Setting up monitoring and logging..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
helm install elk elastic/elasticsearch --namespace logging --create-namespace
print_status "Monitoring and logging setup"

# Display cluster info and next steps
echo "Deployment completed successfully!"
echo "Cluster info:"
kubectl cluster-info
echo ""
echo "Next steps:"
echo "1. Configure your domain's DNS to point to the Load Balancer IP"
echo "2. Set up SSL certificates using Let's Encrypt"
echo "3. Configure backup schedules for MongoDB and Neo4j"
echo "4. Set up CI/CD pipelines in CircleCI"
echo "5. Monitor the cluster and adjust resources as needed"