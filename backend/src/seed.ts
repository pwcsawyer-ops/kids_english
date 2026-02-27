import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// KET vocabulary (sample)
const ketWords = [
  { word: 'apple', phonetic: '/ˈæp.əl/', meaning: '苹果', example: 'An apple a day keeps the doctor away.', level: 'KET', category: 'food' },
  { word: 'book', phonetic: '/bʊk/', meaning: '书', example: 'I like reading books.', level: 'KET', category: 'learning' },
  { word: 'car', phonetic: '/kɑːr/', meaning: '汽车', example: 'My father drives a car.', level: 'KET', category: 'transport' },
  { word: 'dog', phonetic: '/dɒɡ/', meaning: '狗', example: 'The dog is barking.', level: 'KET', category: 'animals' },
  { word: 'eat', phonetic: '/iːt/', meaning: '吃', example: 'I eat breakfast every morning.', level: 'KET', category: 'actions' },
  { word: 'family', phonetic: '/ˈfæm.əl.i/', meaning: '家庭', example: 'My family is very big.', level: 'KET', category: 'people' },
  { word: 'good', phonetic: '/ɡʊd/', meaning: '好的', example: 'This is a good book.', level: 'KET', category: 'adjectives' },
  { word: 'happy', phonetic: '/ˈhæp.i/', meaning: '开心的', example: 'I am very happy today.', level: 'KET', category: 'feelings' },
  { word: 'ice', phonetic: '/aɪs/', meaning: '冰', example: 'The ice is very cold.', level: 'KET', category: 'nature' },
  { word: 'jump', phonetic: '/dʒʌmp/', meaning: '跳', example: 'The cat can jump high.', level: 'KET', category: 'actions' },
  { word: 'kitchen', phonetic: '/ˈkɪtʃ.ɪn/', meaning: '厨房', example: 'My mother is in the kitchen.', level: 'KET', category: 'places' },
  { word: 'love', phonetic: '/lʌv/', meaning: '爱', example: 'I love my family.', level: 'KET', category: 'feelings' },
  { word: 'music', phonetic: '/ˈmjuː.zɪk/', meaning: '音乐', example: 'I like listening to music.', level: 'KET', category: 'arts' },
  { word: 'name', phonetic: '/neɪm/', meaning: '名字', example: 'What is your name?', level: 'KET', category: 'people' },
  { word: 'orange', phonetic: '/ˈɒr.ɪndʒ/', meaning: '橙子', example: 'I drink orange juice.', level: 'KET', category: 'food' },
  { word: 'play', phonetic: '/pleɪ/', meaning: '玩', example: 'Children like to play.', level: 'KET', category: 'actions' },
  { word: 'quiet', phonetic: '/ˈkwaɪ.ət/', meaning: '安静的', example: 'Please be quiet.', level: 'KET', category: 'adjectives' },
  { word: 'run', phonetic: '/rʌn/', meaning: '跑', example: 'I run every morning.', level: 'KET', category: 'actions' },
  { word: 'school', phonetic: '/skuːl/', meaning: '学校', example: 'I go to school every day.', level: 'KET', category: 'places' },
  { word: 'time', phonetic: '/taɪm/', meaning: '时间', example: 'What time is it?', level: 'KET', category: 'general' },
]

// PET vocabulary (sample)
const petWords = [
  { word: 'achieve', phonetic: '/əˈtʃiːv/', meaning: '实现', example: 'She achieved her goal.', level: 'PET', category: 'actions' },
  { word: 'believe', phonetic: '/bɪˈliːv/', meaning: '相信', example: 'I believe in you.', level: 'PET', category: 'actions' },
  { word: 'calculate', phonetic: '/ˈkæl.kjə.leɪt/', meaning: '计算', example: 'Can you calculate the cost?', level: 'PET', category: 'actions' },
  { word: 'describe', phonetic: '/dɪˈskraɪb/', meaning: '描述', example: 'Can you describe it?', level: 'PET', category: 'actions' },
  { word: 'environment', phonetic: '/ɪnˈvaɪ.rən.mənt/', meaning: '环境', example: 'We must protect the environment.', level: 'PET', category: 'nature' },
  { word: 'familiar', phonetic: '/fəˈmɪl.i.ər/', meaning: '熟悉的', example: 'This looks familiar.', level: 'PET', category: 'adjectives' },
  { word: 'generate', phonetic: '/ˈdʒen.ə.reɪt/', meaning: '产生', example: 'This generates heat.', level: 'PET', category: 'actions' },
  { word: 'hypothesis', phonetic: '/haɪˈpɒθ.ə.sɪs/', meaning: '假设', example: 'This is just a hypothesis.', level: 'PET', category: 'science' },
]

