# Security Guide — ISO 30414 Human Capital Reporting

## Security Controls Implemented

### Authentication
| Control | Implementation |
|---|---|
| Password hashing | bcrypt, salt rounds = 12 |
| Session token | JWT, stored in HttpOnly cookie |
| Cookie flags | HttpOnly, Secure (production), SameSite=Strict |
| Session expiry | Configurable via `JWT_EXPIRES_IN` (default 8h) |
| Login attempt logging | `LoginAttempt` table (email, IP, success, timestamp) |
| Timing attack prevention | Constant-time bcrypt comparison even on unknown email |

### Authorization
| Control | Implementation |
|---|---|
| Role-based access control | `requireRole()` middleware on all protected routes |
| Object-level authorization | Submissions, reviews, reports checked by ownership |
| Inactive user block | Active users only can login and maintain sessions |
| Self-deactivation prevention | Admin cannot deactivate their own account |
| Self-role-change prevention | Admin cannot change their own role |

### Rate Limiting
| Endpoint | Limit |
|---|---|
| `/api/auth/login` | 10 requests / 15 minutes per IP |
| `/api/*` (general) | 300 requests / minute per IP |
| `/api/import/excel` | 10 requests / minute per IP |
| Report generation | 5 requests / minute per IP |

### Security Headers (via Helmet)
- `Content-Security-Policy` — restricts script, style, connect sources
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (via CSP `frame-ancestors 'none'`)
- `Referrer-Policy: no-referrer` (default Helmet)
- `Strict-Transport-Security` (production nginx)

### Input Validation
- All API inputs validated with **Zod** schemas
- File uploads: extension + MIME type + magic bytes validation
- File size limit: configurable via `MAX_FILE_SIZE_MB`
- Database access: Prisma ORM (parameterized queries — no SQL injection)
- User-generated content not rendered as raw HTML

### CORS
- Allowed origins: `APP_URL` environment variable only
- Credentials: `true` (required for HttpOnly cookie)
- Wildcard `*` never used for authenticated API

---

## Secret Management

### What should NEVER be in source code
- `JWT_SECRET`
- `DATABASE_URL` (with credentials)
- `POSTGRES_PASSWORD`
- Any API keys or tokens

### How secrets are managed
1. All secrets via environment variables
2. `.env` is in `.gitignore` — never committed
3. Production secrets managed via server env, not Docker image
4. Initial seed password printed to console only (non-production)

### Secret rotation
If a secret is compromised or accidentally committed:
1. Immediately revoke/rotate the secret
2. Generate new `JWT_SECRET` → invalidates all existing sessions (users must re-login)
3. If database credentials compromised: rotate PostgreSQL password
4. Audit login attempts for unauthorized access

---

## Known Limitations

> [!WARNING]
> The following are known security limitations that should be addressed based on risk tolerance:

1. **JWT is stateless** — Revocation requires waiting for token expiry. Deactivating a user does not immediately invalidate their current session token until it expires. To mitigate: set short `JWT_EXPIRES_IN` (8h or less) and check `isActive` on `/api/auth/me` (implemented).

2. **No MFA** — Multi-factor authentication is not implemented. For high-sensitivity deployments, consider adding TOTP or FIDO2.

3. **In-memory rate limiting** — Rate limits use in-memory store. In a multi-instance deployment, limits are per-instance. Consider Redis-backed rate limiting for horizontal scaling.

4. **No CSRF token** — Using SameSite=Strict cookie provides strong CSRF protection for same-origin deployments. If cross-origin requests are ever needed, add CSRF tokens.

5. **Audit log is append-only at application level** — Database-level protection requires additional PostgreSQL row-level security or separate audit database.

6. **No brute force lockout** — Rate limiting slows brute force but doesn't lock accounts (to prevent DoS). Monitor `LoginAttempt` table for anomalies.

---

## Security Response

If you discover a security vulnerability:
1. Do NOT create a public GitHub issue
2. Contact the system administrator directly
3. Provide: description, reproduction steps, potential impact
4. Allow reasonable time for fix before disclosure
