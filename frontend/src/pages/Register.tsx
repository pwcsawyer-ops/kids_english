import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    role: 'student' as 'student' | 'teacher' | 'parent',
    inviteCode: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.username || !form.password || !form.nickname) {
      toast.error('请填写所有必填项')
      return
    }
    
    if (form.password !== form.confirmPassword) {
      toast.error('两次密码输入不一致')
      return
    }
    
    if (form.password.length < 6) {
      toast.error('密码至少6位')
      return
    }
    
    setLoading(true)
    try {
      await register({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        role: form.role,
        inviteCode: form.inviteCode || undefined,
      })
      toast.success('注册成功！')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎加入</h1>
          <p className="text-gray-500">开启英语学习之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称 *</label>
            <input
              type="text"
              placeholder="给自己起个名字"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
            <input
              type="text"
              placeholder="用于登录"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码 *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="至少6位"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码 *</label>
            <input
              type="password"
              placeholder="再次输入密码"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">我是 *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'student', label: '学生', emoji: '👨‍🎓' },
                { value: 'teacher', label: '教师', emoji: '👩‍🏫' },
                { value: 'parent', label: '家长', emoji: '👨‍👩‍👧' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: option.value as any })}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    form.role === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl block mb-1">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邀请码（可选）</label>
            <input
              type="text"
              placeholder="教师或家长请填写"
              value={form.inviteCode}
              onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                注册中...
              </span>
            ) : (
              '立即注册'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          已有账号？{' '}
          <Link to="/login" className="text-primary-500 font-semibold hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
