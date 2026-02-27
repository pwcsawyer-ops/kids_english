import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Learn from './pages/Learn'
import WordList from './pages/WordList'
import Practice from './pages/Practice'
import Games from './pages/Games'
import WrongBook from './pages/WrongBook'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import { useAuthStore } from './stores/authStore'
import { initTelegram } from './utils/telegram'

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    initTelegram()
    setIsLoading(false)
  }, [])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/games" element={<Games />} />
          <Route path="/wrong-book" element={<WrongBook />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['admin', 'teacher']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
