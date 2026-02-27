import TelegramBot from 'node-telegram-bot-api'
import { prisma } from '../services/prisma'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export const bot = new TelegramBot(TOKEN, { polling: true })

export function initTelegramBot() {
  const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL || 'http://localhost:5173'

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id
    const telegramId = msg.from?.id.toString()
    
    // Check if user exists
    if (telegramId) {
      const user = await prisma.user.findFirst({
        where: { telegramId }
      })
      
      if (user) {
        bot.sendMessage(chatId, `欢迎回来，${user.username}！\n点击下方按钮进入学习：`, {
          reply_markup: {
            inline_keyboard: [[
              { text: '📚 开始学习', web_app: { url: miniAppUrl } }
            ]]
          }
        })
      } else {
        bot.sendMessage(chatId, '欢迎使用英语学习小程序！\n请先在网页端注册账号，然后绑定您的Telegram。')
      }
    }
  })

  // Handle /help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, `
📚 英语学习小程序命令：

/start - 开始学习
/help - 显示帮助
/profile - 查看个人资料
/review - 复习单词
    `)
  })

  // Handle /profile command
  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id
    const telegramId = msg.from?.id.toString()
    
    if (telegramId) {
      const user = await prisma.user.findFirst({
        where: { telegramId }
      })
      
      if (user) {
        bot.sendMessage(chatId, `
👤 个人信息
用户名: ${user.username}
角色: ${user.role}
        `)
      } else {
        bot.sendMessage(chatId, '未找到绑定账号，请在网页端注册。')
      }
    }
  })

  console.log('🤖 Telegram Bot 已启动')
}
