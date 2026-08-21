# Architecture Guide — ISO 30414 Human Capital Reporting

## System Overview

ISO 30414 is a web application for Human Capital Reporting based on the ISO 30414:2018 standard.
It supports data collection by PIC, review workflow, approval, and PDF/Excel report generation.

---

## Production Architecture

```
                        INTERNET
                           │
                        HTTPS
                           │
                    ┌──────▼──────┐
                    │    nginx    │  Reverse Proxy
                    │  TLS / SSL  │  Rate Limiting
                    └──────┬──────┘  Security Headers
                           │
               ┌───────────┴───────────┐
               │                       │
        ┌──────▼──────┐        ┌───────▼───────┐
        │  Frontend   │        │    Backend    │
        │  React SPA  │◄──────►│  Express API  │
        │  (nginx)    │        │  (Node.js)    │
        └─────────────┘        └───────┬───────┘
                                       │
                           ┌───────────┼───────────┐
                           │           │           │
                    ┌──────▼──────┐ ┌──▼──┐ ┌─────▼────┐
                    │ PostgreSQL  │ │Files│ │  Logs    │
                    │  (private)  │ │     │ │ (stdout) │
                    └─────────────┘ └─────┘ └──────────┘
```

**Key security properties:**
- PostgreSQL has no public port — only reachable by API container
- All API traffic proxied through nginx (rate limiting, TLS termination)
- Frontend served as static files by nginx (SPA)
- Logs go to stdout → collected by container runtime

---

## Component Details

### Frontend (React + Vite + TypeScript)
- **Framework**: React 19, React Router 7
- **Build tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **State**: React Context (AuthContext)
- **API**: fetch with credentials:include (HttpOnly cookie auth)
- **Charts**: Recharts

### Backend (Node.js + Express 5 + TypeScript)
- **Framework**: Express 5
- **ORM**: Prisma 6 (PostgreSQL)
- **Auth**: JWT (jsonwebtoken) via HttpOnly cookie
- **Password**: bcryptjs (12 rounds)
- **Validation**: Zod
- **File parsing**: ExcelJS (xlsx)
- **PDF generation**: PDFKit
- **Security**: Helmet, express-rate-limit, cors

### Database (PostgreSQL 16)
- Managed via Prisma migrations
- Schema: users, metrics, submissions, reviews, reports, audit_logs, notifications

---

## Data Flow

### Excel Import → Configuration
```
Upload .xlsx
    → multer (size + MIME + magic bytes validation)
    → ExcelJS parsing
    → ImportJob created (preview)
    → Confirm → write to DB (ISOArea, Metric, MetricAttribute, MetricPIC)
```

### PIC Data Submission → Review
```
PIC opens metric form
    → enters attribute values
    → Save draft (MetricValue)
    → Submit → status: Submitted
    → Reviewer sees in queue
    → Reviewer: Approve / Request Revision / Reject
    → Notification sent to PIC
    → AuditLog created for each action
```

### Report Generation
```
User requests report
    → buildReportSnapshot (aggregate from DB)
    → createReport (persist metadata)
    → generateReportFiles (PDF via PDFKit, Excel via ExcelJS)
    → files saved to STORAGE_PATH
    → download via authenticated endpoint (object-level authz)
```

---

## Role Permission Matrix

| Feature | ADMIN | PIC | REVIEWER | MANAGEMENT |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Data Input | ✅ | ✅ | — | — |
| Submit Data | ✅ | ✅ | — | — |
| Review Queue | ✅ | — | ✅ | — |
| Approve/Reject | ✅ | — | ✅ | — |
| Reports | ✅ | ✅* | ✅* | ✅ |
| Audit Log | ✅ | — | — | — |
| User Management | ✅ | — | — | — |
| Configuration | ✅ | — | — | — |

`*` PIC and REVIEWER see reports scoped to their division/access level

---

## Environment Separation

| Environment | Database | Purpose |
|---|---|---|
| Development | Local PostgreSQL | Local development |
| Test | CI PostgreSQL | Automated tests |
| Production | Production PostgreSQL | Live system |

Never use production database for development or testing.
