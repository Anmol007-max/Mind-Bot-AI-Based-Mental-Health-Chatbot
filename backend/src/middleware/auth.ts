// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Session } from '../models/Session';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Token missing.' });
    }

    // 1. Verify the JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

    // 2. Check for an active session (for token revocation/logout)
    const session = await Session.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!session) {
      return res.status(401).json({ message: 'Session expired or invalidated.' });
    }

    // 3. Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // 4. Attach user object to the request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};