# Deployment Guide — ISO 30414 Human Capital Reporting

## Overview

This guide covers deploying ISO 30414 to a production Linux server using Docker Compose.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Docker Engine | 24+ |
| Docker Compose | v2+ |
| Domain name | Configured with DNS A record |
| TLS certificate | Let's Encrypt (certbot) or equivalent |
| Server RAM | 2 GB minimum |
| Disk | 20 GB minimum |

---

## 1. Server Preparation

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install certbot for TLS
sudo apt install certbot -y
sudo certbot certonly --standalone -d your-domain.com
```

---

## 2. Environment Configuration

```bash
# Clone repository
git clone https://github.com/your-org/iso30414.git
cd iso30414

# Copy and fill environment file
cp server/.env.example server/.env
nano server/.env
```

**Required variables in `server/.env`:**

```env
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@postgres:5432/iso30414?schema=public
JWT_SECRET=<generate: openssl rand -base64 64>
JWT_EXPIRES_IN=8h
APP_URL=https://your-domain.com
MAX_FILE_SIZE_MB=10
STORAGE_PATH=/app/storage
LOG_LEVEL=info

# PostgreSQL (for docker-compose.production.yml)
POSTGRES_USER=iso30414prod
POSTGRES_PASSWORD=<strong random password>
POSTGRES_DB=iso30414
```

**Generate strong secrets:**
```bash
openssl rand -base64 64   # For JWT_SECRET
openssl rand -base64 32   # For POSTGRES_PASSWORD
```

---

## 3. Update nginx Domain

Edit `nginx/nginx.prod.conf`:
```nginx
server_name your-domain.com;  # Replace with your actual domain
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

---

## 4. Build and Start

```bash
# Build images
docker compose -f docker-compose.production.yml build

# Run database migration
docker compose -f docker-compose.production.yml run --rm api npx prisma migrate deploy

# Seed initial data (first deployment only)
docker compose -f docker-compose.production.yml run --rm \
  -e SEED_ADMIN_PASSWORD="<secure-initial-password>" \
  api npx tsx prisma/seed.ts

# Start all services
docker compose -f docker-compose.production.yml up -d
```

---

## 5. Verify Deployment

```bash
# Check health
curl https://your-domain.com/health

# Check all containers running
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f api
```

Expected health response:
```json
{"status":"ok","timestamp":"2026-01-01T00:00:00.000Z"}
```

---

## 6. Post-Deployment

1. Login with initial admin credentials (printed during seed)
2. **Immediately change the admin password** via User Management
3. Create additional users (PIC, REVIEWER, MANAGEMENT) as needed
4. Upload ISO 30414 configuration Excel file

---

## 7. Rollback Procedure

If deployment fails:

```bash
# Roll back to previous image (if tagged)
docker compose -f docker-compose.production.yml down
docker tag iso30414-api:previous iso30414-api:latest
docker compose -f docker-compose.production.yml up -d

# Roll back database migration (if needed)
# WARNING: Only if migration was destructive.
# Prefer forward-fix over rollback for data safety.
docker compose -f docker-compose.production.yml run --rm api \
  npx prisma migrate resolve --rolled-back <migration_name>
```

**Best practice:** Tag Docker images before each deployment:
```bash
docker tag iso30414-api:latest iso30414-api:previous
```

---

## 8. Regular Updates

```bash
git pull origin main
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml run --rm api npx prisma migrate deploy
docker compose -f docker-compose.production.yml up -d
curl https://your-domain.com/health
```

---

## 9. Graceful Restart

```bash
# Restart API only (zero-downtime if behind nginx)
docker compose -f docker-compose.production.yml restart api

# Reload nginx config without downtime
docker compose -f docker-compose.production.yml exec nginx nginx -s reload
```
