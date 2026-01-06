# Deployment Guide

This guide explains how to deploy the HR Dashboard to Google Cloud using Docker and Traefik.

## Prerequisites

- Google Cloud instance with Docker and Docker Compose installed
- Traefik reverse proxy configured with `traefik-public` network
- Domain name pointed to your server
- Google Sheets API credentials

## Setup Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd hr-dashboard
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Application Domain (for Docker deployment)
APP_DOMAIN=hr.yourdomain.com

# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1p8teKhCfSiLLds3SxYF5e3hOpO3uXngRvhiq3AEi4Ys
```

**Important Notes:**
- `APP_DOMAIN`: Your domain name (e.g., `hr.example.com`)
- `GOOGLE_PRIVATE_KEY`: Keep the quotes and `\n` characters for line breaks
- `GOOGLE_SHEET_ID`: The ID from your Google Sheets URL

### 3. Verify Traefik Network

Ensure the `traefik-public` network exists:

```bash
docker network ls | grep traefik-public
```

If it doesn't exist, create it:

```bash
docker network create traefik-public
```

### 4. Build and Deploy

Build and start the container:

```bash
docker-compose up -d --build
```

Check the logs:

```bash
docker-compose logs -f hr-dashboard
```

### 5. Verify Deployment

Check container status:

```bash
docker-compose ps
```

Test the API:

```bash
curl https://hr.yourdomain.com/api/attendance
```

View the dashboard in your browser:
```
https://hr.yourdomain.com
```

## Management Commands

### View Logs

```bash
docker-compose logs -f hr-dashboard
```

### Restart Service

```bash
docker-compose restart hr-dashboard
```

### Stop Service

```bash
docker-compose down
```

### Rebuild After Code Changes

```bash
git pull
docker-compose up -d --build
```

### Remove Everything (including volumes)

```bash
docker-compose down -v
```

## Traefik Configuration

The `docker-compose.yml` includes the following Traefik labels:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.hr-dashboard.rule=Host(`${APP_DOMAIN}`)"
  - "traefik.http.routers.hr-dashboard.entrypoints=https"
  - "traefik.http.routers.hr-dashboard.tls=true"
  - "traefik.http.routers.hr-dashboard.tls.certresolver=letsencrypt"
  - "traefik.http.services.hr-dashboard.loadbalancer.server.port=3000"
```

### Optional Middleware

Uncomment in `docker-compose.yml` to enable:

- **Compression**: Gzip compression for responses
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

```yaml
- "traefik.http.routers.hr-dashboard.middlewares=hr-dashboard-compress,hr-dashboard-headers"
- "traefik.http.middlewares.hr-dashboard-compress.compress=true"
- "traefik.http.middlewares.hr-dashboard-headers.headers.customResponseHeaders.X-Frame-Options=SAMEORIGIN"
```

## Troubleshooting

### Container Won't Start

Check logs for errors:
```bash
docker-compose logs hr-dashboard
```

### SSL Certificate Issues

Verify Traefik is configured with Let's Encrypt:
```bash
docker-compose -f /path/to/traefik/docker-compose.yml logs traefik
```

### Cannot Connect to Google Sheets

1. Verify environment variables are set correctly
2. Check service account has access to the spreadsheet
3. Ensure private key format is correct (with `\n` line breaks)

```bash
docker-compose exec hr-dashboard env | grep GOOGLE
```

### 502 Bad Gateway

1. Check if container is running: `docker-compose ps`
2. Check container health: `docker inspect hr-dashboard --format='{{.State.Health.Status}}'`
3. Verify port 3000 is listening: `docker-compose exec hr-dashboard netstat -ln | grep 3000`

### DNS Not Resolving

1. Verify domain DNS points to server IP
2. Check Traefik router configuration: `docker exec traefik traefik healthcheck`
3. Test local resolution: `curl -H "Host: hr.yourdomain.com" http://localhost`

## Performance Optimization

### Health Check

The Dockerfile includes a health check that runs every 30 seconds:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/attendance', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

### Resource Limits (Optional)

Add to `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## Security Best Practices

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Use environment variables** for all secrets
3. **Keep Google credentials secure** - limit service account permissions
4. **Regular updates**: Keep dependencies updated
5. **Monitor logs**: Check for suspicious activity

## Backup

The application is stateless - all data comes from Google Sheets.

To backup configuration:
```bash
cp .env .env.backup
git add docker-compose.yml
git commit -m "Update deployment config"
```

## Updates

To update the application:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Verify
docker-compose logs -f hr-dashboard
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose exec hr-dashboard env`
3. Test API directly: `curl http://localhost:3000/api/attendance` (from inside server)
4. Check Traefik dashboard if available
