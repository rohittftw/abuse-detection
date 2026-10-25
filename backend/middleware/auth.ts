import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/auth';
import { User } from '../models/User';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

type TokenPayload = {
  sub?: string;
};

/**
 * Verifies the Bearer token and attaches the current user to the request.
 * Every data route is mounted behind this middleware.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = jwt.verify(token, getJwtSecret()) as TokenPayload;
    if (!payload.sub) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = await User.findById(payload.sub)
      .select('name email')
      .lean()
      .exec();

    if (!user) {
      res.status(401).json({ error: 'Account no longer exists' });
      return;
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
