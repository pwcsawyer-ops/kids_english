import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createError } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// Get words list
router.get('/', async (req, res, next) => {
  try {
    const { level, category, search, page = '1', limit = '20' } = req.query
    const userId = req.user!.id

    const where: any = {}

    if (level && level !== '全部') {
      where.level = level as string
    }

    if (category) {
      where.category = category as string
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
        orderBy: { word: 'asc' }
      }),
      prisma.word.count({ where })
    ])

    // Get user progress for these words
    const wordIds = words.map(w => w.id)
    const progress = await prisma.wordProgress.findMany({
      where: {
        userId,
        wordId: { in: wordIds }
      }
    })

    const progressMap = new Map(progress.map(p => [p.wordId, p]))

    const wordsWithProgress = words.map(word => ({
      ...word,
      mastered: progressMap.get(word.id)?.status === 'mastered'
    }))

    res.json({
      words: wordsWithProgress,
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

// Get single word
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const word = await prisma.word.findUnique({
      where: { id }
    })

    if (!word) {
      throw createError('Word not found', 404, 'NOT_FOUND')
    }

    res.json(word)
  } catch (error) {
    next(error)
  }
})

// Create word (admin/teacher only)
router.post('/', async (req, res, next) => {
  try {
    const wordSchema = z.object({
      word: z.string().min(1),
      phonetic: z.string().optional(),
      meaning: z.string().min(1),
      example: z.string().optional(),
      exampleCn: z.string().optional(),
      level: z.string().min(1),
      category: z.string().optional()
    })

    const data = wordSchema.parse(req.body)

    const word = await prisma.word.create({
      data
    })

    res.status(201).json(word)
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors[0].message, 400))
    } else {
      next(error)
    }
  }
})

// Update word
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const wordSchema = z.object({
      word: z.string().optional(),
      phonetic: z.string().optional(),
      meaning: z.string().optional(),
      example: z.string().optional(),
      exampleCn: z.string().optional(),
      level: z.string().optional(),
      category: z.string().optional()
    })

    const data = wordSchema.parse(req.body)

    const word = await prisma.word.update({
      where: { id },
      data
    })

    res.json(word)
  } catch (error) {
    next(error)
  }
})

// Delete word
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.word.delete({
      where: { id }
    })

    res.json({ message: 'Word deleted' })
  } catch (error) {
    next(error)
  }
})

// Import words (CSV format)
router.post('/import', async (req, res, next) => {
  try {
    const { words, replaceExisting = false } = req.body

    if (!Array.isArray(words)) {
      throw createError('Words must be an array', 400)
    }

    const wordSchema = z.object({
      word: z.string(),
      phonetic: z.string().optional(),
      meaning: z.string(),
      example: z.string().optional(),
      exampleCn: z.string().optional(),
      level: z.string(),
      category: z.string().optional()
    })

    let imported = 0
    let skipped = 0

    for (const wordData of words) {
      try {
        const data = wordSchema.parse(wordData)

        if (replaceExisting) {
          await prisma.word.upsert({
            where: { word: data.word },
            update: data,
            create: data
          })
        } else {
          const existing = await prisma.word.findUnique({
            where: { word: data.word }
          })

          if (!existing) {
            await prisma.word.create({ data })
            imported++
          } else {
            skipped++
          }
        }
      } catch {
        skipped++
      }
    }

    res.json({
      message: `Imported ${imported} words, skipped ${skipped}`,
      imported,
      skipped
    })
  } catch (error) {
    next(error)
  }
})

// Export words
router.get('/export/all', async (req, res, next) => {
  try {
    const { level } = req.query

    const where: any = {}
    if (level) {
      where.level = level
    }

    const words = await prisma.word.findMany({
      where,
      orderBy: { word: 'asc' }
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=words.csv')
    
    const csv = ['word,phonetic,meaning,example,exampleCn,level,category']
      .concat(words.map(w => 
        `"${w.word}","${w.phonetic || ''}","${w.meaning}","${w.example || ''}","${w.exampleCn || ''}","${w.level}","${w.category || ''}"`
      ))
      .join('\n')

    res.send(csv)
  } catch (error) {
    next(error)
  }
})

export default router
