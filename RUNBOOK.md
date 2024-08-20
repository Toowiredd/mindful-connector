# ADHD 2e AI Agent System Runbook

## Deployment

1. Prerequisites:
   - Ensure you have Docker and Docker Compose installed on your deployment machine.
   - Make sure you have access to the project's GitHub repository.
   - Install the DigitalOcean CLI (doctl) and authenticate it with your account.
   - For Windows users, ensure you have PowerShell 5.1 or later installed.

2. Initial DigitalOcean Setup:
   - Clone the repository: `git clone https://github.com/your-repo/adhd2e-ai-agent.git`
   - Navigate to the project directory: `cd adhd2e-ai-agent`
   - For Unix-based systems (Linux/macOS):
     Run the initial setup script: `./initial_setup.sh`
   - For Windows:
     Run the initial setup script: `.\initial_setup.ps1`
   - This script will:
     - Create a Kubernetes cluster on DigitalOcean
     - Set up a Container Registry
     - Create Spaces for backups
     - Set up managed MongoDB and Neo4j databases
     - Generate a .env file with necessary credentials

3. Review and Modify Configuration:
   - Review the generated .env file and make any necessary adjustments.
   - Update Kubernetes configuration files in the `k8s/` directory if needed.

4. Build and Deploy:
   - For Unix-based systems (Linux/macOS):
     Run the deployment script: `./deploy.sh`
   - For Windows:
     Run the deployment script: `.\deploy.ps1`
   - These scripts will:
     - Build and push Docker images to the DigitalOcean Container Registry
     - Apply Kubernetes configurations
     - Set up monitoring using DigitalOcean Monitoring

5. Verify Deployment:
   - Check the status of the Kubernetes pods: `kubectl get pods -n adhd2e`
   - Ensure all pods are in the "Running" state
   - Access the application via the Load Balancer IP: `kubectl get services -n adhd2e`

6. Post-Deployment Steps:
   - Configure your domain's DNS to point to the Load Balancer IP
   - Set up SSL certificates using Let's Encrypt and cert-manager
   - Perform initial data seeding if required
   - Set up CI/CD pipelines in CircleCI (refer to .circleci/config.yml)

7. Ongoing Maintenance:
   - Monitor the cluster using DigitalOcean Monitoring
   - Regularly update dependencies and redeploy as needed
   - Perform database backups using DigitalOcean's managed database features

## Connecting the Backend

Current Instructions:

1. Ensure your Kubernetes cluster is running and you have the correct kubeconfig:
   ```
   doctl kubernetes cluster kubeconfig save <your-cluster-id>
   ```

2. Verify that all backend services are deployed and running:
   ```
   kubectl get pods -n adhd2e
   ```

3. Check the services to get the ClusterIP for each backend service:
   ```
   kubectl get services -n adhd2e
   ```

Next Steps:

1. Update the frontend configuration:
   - Open `src/services/api.js`
   - Update the `API_BASE_URL` to point to your API Gateway service

2. Configure the API Gateway:
   - Update the `k8s/deployments/api-gateway.yaml` file to include the correct backend service URLs

3. Apply the updated configurations:
   ```
   kubectl apply -f k8s/deployments/api-gateway.yaml
   ```

4. Verify the connections:
   - Use the API Gateway's endpoint to test connections to backend services
   - Check the logs of the API Gateway and backend services for any connection issues:
     ```
     kubectl logs -f deployment/api-gateway -n adhd2e
     ```

5. Troubleshoot common issues:
   - Ensure all services are in the same Kubernetes namespace
   - Verify network policies allow communication between services
   - Check that service names in the API Gateway configuration match the actual service names

6. Set up monitoring and logging:
   - Configure DigitalOcean Monitoring for your cluster
   - Set up a logging solution (e.g., ELK stack) to aggregate logs from all services

7. Implement health checks:
   - Add health check endpoints to all backend services
   - Configure liveness and readiness probes in Kubernetes deployments

8. Secure the connections:
   - Implement mutual TLS between services if not already done
   - Ensure all inter-service communication is encrypted

9. Scale and optimize:
   - Monitor the performance of your backend services
   - Adjust resource allocations and replica counts as needed
   - Consider implementing auto-scaling for services with variable load

Remember to document any changes made during this process and update this runbook accordingly.

## Monitoring

[... rest of the existing content ...]