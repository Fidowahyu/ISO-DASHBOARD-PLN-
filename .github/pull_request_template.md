## Pull Request Checklist

Before requesting review, verify the following:

### 🧪 Quality
- [ ] All tests pass (`cd server && npm test`)
- [ ] TypeScript compiles without errors (`cd server && npm run typecheck`)
- [ ] Client builds successfully (`cd client && npm run build`)
- [ ] Lint passes (`cd client && npm run lint`)

### 🔒 Security
- [ ] No secrets, passwords, API keys, or tokens committed
- [ ] No hardcoded credentials (database URLs, JWT secrets, etc.)
- [ ] Input validated server-side for any new API endpoints
- [ ] Authorization checked (not just authentication) for new routes
- [ ] Object-level access control verified (user can only access their own data)
- [ ] Audit log updated for sensitive actions

### 🗄️ Database
- [ ] New migration created if schema changed (`prisma migrate dev`)
- [ ] Migration is backward-compatible OR rollback strategy documented
- [ ] No raw SQL string concatenation (use Prisma ORM)

### 🧩 Features
- [ ] Business logic unchanged (ISO 30414 calculations, formulas, workflow)
- [ ] RBAC enforced (both frontend hide AND backend reject)
- [ ] Rate limiting applied to new resource-heavy endpoints
- [ ] Error responses use standard format `{ success: false, error: { code, message, requestId } }`

### 📝 Documentation
- [ ] `docs/` updated if deployment or operations changed
- [ ] Code comments added for non-obvious logic

### 📋 Reviewer Notes
<!-- Describe what this PR does and any context reviewers need -->
