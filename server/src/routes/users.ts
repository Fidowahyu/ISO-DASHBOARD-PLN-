import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth';
import { randomBytes } from 'crypto';

const createUserSchema = z.object({
  email: z.string().email('Invalid email.').max(255),
  fullName: z.string().min(2).max(255),
  role: z.nativeEnum(Role),
  divisionId: z.string().uuid().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128).optional(),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  role: z.nativeEnum(Role).optional(),
  divisionId: z.string().uuid().optional().nullable(),
});

export function createUsersRouter(prisma: PrismaClient): Router {
  const router = Router();

  // All user management routes require authentication + ADMIN role
  router.use(authenticate, requireRole(Role.ADMIN));

  const USER_SELECT = {
    id: true,
    email: true,
    fullName: true,
    role: true,
    divisionId: true,
    isActive: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    division: { select: { id: true, code: true, name: true } },
  } as const;

  /** GET /api/users */
  router.get('/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: USER_SELECT,
        orderBy: [{ isActive: 'desc' }, { fullName: 'asc' }],
      });
      res.json({ success: true, users });
    } catch {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to load users.', requestId: req.requestId } });
    }
  });

  /** GET /api/users/:id */
  router.get('/users/:id', async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: USER_SELECT });
      if (!user) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.', requestId: req.requestId } }); return; }
      res.json({ success: true, user });
    } catch {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to load user.', requestId: req.requestId } });
    }
  });

  /** POST /api/users */
  router.post('/users', async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message ?? 'Invalid input.', requestId: req.requestId } });
      return;
    }
    try {
      const { email, fullName, role, divisionId, password } = parsed.data;
      const initialPassword = password ?? randomBytes(12).toString('base64').slice(0, 16);
      const passwordHash = await bcrypt.hash(initialPassword, 12);
      const user = await prisma.user.create({
        data: { email: email.toLowerCase(), fullName, role, divisionId: divisionId ?? null, passwordHash },
        select: USER_SELECT,
      });
      // Return generated password only on creation so admin can share with user
      res.status(201).json({ success: true, user, ...(password ? {} : { temporaryPassword: initialPassword }) });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'P2002') {
        res.status(409).json({ success: false, error: { code: 'DUPLICATE_EMAIL', message: 'A user with this email already exists.', requestId: req.requestId } });
        return;
      }
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create user.', requestId: req.requestId } });
    }
  });

  /** PATCH /api/users/:id */
  router.patch('/users/:id', async (req, res) => {
    // Admin cannot modify their own role to prevent lockout
    if (req.params.id === req.user!.id && req.body.role && req.body.role !== Role.ADMIN) {
      res.status(400).json({ success: false, error: { code: 'SELF_ROLE_CHANGE', message: 'You cannot change your own role.', requestId: req.requestId } });
      return;
    }
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message ?? 'Invalid input.', requestId: req.requestId } });
      return;
    }
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: parsed.data, select: USER_SELECT });
      res.json({ success: true, user });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'P2025') { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.', requestId: req.requestId } }); return; }
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update user.', requestId: req.requestId } });
    }
  });

  /** POST /api/users/:id/deactivate */
  router.post('/users/:id/deactivate', async (req, res) => {
    if (req.params.id === req.user!.id) {
      res.status(400).json({ success: false, error: { code: 'SELF_DEACTIVATE', message: 'You cannot deactivate your own account.', requestId: req.requestId } });
      return;
    }
    try {
      await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
      res.json({ success: true, message: 'User deactivated.' });
    } catch {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to deactivate user.', requestId: req.requestId } });
    }
  });

  /** POST /api/users/:id/activate */
  router.post('/users/:id/activate', async (req, res) => {
    try {
      await prisma.user.update({ where: { id: req.params.id }, data: { isActive: true } });
      res.json({ success: true, message: 'User activated.' });
    } catch {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to activate user.', requestId: req.requestId } });
    }
  });

  /** POST /api/users/:id/reset-password */
  router.post('/users/:id/reset-password', async (req, res) => {
    try {
      const tempPassword = randomBytes(12).toString('base64').slice(0, 16);
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
      res.json({ success: true, temporaryPassword: tempPassword, message: 'Password reset. Share this temporary password with the user securely.' });
    } catch {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to reset password.', requestId: req.requestId } });
    }
  });

  return router;
}
