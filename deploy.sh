#!/bin/bash

set -e

# Check for .env file
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please run initial_setup.sh first."
    exit 1
fi

# Load environment variables
source .env

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

# Authenticate with DigitalOcean
echo "Authenticating with DigitalOcean..."
doctl auth init --access-token $DIGITALOCEAN_TOKEN
print_status "DigitalOcean authentication"

# Configure kubectl
echo "Configuring kubectl..."
echo $KUBE_CONFIG | base64 -d > kubeconfig.yaml
export KUBECONFIG=./kubeconfig.yaml
print_status "kubectl configuration"

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

# Set up DigitalOcean Monitoring
echo "Setting up DigitalOcean Monitoring..."
doctl kubernetes cluster update $CLUSTER_NAME --update-kubeconfig --set-current-context
doctl kubernetes cluster monitoring enable $CLUSTER_NAME
print_status "DigitalOcean Monitoring setup"

# Display cluster info and next steps
echo "Deployment completed successfully!"
echo "Cluster info:"
kubectl cluster-info
echo ""
echo "Next steps:"
echo "1. Configure your domain's DNS to point to the Load Balancer IP"
echo "2. Set up SSL certificates using Let's Encrypt"
echo "3. Monitor the cluster using DigitalOcean Monitoring and adjust resources as needed"
echo "4. Set up CI/CD pipelines in CircleCI"