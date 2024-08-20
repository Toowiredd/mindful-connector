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

# Create block storage volume for backups if it doesn't exist
Write-Host "Checking for existing block storage volume for backups..."
$volumes = doctl compute volume list --format Name,Region --no-header
$backupVolume = $volumes | Where-Object { $_ -match 'adhd2e-backups' }
if (-not $backupVolume) {
    Write-Host "No backup volume found. Creating a new block storage volume for backups..."
    $volumeName = "adhd2e-backups"
    $volumeRegion = "nyc1"  # Specify the region here
    doctl compute volume create $volumeName --region $volumeRegion --size 10GiB
    if ($LASTEXITCODE -ne 0) {
        Print-Status "Failed to create block storage volume for backups" $false
    }
    Print-Status "Block storage volume for backups created successfully" $true
} else {
    Write-Host "Using existing block storage volume for backups"
}

# Create managed MongoDB database if it doesn't exist
Write-Host "Checking for existing MongoDB database..."
$mongoDbs = doctl databases list --format ID,Name,Engine --no-header | Where-Object { $_ -match 'mongodb' }
if (-not $mongoDbs) {
    Write-Host "No MongoDB database found. Creating a new managed MongoDB database..."
    $dbName = "adhd2e-mongodb"
    $dbRegion = "nyc1"  # Specify the region here
    doctl databases create $dbName --engine mongodb --region $dbRegion --size db-s-1vcpu-1gb --num-nodes 1
    if ($LASTEXITCODE -ne 0) {
        Print-Status "Failed to create managed MongoDB database" $false
    }
    Print-Status "Managed MongoDB database created successfully" $true
} else {
    Write-Host "Using existing MongoDB database"
}

# Create managed Neo4j database if it doesn't exist
Write-Host "Checking for existing Neo4j database..."
$neo4jDbs = doctl databases list --format ID,Name,Engine --no-header | Where-Object { $_ -match 'neo4j' }
if (-not $neo4jDbs) {
    Write-Host "No Neo4j database found. Creating a new managed Neo4j database..."
    $neo4jName = "adhd2e-neo4j"
    $neo4jRegion = "nyc1"  # Specify the region here
    $neo4jVersion = "5.6"  # Specify the Neo4j version
    doctl databases create $neo4jName --engine neo4j --version $neo4jVersion --region $neo4jRegion --size db-s-1vcpu-1gb --num-nodes 1
    if ($LASTEXITCODE -ne 0) {
        Print-Status "Failed to create managed Neo4j database" $false
        Write-Host "Error details:"
        doctl databases create $neo4jName --engine neo4j --version $neo4jVersion --region $neo4jRegion --size db-s-1vcpu-1gb --num-nodes 1 --verbose
        exit 1
    }
    Print-Status "Managed Neo4j database created successfully" $true
} else {
    Write-Host "Using existing Neo4j database"
}

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