import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Home, BookOpen, List, PenTool, Gamepad2, FileX, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/learn', icon: BookOpen, label: '学习' },
  { path: '/words', icon: List, label: '词库' },
  { path: '/practice', icon: PenTool, label: '练习' },
  { path: '/games', icon: Gamepad2, label: '游戏' },
  { path: '/wrong-book', icon: FileX, label: '错题' },
  { path: '/profile', icon: User, label: '我的' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
            英语学习小助手
          </h1>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-0 z-40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                  {user?.nickname?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.nickname}</p>
                  <p className="text-xs text-gray-500">Lv.{user?.level || 1}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-secondary-500">💰</span>
                <span>{user?.coins || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-orange-500">🔥</span>
                <span>{user?.streak || 0}天</span>
              </div>
            </div>
          </div>
          
          <nav className="p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
            
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <button
                onClick={() => {
                  navigate('/admin')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-gray-600 hover:bg-gray-50"
              >
                <span className="w-5 h-5">⚙️</span>
                <span className="font-medium">管理后台</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">退出登录</span>
            </button>
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-pb">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
