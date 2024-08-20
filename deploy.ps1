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

# Verify DigitalOcean CLI authentication
Write-Host "Verifying DigitalOcean CLI authentication..."
$authStatus = doctl auth list

if ($LASTEXITCODE -ne 0) {
    Write-Error "DigitalOcean CLI is not authenticated. Please run 'doctl auth init' and follow the prompts to authenticate."
    exit 1
}

Print-Status "DigitalOcean CLI authentication verified" $true

# Function to create Kubernetes cluster
function Create-KubernetesCluster {
    param (
        [string]$clusterName,
        [string]$region,
        [int]$nodeCount = 3,
        [string]$nodeSize = "s-2vcpu-4gb"
    )

    Write-Host "Creating Kubernetes cluster '$clusterName' in region '$region'..."
    $result = doctl kubernetes cluster create $clusterName --region $region --node-pool "name=worker-pool;size=$nodeSize;count=$nodeCount" 2>&1

    if ($LASTEXITCODE -ne 0) {
        if ($result -match "not enough available droplet limit") {
            Write-Host "Error: Insufficient droplet limit. Would you like to try creating a smaller cluster? (y/n)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -eq 'y') {
                return Create-KubernetesCluster -clusterName $clusterName -region $region -nodeCount 2 -nodeSize "s-1vcpu-2gb"
            } else {
                Write-Error "Cluster creation aborted. Please increase your droplet limit in the DigitalOcean control panel and try again."
                exit 1
            }
        } else {
            Write-Error "Failed to create Kubernetes cluster: $result"
            exit 1
        }
    }

    Print-Status "Kubernetes cluster created successfully" $true
    return $clusterName
}

# Create or get existing Kubernetes cluster
Write-Host "Checking for existing Kubernetes cluster..."
$clusters = doctl kubernetes cluster list --format ID,Name,Region --no-header
if ($clusters.Count -eq 0) {
    $clusterName = "adhd2e-cluster"
    $region = "nyc1"
    $clusterName = Create-KubernetesCluster -clusterName $clusterName -region $region
} else {
    $clusterName = ($clusters -split '\s+')[1]
    Write-Host "Using existing Kubernetes cluster: $clusterName"
}

# Update kubeconfig
Write-Host "Updating kubeconfig..."
doctl kubernetes cluster kubeconfig save $clusterName
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

# Create Container Registry if it doesn't exist
Write-Host "Checking for existing Container Registry..."
$registries = doctl registry get
if ($LASTEXITCODE -ne 0) {
    Write-Host "No Container Registry found. Creating a new registry..."
    $registryName = "adhd2e-registry"
    doctl registry create $registryName
    if ($LASTEXITCODE -ne 0) {
        Print-Status "Failed to create Container Registry" $false
    }
    Print-Status "Container Registry created successfully" $true
} else {
    Write-Host "Using existing Container Registry"
}

# Create or update persistent volume for Neo4j
Write-Host "Creating or updating persistent volume for Neo4j..."
$existingPv = kubectl get pv neo4j-pv -o json | ConvertFrom-Json

if ($existingPv) {
    Write-Host "Existing Neo4j persistent volume found. Updating..."
    $volumeHandle = $existingPv.spec.csi.volumeHandle
} else {
    Write-Host "Creating new Neo4j persistent volume..."
    $volumeHandle = New-Guid
}

$neo4jPvYaml = @"
apiVersion: v1
kind: PersistentVolume
metadata:
  name: neo4j-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: do-block-storage
  csi:
    driver: dobs.csi.digitalocean.com
    fsType: ext4
    volumeHandle: $volumeHandle
"@

$neo4jPvYaml | kubectl apply -f -
if ($LASTEXITCODE -ne 0) {
    Print-Status "Failed to create or update Neo4j persistent volume" $false
}
Print-Status "Neo4j persistent volume created or updated successfully" $true

