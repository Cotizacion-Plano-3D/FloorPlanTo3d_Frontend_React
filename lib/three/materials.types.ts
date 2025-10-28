/**
 * Tipos TypeScript para el sistema de materiales Three.js
 * 
 * @module lib/three/materials.types
 */

import * as THREE from 'three'

/**
 * Categorías de materiales disponibles en la biblioteca
 */
export type MaterialCategory = 'door' | 'window' | 'wall' | 'floor' | 'metal'

/**
 * Tipos de materiales de puertas
 */
export type DoorMaterialType = 
  | 'woodPanel' 
  | 'darkWoodPanel' 
  | 'paintedPanel' 
  | 'frame' 
  | 'molding'

/**
 * Tipos de materiales de ventanas
 */
export type WindowMaterialType = 
  | 'frame' 
  | 'woodFrame' 
  | 'glass' 
  | 'frostedGlass' 
  | 'divider' 
  | 'hardware'

/**
 * Tipos de materiales de paredes
 */
export type WallMaterialType = 
  | 'painted' 
  | 'concrete' 
  | 'brick' 
  | 'exterior' 
  | 'drywall'

/**
 * Tipos de materiales de pisos
 */
export type FloorMaterialType = 
  | 'ceramic' 
  | 'wood' 
  | 'marble' 
  | 'concrete'

/**
 * Tipos de materiales metálicos
 */
export type MetalMaterialType = 
  | 'steel' 
  | 'brass' 
  | 'bronze' 
  | 'aluminum'

/**
 * Propiedades de material PBR (Physically Based Rendering)
 */
export interface MaterialProperties {
  /** Color del material (hex string o number) */
  color: string | number
  
  /** Rugosidad de la superficie (0 = espejo, 1 = mate) */
  roughness: number
  
  /** Metalicidad (0 = no metal, 1 = metal puro) */
  metalness: number
  
  /** Si el material tiene transparencia */
  transparent?: boolean
  
  /** Nivel de opacidad (0 = invisible, 1 = opaco) */
  opacity?: number
  
  /** Lado a renderizar (FrontSide, BackSide, DoubleSide) */
  side?: THREE.Side
  
  /** Color emisivo (para materiales que brillan) */
  emissive?: string | number
  
  /** Intensidad del color emisivo */
  emissiveIntensity?: number
}

/**
 * Opciones de configuración para meshes
 */
export interface MaterialConfig {
  /** Si el mesh proyecta sombras */
  castShadow?: boolean
  
  /** Si el mesh recibe sombras */
  receiveShadow?: boolean
  
  /** Si se renderiza en modo wireframe */
  wireframe?: boolean
  
  /** Si se usa flat shading (sin interpolación de normales) */
  flatShading?: boolean
}

/**
 * Configuración extendida para materiales con texturas (futuro)
 */
export interface MaterialTextureConfig {
  /** URL de la textura base (color) */
  map?: string
  
  /** URL de la textura normal (relieves) */
  normalMap?: string
  
  /** URL de la textura de roughness */
  roughnessMap?: string
  
  /** URL de la textura de metalness */
  metalnessMap?: string
  
  /** URL de la textura ambient occlusion */
  aoMap?: string
  
  /** Repetición de la textura [x, y] */
  repeat?: [number, number]
  
  /** Rotación de la textura en radianes */
  rotation?: number
}

/**
 * Información de material para integración con backend
 */
export interface MaterialBackendData {
  /** ID del material en la base de datos */
  id?: number
  
  /** Código único del material */
  codigo?: string
  
  /** Categoría del material */
  categoria_codigo?: string
  
  /** URL de la imagen/textura almacenada en backend */
  imagen_url?: string
  
  /** Propiedades PBR del material */
  properties?: MaterialProperties
}

/**
 * Extensión del objeto ThreeJSObject con información de material
 */
export interface ThreeJSObjectWithMaterial {
  id: string
  type: 'wall' | 'window' | 'door' | 'background'
  position: { x: number; y: number; z: number }
  dimensions: { width: number; height: number; depth: number }
  rotation: { x: number; y: number; z: number }
  
  /** Datos de material (opcional, para futuras versiones) */
  material?: MaterialBackendData
}
