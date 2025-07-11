# Production Setup Guide

This guide will help you set up the Adopte1Etudiant application for production. It covers the initial one-time server setup. For ongoing deployments, it is highly recommended to rely on the automated CI/CD pipeline.

## Prerequisites

*   An Ubuntu/Debian-based server with `sudo` access.
*   Docker and Docker Compose installed on the server.
*   A domain name pointing to your server's IP address (optional but recommended for HTTPS).
*   A Docker Hub account to store and pull the application images.

## ⚠️ Important Note About Data Persistence

The automated CI/CD pipeline has been updated to preserve database volumes during deployments. However, if you're using an older version of the pipeline, it may delete all production data on each deployment. Always verify that your pipeline preserves data before using it in production.

---

## 1. Server Setup

First, connect to your production server:
```bash
ssh your-username@your-server-ip
```

If Docker is not already installed, run the following commands:
```bash
# Update package lists
sudo apt-get update -y

# Install Docker Engine and Docker Compose plugin
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the 'docker' group to run docker commands without sudo
sudo usermod -aG docker $USER
```
**Important**: After adding your user to the `docker` group, you must log out and log back in for the changes to take effect.

---

## 2. GitHub Secrets Configuration

For the automated CI/CD pipeline to work, you must configure secrets in your GitHub repository.

Navigate to `Settings` > `Secrets and variables` > `Actions` and add the following repository secrets:

**Docker Hub Credentials:**
*   `DOCKERHUB_USERNAME`: Your Docker Hub username.
*   `DOCKERHUB_TOKEN`: A Docker Hub access token with read/write permissions.

**Production Server SSH Access:**
*   `PROD_HOST`: The IP address of your production server.
*   `PROD_USERNAME`: The username for SSH access.
*   `PROD_SSH_KEY`: The private SSH key used to connect to your server.

**Production Application Secrets:**
*   `PROD_POSTGRES_USER`: The desired username for your production database.
*   `PROD_POSTGRES_PASSWORD`: A secure password for the production database user.
*   `PROD_POSTGRES_DB`: The name for your production database.
*   `PROD_JWT_SECRET`: A strong, random string for signing JWTs (generate one with `openssl rand -base64 32`).
*   `PROD_WEB_APP_URL`: The full public URL of your application (e.g., `https://your-domain.com`).
*   `PROD_GOOGLE_CLIENT_ID`: Your production Google OAuth Client ID.
*   `PROD_GOOGLE_CLIENT_SECRET`: Your production Google OAuth Client Secret.

---

## 3. Manual Deployment (Alternative to CI/CD)

If you need to deploy the application manually without using the GitHub Actions pipeline, follow these steps.

### 1. Clone the Repository
On your production server, clone your project repository:
```bash
git clone https://github.com/YourUsername/new_adopte1etudiant.git
cd new_adopte1etudiant
```

### 2. Configure Environment
Create a `.env` file from the provided example and fill in your production values:
```bash
cp .env.production.example .env
nano .env
```
Refer to the comments in the `.env` file for guidance on what each variable does.

### 3. Pull Images and Start Services
Pull the latest images from Docker Hub and start the services using the production Docker Compose file:
```bash
# Log in to Docker Hub (if your images are private)
docker login -u "your-dockerhub-username"

# Pull the latest versions of the images defined in the compose file
docker compose -f docker-compose.prod.yml pull

# Start all services in detached mode
docker compose -f docker-compose.prod.yml up -d
```

### 4. Run Database Migrations
After the containers are running, execute the database migrations inside the `api` container:
```bash
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
```

---

## 4. CI/CD Pipeline Features

The automated CI/CD pipeline includes several safety features:

*   **Database Backups**: Automatic backup before each deployment
*   **Data Preservation**: Database volumes are preserved during deployments
*   **Rollback Mechanism**: Automatic rollback to previous version if deployment fails
*   **Security Scanning**: Vulnerability scanning of dependencies
*   **Health Checks**: Comprehensive health monitoring during deployment
*   **Backup Cleanup**: Automatic cleanup of old backups (keeps last 5)

## 5. Verifying the Deployment

Check the status of your running containers:
```bash
docker compose -f docker-compose.prod.yml ps
```
You should see `adopte1etudiant-api`, `adopte1etudiant-web`, and `adopte1etudiant-db` with a status of `Up` or `running`.

Your application should now be available at:
*   **Web Frontend:** `http://your-server-ip` (or `https://your-domain.com` if using a reverse proxy with SSL)
*   **API Backend:** `http://your-server-ip:8080`

---

## 6. Troubleshooting

If you encounter issues, here are some commands to help diagnose the problem.

### Check Container Logs
```bash
# Check the logs for the API service
docker compose -f docker-compose.prod.yml logs api

# Check the logs for the web server
docker compose -f docker-compose.prod.yml logs web

# Check the logs for the database
docker compose -f docker-compose.prod.yml logs postgres
```

### Restarting Services
To restart your application:
```bash
docker compose -f docker-compose.prod.yml restart
```

### Restoring from Backup

If you need to restore the database from a backup:

```bash
# List available backups
ls -la ~/adopte1etudiant-mvp/backup_*.sql

# Restore from a specific backup (replace with actual filename)
docker compose -f docker-compose.prod.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < ~/adopte1etudiant-mvp/backup_YYYYMMDD_HHMMSS.sql
```

### Updating the Application Manually
To update to the latest version when deploying manually:
```bash
# Navigate to your project directory
cd ~/new_adopte1etudiant

# Pull the latest code changes from your main branch
git pull origin main

# Pull the latest Docker images
docker compose -f docker-compose.prod.yml pull

# Recreate the containers to apply the new images and any configuration changes
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Run database migrations if there are any new ones
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
``` 