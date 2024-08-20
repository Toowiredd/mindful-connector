# PowerShell Deployment Script for Windows 11

# Check if doctl is installed
if (!(Get-Command doctl -ErrorAction SilentlyContinue)) {
    Write-Error "doctl is not installed. Please install it first."
    exit 1
}

# Check if kubectl is installed
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Error "kubectl is not installed. Please install it first."
    exit 1
}

# Configuration
$CLUSTER_NAME = "adhd2e-cluster"
$REGION = "nyc1"
$NODE_POOL_NAME = "worker-pool"
$NODE_SIZE = "s-2vcpu-4gb"
$NODE_COUNT = 3
$SPACES_NAME = "adhd2e-backups"
$REGISTRY_NAME = "adhd2e-registry"

# Function to print colored output
function Print-Status($message, $success) {
    if ($success) {
        Write-Host $message -ForegroundColor Green
    } else {
        Write-Host $message -ForegroundColor Red
        exit 1
    }
}

# Authenticate with DigitalOcean
Write-Host "Ensuring DigitalOcean authentication..."
doctl account get | Out-Null
Print-Status "DigitalOcean authentication" $?

# Create Kubernetes cluster
Write-Host "Creating Kubernetes cluster..."
doctl kubernetes cluster create $CLUSTER_NAME `
    --region $REGION `
    --node-pool "name=$NODE_POOL_NAME;size=$NODE_SIZE;count=$NODE_COUNT" `
    --wait
Print-Status "Kubernetes cluster creation" $?

# Configure kubectl
Write-Host "Configuring kubectl..."
doctl kubernetes cluster kubeconfig save $CLUSTER_NAME
Print-Status "kubectl configuration" $?

# Create DigitalOcean Spaces for backups
Write-Host "Creating DigitalOcean Spaces for backups..."
doctl spaces create $SPACES_NAME --region $REGION
Print-Status "DigitalOcean Spaces creation" $?

# Create DigitalOcean Container Registry
Write-Host "Creating DigitalOcean Container Registry..."
doctl registry create $REGISTRY_NAME
Print-Status "Container Registry creation" $?

# Build and push Docker images
Write-Host "Building and pushing Docker images..."
docker-compose build
docker-compose push
Print-Status "Docker image build and push" $?

# Apply Kubernetes configurations
Write-Host "Applying Kubernetes configurations..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
Print-Status "Kubernetes configuration application" $?

# Wait for deployments to be ready
Write-Host "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment --all -n adhd2e
Print-Status "Deployment readiness" $?

# Set up DigitalOcean Monitoring
Write-Host "Setting up DigitalOcean Monitoring..."
doctl kubernetes cluster update $CLUSTER_NAME --update-kubeconfig --set-current-context
doctl kubernetes cluster monitoring enable $CLUSTER_NAME
Print-Status "DigitalOcean Monitoring setup" $?

# Enable DigitalOcean Kubernetes Monitoring
Write-Host "Enabling DigitalOcean Kubernetes Monitoring..."
doctl kubernetes cluster monitoring enable $CLUSTER_NAME
Print-Status "DigitalOcean Kubernetes Monitoring enabled" $?

# Display cluster info and next steps
Write-Host "Deployment completed successfully!"
Write-Host "Cluster info:"
kubectl cluster-info
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Configure your domain's DNS to point to the Load Balancer IP"
Write-Host "2. Set up SSL certificates using Let's Encrypt"
Write-Host "3. Configure backup schedules for MongoDB and Neo4j using DigitalOcean Managed Databases"
Write-Host "4. Set up CI/CD pipelines in CircleCI"
Write-Host "5. Monitor the cluster using DigitalOcean Monitoring and adjust resources as needed"