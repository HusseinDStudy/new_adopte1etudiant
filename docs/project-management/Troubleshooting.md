# Troubleshooting Guide

This guide covers common issues and their solutions for the Adopte1Etudiant application.

## 🚨 Critical Issues

### 1. DATABASE_URL Environment Variable Issues

#### **Problem**: 
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Error validating datasource `db`: You must provide a nonempty URL. The environment variable `DATABASE_URL` resolved to an empty string.
```

#### **Root Cause**:
The `DATABASE_URL` environment variable is not properly set or is empty in the API container.

#### **Solution**:
1. **Check GitHub Secrets**: Ensure all required secrets are set in GitHub repository settings:
   - `PROD_POSTGRES_USER`
   - `PROD_POSTGRES_PASSWORD` 
   - `PROD_POSTGRES_DB`
   - `PROD_JWT_SECRET`
   - `PROD_WEB_APP_URL`
   - `PROD_GOOGLE_CLIENT_ID`
   - `PROD_GOOGLE_CLIENT_SECRET`

2. **Verify Secret Values**: The `DATABASE_URL` is now automatically constructed from individual components:
   ```bash
   DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
   ```

3. **Manual Verification**: SSH into the production server and check:
   ```bash
   ssh ubuntu@your-server-ip
   cd ~/adopte1etudiant-mvp
   cat .env | grep DATABASE_URL
   ```

#### **Prevention**:
- Always test environment variables in the CI/CD pipeline
- Use the debug output in the deployment logs to verify variable construction
- Regularly rotate and update secrets

### 2. Container Startup Failures

#### **Problem**:
Containers fail to start or restart continuously.

#### **Diagnosis**:
```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# View container logs
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs postgres
```

#### **Common Causes**:
1. **Port Conflicts**: Another service using ports 80 or 8080
2. **Resource Limits**: Insufficient memory or CPU
3. **Network Issues**: Docker network configuration problems
4. **Volume Permissions**: Database volume permission issues

#### **Solutions**:
```bash
# Check for port conflicts
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8080

# Check resource usage
docker stats

# Restart Docker service if needed
sudo systemctl restart docker

# Clean up and restart
docker compose -f docker-compose.prod.yml down
docker system prune -f
docker compose -f docker-compose.prod.yml up -d
```

### 3. Database Connection Issues

#### **Problem**:
API cannot connect to the database.

#### **Diagnosis**:
```bash
# Check database container status
docker compose -f docker-compose.prod.yml ps postgres

# Test database connectivity
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U your-user

# Check database logs
docker compose -f docker-compose.prod.yml logs postgres
```

#### **Solutions**:
1. **Database Not Ready**: Wait for health checks to pass
2. **Wrong Credentials**: Verify `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
3. **Network Issues**: Check Docker network configuration
4. **Volume Issues**: Verify database volume exists and has proper permissions

### 4. Migration Failures

#### **Problem**:
Database migrations fail during deployment.

#### **Diagnosis**:
```bash
# Check migration status
docker compose -f docker-compose.prod.yml exec api npx prisma migrate status

# View migration logs
docker compose -f docker-compose.prod.yml logs api | grep -i migration
```

#### **Solutions**:
1. **Database Lock**: Wait for other operations to complete
2. **Schema Conflicts**: Check for conflicting schema changes
3. **Permission Issues**: Verify database user permissions
4. **Connection Issues**: Ensure database is fully ready before migrations

## 🔧 Manual Recovery Procedures

### 1. Emergency Rollback

If deployment fails and automatic rollback doesn't work:

```bash
# SSH into production server
ssh ubuntu@your-server-ip
cd ~/adopte1etudiant-mvp

# Check available image tags
docker images | grep your-dockerhub-username

# Update .env with previous working tags
sed -i "s/API_IMAGE_TAG=.*/API_IMAGE_TAG=previous-working-tag/" .env
sed -i "s/WEB_IMAGE_TAG=.*/WEB_IMAGE_TAG=previous-working-tag/" .env

# Restart with previous images
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### 2. Database Recovery

If database is corrupted or needs recovery:

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Restore from backup
docker compose -f docker-compose.prod.yml up -d postgres
docker compose -f docker-compose.prod.yml exec -T postgres psql -U your-user -d your-db < backup_YYYYMMDD_HHMMSS.sql

# Restart all services
docker compose -f docker-compose.prod.yml up -d
```

### 3. Complete Reset

If everything is broken and you need a fresh start:

```bash
# Stop and remove everything
docker compose -f docker-compose.prod.yml down -v
docker system prune -af

# Remove project directory
rm -rf ~/adopte1etudiant-mvp

# Re-deploy from scratch
# (This will trigger a new deployment from GitHub Actions)
```

## 📊 Monitoring and Debugging

### 1. Health Check Endpoints

- **API Health**: `http://your-domain:8080/health`
- **Web Health**: `http://your-domain:80`
- **Database Health**: Internal container health checks

### 2. Log Monitoring

```bash
# Follow logs in real-time
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f postgres
```

### 3. Resource Monitoring

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

## 🚀 Performance Issues

### 1. Slow Response Times

#### **Diagnosis**:
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/health

# Check database performance
docker compose -f docker-compose.prod.yml exec postgres psql -U your-user -d your-db -c "SELECT * FROM pg_stat_activity;"
```

#### **Solutions**:
1. **Increase Resources**: Adjust memory/CPU limits in `docker-compose.prod.yml`
2. **Database Optimization**: Add indexes, optimize queries
3. **Caching**: Implement Redis or application-level caching
4. **Load Balancing**: Add multiple API instances

### 2. High Memory Usage

#### **Diagnosis**:
```bash
# Check memory usage
docker stats --no-stream

# Check for memory leaks
docker compose -f docker-compose.prod.yml exec api ps aux
```

#### **Solutions**:
1. **Adjust Limits**: Increase memory limits in Docker Compose
2. **Optimize Application**: Review memory usage patterns
3. **Restart Services**: Periodic restarts to clear memory
4. **Monitor Logs**: Check for memory-related errors

## 🔒 Security Issues

### 1. Unauthorized Access

#### **Diagnosis**:
```bash
# Check open ports
sudo netstat -tulpn

# Check firewall status
sudo ufw status
```

#### **Solutions**:
1. **Firewall Configuration**: Ensure only necessary ports are open
2. **SSL/TLS**: Implement HTTPS with proper certificates
3. **Authentication**: Verify JWT secret and OAuth configuration
4. **Network Isolation**: Use Docker networks properly

### 2. Secret Management

#### **Best Practices**:
1. **Rotate Secrets**: Regularly update JWT secrets and database passwords
2. **Access Control**: Limit access to production secrets
3. **Audit Logs**: Monitor access to sensitive data
4. **Backup Security**: Encrypt database backups

## 📞 Getting Help

### 1. Before Asking for Help

- Check this troubleshooting guide
- Review recent deployment logs
- Verify GitHub Actions workflow status
- Check server resource usage

### 2. Information to Provide

When reporting issues, include:
- Error messages and logs
- Deployment timestamp
- GitHub Actions run ID
- Server resource usage
- Steps already attempted

### 3. Emergency Contacts

- **DevOps Team**: For infrastructure issues
- **Database Admin**: For database-specific problems
- **Security Team**: For security-related incidents

---

**Last Updated**: December 2024
**Version**: 1.0
**Maintainer**: DevOps Team 