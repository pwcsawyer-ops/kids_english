import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// All admin routes require admin or teacher role
router.use(authorize('admin', 'teacher'))

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query

    const where: any = {}
    if (role && role !== 'all') {
      where.role = role as string
    }
    if (search) {
      where.OR = [
        { username: { contains: search as string } },
        { nickname: { contains: search as string } }
      ]
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          nickname: true,
          role: true,
          level: true,
          exp: true,
          coins: true,
          streak: true,
          createdAt: true,
          lastLoginAt: true
        }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get user details
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nickname: true,
        role: true,
        level: true,
        exp: true,
        coins: true,
        streak: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get stats
    const [totalWords, masteredWords, wrongWords, gamesPlayed] = await Promise.all([
      prisma.wordProgress.count({ where: { userId: id } }),
      prisma.wordProgress.count({ where: { userId: id, status: 'mastered' } }),
      prisma.wrongWord.count({ where: { userId: id } }),
      prisma.gameRecord.count({ where: { userId: id } })
    ])

    res.json({
      ...user,
      stats: { totalWords, masteredWords, wrongWords, gamesPlayed }
    })
  } catch (error) {
    next(error)
  }
})

// Update user
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { nickname, role, level, coins } = z.object({
      nickname: z.string().optional(),
      role: z.enum(['student', 'teacher', 'parent', 'admin']).optional(),
      level: z.number().optional(),
      coins: z.number().optional()
    }).parse(req.body)

    const user = await prisma.user.update({
      where: { id },
      data: { nickname, role, level, coins }
    })

    res.json(user)
  } catch (error) {
    next(error)
  }
})

// Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.user.delete({
      where: { id }
    })

    res.json({ message: 'User deleted' })
  } catch (error) {
    next(error)
  }
})

// Get dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentsCount,
      teachersCount,
      totalWords,
      totalGames,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.word.count(),
      prisma.gameRecord.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { nickname: true, role: true, createdAt: true }
      })
    ])

    // Get today's stats
    const today = new Date().toISOString().split('T')[0]
    const todayStats = await prisma.dailyStat.findMany({
      where: { date: today }
    })

    const todayLearned = todayStats.reduce((sum, s) => sum + s.wordsLearned, 0)
    const todayGames = todayStats.reduce((sum, s) => sum + s.gamesPlayed, 0)

    res.json({
      totalUsers,
      studentsCount,
      teachersCount,
      totalWords,
      totalGames,
      todayLearned,
      todayGames,
      recentUsers
    })
  } catch (error) {
    next(error)
  }
})

// Word management
router.get('/words', async (req, res, next) => {
  try {
    const { level, search, page = '1', limit = '20' } = req.query

    const where: any = {}
    if (level && level !== 'all') {
      where.level = level as string
    }
    if (search) {
      where.OR = [
        { word: { contains: search as string } },
        { meaning: { contains: search as string } }
      ]
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.word.count({ where })
    ])

    res.json({
      words,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    next(error)
  }
})

// Create word
router.post('/words', async (req, res, next) => {
  try {
    const data = z.object({
      word: z.string(),
      phonetic: z.string().optional(),
      meaning: z.string(),
      example: z.string().optional(),
      exampleCn: z.string().optional(),
      level: z.string(),
      category: z.string().optional()
    }).parse(req.body)

    const word = await prisma.word.create({ data })

    res.status(201).json(word)
  } catch (error) {
    next(error)
  }
})

// Bulk import words
router.post('/words/import', async (req, res, next) => {
  try {
    const { words } = req.body

    if (!Array.isArray(words)) {
      throw new Error('Words must be an array')
    }

    let imported = 0
    for (const word of words) {
      try {
        await prisma.word.create({ data: word })
        imported++
      } catch {
        // Skip duplicates
      }
    }

    res.json({ message: `Imported ${imported} words`, imported })
  } catch (error) {
    next(error)
  }
})

// Delete word
router.delete('/words/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.word.delete({ where: { id } })

    res.json({ message: 'Word deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
