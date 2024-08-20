# PowerShell Deployment Script for Windows 11

# Check for .env file
if (!(Test-Path .env)) {
    Write-Error "Error: .env file not found. Please run initial_setup.ps1 first."
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^(.+)=(.+)$') {
        Set-Item -Path Env:$($Matches[1]) -Value $Matches[2]
    }
}

# Function to print colored output
function Print-Status($message, $success) {
    if ($success) {
        Write-Host $message -ForegroundColor Green
    } else {
        Write-Host $message -ForegroundColor Red
        exit 1
    }
}

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

# Check if Docker is running
function Test-DockerRunning {
    try {
        $null = docker info
        return $true
    } catch {
        return $false
    }
}

if (!(Test-DockerRunning)) {
    Write-Error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}

# Authenticate with DigitalOcean
Write-Host "Authenticating with DigitalOcean..."
doctl auth init --access-token $env:DIGITALOCEAN_TOKEN
Print-Status "DigitalOcean authentication" $?

# Configure kubectl
Write-Host "Configuring kubectl..."
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($env:KUBE_CONFIG)) | Out-File -FilePath kubeconfig.yaml -Encoding utf8
$env:KUBECONFIG = ".\kubeconfig.yaml"
Print-Status "kubectl configuration" $?

# Build and push Docker images
Write-Host "Building and pushing Docker images..."
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Print-Status "Docker image build failed" $false
}
docker-compose push
if ($LASTEXITCODE -ne 0) {
    Print-Status "Docker image push failed" $false
}
Print-Status "Docker image build and push" $true

# Apply Kubernetes configurations
Write-Host "Applying Kubernetes configurations..."
kubectl apply -f k8s/namespace.yaml --validate=false
kubectl apply -f k8s/secrets.yaml --validate=false
kubectl apply -f k8s/deployments/ --validate=false
kubectl apply -f k8s/services/ --validate=false
kubectl apply -f k8s/ingress.yaml --validate=false
kubectl apply -f k8s/hpa.yaml --validate=false
Print-Status "Kubernetes configuration application" $?

# Wait for deployments to be ready
Write-Host "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment --all -n adhd2e
Print-Status "Deployment readiness" $?

# Set up DigitalOcean Monitoring
Write-Host "Setting up DigitalOcean Monitoring..."
doctl kubernetes cluster update $env:CLUSTER_NAME --update-kubeconfig --set-current-context
doctl kubernetes cluster monitoring enable $env:CLUSTER_NAME
Print-Status "DigitalOcean Monitoring setup" $?

# Display cluster info and next steps
Write-Host "Deployment completed successfully!"
Write-Host "Cluster info:"
kubectl cluster-info
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Configure your domain's DNS to point to the Load Balancer IP"
Write-Host "2. Set up SSL certificates using Let's Encrypt"
Write-Host "3. Monitor the cluster using DigitalOcean Monitoring and adjust resources as needed"
Write-Host "4. Set up CI/CD pipelines in CircleCI"