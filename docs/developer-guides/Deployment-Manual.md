# Deployment Manual

## 1. Introduction

This document serves as a comprehensive guide for deploying the "Adopte1Etudiant" application to various environments. It covers the necessary prerequisites, step-by-step deployment procedures, configuration details, database management, monitoring, troubleshooting, and rollback strategies. The goal is to ensure a smooth, repeatable, and reliable deployment process.

## 2. Prerequisites

Before initiating any deployment, ensure the following prerequisites are met on the target server:

*   **Operating System**: Ubuntu Server 22.04 LTS (Recommended)
*   **Docker**: Latest stable version installed and running.
*   **Docker Compose**: Latest stable version installed.
*   **Node.js**: Version 20.x (if deploying natively, not containerized).
*   **npm**: Latest stable version (if deploying natively).
*   **Git**: For cloning the repository.
*   **SSH Access**: Secure Shell access to the deployment server.
*   **Domain Name**: A registered domain name pointing to the server's IP address.
*   **SSL Certificates**: Configured with Certbot or similar for HTTPS.
*   **GitHub Secrets**: Configured with all necessary production secrets (see Section 4.2).

## 3. Deployment Environments

The application supports deployment to the following environments:

*   **Development**: Local machines for development and testing.
*   **Production**: The live environment accessible to end-users.

## 4. Configuration and Secrets Management

Sensitive information and environment-specific configurations are managed through environment variables and GitHub Secrets.

### 4.1. Environment Variables (`.env` file)

Create a `.env` file in the project root on the deployment server with the following structure. These variables will be used by `docker-compose.prod.yml`.

```env
# Database Configuration
POSTGRES_USER=your-prod-db-user
POSTGRES_PASSWORD=your-secure-prod-db-password
POSTGRES_DB=your-prod-db-name
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

# Application Secrets
JWT_SECRET=your-super-secure-jwt-secret
WEB_APP_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Docker Configuration
DOCKERHUB_USERNAME=your-dockerhub-username
API_IMAGE_TAG=latest
WEB_IMAGE_TAG=latest
VITE_API_URL=/api
```

### 4.2. GitHub Secrets (for Automated Deployment)

For automated deployments via GitHub Actions, the following secrets must be configured in your GitHub repository settings (`Settings > Secrets > Actions`):

*   `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`: For logging into Docker Hub to pull images.
*   `PROD_HOST`, `PROD_USERNAME`, `PROD_SSH_KEY`: For SSH access to the production server.
*   `PROD_POSTGRES_USER`, `PROD_POSTGRES_PASSWORD`, `PROD_POSTGRES_DB`: For the production database connection.
*   `PROD_JWT_SECRET`, `PROD_WEB_APP_URL`, `PROD_GOOGLE_CLIENT_ID`, `PROD_GOOGLE_CLIENT_SECRET`: Application-specific secrets for the production environment.

These secrets are used by the `deploy` job in `.github/workflows/ci-cd.yml` to create the `.env` file on the production server.

## 5. Deployment Process (Production Environment)

The recommended deployment method for production is via **Docker Compose** orchestrator and **GitHub Actions** for automation. This ensures consistency and reliability.

### 5.1. Automated Deployment via GitHub Actions

The primary method for deploying to production is through the CI/CD pipeline defined in `.github/workflows/ci-cd.yml`.

**Trigger**: Pushing code to the `main` branch after a successful `ci` and `build_and_push` job.

**High-Level Steps**:

1.  **SSH Connection**: Establish an SSH connection to the production server using provided GitHub Secrets.
2.  **Project Directory Setup**: Ensure the project directory (`~/adopte1etudiant-mvp`) exists on the server.
3.  **Copy Compose File**: The committed `docker-compose.prod.yml` is copied to the server.
4.  **Create Environment File**: A `.env` file is created on the server using production secrets from GitHub.
5.  **Stop Existing Services**: Currently running Docker services are stopped (`docker compose down --remove-orphans`). Volumes are preserved to retain database data.
6.  **Pull Latest Images**: Log in to Docker Hub and pull the latest `api` and `web` images.
7.  **Start New Services**: Containers are started in detached mode (`docker compose up -d --force-recreate`).
8.  **Container Health Monitoring**: Health checks and retry logic ensure containers start successfully.
9.  **Database Migrations**: `npx prisma migrate deploy` is executed inside the `api` container to apply any new database schema changes. This includes retry logic.
10. **Database Seeding**: `npx prisma db seed` is executed to populate the database with initial data (e.g., admin users, default settings).
11. **Health Checks**: Comprehensive health checks (API health endpoint, web server availability) are performed post-deployment.
12. **Cleanup**: Old database backups (keeping the last 5) and unused Docker images are removed to save disk space.

