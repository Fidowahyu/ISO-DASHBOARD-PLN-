# Operations Guide — ISO 30414 Human Capital Reporting

## Daily Operations

### Health Check
```bash
# Quick health check
curl https://your-domain.com/health

# Ready check (includes DB)
curl https://your-domain.com/health/ready

# Container status
docker compose -f docker-compose.production.yml ps
```

### Log Monitoring
```bash
# Follow all logs
docker compose -f docker-compose.production.yml logs -f

# API logs only
docker compose -f docker-compose.production.yml logs -f api

# Filter for errors
docker compose -f docker-compose.production.yml logs api | grep '"level":"error"'

# Filter for failed logins
docker compose -f docker-compose.production.yml logs api | grep 'Failed login'
```

### Container Resource Usage
```bash
docker stats --no-stream
```

---

## Alerts to Monitor

| Alert | Condition | Response |
|---|---|---|
| API down | `/health` returns non-200 | Restart API container |
| DB unavailable | `/health/ready` returns 503 | Check PostgreSQL container |
| High error rate | `"level":"error"` in logs frequently | Review logs, check DB |
| Disk almost full | >85% disk usage | Clean old logs/backups |
| Repeated auth failures | Many `Failed login` log entries | Review IP, consider blocking |

### Check disk usage
```bash
df -h /var/lib/docker
du -sh /var/backups/iso30414/
```

---

## Common Operations

### Restart API
```bash
docker compose -f docker-compose.production.yml restart api
```

### View last 100 error logs
```bash
docker compose -f docker-compose.production.yml logs --tail=100 api | \
  grep '"level":"error"'
```

### Check failed login attempts (last 24h)
```bash
# From inside postgres container
docker compose -f docker-compose.production.yml exec postgres \
  psql -U iso30414prod iso30414 -c \
  "SELECT email, ip_address, COUNT(*) as attempts, MAX(created_at) as last_attempt
   FROM login_attempts
   WHERE success = false AND created_at > NOW() - INTERVAL '24 hours'
   GROUP BY email, ip_address
   ORDER BY attempts DESC
   LIMIT 20;"
```

### Deactivate a compromised user
1. Login as ADMIN
2. Go to **Administration → Users**
3. Find the user → **Deactivate**
4. Their session will be invalidated at next `/auth/me` check

### Emergency: Invalidate all sessions
```bash
# Rotate JWT_SECRET — all existing tokens become invalid
# Users will need to login again

# 1. Generate new secret
openssl rand -base64 64

# 2. Update .env JWT_SECRET
nano server/.env

# 3. Restart API
docker compose -f docker-compose.production.yml restart api
```

---

## Data Retention

| Data Type | Default Retention | Configurable |
|---|---|---|
| Submissions (ISO data) | Permanent | No — regulatory requirement |
| Audit logs | Permanent | No — compliance requirement |
| Generated reports (files) | Until disk pressure | Yes — manual cleanup |
| Login attempts | 90 days (suggested) | Manual DB cleanup |
| Notifications | 90 days (suggested) | Manual DB cleanup |
| Application logs | 30 days (Docker) | Via log driver |

### Clean old login attempts (example)
```bash
docker compose -f docker-compose.production.yml exec postgres \
  psql -U iso30414prod iso30414 -c \
  "DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '90 days';"
```

---

## Performance Monitoring

### Slow query detection
```bash
# Enable slow query logging in PostgreSQL (pg_stat_statements)
docker compose -f docker-compose.production.yml exec postgres \
  psql -U iso30414prod iso30414 -c \
  "SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;"
```

### Database connections
```bash
docker compose -f docker-compose.production.yml exec postgres \
  psql -U iso30414prod iso30414 -c \
  "SELECT count(*) as connections FROM pg_stat_activity WHERE datname = 'iso30414';"
```

---

## Monitoring Foundation

The application emits **structured JSON logs** to stdout with these fields:

```json
{
  "timestamp": "2026-08-19T09:00:00.000Z",
  "level": "info|warn|error",
  "service": "iso30414-api",
  "requestId": "REQ-20260819-8F92A",
  "userId": "uuid",
  "method": "POST",
  "path": "/api/submissions/123/approve",
  "statusCode": 200,
  "durationMs": 42,
  "message": "HTTP request"
}
```

These logs can be ingested by:
- **ELK Stack** (Elasticsearch + Logstash + Kibana)
- **Grafana Loki**
- **Datadog / New Relic** (with log forwarding)
- **Simple file**: `docker compose logs api >> /var/log/iso30414-api.log`
