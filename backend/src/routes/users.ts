import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        role: true,
        avatar: true,
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

    // Get achievement count
    const achievementCount = await prisma.userAchievement.count({
      where: { userId }
    })

    // Get total words learned
    const wordsLearned = await prisma.wordProgress.count({
      where: { userId, status: { not: 'new' } }
    })

    // Get mastered words
    const masteredWords = await prisma.wordProgress.count({
      where: { userId, status: 'mastered' }
    })

    res.json({
      ...user,
      achievementCount,
      wordsLearned,
      masteredWords
    })
  } catch (error) {
    next(error)
  }
})

// Update profile
router.put('/profile', async (req, res, next) => {
  try {
    const userId = req.user!.id

    const schema = z.object({
      nickname: z.string().min(1).max(20).optional(),
      avatar: z.string().url().optional()
    })

    const data = schema.parse(req.body)

    const user = await prisma.user.update({
      where: { id: userId },
      data
    })

    res.json({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(error.errors[0].message)
    } else {
      next(error)
    }
  }
})

// Get user stats
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user!.id

    const [
      totalWords,
      masteredWords,
      wrongWords,
      totalGames,
      achievements,
      recentStats
    ] = await Promise.all([
      prisma.wordProgress.count({ where: { userId } }),
      prisma.wordProgress.count({ where: { userId, status: 'mastered' } }),
      prisma.wrongWord.count({ where: { userId } }),
      prisma.gameRecord.count({ where: { userId } }),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.dailyStat.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7
      })
    ])

    // Calculate accuracy
    const progress = await prisma.wordProgress.findMany({
      where: { userId },
      select: { correctCount: true, wrongCount: true }
    })

    const totalCorrect = progress.reduce((sum, p) => sum + p.correctCount, 0)
    const totalWrong = progress.reduce((sum, p) => sum + p.wrongCount, 0)
    const accuracy = totalCorrect + totalWrong > 0 
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
      : 0

    res.json({
      totalWords,
      masteredWords,
      wrongWords,
      totalGames,
      achievements,
      accuracy,
      recentStats
    })
  } catch (error) {
    next(error)
  }
})

// Get achievements
router.get('/achievements', async (req, res, next) => {
  try {
    const userId = req.user!.id

    const allAchievements = await prisma.achievement.findMany()
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    })

    const earnedIds = new Set(userAchievements.map(a => a.achievementId))

    const achievements = allAchievements.map(a => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: userAchievements.find(u => u.achievementId === a.id)?.earnedAt
    }))

    res.json({ achievements })
  } catch (error) {
    next(error)
  }
})

// Get calendar data
router.get('/calendar', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { year, month } = req.query

    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1)
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0)

    const stats = await prisma.dailyStat.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString().split('T')[0],
          lte: endDate.toISOString().split('T')[0]
        }
      }
    })

    res.json({ stats })
  } catch (error) {
    next(error)
  }
})

export default router
