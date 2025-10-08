import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Membresia, Suscripcion, Pago, Usuario } from '@/types/api'

// Hook para manejar membresías
export function useMembresias() {
  const [membresias, setMembresias] = useState<Membresia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembresias = useCallback(async () => {
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
  }, [])

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

// Hook para manejar suscripciones
export function useSuscripciones() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuscripciones = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Usar la API real en lugar de datos mock
      const data = await apiClient.getSuscripciones()
      setSuscripciones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripciones')
      // Si falla la API, usar array vacío en lugar de datos mock
      setSuscripciones([])
    } finally {
      setIsLoading(false)
    }
  }, []) // Dependencias vacías para evitar recreación

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

  useEffect(() => {
    fetchSuscripciones()
  }, [])

  return {
    suscripciones,
    isLoading,
    error,
    fetchSuscripciones,
    createSuscripcion,
    updateSuscripcion,
    deleteSuscripcion
  }
}

// Hook para manejar pagos
export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPagos = useCallback(async () => {
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
  }, [])

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

  // const updateUser = async (id: number, userData: Partial<Usuario>) => {
  //   try {
  //     const updatedUser = await apiClient.updateUser(id, userData)
  //     setUsers(prev => prev.map(u => u.id === id ? updatedUser : u))
  //     return updatedUser
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Error al actualizar usuario')
  //     throw err
  //   }
  // }

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
    // updateUser,
    deleteUser
  }
}

// Hook para verificar suscripción activa
export function useActiveSubscription(userId?: number) {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkActiveSubscription = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const isActive = await apiClient.checkActiveSubscription(id)
      setHasActiveSubscription(isActive)
      return isActive
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar suscripción')
      setHasActiveSubscription(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      checkActiveSubscription(userId)
    }
  }, [userId])

  return {
    hasActiveSubscription,
    isLoading,
    error,
    checkActiveSubscription
  }
}