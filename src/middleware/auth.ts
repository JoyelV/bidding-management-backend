import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { userId: number; email: string; role: string };
  filePath?: string;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
     res.status(401).json({ error: 'No token provided' });
     return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as {
      userId: number;
      email: string;
      role: string;
    };

    // Assign user with all required properties
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
     res.status(401).json({ error: 'Invalid token' });
     return
  }
};

export { AuthRequest, authMiddleware };