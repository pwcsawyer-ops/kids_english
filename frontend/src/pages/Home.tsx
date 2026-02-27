import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  Target, 
  Gift, 
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { learnApi } from '../services/api'

interface TodayStats {
  wordsLearned: number
  reviewCount: number
  practiceTime: number
  streak: number
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<TodayStats>({
    wordsLearned: 0,
    reviewCount: 0,
    practiceTime: 0,
    streak: 0,
  })

  useEffect(() => {
    // Fetch today's stats
    learnApi.getStats().then(res => setStats(res.data)).catch(console.error)
  }, [])

  const quickActions = [
    { 
      icon: BookOpen, 
      label: '开始学习', 
      color: 'from-primary-400 to-primary-500',
      path: '/learn',
      emoji: '📖'
    },
    { 
      icon: Target, 
      label: '每日复习', 
      color: 'from-orange-400 to-orange-500',
      path: '/wrong-book',
      emoji: '🎯'
    },
    { 
      icon: Trophy, 
      label: '游戏挑战', 
      color: 'from-purple-400 to-purple-500',
      path: '/games',
      emoji: '🏆'
    },
    { 
      icon: Gift, 
      label: '每日奖励', 
      color: 'from-yellow-400 to-yellow-500',
      path: '/profile',
      emoji: '🎁'
    },
  ]

  const expProgress = user ? (user.exp % 100) : 0

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="card bg-gradient-to-br from-primary-500 to-secondary-400 text-white overflow-hidden">
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm">你好，</p>
              <h2 className="text-2xl font-bold">{user?.nickname || '小朋友'}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              {user?.level ? `Lv.${user.level}` : 'Lv.1'}
            </div>
          </div>
          
          {/* Level Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>经验值</span>
              <span>{expProgress}/100</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${expProgress}%` }}
              />
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/10 rounded-xl py-2">
              <p className="text-2xl mb-0">🔥</p>
              <p className="text-xs">{user?.streak || 0}天</p>
            </div>
            <div className="bg-white/10 rounded-xl py-2">
              <p className="text-2xl mb-0">💰</p>
              <p className="text-xs">{user?.coins || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl py-2">
              <p className="text-2xl mb-0">📚</p>
              <p className="text-xs">{stats.wordsLearned}词</p>
            </div>
            <div className="bg-white/10 rounded-xl py-2">
              <p className="text-2xl mb-0">⏰</p>
              <p className="text-xs">{stats.practiceTime}分钟</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">快捷操作</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="card hover:scale-[1.02] transition-transform flex items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                  <span className="text-xl">{action.emoji}</span>
                </div>
                <span className="font-medium text-gray-900">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">今日任务</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {[
            { label: '学习新单词', progress: 5, total: 10, color: 'bg-primary-500' },
            { label: '复习旧单词', progress: 12, total: 20, color: 'bg-orange-500' },
            { label: '完成练习', progress: 3, total: 5, color: 'bg-purple-500' },
          ].map((task, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{task.label}</span>
                  <span className="text-gray-500">{task.progress}/{task.total}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${task.color} rounded-full transition-all`}
                    style={{ width: `${(task.progress / task.total) * 100}%` }}
                  />
                </div>
              </div>
              {task.progress >= task.total && (
                <Sparkles className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Reminder */}
      {stats.reviewCount > 0 && (
        <div 
          onClick={() => navigate('/wrong-book')}
          className="card bg-orange-50 border-orange-200 cursor-pointer hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">复习提醒</p>
              <p className="text-sm text-gray-600">你有 {stats.reviewCount} 个单词需要复习</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  )
}
