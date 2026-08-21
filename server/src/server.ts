import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { createAuthRouter } from './routes/auth';
import { createUsersRouter } from './routes/users';
import { createPhase2Router } from './routes/phase2';
import { createPhase3Router } from './routes/phase3';
import { createPhase4Router } from './routes/phase4';
import { createPhase5Router } from './routes/phase5';
import { createPhase6Router } from './routes/phase6';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger, logger } from './middleware/logger';
import { apiRateLimiter } from './middleware/rateLimiter';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3001);

// ─── Security Headers ───
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for PDF downloads
}));

// ─── CORS ───
const allowedOrigins = (process.env.APP_URL ?? 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, health checks from within network)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Request-ID'],
}));

// ─── Core Middleware ───
app.use(requestIdMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requestLogger);

// ─── Rate Limiting ───
app.use('/api', apiRateLimiter);

// ─── Health (public — no auth) ───
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable', timestamp: new Date().toISOString() });
  }
});

// Backward-compat alias
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

// ─── Routes ───
app.use('/api', createAuthRouter(prisma));
app.use('/api', createUsersRouter(prisma));
app.use('/api', createPhase2Router(prisma));
app.use('/api', createPhase3Router(prisma));
app.use('/api', createPhase4Router(prisma));
app.use('/api', createPhase5Router(prisma));
app.use('/api', createPhase6Router(prisma));

// ─── 404 ───
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'The requested resource does not exist.' } });
});

// ─── Global Error Handler ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number; requestId?: string }, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  const requestId = req.requestId;

  if (status >= 500) {
    logger.error('Unhandled server error', {
      requestId,
      error: err.message,
      path: req.path,
      method: req.method,
    });
  }

  // Never expose internal error details to the client in production
  const message = status < 500 ? err.message : 'An unexpected error occurred. Please try again later.';
  res.status(status).json({
    success: false,
    error: { code: status === 403 ? 'FORBIDDEN' : status === 401 ? 'UNAUTHENTICATED' : 'SERVER_ERROR', message, requestId },
  });
});

// ─── Start ───
const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`ISO 30414 API started`, { port, host: '0.0.0.0', env: process.env.NODE_ENV ?? 'development' });
});

// ─── Graceful Shutdown ───
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed.');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));