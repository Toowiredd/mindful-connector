# PowerShell Deployment Script for Windows 11

# Load environment variables
if (!(Test-Path .env)) {
    Write-Error "Error: .env file not found. Please run initial_setup.ps1 first."
    exit 1
}

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
if ($LASTEXITCODE -ne 0) {
    Print-Status "DigitalOcean authentication failed" $false
}
Print-Status "DigitalOcean authentication" $true

# Get Kubernetes cluster info
Write-Host "Fetching Kubernetes cluster info..."
$clusters = doctl kubernetes cluster list --format ID,Name,Region --no-header
if ($clusters.Count -eq 0) {
    Write-Error "No Kubernetes clusters found. Please create a cluster first."
    exit 1
}

$clusterID = ($clusters -split '\s+')[0]
Write-Host "Using Kubernetes cluster: $clusterID"

# Update kubeconfig
Write-Host "Updating kubeconfig..."
doctl kubernetes cluster kubeconfig save $clusterID
if ($LASTEXITCODE -ne 0) {
    Print-Status "Failed to update kubeconfig" $false
}
Print-Status "Kubeconfig updated" $true

# Verify Kubernetes connection
Write-Host "Verifying Kubernetes connection..."
kubectl cluster-info
if ($LASTEXITCODE -ne 0) {
    Print-Status "Failed to connect to Kubernetes cluster" $false
}
Print-Status "Connected to Kubernetes cluster" $true

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
$kubeApplySuccess = $true

function Apply-KubeConfig($file) {
    Write-Host "Applying $file..."
    kubectl apply -f $file
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to apply $file" -ForegroundColor Yellow
        $script:kubeApplySuccess = $false
        Write-Host "Error details:"
        kubectl apply -f $file --v=8
    } else {
        Write-Host "Successfully applied $file" -ForegroundColor Green
    }
}

Apply-KubeConfig "k8s/namespace.yaml"
Apply-KubeConfig "k8s/secrets.yaml"
Get-ChildItem "k8s/deployments" -Filter *.yaml | ForEach-Object { Apply-KubeConfig $_.FullName }
Get-ChildItem "k8s/services" -Filter *.yaml | ForEach-Object { Apply-KubeConfig $_.FullName }
Apply-KubeConfig "k8s/ingress.yaml"
Apply-KubeConfig "k8s/hpa.yaml"

if (-not $kubeApplySuccess) {
    Write-Host "Warning: Some Kubernetes configurations failed to apply. Please review the error messages above." -ForegroundColor Yellow
    exit 1
}

Print-Status "Kubernetes configuration application" $kubeApplySuccess

# Wait for deployments to be ready
Write-Host "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment --all -n adhd2e
Print-Status "Deployment readiness" $?

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