// Cambridge Starters (YLE Starters)
const startersWords = [
  { word: 'ant', phonetic: '/ænt/', meaning: '蚂蚁', example: 'The ant is small.', level: 'Starters', category: 'animals' },
  { word: 'bag', phonetic: '/bæɡ/', meaning: '包', example: 'I have a big bag.', level: 'Starters', category: 'things' },
  { word: 'cat', phonetic: '/kæt/', meaning: '猫', example: 'The cat is cute.', level: 'Starters', category: 'animals' },
  { word: 'dog', phonetic: '/dɒɡ/', meaning: '狗', example: 'The dog is friendly.', level: 'Starters', category: 'animals' },
  { word: 'egg', phonetic: '/eɡ/', meaning: '鸡蛋', example: 'I want an egg.', level: 'Starters', category: 'food' },
  { word: 'fish', phonetic: '/fɪʃ/', meaning: '鱼', example: 'The fish is swimming.', level: 'Starters', category: 'animals' },
  { word: 'girl', phonetic: '/ɡɜːl/', meaning: '女孩', example: 'The girl is smiling.', level: 'Starters', category: 'people' },
  { word: 'hand', phonetic: '/hænd/', meaning: '手', example: 'Raise your hand.', level: 'Starters', category: 'body' },
  { word: 'ice cream', phonetic: '/aɪs kriːm/', meaning: '冰淇淋', example: 'I like ice cream.', level: 'Starters', category: 'food' },
  { word: 'juice', phonetic: '/dʒuːs/', meaning: '果汁', example: 'I want some juice.', level: 'Starters', category: 'food' },
]

// Achievements
const achievements = [
  { code: 'first_word', name: '初学者', description: '学习第一个单词', icon: '📖', expReward: 10, coinReward: 5 },
  { code: 'ten_words', name: '小试牛刀', description: '学习10个单词', icon: '📚', expReward: 50, coinReward: 20 },
  { code: 'fifty_words', name: '词汇达人', description: '学习50个单词', icon: '🏅', expReward: 100, coinReward: 50 },
  { code: 'hundred_words', name: '单词高手', description: '学习100个单词', icon: '🏆', expReward: 200, coinReward: 100 },
  { code: 'first_game', name: '游戏达人', description: '完成第一个游戏', icon: '🎮', expReward: 20, coinReward: 10 },
  { code: 'streak_7', name: '坚持不懈', description: '连续学习7天', icon: '🔥', expReward: 100, coinReward: 50 },
  { code: 'streak_30', name: '持之以恒', description: '连续学习30天', icon: '💪', expReward: 300, coinReward: 150 },
  { code: 'perfect_game', name: '完美通关', description: '游戏获得满分', icon: '⭐', expReward: 50, coinReward: 30 },
  { code: 'all_mastered', name: '炉火纯青', description: '掌握所有已学单词', icon: '👑', expReward: 500, coinReward: 200 },
  { code: 'first_wrong', name: '知错能改', description: '添加第一个错题', icon: '📝', expReward: 10, coinReward: 5 },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      nickname: '管理员',
      role: 'admin',
      level: 10,
      exp: 1000,
      coins: 500
    }
  })
  console.log('✅ Admin user created')

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  await prisma.user.upsert({
    where: { username: 'teacher' },
    update: {},
    create: {
      username: 'teacher',
      password: teacherPassword,
      nickname: '李老师',
      role: 'teacher',
      level: 5,
      exp: 500,
      coins: 200
    }
  })
  console.log('✅ Teacher user created')

  // Create demo student
  const studentPassword = await bcrypt.hash('student123', 10)
  await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      password: studentPassword,
      nickname: '小明',
      role: 'student',
      level: 2,
      exp: 150,
      coins: 50,
      streak: 3
    }
  })
  console.log('✅ Demo student created')

  // Create words
  const allWords = [...ketWords, ...petWords, ...startersWords]
  
  for (const word of allWords) {
    await prisma.word.upsert({
      where: { word: word.word },
      update: {},
      create: word
    })
  }
  console.log(`✅ Created ${allWords.length} words`)

  // Create achievements
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: achievement
    })
  }
  console.log(`✅ Created ${achievements.length} achievements`)

  console.log('🌸 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