### 5.2. Manual Deployment (Alternative/Troubleshooting)

In rare cases or for initial setup, manual deployment may be necessary.

1.  **SSH into the Server**:
    ```bash
    ssh your-username@your-server-ip
    ```
2.  **Clone/Update Repository**:
    ```bash
    cd ~/adopte1etudiant-mvp # Or wherever your project is located
    git pull origin main
    ```
3.  **Create/Update `.env` file**: Ensure your `.env` file (as described in Section 4.1) is present and up-to-date.
4.  **Stop and Remove Old Containers (if any)**:
    ```bash
    docker compose -f docker-compose.prod.yml down --remove-orphans
    ```
5.  **Pull Latest Docker Images**:
    ```bash
    docker compose -f docker-compose.prod.yml pull
    ```
6.  **Start Services**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --force-recreate
    ```
7.  **Run Database Migrations and Seeding**:
    ```bash
    docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
    docker compose -f docker-compose.prod.yml exec api npx prisma db seed
    ```
8.  **Verify Deployment**: Check application health (see Section 7).

## 6. Database Management

### 6.1. Migrations

Database schema changes are managed using Prisma Migrations. During automated deployment, `npx prisma migrate deploy` is run automatically. For manual execution:

```bash
# From project root, inside the api container
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

### 6.2. Backups and Restoration

Automated deployments include a database backup before starting new services. Backups are stored on the production server. In case of database corruption or data loss:

1.  **Locate Latest Backup**: Backups are typically named with timestamps (e.g., `db_backup_YYYYMMDD_HHMMSS.sql`).
2.  **Stop Database Service**:
    ```bash
    docker compose -f docker-compose.prod.yml stop postgres
    ```
3.  **Restore Database (Example)**:
    ```bash
    # Replace with your backup file and database name/user
    docker compose -f docker-compose.prod.yml exec postgres psql -U your-prod-db-user -d your-prod-db-name < /path/to/your/db_backup.sql
    ```
4.  **Start Database Service**:
    ```bash
    docker compose -f docker-compose.prod.yml start postgres
    ```

## 7. Monitoring and Troubleshooting

### 7.1. Health Checks

*   **API Health**: Access `http://your-domain.com/api/health` (or `http://your-server-ip:8080/health` if direct access).
*   **Web Health**: Access `http://your-domain.com` (or `http://your-server-ip:80` if direct access).

### 7.2. Checking Container Status and Logs

*   **List running containers**:
    ```bash
    docker compose -f docker-compose.prod.yml ps
    ```
*   **View service logs**:
    ```bash
    docker compose -f docker-compose.prod.yml logs [service-name] # e.g., api, web, postgres
    ```

### 7.3. Common Issues and Resolutions

*   **Deployment Failures**: Check GitHub Actions logs for specific errors. Review container logs on the server.
*   **Database Connection Issues**: Verify environment variables, ensure PostgreSQL container is running and accessible.
*   **Resource Exhaustion**: Monitor `docker stats` and consider adjusting resource limits in `docker-compose.prod.yml`.

## 8. Rollback Procedures

In case of critical issues post-deployment, a rollback to a previous stable version is possible.

### 8.1. Automated Rollback Triggers

*   Health check failures during deployment.
*   Database migration failures.
*   Container startup failures.

### 8.2. Manual Rollback Process

1.  **SSH into the production server**:
    ```bash
    ssh your-username@your-server-ip
    ```
2.  **Navigate to project directory**:
    ```bash
    cd ~/adopte1etudiant-mvp
    ```
3.  **Identify previous stable image tags**: Check Docker Hub or your image registry for previous stable tags (e.g., based on Git commit SHAs).
4.  **Update `.env` with previous image tags**:
    ```bash
    sed -i "s/API_IMAGE_TAG=.*/API_IMAGE_TAG=previous-api-tag/" .env
    sed -i "s/WEB_IMAGE_TAG=.*/WEB_IMAGE_TAG=previous-web-tag/" .env
    ```
5.  **Restart services with previous images**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --force-recreate
    ```
6.  **Verify Rollback**: Perform health checks to confirm the previous version is running correctly.

---

**Last Updated**: July 2024
**Version**: 1.0
**Author**: Your Name/Team Name
