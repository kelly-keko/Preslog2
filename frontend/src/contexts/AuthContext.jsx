import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000
        
        if (decoded.exp > currentTime) {
          // Token valide, récupérer les infos utilisateur
          fetchUserInfo()
        } else {
          // Token expiré
          logout()
        }
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error)
        logout()
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/api/users/me/')
      setUser(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/token/', credentials)
      const { access, refresh } = response.data
      
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      
      // Configurer le token pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      // Récupérer les infos utilisateur
      await fetchUserInfo()
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur de connexion' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setLoading(false)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isRH: user?.role === 'RH' || user?.role === 'DG',
    isDG: user?.role === 'DG',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 