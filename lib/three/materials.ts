/**
 * MaterialLibrary - Biblioteca de materiales para Three.js
 * 
 * Sistema centralizado de materiales para el renderizado 3D de planos.
 * Optimizado para vista aérea con parámetros realistas de PBR (Physically Based Rendering).
 * 
 * @module lib/three/materials
 */

import * as THREE from 'three'

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

/**
 * Categorías de materiales disponibles
 */
export type MaterialCategory = 'door' | 'window' | 'wall' | 'floor' | 'metal'

/**
 * Propiedades de material PBR
 */
export interface MaterialProperties {
  color: string | number
  roughness: number
  metalness: number
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
  emissive?: string | number
  emissiveIntensity?: number
}

/**
 * Opciones de configuración para materiales
 */
export interface MaterialConfig {
  castShadow?: boolean
  receiveShadow?: boolean
  wireframe?: boolean
  flatShading?: boolean
}

// ============================================================================
// PALETA DE COLORES
// ============================================================================

/**
 * Paleta de colores pre-definida
 * Basada en materiales arquitectónicos reales
 */
export const COLOR_PALETTE = {
  // Maderas
  wood: {
    oak: '#8B4513',           // Roble
    mahogany: '#654321',       // Caoba
    pine: '#C19A6B',           // Pino
    walnut: '#5C4033',         // Nogal
  },
  
  // Metales
  metal: {
    steel: '#C0C0C0',          // Acero
    brass: '#B5A642',          // Latón
    bronze: '#CD7F32',         // Bronce
    aluminum: '#D3D3D3',       // Aluminio
  },
  
  // Paredes
  wall: {
    white: '#FFFFFF',          // Blanco
    beige: '#F5F5DC',          // Beige
    lightGray: '#E5E5E5',      // Gris claro
    concrete: '#B0B0B0',       // Concreto
    brick: '#B7410E',          // Ladrillo
  },
  
  // Vidrios
  glass: {
    clear: '#87CEEB',          // Azul cielo claro
    frosted: '#E6F3F7',        // Esmerilado
    tinted: '#6BA3D0',         // Teñido
  },
  
  // Pisos
  floor: {
    ceramic: '#F5F5F5',        // Cerámica blanca
    wood: '#D2691E',           // Madera
    marble: '#F0F0F0',         // Mármol
    concrete: '#C8C8C8',       // Concreto pulido
  }
} as const

// ============================================================================
// MATERIALES DE PUERTAS
// ============================================================================

/**
 * Materiales para puertas
 */
export const doorMaterials = {
  /**
   * Panel de puerta de madera (roble)
   * Superficie mate con textura natural
   */
  woodPanel: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wood.oak,
    roughness: 0.7,
    metalness: 0.0,
    name: 'door-wood-panel'
  }),

  /**
   * Panel de puerta de madera oscura (caoba)
   * Para puertas de entrada o elegantes
   */
  darkWoodPanel: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wood.mahogany,
    roughness: 0.6,
    metalness: 0.0,
    name: 'door-dark-wood-panel'
  }),

  /**
   * Panel de puerta pintada (blanca)
   * Para puertas interiores modernas
   */
  paintedPanel: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.white,
    roughness: 0.4,
    metalness: 0.0,
    name: 'door-painted-panel'
  }),

  /**
   * Marco de puerta
   * Ligeramente más oscuro que el panel
   */
  frame: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wood.walnut,
    roughness: 0.75,
    metalness: 0.0,
    name: 'door-frame'
  }),

  /**
   * Moldura decorativa
   * Detalles en relieve
   */
  molding: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wood.mahogany,
    roughness: 0.7,
    metalness: 0.0,
    name: 'door-molding'
  })
} as const

// ============================================================================
// MATERIALES DE VENTANAS
// ============================================================================

/**
 * Materiales para ventanas
 */
