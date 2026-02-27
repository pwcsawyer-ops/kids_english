import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createError } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// Get today's learning words
router.get('/today', async (req, res, next) => {
  try {
    const userId = req.user!.id

    // Get words user hasn't learned yet
    const learnedWordIds = await prisma.wordProgress.findMany({
      where: { userId, status: { not: 'new' } },
      select: { wordId: true }
    })

    const learnedIds = learnedWordIds.map(p => p.wordId)

    const words = await prisma.word.findMany({
      where: {
        id: { notIn: learnedIds }
      },
      take: 10,
      orderBy: { word: 'asc' }
    })

    // Get review words due today
    const reviewWords = await prisma.reviewCard.findMany({
      where: {
        userId,
        nextReview: { lte: new Date() }
      },
      include: { word: true },
      take: 10
    })

    res.json({
      words,
      reviewWords: reviewWords.map(r => r.word),
      totalNew: words.length,
      totalReview: reviewWords.length
    })
  } catch (error) {
    next(error)
  }
})

// Get review words
router.get('/review', async (req, res, next) => {
  try {
    const userId = req.user!.id

    // Get words due for review based on Ebbinghaus curve
    const reviewCards = await prisma.reviewCard.findMany({
      where: {
        userId,
        nextReview: { lte: new Date() }
      },
      include: { word: true },
      take: 20,
      orderBy: { nextReview: 'asc' }
    })

    res.json({
      words: reviewCards.map(r => ({
        ...r.word,
        interval: r.interval,
        repetitions: r.repetitions
      })),
      total: reviewCards.length
    })
  } catch (error) {
    next(error)
  }
})

// Record learning progress
router.post('/progress', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { wordId, status, quality } = z.object({
      wordId: z.string(),
      status: z.enum(['known', 'unknown']).optional(),
      quality: z.number().min(0).max(5).optional() // For SM-2 algorithm
    }).parse(req.body)

    const word = await prisma.word.findUnique({ where: { id: wordId } })
    if (!word) {
      throw createError('Word not found', 404)
    }

    // Get or create progress
    let progress = await prisma.wordProgress.findUnique({
      where: { userId_wordId: { userId, wordId } }
    })

    if (!progress) {
      progress = await prisma.wordProgress.create({
        data: { userId, wordId, status: 'learning' }
      })
    }

    // Update progress
    if (status === 'known') {
      await prisma.wordProgress.update({
        where: { id: progress.id },
        data: {
          correctCount: { increment: 1 },
          lastReviewAt: new Date()
        }
      })

      // Add to review cards (Ebbinghaus SM-2 algorithm)
      await updateReviewCard(userId, wordId, quality || 4)
    } else {
      await prisma.wordProgress.update({
        where: { id: progress.id },
        data: {
          wrongCount: { increment: 1 },
          lastReviewAt: new Date()
        }
      })

      // Add to wrong book
      await addToWrongBook(userId, wordId)

      // Reduce interval for wrong answer
      await updateReviewCard(userId, wordId, quality || 1)
    }

    // Update user stats
    await updateUserStats(userId, status === 'known')

    res.json({ message: 'Progress recorded' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors[0].message, 400))
    } else {
      next(error)
    }
  }
})

// SM-2 Algorithm implementation (Ebbinghaus curve)
async function updateReviewCard(userId: string, wordId: string, quality: number) {
  // quality: 0-5 (0-2 = fail, 3-5 = pass)
  // 5 = perfect response
  // 4 = correct after hesitation
  // 3 = correct with difficulty
  // 2 = incorrect but remembered
  // 1 = incorrect but easy to recall
  // 0 = complete blackout

  let card = await prisma.reviewCard.findUnique({
    where: { userId_wordId: { userId, wordId } }
  })

  if (!card) {
    card = await prisma.reviewCard.create({
      data: {
        userId,
        wordId,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0
      }
    })
  }

  let { interval, easeFactor, repetitions } = card

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 3
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions++
  } else {
    // Incorrect response
    repetitions = 0
    interval = 1
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  await prisma.reviewCard.update({
    where: { id: card.id },
    data: {
      interval,
      easeFactor,
      repetitions,
      nextReview
    }
  })
}

// Add to wrong book
async function addToWrongBook(userId: string, wordId: string) {
  const existing = await prisma.wrongWord.findUnique({
    where: { userId_wordId: { userId, wordId } }
  })

  if (existing) {
    await prisma.wrongWord.update({
      where: { id: existing.id },
      data: {
        wrongCount: { increment: 1 },
        lastWrongAt: new Date()
      }
    })
  } else {
    await prisma.wrongWord.create({
      data: { userId, wordId }
    })
  }
}

// Update user stats
async function updateUserStats(userId: string, isCorrect: boolean) {
  const today = new Date().toISOString().split('T')[0]

  const stat = await prisma.dailyStat.findUnique({
    where: { userId_date: { userId, date: today } }
  })

  if (stat) {
    await prisma.dailyStat.update({
      where: { id: stat.id },
      data: {
        wordsLearned: isCorrect ? { increment: 1 } : stat.wordsLearned,
        expEarned: isCorrect ? { increment: 10 } : stat.expEarned,
        coinsEarned: isCorrect ? { increment: 1 } : stat.coinsEarned
      }
    })
  } else {
    await prisma.dailyStat.create({
      data: {
        userId,
        date: today,
        wordsLearned: isCorrect ? 1 : 0,
        expEarned: isCorrect ? 10 : 0,
        coinsEarned: isCorrect ? 1 : 0
      }
    })
  }

  // Update user level and streak
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    const newExp = user.exp + (isCorrect ? 10 : 2)
    const newLevel = Math.floor(newExp / 100) + 1
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        exp: newExp,
        level: newLevel,
        coins: { increment: isCorrect ? 1 : 0 }
      }
    })
  }
}

// Get learning stats
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const today = new Date().toISOString().split('T')[0]

    const [todayStat, totalWords, masteredWords, reviewCount] = await Promise.all([
      prisma.dailyStat.findUnique({
        where: { userId_date: { userId, date: today } }
      }),
      prisma.wordProgress.count({ where: { userId } }),
      prisma.wordProgress.count({ where: { userId, status: 'mastered' } }),
      prisma.reviewCard.count({
        where: { userId, nextReview: { lte: new Date() } }
      })
    ])

    res.json({
      wordsLearned: todayStat?.wordsLearned || 0,
      wordsReviewed: todayStat?.wordsReviewed || 0,
      practiceTime: todayStat?.practiceTime || 0,
      totalWords,
      masteredWords,
      reviewCount
    })
  } catch (error) {
    next(error)
  }
})

export default router
