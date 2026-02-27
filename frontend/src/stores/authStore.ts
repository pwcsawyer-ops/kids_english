import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export interface User {
  id: string
  telegramId?: string
  username: string
  nickname: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  avatar?: string
  level: number
  exp: number
  coins: number
  streak: number
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  refreshUser: () => Promise<void>
}

interface RegisterData {
  username: string
  password: string
  nickname: string
  role: 'student' | 'teacher' | 'parent'
  inviteCode?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password })
        const { user, token } = response.data
        
        set({ user, token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      register: async (data: RegisterData) => {
        const response = await api.post('/auth/register', data)
        const { user, token } = response.data
        
        set({ user, token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      updateUser: (data: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },

      refreshUser: async () => {
        const response = await api.get('/auth/me')
        set({ user: response.data })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      },
    }
  )
)
