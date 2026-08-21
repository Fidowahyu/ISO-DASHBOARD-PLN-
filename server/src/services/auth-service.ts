import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthUser, signToken } from '../middleware/auth';
import { logger } from '../middleware/logger';

const COOKIE_NAME = 'iso_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: parseDurationToMs(process.env.JWT_EXPIRES_IN ?? '8h'),
  path: '/',
};

function parseDurationToMs(duration: string): number {
  const map: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 8 * 3600000; // default 8h
  return parseInt(match[1], 10) * (map[match[2]] ?? 3600000);
}

/**
 * Attempt login. Returns a signed JWT string on success.
 * Throws an Error with .status property on failure.
 */
export async function attemptLogin(
  prisma: PrismaClient,
  email: string,
  password: string,
  meta: { ipAddress?: string; userAgent?: string },
): Promise<{ token: string; user: Omit<AuthUser, never> }> {
  // Always record the attempt (success or failure) for audit
  const recordAttempt = (success: boolean) =>
    prisma.loginAttempt.create({
      data: { email: email.toLowerCase(), success, ipAddress: meta.ipAddress, userAgent: meta.userAgent },
    }).catch(() => {/* non-fatal */});

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, passwordHash: true, role: true, divisionId: true, isActive: true, fullName: true },
  });

  if (!user) {
    // Use constant-time comparison to prevent email enumeration via timing
    await bcrypt.compare(password, '$2a$12$placeholder.hash.that.never.matches.anything.at.all');
    await recordAttempt(false);
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }

  if (!user.isActive) {
    await recordAttempt(false);
    throw Object.assign(new Error('Your account has been deactivated. Please contact an administrator.'), { status: 403 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await recordAttempt(false);
    logger.warn('Failed login attempt', { email: user.email, ip: meta.ipAddress });
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }

  await recordAttempt(true);

  // Update lastLoginAt (fire-and-forget, non-blocking)
  prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {/* non-fatal */});

  const authUser: AuthUser = { id: user.id, email: user.email, role: user.role, divisionId: user.divisionId };
  const token = signToken(authUser);

  logger.info('User logged in', { userId: user.id, role: user.role });
  return { token, user: authUser };
}

export { COOKIE_NAME, COOKIE_OPTIONS };
