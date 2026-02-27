import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateToken } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  nickname: z.string().min(1).max(20),
  role: z.enum(['student', 'teacher', 'parent']),
  inviteCode: z.string().optional()
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const token = generateToken(user.id)

    res.json({
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        avatar: user.avatar,
        level: user.level,
        exp: user.exp,
        coins: user.coins,
        streak: user.streak
      },
      token
    })
  } catch (error) {
    next(error)
  }
})

// Register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    })

    if (existingUser) {
      throw createError('Username already exists', 400, 'USERNAME_EXISTS')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        nickname: data.nickname,
        role: data.role
      }
    })

    const token = generateToken(user.id)

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        level: user.level,
        exp: user.exp,
        coins: user.coins,
        streak: user.streak
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw createError('No token', 401, 'NO_TOKEN')
    }

    const token = authHeader.split(' ')[1]
    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND')
    }

    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      role: user.role,
      avatar: user.avatar,
      level: user.level,
      exp: user.exp,
      coins: user.coins,
      streak: user.streak,
      createdAt: user.createdAt
    })
  } catch (error) {
    next(error)
  }
})

export default router
