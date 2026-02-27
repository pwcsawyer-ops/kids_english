import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Game configurations
const gameConfigs: Record<string, { expReward: number; coinReward: number; maxScore: number }> = {
  sprint: { expReward: 50, coinReward: 10, maxScore: 100 },
  target: { expReward: 60, coinReward: 15, maxScore: 100 },
  match: { expReward: 40, coinReward: 8, maxScore: 50 },
  quiz: { expReward: 30, coinReward: 5, maxScore: 30 }
}

// Start game
router.post('/start', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { type } = z.object({
      type: z.enum(['sprint', 'target', 'match', 'quiz'])
    }).parse(req.body)

    const config = gameConfigs[type]

    // Generate game questions based on game type
    const words = await prisma.word.findMany({
      take: config.maxScore,
      orderBy: { word: 'asc' }
    })

    res.json({
      gameId: `${type}-${Date.now()}`,
      type,
      questions: words.map(w => ({
        wordId: w.id,
        word: w.word,
        meaning: w.meaning,
        phonetic: w.phonetic
      })),
      config
    })
  } catch (error) {
    next(error)
  }
})

// Record game score
router.post('/score', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { gameId, score, answers } = z.object({
      gameId: z.string(),
      score: z.number().min(0),
      answers: z.array(z.object({
        wordId: z.string(),
        correct: z.boolean()
      })).optional()
    }).parse(req.body)

    const type = gameId.split('-')[0]
    const config = gameConfigs[type]

    if (!config) {
      throw new Error('Invalid game type')
    }

    // Calculate rewards based on score percentage
    const percentage = score / config.maxScore
    const expEarned = Math.round(config.expReward * percentage)
    const coinsEarned = Math.round(config.coinReward * percentage)

    // Record game play
    await prisma.gameRecord.create({
      data: {
        userId,
        gameType: type,
        score,
        expEarned,
        coinsEarned
      }
    })

    // Record wrong answers
    if (answers) {
      for (const answer of answers) {
        if (!answer.correct) {
          // Add to wrong book
          const existing = await prisma.wrongWord.findUnique({
            where: { userId_wordId: { userId, wordId: answer.wordId } }
          })

          if (existing) {
            await prisma.wrongWord.update({
              where: { id: existing.id },
              data: { wrongCount: { increment: 1 } }
            })
          } else {
            await prisma.wrongWord.create({
              data: { userId, wordId: answer.wordId, category: 'spelling' }
            })
          }
        }
      }
    }

    // Update user stats
    const today = new Date().toISOString().split('T')[0]
    const stat = await prisma.dailyStat.findUnique({
      where: { userId_date: { userId, date: today } }
    })

    if (stat) {
      await prisma.dailyStat.update({
        where: { id: stat.id },
        data: {
          gamesPlayed: { increment: 1 },
          expEarned: { increment: expEarned },
          coinsEarned: { increment: coinsEarned }
        }
      })
    } else {
      await prisma.dailyStat.create({
        data: {
          userId,
          date: today,
          gamesPlayed: 1,
          expEarned,
          coinsEarned
        }
      })
    }

    // Update user level
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user) {
      const newExp = user.exp + expEarned
      const newLevel = Math.floor(newExp / 100) + 1
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          exp: newExp,
          level: newLevel,
          coins: { increment: coinsEarned }
        }
      })
    }

    res.json({
      score,
      expEarned,
      coinsEarned,
      levelUp: user ? Math.floor((user.exp + expEarned) / 100) > user.level : false
    })
  } catch (error) {
    next(error)
  }
})

// Get leaderboard
router.get('/leaderboard/:type', async (req, res, next) => {
  try {
    const { type } = req.params

    const records = await prisma.gameRecord.findMany({
      where: { gameType: type },
      include: {
        user: {
          select: { nickname: true, avatar: true }
        }
      },
      orderBy: { score: 'desc' },
      take: 20
    })

    // Group by user and get best score
    const userScores = new Map()
    for (const record of records) {
      const existing = userScores.get(record.userId)
      if (!existing || record.score > existing.score) {
        userScores.set(record.userId, {
          userId: record.userId,
          nickname: record.user.nickname,
          avatar: record.user.avatar,
          score: record.score,
          playedAt: record.playedAt
        })
      }
    }

    const leaderboard = Array.from(userScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    res.json({ leaderboard })
  } catch (error) {
    next(error)
  }
})

// Get game history
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { limit = '10' } = req.query

    const records = await prisma.gameRecord.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: parseInt(limit as string)
    })

    res.json({ records })
  } catch (error) {
    next(error)
  }
})

export default router
