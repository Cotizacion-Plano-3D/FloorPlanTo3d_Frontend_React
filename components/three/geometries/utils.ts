/**
 * Utilidades compartidas para componentes de geometrías Three.js
 * 
 * @module components/three/geometries/utils
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
 * Posición 3D
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
 * Configuración común de sombras
 */
export interface ShadowConfig {
  cast: boolean
  receive: boolean
}

/**
 * Aplica configuración de sombras a un mesh
 */
export function applyShadows(
  mesh: THREE.Mesh,
  config: ShadowConfig = { cast: true, receive: true }
): void {
  mesh.castShadow = config.cast
  mesh.receiveShadow = config.receive
}

/**
 * Crea una geometría de caja con dimensiones
 */
export function createBox(dimensions: Dimensions): THREE.BoxGeometry {
  return new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  )
}

/**
 * Crea una geometría de plano
 */
export function createPlane(width: number, height: number): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(width, height)
}

/**
 * Crea una geometría de cilindro
 */
export function createCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number = 16
): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)
}

/**
 * Crea una geometría de esfera
 */
export function createSphere(
  radius: number,
  widthSegments: number = 16,
  heightSegments: number = 16
): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, widthSegments, heightSegments)
}

/**
 * Calcula el grosor mínimo visible para vista aérea
 * 
 * @param depth - Grosor deseado
 * @param minDepth - Grosor mínimo (default: 0.08)
 * @returns Grosor ajustado para visibilidad
 */
export function calculateVisibleDepth(depth: number, minDepth: number = 0.08): number {
  return Math.max(depth, minDepth)
}

/**
 * Calcula dimensiones de marco basadas en el objeto principal
 * 
 * @param dimensions - Dimensiones del objeto
 * @param frameRatio - Ratio del grosor del marco (default: 0.08)
 * @returns Dimensiones del marco
 */
export function calculateFrameDimensions(
  dimensions: Dimensions,
  frameRatio: number = 0.08
): {
  thickness: number
  outerWidth: number
  outerHeight: number
  depth: number
} {
  const thickness = Math.max(dimensions.width, dimensions.height) * frameRatio
  return {
    thickness,
    outerWidth: dimensions.width + thickness * 2,
    outerHeight: dimensions.height + thickness * 2,
    depth: dimensions.depth * 1.5
  }
}

/**
 * Convierte un objeto Position3D a array [x, y, z]
 */
export function positionToArray(position: Position3D): [number, number, number] {
  return [position.x, position.y, position.z]
}

/**
 * Convierte un objeto Rotation3D a array [x, y, z]
 */
export function rotationToArray(rotation: Rotation3D): [number, number, number] {
  return [rotation.x, rotation.y, rotation.z]
}

/**
 * Convierte un objeto Dimensions a array [width, height, depth]
 */
export function dimensionsToArray(dimensions: Dimensions): [number, number, number] {
  return [dimensions.width, dimensions.height, dimensions.depth]
}

/**
 * Calcula el centro de un objeto dados sus bounds
 */
export function calculateCenter(
  min: Position3D,
  max: Position3D
): Position3D {
  return {
    x: (min.x + max.x) / 2,
    y: (min.y + max.y) / 2,
    z: (min.z + max.z) / 2
  }
}

/**
 * Escala dimensiones por un factor
 */
export function scaleDimensions(
  dimensions: Dimensions,
  factor: number
): Dimensions {
  return {
    width: dimensions.width * factor,
    height: dimensions.height * factor,
    depth: dimensions.depth * factor
  }
}

/**
 * Calcula dimensiones relativas (para molduras, detalles, etc.)
 */
export function getRelativeDimensions(
  baseDimensions: Dimensions,
  widthRatio: number,
  heightRatio: number,
  depthRatio: number = 1
): Dimensions {
  return {
    width: baseDimensions.width * widthRatio,
    height: baseDimensions.height * heightRatio,
    depth: baseDimensions.depth * depthRatio
  }
}

/**
 * Verifica si unas dimensiones son válidas (no negativas, no cero)
 */
export function areDimensionsValid(dimensions: Dimensions): boolean {
  return dimensions.width > 0 && 
         dimensions.height > 0 && 
         dimensions.depth > 0
}

/**
 * Normaliza dimensiones para evitar valores inválidos
 */
export function normalizeDimensions(
  dimensions: Dimensions,
  minValue: number = 0.01
): Dimensions {
  return {
    width: Math.max(dimensions.width, minValue),
    height: Math.max(dimensions.height, minValue),
    depth: Math.max(dimensions.depth, minValue)
  }
}

/**
 * Calcula el área de una superficie rectangular
 */
export function calculateArea(width: number, height: number): number {
  return width * height
}

/**
 * Calcula el volumen de un objeto
 */
export function calculateVolume(dimensions: Dimensions): number {
  return dimensions.width * dimensions.height * dimensions.depth
}

/**
 * Genera un ID único para un mesh
 */
export function generateMeshId(prefix: string, index?: number): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const indexStr = index !== undefined ? `_${index}` : ''
  return `${prefix}${indexStr}_${timestamp}_${random}`
}

/**
 * Crea una configuración de material con sombras habilitadas
 */
export function createMeshWithShadows(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  castShadow: boolean = true,
  receiveShadow: boolean = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = castShadow
  mesh.receiveShadow = receiveShadow
  return mesh
}

/**
 * Opciones para optimización de vista aérea
 */
export interface AerialViewOptimization {
  /** Aumentar grosor mínimo para visibilidad */
  minDepth: number
  /** Factor de escala para elementos pequeños (manijas, etc.) */
  detailScale: number
  /** Enfatizar marcos y bordes */
  emphasizeFrames: boolean
  /** Incrementar contraste de materiales */
  enhanceContrast: boolean
}

/**
 * Configuración por defecto para vista aérea
 */
export const DEFAULT_AERIAL_OPTIMIZATION: AerialViewOptimization = {
  minDepth: 0.08,
  detailScale: 1.5,
  emphasizeFrames: true,
  enhanceContrast: true
}

/**
 * Aplica optimizaciones para vista aérea
 */
export function applyAerialOptimization(
  dimensions: Dimensions,
  options: Partial<AerialViewOptimization> = {}
): Dimensions {
  const opts = { ...DEFAULT_AERIAL_OPTIMIZATION, ...options }
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    depth: Math.max(dimensions.depth, opts.minDepth)
  }
}
