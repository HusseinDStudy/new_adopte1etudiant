# CI/CD (Continuous Integration & Continuous Deployment)

This document outlines the CI/CD strategy and workflow for the "AdopteUnEtudiant" project, using GitHub Actions for automation.

---

## 1. CI/CD Philosophy

Our CI/CD pipeline is designed to automate the process of building, testing, and deploying the application. The primary goals are:

*   **Improve Code Quality**: Automatically run tests and linters to catch issues early.
*   **Increase Development Velocity**: Automate repetitive tasks, allowing developers to focus on building features.
*   **Ensure Stability**: Automate deployments to ensure a consistent and reliable release process.

---

## 2. The CI/CD Platform: GitHub Actions

We use **[GitHub Actions](https://github.com/features/actions)** to orchestrate our workflows. The main workflow file is located at:
`.github/workflows/ci-cd.yml`

This workflow contains three main jobs: `ci`, `build_and_push`, and `deploy`.

---

## 3. Continuous Integration (CI)

The CI process runs on every push and pull request to the `main` branch. It validates the code without deploying it.

**Trigger**: `on: push` (to `main`), `on: pull_request` (to `main`)

**Job**: `ci`

**Key Steps**:
1.  **Checkout Code**: The workflow checks out the repository's code.
2.  **Setup Node.js**: It sets up Node.js version 20.
3.  **Setup Database**: A PostgreSQL 15 service is started for the CI job to use for integration testing.
4.  **Install Dependencies**: It installs all project dependencies using `npm ci` for fast, reliable installs.
5.  **Security Audit**: Runs `npm audit fix` to automatically fix security vulnerabilities where possible.
6.  **Setup Environment**: A temporary `.env` file is created for the API using secrets and environment variables available to the runner.
7.  **Prisma and Migrations**: It generates the Prisma client and runs database migrations (`prisma migrate deploy`) against the test database.
8.  **Linting**: It runs the linter (`npm run lint`) to check for code style and quality issues.
9.  **Testing**: It runs the test suite (`npm test`).
10. **Build**: It performs a production build (`npm run build`) to ensure the code is valid and compiles correctly.

---

## 4. Build and Push Docker Images

This job runs after the `ci` job succeeds and only on pushes to the `main` branch. It builds the production Docker images and pushes them to Docker Hub.

**Trigger**: `on: push` (to `main`)

**Job**: `build_and_push`

**Key Steps**:
1.  **Checkout Code**: The workflow checks out the repository's code.
2.  **Setup Docker Buildx**: Sets up Docker Buildx for advanced build capabilities.
3.  **Login to Docker Hub**: Logs into Docker Hub using secrets.
4.  **Build and Push API Image**:
    *   Builds the `api` service using the multi-stage `Dockerfile`.
    *   Pushes the image to Docker Hub.
    *   Tags the image with the git commit SHA and `latest`.
    *   Uses GitHub Actions cache for faster builds.
5.  **Build and Push Web Image**:
    *   Builds the `web` service using the multi-stage `Dockerfile`.
    *   Pushes the image to Docker Hub.
    *   Tags the image with the git commit SHA and `latest`.
    *   Uses GitHub Actions cache for faster builds.

---

## 5. Continuous Deployment (CD)

The CD process automatically deploys the `api` and `web` applications to the production server. This job runs after `build_and_push` is successful.

**Trigger**: `on: push` (to `main`)

**Job**: `deploy`

**Deployment Mechanism**:
The deployment is handled by an SSH script executed on the production server via the `appleboy/ssh-action` action.

**Workflow Steps**:
1.  **SSH into Server**: The action establishes an SSH connection to the production server.
2.  **Setup Directory**: It ensures a project directory (`~/adopte1etudiant-mvp`) exists.
3.  **Create Docker Compose File**: The deployment script writes the contents of the production Docker Compose configuration into `docker-compose.prod.yml` on the server.
    > **Note**: This file is generated dynamically during deployment. It is important to keep the local `docker-compose.prod.yml` file in sync with the version in the `.github/workflows/ci-cd.yml` file to ensure consistency between local testing and production.
4.  **Create Environment File**: A `.env` file is created on the server from production secrets stored in GitHub.
5.  **Deploy Services**:
    *   A database backup is created before deployment.
    *   Running services are stopped with `docker compose down --remove-orphans` (volumes are preserved).
    *   The workflow logs into Docker Hub and pulls the latest images.
    *   Containers are started in detached mode using `docker compose up -d --force-recreate`.
6.  **Container Health Monitoring**: The script includes comprehensive health checks and retry logic for container startup.
7.  **Run Database Migrations**: After the services are up, it runs `npx prisma migrate deploy` inside the running `api` container to apply any new database migrations with retry logic (up to 5 attempts).
8.  **Health Checks**: The script performs a series of checks to ensure containers are running and the API is responsive.

---

## 6. Environment and Secrets Management

The CI/CD pipeline relies on **GitHub Secrets** to handle sensitive information. Key secrets include:
*   `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`: For logging into Docker Hub.
*   `PROD_HOST`, `PROD_USERNAME`, `PROD_SSH_KEY`: For SSH access to the production server.
*   `PROD_POSTGRES_USER`, `PROD_POSTGRES_PASSWORD`, `PROD_POSTGRES_DB`: For the production database connection.
*   `PROD_JWT_SECRET`, `PROD_GOOGLE_CLIENT_ID`, etc.: Application-specific secrets for the production environment.

These are injected into the workflow and used to create the `.env` file on the production server.

---

## 7. Current Limitations

The pipeline now preserves database volumes and performs automatic backups before deployment. However, there are still some areas for improvement:
*   **Rollback Mechanism**: If deployment fails, only a basic rollback is available.
*   **Limited Error Handling**: While the script includes error handling, it could be more robust.
*   **No Performance Testing**: No performance validation in the pipeline.
*   **Limited Monitoring**: Only basic health checks are performed.

---

## 8. Recommended Improvements

### High Priority
1.  **Enhance Rollback Mechanism**: Improve the automatic rollback step when deployment fails.

### Medium Priority (Security & Quality)
2.  **Security Scanning**: Integrate container security scanning (e.g., Trivy, Snyk).
3.  **Code Coverage Analysis**: Integrate a tool like **SonarCloud** or **Codecov** to track test coverage.
4.  **E2E Testing**: Add End-to-End testing using Cypress or Playwright.

### Low Priority (Convenience)
5.  **Preview Environments**: Deploy pull requests to temporary environments for testing.
6.  **Simplify Deployment Script**: Use committed `docker-compose.prod.yml` instead of generating it.
7.  **Performance Testing**: Add basic performance validation.
8.  **Monitoring Integration**: Add deployment notifications and monitoring.

---

## 9. Emergency Procedures

### If Deployment Fails
1. Check the GitHub Actions logs for the specific error.
2. SSH into the production server and check container status: `docker compose -f docker-compose.prod.yml ps`
3. Check container logs: `docker compose -f docker-compose.prod.yml logs [service-name]`
4. If needed, manually rollback by pulling the previous image tag.

### If Database is Corrupted
1. Restore from the latest backup created during deployment (stored on the server).
2. If no backup exists, the data may be unrecoverable.

---

## 10. Monitoring and Alerts

Currently, the pipeline provides basic logging and health checks. Consider implementing:
*   **Deployment Notifications**: Slack/Discord notifications for deployment status.
*   **Application Monitoring**: Integration with monitoring tools like DataDog, New Relic, or Prometheus.
*   **Uptime Monitoring**: External monitoring services to verify application availability.
