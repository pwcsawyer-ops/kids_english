import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  User, Settings, Award, Calendar, Star, 
  ChevronRight, LogOut, Bell, Shield
} from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      navigate('/login')
    }
  }

  const menuItems = [
    { icon: Award, label: '我的成就', path: '/profile/achievements', badge: '12' },
    { icon: Calendar, label: '学习日历', path: '/profile/calendar', badge: null },
    { icon: Star, label: '收藏夹', path: '/profile/favorites', badge: '5' },
    { icon: Bell, label: '通知设置', path: '/profile/notifications', badge: null },
    { icon: Shield, label: '隐私设置', path: '/profile/privacy', badge: null },
    { icon: Settings, label: '设置', path: '/profile/settings', badge: null },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="card bg-gradient-to-br from-primary-500 to-secondary-400 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              user?.nickname?.charAt(0) || 'U'
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{user?.nickname}</h2>
            <p className="text-primary-100">@{user?.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Lv.{user?.level || 1}
              </span>
              <span className="text-sm">🔥 {user?.streak || 0} 天连续</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-6 text-center">
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-xl font-bold">{user?.exp || 0}</p>
            <p className="text-xs text-primary-100">经验值</p>
          </div>
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-xl font-bold">{user?.coins || 0}</p>
            <p className="text-xs text-primary-100">金币</p>
          </div>
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-xl font-bold">150</p>
            <p className="text-xs text-primary-100">词汇量</p>
          </div>
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-xl font-bold">85%</p>
            <p className="text-xs text-primary-100">正确率</p>
          </div>
        </div>
      </div>

      {/* Achievements Preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">成就徽章</h3>
          <button className="text-primary-500 text-sm">查看全部</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {['🎯', '📚', '🏃', '⭐', '🌟', '🏆'].map((emoji, i) => (
            <div 
              key={i}
              className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="card p-0">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Icon className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-left font-medium text-gray-900">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-4 text-red-500 font-medium flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> 退出登录
      </button>
    </div>
  )
}
