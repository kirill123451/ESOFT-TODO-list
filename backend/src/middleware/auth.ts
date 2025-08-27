import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export interface AuthRequest extends Request {
  userId?: number
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies.token

  if (!token) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return
  }

  try {
    const decoded = verifyToken(token)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(403).json({ error: 'Неверный токен' })
  }
}