/**
 * Sistema de almacenamiento para planos procesados
 * Usa localStorage para almacenar los datos de los planos convertidos
 */

import { FloorPlanThreeJSResponse } from './floorplan-api'

export interface StoredFloorPlan {
  id: string
  name: string
  uploadDate: string
  imageUrl: string
  threejsData: FloorPlanThreeJSResponse
  thumbnail?: string
}

const STORAGE_KEY = 'floor_plans'

class FloorPlanStorage {
  /**
   * Guarda un plano procesado
   */
  saveFloorPlan(plan: StoredFloorPlan): void {
    try {
      const plans = this.getAllFloorPlans()
      plans.push(plan)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
      console.log('💾 Plano guardado:', plan.id)
    } catch (error) {
      console.error('❌ Error al guardar plano:', error)
      throw error
    }
  }

  /**
   * Obtiene todos los planos guardados
   */
  getAllFloorPlans(): StoredFloorPlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('❌ Error al obtener planos:', error)
      return []
    }
  }

  /**
   * Obtiene un plano por ID
   */
  getFloorPlan(id: string): StoredFloorPlan | null {
    try {
      const plans = this.getAllFloorPlans()
      return plans.find(plan => plan.id === id) || null
    } catch (error) {
      console.error('❌ Error al obtener plano:', error)
      return null
    }
  }

  /**
   * Elimina un plano
   */
  deleteFloorPlan(id: string): void {
    try {
      const plans = this.getAllFloorPlans()
      const filtered = plans.filter(plan => plan.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      console.log('🗑️ Plano eliminado:', id)
    } catch (error) {
      console.error('❌ Error al eliminar plano:', error)
      throw error
    }
  }

  /**
   * Limpia todos los planos
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('🗑️ Todos los planos eliminados')
    } catch (error) {
      console.error('❌ Error al limpiar planos:', error)
      throw error
    }
  }

  /**
   * Obtiene el conteo de planos guardados
   */
  getCount(): number {
    return this.getAllFloorPlans().length
  }
}

export const floorPlanStorage = new FloorPlanStorage()

