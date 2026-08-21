# Backup & Restore Guide — ISO 30414

## What Needs Backing Up

| Data | Location | Priority |
|---|---|---|
| PostgreSQL database | Docker volume `pgdata` | 🔴 Critical |
| Generated report files (PDF/Excel) | Docker volume `api_storage` | 🟡 High |
| Application configuration | `.env` file | 🔴 Critical |
| Uploaded Excel files | DB (stored as job records) | 🟡 High |

---

## 1. Database Backup

### Manual Backup
```bash
# Create backup
docker compose -f docker-compose.production.yml exec postgres \
  pg_dump -U iso30414prod iso30414 \
  | gzip > backups/iso30414_$(date +%Y%m%d_%H%M%S).sql.gz

# Verify backup
ls -lh backups/
zcat backups/iso30414_*.sql.gz | head -20
```

### Automated Daily Backup Script
Create `/etc/cron.daily/iso30414-backup`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/iso30414"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Database backup
docker compose -f /opt/iso30414/docker-compose.production.yml exec -T postgres \
  pg_dump -U iso30414prod iso30414 \
  | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

# Remove backups older than retention period
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup completed: $BACKUP_DIR/db_${DATE}.sql.gz"
```

```bash
chmod +x /etc/cron.daily/iso30414-backup
```

---

## 2. Restore Procedure

### Restore Database
```bash
# 1. Stop API to prevent writes during restore
docker compose -f docker-compose.production.yml stop api

# 2. Drop and recreate database
docker compose -f docker-compose.production.yml exec postgres \
  psql -U iso30414prod -c "DROP DATABASE IF EXISTS iso30414;"
docker compose -f docker-compose.production.yml exec postgres \
  psql -U iso30414prod -c "CREATE DATABASE iso30414;"

# 3. Restore from backup
zcat backups/iso30414_20260101_000000.sql.gz | \
  docker compose -f docker-compose.production.yml exec -T postgres \
  psql -U iso30414prod iso30414

# 4. Run any pending migrations
docker compose -f docker-compose.production.yml run --rm api \
  npx prisma migrate deploy

# 5. Restart API
docker compose -f docker-compose.production.yml start api

# 6. Verify
curl https://your-domain.com/health/ready
```

---

## 3. Retention Policy

| Backup Type | Frequency | Retention |
|---|---|---|
| Daily database dump | Every day at 02:00 | 30 days |
| Weekly snapshot | Every Sunday | 12 weeks |
| Monthly archive | 1st of month | 12 months |
| Pre-deployment snapshot | Before each deploy | 3 versions |

---

## 4. Storage Files Backup

```bash
# Backup report storage
docker run --rm \
  -v iso30414_api_storage:/source \
  -v /var/backups/iso30414:/target \
  alpine tar czf /target/storage_$(date +%Y%m%d).tar.gz -C /source .
```

---

## 5. Restore Test Schedule

> [!IMPORTANT]
> A backup that has never been tested is not a backup.

Perform restore test every **quarter**:
1. Spin up a separate test environment
2. Restore latest backup
3. Run health check
4. Verify latest submissions and reports are present
5. Document result and any issues found

---

## 6. Configuration Backup

```bash
# Backup .env (store encrypted, e.g., in vault or password manager)
# Never commit .env to Git

# Backup nginx config
cp nginx/nginx.prod.conf backups/nginx.prod.conf.$(date +%Y%m%d)
```
