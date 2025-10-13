/**
 * Cliente API para FloorPlanTo3D-API
 * Servicio de conversión de planos 2D a 3D
 */

const FLOORPLAN_API_URL = process.env.NEXT_PUBLIC_FLOORPLAN_API_URL || 'http://localhost:5000'

export interface FloorPlanObject {
  id: number
  type: 'wall' | 'window' | 'door' | 'background'
  confidence: number
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
  center: {
    x: number
    y: number
  }
}

export interface FloorPlanMetadata {
  image_width: number
  image_height: number
  total_objects: number
  average_door_size: number
  processing_timestamp: string
}

export interface FloorPlanStatistics {
  walls: number
  windows: number
  doors: number
}

export interface FloorPlanWebResponse {
  metadata: FloorPlanMetadata
  objects: FloorPlanObject[]
  statistics: FloorPlanStatistics
}

export interface ThreeJSObject {
  id: string
  type: 'wall' | 'window' | 'door' | 'background'
  position: {
    x: number
    y: number
    z: number
  }
  dimensions: {
    width: number
    height: number
    depth: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
}

export interface ThreeJSScene {
  name: string
  units: string
  bounds: {
    width: number
    height: number
  }
}

export interface ThreeJSCamera {
  position: {
    x: number
    y: number
    z: number
  }
  target: {
    x: number
    y: number
    z: number
  }
}

export interface FloorPlanThreeJSResponse {
  scene: ThreeJSScene
  objects: ThreeJSObject[]
  camera: ThreeJSCamera
}

export type FloorPlanFormat = 'unity' | 'web' | 'threejs'

class FloorPlanApiClient {
  private baseURL: string

  constructor(baseURL: string = FLOORPLAN_API_URL) {
    this.baseURL = baseURL
    console.log('🏠 FloorPlan API Client inicializado:', this.baseURL)
  }

  /**
   * Convierte un plano 2D a 3D
   * @param imageFile - Archivo de imagen del plano
   * @param format - Formato de salida (unity, web, threejs)
   * @returns Datos del plano procesado según el formato
   */
  async convertFloorPlan(
    imageFile: File,
    format: FloorPlanFormat = 'threejs'
  ): Promise<FloorPlanWebResponse | FloorPlanThreeJSResponse> {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      console.log('📤 Enviando plano a procesar:', {
        fileName: imageFile.name,
        fileSize: `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`,
        format
      })

      const response = await fetch(`${this.baseURL}/predict?format=${format}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error del servidor FloorPlan:', {
          status: response.status,
          error: errorText
        })
        throw new Error(`Error al procesar el plano: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Plano procesado exitosamente:', {
        format,
        objectCount: result.objects?.length || 0,
        statistics: result.statistics
      })

      return result
    } catch (error) {
      console.error('❌ Error al convertir plano:', error)
      throw error
    }
  }

  /**
   * Obtiene información sobre los formatos disponibles
   */
  async getAvailableFormats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/formats`)
      
      if (!response.ok) {
        throw new Error(`Error al obtener formatos: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Error al obtener formatos:', error)
      throw error
    }
  }

  /**
   * Verifica si la API está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/formats`, {
        method: 'GET',
      })
      return response.ok
    } catch (error) {
      console.error('❌ FloorPlan API no disponible:', error)
      return false
    }
  }
}

export const floorPlanApi = new FloorPlanApiClient()