export const windowMaterials = {
  /**
   * Marco de ventana (aluminio blanco)
   * Acabado semi-brillante típico de ventanas modernas
   */
  frame: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.white,
    roughness: 0.3,
    metalness: 0.4,
    name: 'window-frame'
  }),

  /**
   * Marco de ventana de madera
   * Para ventanas tradicionales
   */
  woodFrame: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wood.pine,
    roughness: 0.6,
    metalness: 0.0,
    name: 'window-wood-frame'
  }),

  /**
   * Vidrio transparente
   * Alta transparencia con ligero reflejo
   */
  glass: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.glass.clear,
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    name: 'window-glass'
  }),

  /**
   * Vidrio esmerilado
   * Para baños o privacidad
   */
  frostedGlass: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.glass.frosted,
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    name: 'window-frosted-glass'
  }),

  /**
   * Cruz divisoria / montantes
   * Estructura interna de la ventana
   */
  divider: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.white,
    roughness: 0.4,
    metalness: 0.3,
    name: 'window-divider'
  }),

  /**
   * Bisagras y herrajes
   * Acabado metálico
   */
  hardware: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.metal.steel,
    roughness: 0.2,
    metalness: 0.95,
    name: 'window-hardware'
  })
} as const

// ============================================================================
// MATERIALES DE PAREDES
// ============================================================================

/**
 * Materiales para paredes
 */
export const wallMaterials = {
  /**
   * Pared interior pintada (blanco)
   * Acabado mate estándar
   */
  painted: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.white,
    roughness: 0.9,
    metalness: 0.0,
    name: 'wall-painted'
  }),

  /**
   * Pared de concreto
   * Textura rugosa sin pintar
   */
  concrete: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.concrete,
    roughness: 0.95,
    metalness: 0.0,
    name: 'wall-concrete'
  }),

  /**
   * Pared de ladrillo
   * Color rojizo típico
   */
  brick: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.brick,
    roughness: 0.85,
    metalness: 0.0,
    name: 'wall-brick'
  }),

  /**
   * Pared exterior (gris claro)
   * Para fachadas
   */
  exterior: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.lightGray,
    roughness: 0.8,
    metalness: 0.1,
    name: 'wall-exterior'
  }),

  /**
   * Yeso o drywall
   * Acabado liso y uniforme
   */
  drywall: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.wall.beige,
    roughness: 0.85,
    metalness: 0.0,
    name: 'wall-drywall'
  })
} as const

// ============================================================================
// MATERIALES DE PISOS
// ============================================================================

/**
 * Materiales para pisos
 */
export const floorMaterials = {
  /**
   * Cerámica blanca
   * Acabado brillante típico de baños/cocinas
   */
  ceramic: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.floor.ceramic,
    roughness: 0.3,
    metalness: 0.2,
    name: 'floor-ceramic'
  }),

  /**
   * Madera (parquet/laminado)
   * Acabado semi-mate
   */
  wood: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.floor.wood,
    roughness: 0.6,
    metalness: 0.0,
    name: 'floor-wood'
  }),

  /**
   * Mármol
   * Acabado pulido con ligero brillo
   */
  marble: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.floor.marble,
    roughness: 0.2,
    metalness: 0.3,
    name: 'floor-marble'
  }),

  /**
   * Concreto pulido
   * Estilo industrial moderno
   */
  concrete: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.floor.concrete,
    roughness: 0.7,
    metalness: 0.1,
    name: 'floor-concrete'
  })
} as const

// ============================================================================
// MATERIALES DE HERRAJES Y METALES
// ============================================================================

/**
 * Materiales metálicos para manijas, bisagras, etc.
 */
export const metalMaterials = {
  /**
   * Acero inoxidable
   * Para manijas de puerta, herrajes
   */
  steel: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.metal.steel,
    roughness: 0.15,
    metalness: 0.95,
    name: 'metal-steel'
  }),

  /**
   * Latón
   * Acabado dorado para detalles elegantes
   */
  brass: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.metal.brass,
    roughness: 0.25,
    metalness: 0.9,
    name: 'metal-brass'
  }),

  /**
   * Bronce
   * Acabado clásico
   */
  bronze: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.metal.bronze,
    roughness: 0.3,
    metalness: 0.85,
    name: 'metal-bronze'
  }),

  /**
   * Aluminio
   * Ligero y mate
   */
  aluminum: new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.metal.aluminum,
    roughness: 0.4,
    metalness: 0.8,
    name: 'metal-aluminum'
  })
} as const

