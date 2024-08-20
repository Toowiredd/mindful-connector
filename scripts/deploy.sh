#!/bin/bash

set -e

# Configure kubectl
echo $KUBE_CONFIG | base64 -d > kubeconfig
export KUBECONFIG=./kubeconfig

# Update Kubernetes deployments
kubectl set image deployment/frontend frontend=${DOCKER_LOGIN}/${CIRCLE_PROJECT_REPONAME}-frontend:${CIRCLE_SHA1} --record

# Wait for rollout to complete
kubectl rollout status deployment/frontend

echo "Deployment completed successfully!"