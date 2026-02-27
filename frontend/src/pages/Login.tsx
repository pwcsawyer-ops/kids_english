import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('请填写用户名和密码')
      return
    }
    
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('登录成功！')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
          <span className="text-5xl">📚</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">英语学习小助手</h1>
        <p className="text-gray-500 mb-8">让学习变得更有趣</p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <input
              type="text"
              placeholder="用户名"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input"
              autoComplete="username"
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="密码"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input pr-12"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '登录'
            )}
          </button>
        </form>

        <p className="mt-6 text-gray-500">
          还没有账号？{' '}
          <Link to="/register" className="text-primary-500 font-semibold hover:underline">
            立即注册
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-400">
          © 2024 英语学习小助手 · 让学习更有趣
        </p>
      </div>
    </div>
  )
}
