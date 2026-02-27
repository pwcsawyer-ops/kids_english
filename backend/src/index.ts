import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Services
import { prisma } from './services/prisma.js'

// Routes
import authRoutes from './routes/auth.js'
import wordRoutes from './routes/words.js'
import learnRoutes from './routes/learn.js'
import wrongBookRoutes from './routes/wrongBook.js'
import gameRoutes from './routes/games.js'
import userRoutes from './routes/users.js'
import adminRoutes from './routes/admin.js'

// Middleware
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Make prisma available to routes
app.set('prisma', prisma)

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes
app.use('/api/words', authenticate, wordRoutes)
app.use('/api/learn', authenticate, learnRoutes)
app.use('/api/wrong-book', authenticate, wrongBookRoutes)
app.use('/api/games', authenticate, gameRoutes)
app.use('/api/users', authenticate, userRoutes)
app.use('/api/admin', authenticate, adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

// Start server
async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Initialize Telegram Bot (if token is provided)
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const { initTelegramBot } = await import('./services/telegram.js')
        initTelegramBot()
      } catch (e) {
        console.log('⚠️ Telegram bot 初始化失败:', e)
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

main()

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export { prisma }
