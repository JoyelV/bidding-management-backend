import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Extend the Express Request type to include user data
export interface AuthRequest extends Request {
  user?: { userId: number };
}

const prisma = new PrismaClient();

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       res.status(401).json({ error: 'No token provided' });
       return;
    }

    const token = authHeader.split(' ')[1]; // Extract the token (Bearer <token>)

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
       res.status(401).json({ error: 'User not found' });
       return;
    }

    // Attach user data to the request object
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
     res.status(401).json({ error: 'Invalid token' });
     return;
  }
};