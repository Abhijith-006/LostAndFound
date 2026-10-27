import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

import { getJwtSecret } from '../config/jwt';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: 'Not authorized, token missing' });
        return;
      }
      const jwtSecret = getJwtSecret();
      const decoded = jwt.verify(token, jwtSecret) as any;

      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }
      req.user = user;
      next();
      return;
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`JWT verification failed: ${error?.message || error}`);
      }
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, please log in first' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this resource`,
      });
      return;
    }

    next();
  };
};

