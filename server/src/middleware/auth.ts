import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  divisionId: string | null;
}

// Extend Express Request type to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
  return secret;
}

/** Verify JWT from HttpOnly cookie and attach user to request. */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token: string | undefined = req.cookies?.['iso_token'];

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication is required.',
        requestId: req.requestId,
      },
    });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as AuthUser & { iat: number; exp: number };
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      divisionId: payload.divisionId,
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Session expired. Please log in again.',
        requestId: req.requestId,
      },
    });
  }
}

/** Require one of the specified roles. Must be used after authenticate(). */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.', requestId: req.requestId },
      });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          requestId: req.requestId,
        },
      });
      return;
    }
    next();
  };
}

/** Sign a JWT token for the given user. */
export function signToken(user: AuthUser): string {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '8h';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, divisionId: user.divisionId },
    getJwtSecret(),
    { expiresIn } as jwt.SignOptions,
  );
}