// ============================================================================
// BIBLIOTECA COMPLETA
// ============================================================================

/**
 * Biblioteca completa de materiales exportada
 */
export const MaterialLibrary = {
  door: doorMaterials,
  window: windowMaterials,
  wall: wallMaterials,
  floor: floorMaterials,
  metal: metalMaterials,
  colors: COLOR_PALETTE
} as const

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Clona un material para poder modificarlo sin afectar el original
 * 
 * @param material - Material a clonar
 * @returns Nueva instancia del material
 * 
 * @example
 * ```ts
 * const customDoor = cloneMaterial(doorMaterials.woodPanel)
 * customDoor.color.set('#FF0000') // Puerta roja
 * ```
 */
export function cloneMaterial(material: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  return material.clone()
}

/**
 * Crea un material personalizado con propiedades override
 * 
 * @param baseMaterial - Material base
 * @param properties - Propiedades a sobrescribir
 * @returns Nuevo material con propiedades aplicadas
 * 
 * @example
 * ```ts
 * const customWall = createCustomMaterial(wallMaterials.painted, {
 *   color: '#CCCCCC',
 *   roughness: 0.5
 * })
 * ```
 */
export function createCustomMaterial(
  baseMaterial: THREE.MeshStandardMaterial,
  properties: Partial<MaterialProperties>
): THREE.MeshStandardMaterial {
  const material = baseMaterial.clone()
  
  if (properties.color !== undefined) {
    material.color.set(properties.color)
  }
  if (properties.roughness !== undefined) {
    material.roughness = properties.roughness
  }
  if (properties.metalness !== undefined) {
    material.metalness = properties.metalness
  }
  if (properties.transparent !== undefined) {
    material.transparent = properties.transparent
  }
  if (properties.opacity !== undefined) {
    material.opacity = properties.opacity
  }
  if (properties.side !== undefined) {
    material.side = properties.side
  }
  if (properties.emissive !== undefined) {
    material.emissive.set(properties.emissive)
  }
  if (properties.emissiveIntensity !== undefined) {
    material.emissiveIntensity = properties.emissiveIntensity
  }
  
  return material
}

/**
 * Obtiene un material por su categoría y tipo
 * 
 * @param category - Categoría del material
 * @param type - Tipo específico dentro de la categoría
 * @returns Material correspondiente o undefined si no existe
 * 
 * @example
 * ```ts
 * const material = getMaterial('door', 'woodPanel')
 * ```
 */
export function getMaterial(
  category: MaterialCategory,
  type: string
): THREE.MeshStandardMaterial | undefined {
  const categoryMaterials = MaterialLibrary[category]
  if (!categoryMaterials) return undefined
  
  return (categoryMaterials as any)[type]
}

/**
 * Lista todos los materiales disponibles para una categoría
 * 
 * @param category - Categoría a listar
 * @returns Array con los nombres de los materiales disponibles
 * 
 * @example
 * ```ts
 * const doorTypes = listMaterials('door')
 * // ['woodPanel', 'darkWoodPanel', 'paintedPanel', ...]
 * ```
 */
export function listMaterials(category: MaterialCategory): string[] {
  const categoryMaterials = MaterialLibrary[category]
  if (!categoryMaterials) return []
  
  return Object.keys(categoryMaterials)
}

/**
 * Aplica configuración común a un mesh (sombras, etc.)
 * 
 * @param mesh - Mesh de Three.js
 * @param config - Configuración a aplicar
 * 
 * @example
 * ```ts
 * const mesh = new THREE.Mesh(geometry, material)
 * applyMeshConfig(mesh, { castShadow: true, receiveShadow: true })
 * ```
 */
export function applyMeshConfig(
  mesh: THREE.Mesh,
  config: MaterialConfig = {}
): void {
  if (config.castShadow !== undefined) {
    mesh.castShadow = config.castShadow
  }
  if (config.receiveShadow !== undefined) {
    mesh.receiveShadow = config.receiveShadow
  }
  if (config.wireframe !== undefined && mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.wireframe = config.wireframe
  }
  if (config.flatShading !== undefined && mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.flatShading = config.flatShading
  }
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default MaterialLibrary
