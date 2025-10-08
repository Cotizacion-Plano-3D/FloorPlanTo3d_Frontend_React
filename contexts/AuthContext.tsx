'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient } from '@/lib/api'
import { Usuario, LoginRequest, RegisterRequest } from '@/types/api'

interface AuthContextType {
  user: Usuario | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  hasActiveSubscription: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkSubscription: () => Promise<boolean>
  clearSession: () => void
  forceLogout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false)

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    // Verificar si hay token guardado al cargar la app
    const savedToken = apiClient.initializeFromStorage()
    console.log('🔍 Verificando sesión guardada:', { 
      hasToken: !!savedToken, 
      tokenLength: savedToken?.length || 0 
    })
    
    if (savedToken) {
      setToken(savedToken)
      console.log('✅ Token restaurado desde localStorage')
      // Intentar obtener datos del usuario
      refreshUser()
    } else {
      console.log('❌ No hay token guardado')
      setIsLoading(false)
    }
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      console.log('🔐 Iniciando proceso de login...', {
        correo: credentials.correo
      })
      
      // Limpiar estado anterior ANTES del login
      console.log('🧹 Limpiando estado anterior...')
      setUser(null)
      setToken(null)
      setHasActiveSubscription(false)
      apiClient.setToken(null)
      
      const response = await apiClient.login(credentials)
      
      console.log('✅ Login exitoso, guardando token:', {
        tokenLength: response.access_token?.length || 0,
        tokenPreview: response.access_token?.substring(0, 20) + '...'
      })
      
      setToken(response.access_token)
      apiClient.setToken(response.access_token)
      
      // Verificar que se guardó en localStorage
      const savedToken = localStorage.getItem('auth_token')
      console.log('💾 Token guardado en localStorage:', !!savedToken)
      
      // Obtener datos del usuario después del login
      await refreshUser()
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      
      // Limpiar estado anterior antes del registro
      setUser(null)
      setToken(null)
      setHasActiveSubscription(false)
      apiClient.setToken(null)
      
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
      // Limpiar estado inmediatamente
      setUser(null)
      setToken(null)
      setHasActiveSubscription(false)
      apiClient.setToken(null)
      
      // Intentar logout en el servidor (opcional)
      try {
        await apiClient.logout()
      } catch (serverError) {
        console.warn('Server logout failed, but local state cleared:', serverError)
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // Redirigir a la página principal
      window.location.href = '/'
    }
  }

  const refreshUser = async () => {
    try {
      console.log('👤 Obteniendo datos del usuario...')
      
      // Limpiar usuario anterior antes de obtener el nuevo
      setUser(null)
      
      // Obtener datos del usuario actual
      const currentUser = await apiClient.getCurrentUser()
      console.log('✅ Usuario obtenido:', {
        id: currentUser.id,
        nombre: currentUser.nombre,
        correo: currentUser.correo
      })
      
      // Verificar que el usuario obtenido es diferente al anterior
      if (user && user.id !== currentUser.id) {
        console.log('🔄 Usuario diferente detectado:', {
          anterior: user.correo,
          nuevo: currentUser.correo
        })
      }
      
      setUser(currentUser)
      
      // Verificar suscripción activa usando el ID del usuario obtenido
      if (currentUser.id) {
        try {
          console.log('🔍 Verificando suscripción activa para usuario:', currentUser.id)
          const isActive = await apiClient.checkActiveSubscription(currentUser.id)
          console.log('📋 Estado de suscripción obtenido:', isActive)
          console.log('📋 Tipo de respuesta:', typeof isActive)
          setHasActiveSubscription(isActive)
          console.log('✅ Estado de suscripción actualizado a:', isActive)
        } catch (subscriptionError) {
          console.error('❌ Failed to check subscription:', subscriptionError)
          setHasActiveSubscription(false)
          console.log('❌ Estado de suscripción establecido a false por error')
        }
      }
    } catch (error) {
      console.error('❌ Failed to refresh user:', error)
      // Si falla, limpiar la autenticación
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const checkSubscription = async () => {
    if (!user?.id) {
      console.log('❌ No hay usuario para verificar suscripción')
      return false
    }
    
    try {
      console.log('🔍 Verificando suscripción manual para usuario:', user.id)
      const isActive = await apiClient.checkActiveSubscription(user.id)
      console.log('📋 Estado de suscripción manual:', isActive)
      setHasActiveSubscription(isActive)
      console.log('✅ Estado de suscripción manual actualizado a:', isActive)
      return isActive
    } catch (error) {
      console.error('❌ Failed to check subscription manually:', error)
      setHasActiveSubscription(false)
      console.log('❌ Estado de suscripción manual establecido a false por error')
      return false
    }
  }

  // Función para limpiar completamente la sesión
  const clearSession = () => {
    console.log('🧹 Limpiando sesión completamente...')
    setUser(null)
    setToken(null)
    setHasActiveSubscription(false)
    apiClient.setToken(null)
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      console.log('🗑️ localStorage limpiado')
    }
  }

  // Función para forzar la limpieza completa y recarga
  const forceLogout = () => {
    console.log('🚨 Forzando logout completo...')
    clearSession()
    // Forzar recarga de la página para limpiar todo el estado
    window.location.href = '/'
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    login,
    register,
    logout,
    refreshUser,
    checkSubscription,
    clearSession,
    forceLogout
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
