'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient } from '@/lib/api'
import { Usuario, LoginRequest, RegisterRequest } from '@/types/api'

interface AuthContextType {
  user: Usuario | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    // Verificar si hay token guardado al cargar la app
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      apiClient.setToken(savedToken)
      // Intentar obtener datos del usuario
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const response = await apiClient.login(credentials)
      
      setToken(response.access_token)
      apiClient.setToken(response.access_token)
      
      // Obtener datos del usuario después del login
      await refreshUser()
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      await apiClient.register(userData)
      
      // Después del registro, hacer login automático
      await login({
        correo: userData.correo,
        contrasena: userData.contrasena
      })
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setToken(null)
      apiClient.setToken(null)
    }
  }

  const refreshUser = async () => {
    try {
      const dashboardData = await apiClient.getDashboard()
      // Como el dashboard solo devuelve un mensaje, necesitaríamos un endpoint específico para obtener datos del usuario
      // Por ahora, creamos un usuario básico con la información disponible
      const basicUser: Usuario = {
        id: 0, // Se necesitaría obtener del backend
        nombre: 'Usuario', // Se necesitaría obtener del backend
        correo: '', // Se necesitaría obtener del backend
        contrasena: '',
        fecha_creacion: new Date().toISOString()
      }
      setUser(basicUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // Si falla, limpiar la autenticación
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
