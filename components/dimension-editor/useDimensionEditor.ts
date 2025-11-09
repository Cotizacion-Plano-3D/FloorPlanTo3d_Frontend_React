import { useState, useCallback, useMemo } from 'react'
import { ThreeJSObject } from '@/lib/floorplan-api'

export interface ModifiedDimensions {
  [objectId: string]: {
    width?: number
    height?: number
    depth?: number
    position?: {
      x?: number
      y?: number
      z?: number
    }
    // Propiedades específicas para ventanas
    windowCenterY?: number
    // Propiedades específicas para puertas
    doorHeightFactor?: number
    topWallHeight?: number
  }
}

interface DimensionConstraints {
  min: number
  max: number
  step?: number
}

export const DEFAULT_CONSTRAINTS: {
  width: DimensionConstraints
  height: DimensionConstraints
  depth: DimensionConstraints
  position: DimensionConstraints
} = {
  width: { min: 0.1, max: 20, step: 0.1 },
  height: { min: 0.1, max: 10, step: 0.1 },
  depth: { min: 0.05, max: 5, step: 0.05 },
  position: { min: -50, max: 50, step: 0.1 }
}

export function useDimensionEditor(initialObjects: ThreeJSObject[]) {
  const [modifiedDimensions, setModifiedDimensions] = useState<ModifiedDimensions>({})

  // Cargar dimensiones desde localStorage
  const loadFromLocalStorage = useCallback((modelo3dId?: number) => {
    if (!modelo3dId) return

    try {
      const key = `modifiedDimensions_${modelo3dId}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored) as ModifiedDimensions
        setModifiedDimensions(parsed)
        console.log('📥 Dimensiones cargadas desde localStorage:', parsed)
      }
    } catch (error) {
      console.error('❌ Error cargando dimensiones desde localStorage:', error)
    }
  }, [])

  // Guardar dimensiones en localStorage
  const saveToLocalStorage = useCallback((modelo3dId?: number) => {
    if (!modelo3dId) return

    try {
      const key = `modifiedDimensions_${modelo3dId}`
      localStorage.setItem(key, JSON.stringify(modifiedDimensions))
      console.log('💾 Dimensiones guardadas en localStorage:', modifiedDimensions)
    } catch (error) {
      console.error('❌ Error guardando dimensiones en localStorage:', error)
    }
  }, [modifiedDimensions])

  // Actualizar una dimensión específica
  const updateDimension = useCallback((
    objectId: string | number,
    dimension: 'width' | 'height' | 'depth',
    value: number,
    constraints: DimensionConstraints = DEFAULT_CONSTRAINTS[dimension]
  ) => {
    // Validar valor
    const clampedValue = Math.max(constraints.min, Math.min(constraints.max, value))
    const id = String(objectId)

    setModifiedDimensions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [dimension]: clampedValue
      }
    }))
  }, [])

  // Actualizar posición
  const updatePosition = useCallback((
    objectId: string | number,
    axis: 'x' | 'y' | 'z',
    value: number,
    constraints: DimensionConstraints = DEFAULT_CONSTRAINTS.position
  ) => {
    // Validar valor
    const clampedValue = Math.max(constraints.min, Math.min(constraints.max, value))
    const id = String(objectId)

    setModifiedDimensions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        position: {
          ...prev[id]?.position,
          [axis]: clampedValue
        }
      }
    }))
  }, [])

  // Obtener dimensiones efectivas (modificadas o originales)
  const getEffectiveDimensions = useCallback((obj: ThreeJSObject) => {
    // Convertir obj.id a string para la comparación
    const objId = String(obj.id)
    const modifiedForObj = modifiedDimensions[objId]
    
    return {
      width: modifiedForObj?.width ?? obj.dimensions.width,
      height: modifiedForObj?.height ?? obj.dimensions.height,
      depth: modifiedForObj?.depth ?? obj.dimensions.depth,
      position: {
        x: modifiedForObj?.position?.x ?? obj.position.x,
        y: modifiedForObj?.position?.y ?? obj.position.y,
        z: modifiedForObj?.position?.z ?? obj.position.z
      }
    }
  }, [modifiedDimensions])

  // Resetear dimensiones de un objeto
  const resetObjectDimensions = useCallback((objectId: string | number) => {
    const id = String(objectId)
    setModifiedDimensions(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }, [])

  // Resetear todas las dimensiones
  const resetAllDimensions = useCallback(() => {
    setModifiedDimensions({})
  }, [])

  // Verificar si un objeto tiene dimensiones modificadas
  const hasModifications = useCallback((objectId: string | number) => {
    const id = String(objectId)
    return !!modifiedDimensions[id]
  }, [modifiedDimensions])

  // Obtener dimensiones modificadas de un objeto
  const getModifiedDimensions = useCallback((objectId: string | number) => {
    const id = String(objectId)
    return modifiedDimensions[id] || null
  }, [modifiedDimensions])

  return {
    modifiedDimensions,
    updateDimension,
    updatePosition,
    getEffectiveDimensions,
    resetObjectDimensions,
    resetAllDimensions,
    hasModifications,
    getModifiedDimensions,
    loadFromLocalStorage,
    saveToLocalStorage
  }
}

