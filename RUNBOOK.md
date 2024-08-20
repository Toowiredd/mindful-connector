# ADHD 2e AI Agent System Runbook

## Deployment

1. Prerequisites:
   - Ensure you have Docker and Docker Compose installed on your deployment machine.
   - Make sure you have access to the project's GitHub repository.
   - Verify that you have the necessary credentials for DigitalOcean, Supabase, MongoDB, and Neo4j.

2. Environment Setup:
   - Clone the repository: `git clone https://github.com/your-repo/adhd2e-ai-agent.git`
   - Navigate to the project directory: `cd adhd2e-ai-agent`
   - Copy the example environment file: `cp .env.example .env`
   - Fill in all the required environment variables in the `.env` file.

3. Build and Deploy:
   - Run the deployment script: `./deploy.sh`
   - This script will:
     - Create a Kubernetes cluster on DigitalOcean
     - Set up a Container Registry
     - Build and push Docker images
     - Apply Kubernetes configurations
     - Set up monitoring and logging

4. Verify Deployment:
   - Check the status of the Kubernetes pods: `kubectl get pods -n adhd2e`
   - Ensure all pods are in the "Running" state
   - Access the application via the Load Balancer IP: `kubectl get services -n adhd2e`

5. Post-Deployment Steps:
   - Configure your domain's DNS to point to the Load Balancer IP
   - Set up SSL certificates using Let's Encrypt and cert-manager
   - Perform initial data seeding if required

## Monitoring

1. Kubernetes Dashboard:
   - Access the Kubernetes dashboard for an overview of the cluster's health
   - Command to start the proxy: `kubectl proxy`
   - Access URL: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

2. Prometheus and Grafana:
   - Access Grafana dashboard for detailed metrics
   - Default URL: `https://grafana.your-domain.com`
   - Login with the credentials set during deployment

3. Logging with ELK Stack:
   - Access Kibana for log analysis
   - Default URL: `https://kibana.your-domain.com`

4. Set up alerts:
   - Configure alert rules in Prometheus for CPU, memory, and disk usage thresholds
   - Set up email or Slack notifications for critical alerts

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

## Maintenance

1. Updating Dependencies:
   - Regularly update npm packages: `npm audit fix`
   - Update Docker images in the Dockerfiles
   - Rebuild and redeploy after updates

2. Database Backups:
   - MongoDB backups are automated daily using the configured backup scripts
   - Verify backups are being created and stored in DigitalOcean Spaces

3. Scaling:
   - Adjust the number of replicas in the Kubernetes deployment files as needed
   - Update HPA (Horizontal Pod Autoscaler) settings if required

4. Monitoring and Optimization:
   - Regularly review Grafana dashboards for performance insights
   - Optimize database queries and indexes based on usage patterns

## Security

1. Access Management:
   - Regularly review and update Kubernetes RBAC roles and bindings
   - Rotate Kubernetes secrets periodically

2. Network Security:
   - Ensure all external communications are encrypted (TLS)
   - Regularly update and patch all components, including the base OS of nodes

3. Authentication:
   - Regularly rotate API keys for Supabase, MongoDB, and Neo4j
   - Implement and maintain strong password policies

4. Compliance:
   - Ensure GDPR compliance for user data handling
   - Regularly conduct security audits

## Disaster Recovery

1. Data Backups:
   - Verify daily backups of MongoDB and Neo4j databases
   - Test restoration process quarterly to ensure backup integrity

2. High Availability:
   - Implement multi-zone deployment in DigitalOcean for increased resilience
   - Consider multi-region deployment for critical components

3. Recovery Plan:
   - Document step-by-step recovery procedures for different failure scenarios
   - Conduct regular drills to test the recovery process

4. Incident Response:
   - Maintain an up-to-date incident response plan
   - Define clear roles and communication channels for handling incidents

## Continuous Integration/Continuous Deployment (CI/CD)

1. CircleCI Pipeline:
   - The `.circleci/config.yml` file defines the CI/CD pipeline
   - Ensure the CircleCI project is properly configured with necessary environment variables

2. Automated Testing:
   - Run `npm test` locally before pushing changes
   - CircleCI will automatically run tests on each push

3. Deployment Process:
   - Merges to the `main` branch trigger automatic deployments
   - Monitor CircleCI builds for any failures

4. Rollback Procedure:
   - In case of a failed deployment, use `kubectl rollout undo deployment/<deployment-name> -n adhd2e` to revert to the previous version

Remember to keep this runbook updated as the system evolves. Regular reviews and updates ensure it remains a valuable resource for the team.