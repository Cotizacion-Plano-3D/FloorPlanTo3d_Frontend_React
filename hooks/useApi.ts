import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Membresia, Suscripcion, Pago, Usuario } from '@/types/api'

// Hook para manejar membresías
export function useMembresias() {
  const [membresias, setMembresias] = useState<Membresia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembresias = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.getMembresias()
      setMembresias(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar membresías')
    } finally {
      setIsLoading(false)
    }
  }

  const createMembresia = async (membresia: Omit<Membresia, 'id'>) => {
    try {
      const newMembresia = await apiClient.createMembresia(membresia)
      setMembresias(prev => [...prev, newMembresia])
      return newMembresia
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear membresía')
      throw err
    }
  }

  const updateMembresia = async (id: number, membresia: Partial<Membresia>) => {
    try {
      const updatedMembresia = await apiClient.updateMembresia(id, membresia)
      setMembresias(prev => prev.map(m => m.id === id ? updatedMembresia : m))
      return updatedMembresia
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar membresía')
      throw err
    }
  }

  const deleteMembresia = async (id: number) => {
    try {
      await apiClient.deleteMembresia(id)
      setMembresias(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar membresía')
      throw err
    }
  }

  useEffect(() => {
    fetchMembresias()
  }, [])

  return {
    membresias,
    isLoading,
    error,
    fetchMembresias,
    createMembresia,
    updateMembresia,
    deleteMembresia
  }
}

// Hook para manejar suscripciones con datos mock y control de estado
export function useSuscripciones() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockMode, setMockMode] = useState<'with_subscription' | 'without_subscription'>('with_subscription')

  // Datos mock para testing - CON suscripción activa
  const mockSuscripcionesWith: Suscripcion[] = [
    {
      id: 1,
      usuario_id: 1,
      membresia_id: 2,
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días desde ahora
      estado: 'activa',
      membresia: {
        id: 2,
        nombre: 'Pro',
        precio: 20,
        duracion: 30,
        descripcion: 'Plan profesional para estudios de arquitectura'
      }
    }
  ]

  // Datos mock para testing - SIN suscripción activa
  const mockSuscripcionesWithout: Suscripcion[] = [
    {
      id: 1,
      usuario_id: 1,
      membresia_id: 1,
      fecha_inicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días atrás
      fecha_fin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás (expirada)
      estado: 'expirada',
      membresia: {
        id: 1,
        nombre: 'Gratis',
        precio: 0,
        duracion: 30,
        descripcion: 'Plan gratuito básico'
      }
    }
  ]

  const fetchSuscripciones = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Usar datos mock según el modo
      if (mockMode === 'with_subscription') {
        setSuscripciones(mockSuscripcionesWith)
      } else {
        setSuscripciones(mockSuscripcionesWithout)
      }
      
      // Descomentar cuando la API esté lista:
      // const data = await apiClient.getSuscripciones()
      // setSuscripciones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripciones')
    } finally {
      setIsLoading(false)
    }
  }

  const createSuscripcion = async (suscripcion: Omit<Suscripcion, 'id'>) => {
    try {
      const newSuscripcion = await apiClient.createSuscripcion(suscripcion)
      setSuscripciones(prev => [...prev, newSuscripcion])
      return newSuscripcion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear suscripción')
      throw err
    }
  }

  const updateSuscripcion = async (id: number, suscripcion: Partial<Suscripcion>) => {
    try {
      const updatedSuscripcion = await apiClient.updateSuscripcion(id, suscripcion)
      setSuscripciones(prev => prev.map(s => s.id === id ? updatedSuscripcion : s))
      return updatedSuscripcion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar suscripción')
      throw err
    }
  }

  const deleteSuscripcion = async (id: number) => {
    try {
      await apiClient.deleteSuscripcion(id)
      setSuscripciones(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar suscripción')
      throw err
    }
  }

  // Función para cambiar el modo mock (para testing)
  const toggleMockMode = () => {
    setMockMode(prev => prev === 'with_subscription' ? 'without_subscription' : 'with_subscription')
  }

  useEffect(() => {
    fetchSuscripciones()
  }, [mockMode])

  return {
    suscripciones,
    isLoading,
    error,
    fetchSuscripciones,
    createSuscripcion,
    updateSuscripcion,
    deleteSuscripcion,
    toggleMockMode, // Para testing
    mockMode // Para mostrar el estado actual
  }
}

// Hook para manejar pagos
export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPagos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.getPagos()
      setPagos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pagos')
    } finally {
      setIsLoading(false)
    }
  }

  const createPago = async (pago: Omit<Pago, 'id'>) => {
    try {
      const newPago = await apiClient.createPago(pago)
      setPagos(prev => [...prev, newPago])
      return newPago
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear pago')
      throw err
    }
  }

  useEffect(() => {
    fetchPagos()
  }, [])

  return {
    pagos,
    isLoading,
    error,
    fetchPagos,
    createPago
  }
}

// Hook para manejar usuarios
export function useUsers() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (id: number, userData: Partial<Usuario>) => {
    try {
      const updatedUser = await apiClient.updateUser(id, userData)
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u))
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario')
      throw err
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await apiClient.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario')
      throw err
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUser,
    deleteUser
  }
}