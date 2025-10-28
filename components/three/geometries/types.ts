/**
 * Tipos TypeScript compartidos para geometrías Three.js
 * 
 * @module components/three/geometries/types
 */

import * as THREE from 'three'

/**
 * Dimensiones básicas de un objeto 3D
 */
export interface Dimensions {
  width: number
  height: number
  depth: number
}

/**
 * Posición 3D en el espacio
 */
export interface Position3D {
  x: number
  y: number
  z: number
}

/**
 * Rotación 3D en radianes
 */
export interface Rotation3D {
  x: number
  y: number
  z: number
}

/**
 * Props base para todos los componentes de geometría
 */
export interface BaseGeometryProps {
  /** Ancho del objeto */
  width: number
  
  /** Alto del objeto */
  height: number
  
  /** Profundidad/grosor del objeto */
  depth: number
  
  /** Si proyectar sombras */
  castShadow?: boolean
  
  /** Si recibir sombras */
  receiveShadow?: boolean
}

/**
 * Props extendidas con posición y rotación
 */
export interface PositionedGeometryProps extends BaseGeometryProps {
  /** Posición en el espacio 3D */
  position?: Position3D
  
  /** Rotación en radianes */
  rotation?: Rotation3D
}

/**
 * Configuración de marco/borde
 */
export interface FrameConfig {
  /** Si incluir marco */
  enabled: boolean
  
  /** Grosor del marco */
  thickness?: number
  
  /** Profundidad del marco */
  depth?: number
  
  /** Material del marco (opcional) */
  material?: THREE.Material
}

/**
 * Datos del objeto 3D desde el backend
 */
export interface ThreeJSObjectData {
  id: string
  type: 'wall' | 'window' | 'door' | 'background'
  position: Position3D
  dimensions: Dimensions
  rotation: Rotation3D
}

/**
 * Opciones de optimización para diferentes vistas
 */
export interface ViewOptimization {
  /** Tipo de vista */
  viewType: 'aerial' | 'perspective' | 'first-person'
  
  /** Nivel de detalle (0-1, donde 1 es máximo detalle) */
  detailLevel: number
  
  /** Si enfatizar elementos para mejor visibilidad */
  emphasizeElements: boolean
}

/**
 * Resultado de validación de geometría
 */
export interface GeometryValidation {
  /** Si la geometría es válida */
  valid: boolean
  
  /** Mensajes de error (si hay) */
  errors: string[]
  
  /** Advertencias (opcional) */
  warnings?: string[]
}
