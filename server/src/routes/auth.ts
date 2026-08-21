import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { attemptLogin, COOKIE_NAME, COOKIE_OPTIONS } from '../services/auth-service';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.').max(255),
  password: z.string().min(1, 'Password is required.').max(128),
});

export function createAuthRouter(prisma: PrismaClient): Router {
  const router = Router();

  /** POST /api/auth/login */
  router.post('/auth/login', loginRateLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message ?? 'Invalid input.', requestId: req.requestId },
      });
      return;
    }

    try {
      const { email, password } = parsed.data;
      const meta = {
        ipAddress: (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? req.ip,
        userAgent: req.headers['user-agent'],
      };
      const { token, user } = await attemptLogin(prisma, email, password, meta);
      res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
      res.json({
        success: true,
        user: { id: user.id, email: user.email, role: user.role, divisionId: user.divisionId },
      });
    } catch (err) {
      const e = err as Error & { status?: number };
      res.status(e.status ?? 500).json({
        success: false,
        error: { code: 'AUTH_FAILED', message: e.message, requestId: req.requestId },
      });
    }
  });

  /** POST /api/auth/logout */
  router.post('/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  /** GET /api/auth/me — returns current session user */
  router.get('/auth/me', authenticate, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, fullName: true, role: true, divisionId: true, isActive: true, lastLoginAt: true },
      });
      if (!user || !user.isActive) {
        res.clearCookie(COOKIE_NAME, { path: '/' });
        res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Session invalid.', requestId: req.requestId } });
        return;
      }
      res.json({ success: true, user });
    } catch {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to load session.', requestId: req.requestId } });
    }
  });

  return router;
}
