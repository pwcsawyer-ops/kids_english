import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const authApi = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export const wordApi = {
  list: (params?: any) => api.get('/words', { params }),
  get: (id: string) => api.get(`/words/${id}`),
  create: (data: any) => api.post('/words', data),
  update: (id: string, data: any) => api.put(`/words/${id}`, data),
  delete: (id: string) => api.delete(`/words/${id}`),
  import: (data: any) => api.post('/words/import', data),
}

export const learnApi = {
  getTodayWords: () => api.get('/learn/today'),
  recordProgress: (data: any) => api.post('/learn/progress', data),
  getReviewWords: () => api.get('/learn/review'),
  getStats: () => api.get('/learn/stats'),
}

export const wrongBookApi = {
  list: () => api.get('/wrong-book'),
  add: (data: any) => api.post('/wrong-book', data),
  remove: (id: string) => api.delete(`/wrong-book/${id}`),
  clear: () => api.delete('/wrong-book'),
}

export const gameApi = {
  startGame: (type: string) => api.post('/games/start', { type }),
  recordScore: (gameId: string, score: number) => 
    api.post('/games/score', { gameId, score }),
  getLeaderboard: (type: string) => api.get(`/games/leaderboard/${type}`),
}

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getStats: () => api.get('/users/stats'),
}
