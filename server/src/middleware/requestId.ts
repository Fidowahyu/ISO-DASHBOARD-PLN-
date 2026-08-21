import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

const formatDate = (d: Date) =>
  `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  const id = `REQ-${formatDate(new Date())}-${suffix}`;
  (req as Request & { requestId: string }).requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}
