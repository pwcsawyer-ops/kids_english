import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Get wrong words
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { category } = req.query

    const where: any = { userId }
    if (category && category !== 'all') {
      where.category = category as string
    }

    const wrongWords = await prisma.wrongWord.findMany({
      where,
      include: { word: true },
      orderBy: { lastWrongAt: 'desc' }
    })

    res.json({
      words: wrongWords.map(w => ({
        id: w.id,
        word: w.word.word,
        phonetic: w.word.phonetic,
        meaning: w.word.meaning,
        wrongCount: w.wrongCount,
        lastWrongAt: w.lastWrongAt,
        category: w.category
      })),
      total: wrongWords.length
    })
  } catch (error) {
    next(error)
  }
})

// Add to wrong book
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { wordId, category = 'spelling' } = z.object({
      wordId: z.string(),
      category: z.enum(['spelling', 'listening', 'reading', 'grammar']).optional()
    }).parse(req.body)

    const existing = await prisma.wrongWord.findUnique({
      where: { userId_wordId: { userId, wordId } }
    })

    if (existing) {
      await prisma.wrongWord.update({
        where: { id: existing.id },
        data: {
          wrongCount: { increment: 1 },
          lastWrongAt: new Date(),
          category
        }
      })
    } else {
      await prisma.wrongWord.create({
        data: { userId, wordId, category }
      })
    }

    res.json({ message: 'Added to wrong book' })
  } catch (error) {
    next(error)
  }
})

// Remove from wrong book
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.wrongWord.delete({
      where: { id }
    })

    res.json({ message: 'Removed from wrong book' })
  } catch (error) {
    next(error)
  }
})

// Clear all wrong words
router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user!.id

    await prisma.wrongWord.deleteMany({
      where: { userId }
    })

    res.json({ message: 'Wrong book cleared' })
  } catch (error) {
    next(error)
  }
})

// Get wrong word statistics
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user!.id

    const [total, serious, byCategory] = await Promise.all([
      prisma.wrongWord.count({ where: { userId } }),
      prisma.wrongWord.count({ where: { userId, wrongCount: { gte: 3 } } }),
      prisma.wrongWord.groupBy({
        by: ['category'],
        where: { userId },
        _count: true
      })
    ])

    res.json({
      total,
      serious,
      byCategory: byCategory.map(c => ({
        category: c.category,
        count: c._count
      }))
    })
  } catch (error) {
    next(error)
  }
})

export default router