# Create Neo4j deployment and service
Write-Host "Creating Neo4j deployment and service..."
$neo4jDeploymentYaml = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: neo4j
spec:
  replicas: 1
  selector:
    matchLabels:
      app: neo4j
  template:
    metadata:
      labels:
        app: neo4j
    spec:
      containers:
      - name: neo4j
        image: neo4j:4.4
        ports:
        - containerPort: 7474
        - containerPort: 7687
        env:
        - name: NEO4J_AUTH
          value: neo4j/$env:NEO4J_PASSWORD
        volumeMounts:
        - name: neo4j-data
          mountPath: /data
      volumes:
      - name: neo4j-data
        persistentVolumeClaim:
          claimName: neo4j-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: neo4j
spec:
  selector:
    app: neo4j
  ports:
    - port: 7474
      targetPort: 7474
      name: http
    - port: 7687
      targetPort: 7687
      name: bolt
"@

$neo4jDeploymentYaml | kubectl apply -f -
if ($LASTEXITCODE -ne 0) {
    Print-Status "Failed to create Neo4j deployment and service" $false
}
Print-Status "Neo4j deployment and service created successfully" $true

# Wait for Neo4j pod to be ready
Write-Host "Waiting for Neo4j pod to be ready..."
$timeout = 300 # 5 minutes timeout
$startTime = Get-Date
$neo4jReady = $false

while (-not $neo4jReady) {
    $neo4jPod = kubectl get pods -l app=neo4j -o jsonpath="{.items[0].metadata.name}"
    $podStatus = kubectl get pod $neo4jPod -o jsonpath="{.status.phase}"
    
    if ($podStatus -eq "Running") {
        $containerReady = kubectl get pod $neo4jPod -o jsonpath="{.status.containerStatuses[0].ready}"
        if ($containerReady -eq "true") {
            $neo4jReady = $true
        }
    }
    
    if (-not $neo4jReady) {
        $elapsedTime = (Get-Date) - $startTime
        if ($elapsedTime.TotalSeconds -gt $timeout) {
            Print-Status "Timeout waiting for Neo4j pod to be ready" $false
            exit 1
        }
        Start-Sleep -Seconds 5
    }
}

Print-Status "Neo4j pod is ready" $true

# Check Neo4j connection
Write-Host "Checking Neo4j connection..."
$retryCount = 0
$maxRetries = 5

while ($retryCount -lt $maxRetries) {
    try {
        $neo4jStatus = kubectl exec $neo4jPod -- cypher-shell -u neo4j -p "$env:NEO4J_PASSWORD" "RETURN 1 AS result"
        if ($neo4jStatus -match "1 row") {
            Print-Status "Neo4j is functioning correctly" $true
            break
        }
    } catch {
        $retryCount++
        if ($retryCount -eq $maxRetries) {
            Print-Status "Neo4j connection failed after $maxRetries attempts" $false
            exit 1
        }
        Write-Host "Retrying Neo4j connection check in 10 seconds... (Attempt $retryCount of $maxRetries)"
        Start-Sleep -Seconds 10
    }
}

# Update the application's Neo4j connection details
Write-Host "Updating application's Neo4j connection details..."
$neo4jServiceIp = kubectl get service neo4j -o jsonpath='{.spec.clusterIP}'
$env:NEO4J_URI = "bolt://$neo4jServiceIp`:7687"

# Update the .env file with the new Neo4j connection details
$envContent = Get-Content .env -Raw
$envContent = $envContent -replace "NEO4J_URI=.*", "NEO4J_URI=$env:NEO4J_URI"
$envContent | Set-Content .env -NoNewline

Print-Status "Application's Neo4j connection details updated" $true

# Build and push Docker images
Write-Host "Building and pushing Docker images..."
$services = @("frontend", "api-gateway", "auth-service", "task-service", "profile-service", "ai-service", "analytics-service", "graph-service")

foreach ($service in $services) {
    Write-Host "Building $service image..."
    docker build -t "$env:REGISTRY_NAME/$service`:latest" -f "Dockerfile.$service" .
    if ($LASTEXITCODE -ne 0) {
        Print-Status "Docker image build failed for $service" $false
    }
    
    Write-Host "Pushing $service image..."
    docker push "$env:REGISTRY_NAME/$service`:latest"
    if ($LASTEXITCODE -ne 0) {
        Print-Status "Docker image push failed for $service" $false
    }
}

Print-Status "Docker images built and pushed successfully" $true

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