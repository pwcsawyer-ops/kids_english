import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { createError } from './errorHandler.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    role: string
  }
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401, 'NO_TOKEN')
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const prisma: PrismaClient = req.app.get('prisma')
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true }
    })

    if (!user) {
      throw createError('User not found', 401, 'USER_NOT_FOUND')
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401, 'INVALID_TOKEN'))
    } else {
      next(error)
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Not authenticated', 401, 'NOT_AUTHENTICATED'))
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'))
    }

    next()
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}
