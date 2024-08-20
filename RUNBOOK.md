# ADHD 2e AI Agent System Runbook

## Deployment

1. Prerequisites:
   - Ensure you have Docker and Docker Compose installed on your deployment machine.
   - Make sure you have access to the project's GitHub repository.
   - Verify that you have the necessary credentials for DigitalOcean.
   - For Windows users, ensure you have PowerShell 5.1 or later installed.

2. Environment Setup:
   - Clone the repository: `git clone https://github.com/your-repo/adhd2e-ai-agent.git`
   - Navigate to the project directory: `cd adhd2e-ai-agent`
   - Copy the example environment file: `cp .env.example .env`
   - Fill in all the required environment variables in the `.env` file.

3. Build and Deploy:
   - For Unix-based systems (Linux/macOS):
     Run the deployment script: `./deploy.sh`
   - For Windows:
     Run the deployment script: `.\deploy.ps1`
   - These scripts will:
     - Create a Kubernetes cluster on DigitalOcean
     - Set up a Container Registry
     - Build and push Docker images
     - Apply Kubernetes configurations
     - Set up monitoring using DigitalOcean Monitoring

4. Verify Deployment:
   - Check the status of the Kubernetes pods: `kubectl get pods -n adhd2e`
   - Ensure all pods are in the "Running" state
   - Access the application via the Load Balancer IP: `kubectl get services -n adhd2e`

5. Post-Deployment Steps:
   - Configure your domain's DNS to point to the Load Balancer IP
   - Set up SSL certificates using Let's Encrypt and cert-manager
   - Perform initial data seeding if required

## Monitoring

1. DigitalOcean Monitoring:
   - Access the DigitalOcean Control Panel: https://cloud.digitalocean.com/
   - Navigate to the "Monitoring" section in the left sidebar
   - Here you can view metrics for your Kubernetes cluster, including:
     - CPU usage
     - Memory usage
     - Disk I/O
     - Network traffic

2. Setting up Alerts:
   - In the DigitalOcean Control Panel, go to "Monitoring" > "Alerts"
   - Click "Create Alert Policy"
   - Choose the metric you want to monitor (e.g., CPU usage)
   - Set the threshold and duration
   - Configure notification settings (email, Slack, etc.)

3. DigitalOcean Kubernetes Monitoring:
   - Access detailed Kubernetes metrics through the DigitalOcean Control Panel
   - Navigate to "Kubernetes" > "Your Cluster" > "Insights" tab
   - View pod-level metrics, cluster health, and resource allocation

4. Logging:
   - Use DigitalOcean's built-in logging solution for Kubernetes clusters
   - Access logs through the DigitalOcean Control Panel under "Kubernetes" > "Your Cluster" > "Insights" tab
   - For centralized logging, consider setting up DigitalOcean's Managed Databases for Elasticsearch or using DigitalOcean's partner solutions like Papertrail or Loggly

5. Application Performance Monitoring (APM):
   - Integrate DigitalOcean's APM solution or a compatible third-party tool
   - Configure APM agents in your application code to collect detailed performance metrics
   - Access APM data through the DigitalOcean Control Panel or the chosen APM tool's interface

## Troubleshooting

1. Check application logs:
   - For a specific pod: `kubectl logs <pod-name> -n adhd2e`
   - For a specific container in a pod: `kubectl logs <pod-name> -c <container-name> -n adhd2e`

2. Verify all services are running:
   - `kubectl get pods -n adhd2e`
   - `kubectl get services -n adhd2e`

3. Check for any errors in the events:
   - `kubectl get events -n adhd2e`

4. Debugging Pods:
   - Describe a pod: `kubectl describe pod <pod-name> -n adhd2e`
   - Execute commands in a pod: `kubectl exec -it <pod-name> -n adhd2e -- /bin/bash`

5. DigitalOcean Support:
   - If issues persist, use the DigitalOcean support system accessible through the Control Panel

## Maintenance

1. Updating Dependencies:
   - Regularly update npm packages: `npm audit fix`
   - Update Docker images in the Dockerfiles
   - Rebuild and redeploy after updates

2. Database Backups:
   - Use DigitalOcean's Managed Databases backup feature for MongoDB and Neo4j
   - Configure automated backups through the DigitalOcean Control Panel

3. Scaling:
   - Adjust the number of replicas in the Kubernetes deployment files as needed
   - Use DigitalOcean's node pool management to scale your cluster

4. Monitoring and Optimization:
   - Regularly review DigitalOcean Monitoring dashboards for performance insights
   - Optimize database queries and indexes based on usage patterns

## Security

1. Access Management:
   - Use DigitalOcean Teams for managing access to resources
   - Regularly review and update Kubernetes RBAC roles and bindings

2. Network Security:
   - Utilize DigitalOcean Cloud Firewalls to control traffic to your Kubernetes nodes
   - Ensure all external communications are encrypted (TLS)

3. Authentication:
   - Use DigitalOcean's managed databases for enhanced security
   - Implement and maintain strong password policies

4. Compliance:
   - Ensure GDPR compliance for user data handling
   - Regularly conduct security audits

## Disaster Recovery

1. Data Backups:
   - Utilize DigitalOcean Spaces for storing application-level backups
   - Use DigitalOcean's Managed Databases backup features for MongoDB and Neo4j
   - Test restoration process quarterly to ensure backup integrity

2. High Availability:
   - Implement multi-node Kubernetes clusters across multiple availability zones in DigitalOcean
   - Consider multi-region deployment for critical components

3. Recovery Plan:
   - Document step-by-step recovery procedures for different failure scenarios
   - Conduct regular drills to test the recovery process

4. Incident Response:
   - Maintain an up-to-date incident response plan
   - Define clear roles and communication channels for handling incidents

## Continuous Integration/Continuous Deployment (CI/CD)

1. DigitalOcean App Platform (Optional):
   - Consider migrating to DigitalOcean App Platform for simplified deployments
   - Configure automatic deployments from your GitHub repository

2. CircleCI Integration:
   - Ensure CircleCI is properly configured with necessary DigitalOcean credentials
   - The `.circleci/config.yml` file defines the CI/CD pipeline

3. Automated Testing:
   - Run `npm test` locally before pushing changes
   - CircleCI will automatically run tests on each push

4. Deployment Process:
   - Merges to the `main` branch trigger automatic deployments
   - Monitor CircleCI builds for any failures

5. Rollback Procedure:
   - In case of a failed deployment, use `kubectl rollout undo deployment/<deployment-name> -n adhd2e` to revert to the previous version

Remember to keep this runbook updated as the system evolves. Regular reviews and updates ensure it remains a valuable resource for the team.