#!/bin/bash

echo "ADHD 2e AI Agent System - Initial DigitalOcean Setup"

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "doctl is not installed. Please install it first."
    exit 1
fi

# Authenticate with DigitalOcean
echo "Please authenticate with DigitalOcean:"
doctl auth init

# Create Kubernetes cluster
echo "Creating Kubernetes cluster..."
CLUSTER_NAME="adhd2e-cluster"
REGION="nyc1"
doctl kubernetes cluster create $CLUSTER_NAME --region $REGION

# Create Container Registry
echo "Creating Container Registry..."
REGISTRY_NAME="adhd2e-registry"
doctl registry create $REGISTRY_NAME

# Create Spaces for backups
echo "Creating Spaces for backups..."
SPACES_NAME="adhd2e-backups"
doctl spaces create $SPACES_NAME --region $REGION

# Create managed MongoDB database
echo "Creating managed MongoDB database..."
DB_NAME="adhd2e-mongodb"
doctl databases create $DB_NAME --engine mongodb --region $REGION

# Create managed Neo4j database
echo "Creating managed Neo4j database..."
NEO4J_NAME="adhd2e-neo4j"
doctl databases create $NEO4J_NAME --engine neo4j --region $REGION

# Generate and store credentials
echo "Generating .env file with credentials..."
cat << EOF > .env
DIGITALOCEAN_TOKEN=$(doctl auth list --format Access-Token --no-header)
KUBE_CONFIG=$(doctl kubernetes cluster kubeconfig show $CLUSTER_NAME | base64 -w 0)
REGISTRY_NAME=$REGISTRY_NAME
SPACES_NAME=$SPACES_NAME
MONGODB_URI=$(doctl databases connection $DB_NAME --format URI --no-header)
NEO4J_URI=$(doctl databases connection $NEO4J_NAME --format URI --no-header)
EOF

echo "Initial setup complete. Please review the .env file and proceed with the deployment."