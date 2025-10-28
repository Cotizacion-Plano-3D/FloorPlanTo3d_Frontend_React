/**
 * DoorGeometry Component
 * 
 * Componente React Three Fiber para renderizar puertas arquitectónicas realistas.
 * Optimizado para vista aérea con mayor visibilidad desde arriba.
 * 
 * Características:
 * - Marco exterior visible
 * - Panel principal con grosor realista
 * - Moldura decorativa central (opcional)
 * - Manija en posición lateral
 * - Materiales PBR de MaterialLibrary
 * 
 * @module components/three/geometries/DoorGeometry
 */

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { doorMaterials, metalMaterials } from '@/lib/three/materials'

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Estilo de puerta disponible
 */
export type DoorStyle = 'standard' | 'elegant' | 'modern' | 'painted'

/**
 * Configuración de la manija
 */
export interface HandleConfig {
  /** Si incluir manija */
  enabled: boolean
  /** Posición horizontal (0-1, donde 0.5 es centro) */
  position?: number
  /** Tipo de material metálico */
  material?: 'steel' | 'brass' | 'bronze'
  /** Radio de la esfera de la manija */
  radius?: number
}

/**
 * Configuración de la moldura decorativa
 */
export interface MoldingConfig {
  /** Si incluir moldura */
  enabled: boolean
  /** Ancho relativo al panel (0-1) */
  widthRatio?: number
  /** Alto relativo al panel (0-1) */
  heightRatio?: number
  /** Profundidad de la moldura */
  depth?: number
}

/**
 * Props del componente DoorGeometry
 */
export interface DoorGeometryProps {
  /** Ancho de la puerta */
  width: number
  
  /** Alto de la puerta */
  height: number
  
  /** Profundidad/grosor de la puerta */
  depth: number
  
  /** Estilo de puerta */
  style?: DoorStyle
  
  /** Configuración de la manija */
  handle?: HandleConfig | boolean
  
  /** Configuración de la moldura */
  molding?: MoldingConfig | boolean
  
  /** Si el marco debe ser más prominente (vista aérea) */
  emphasizeFrame?: boolean
}

// ============================================================================
// CONFIGURACIONES POR DEFECTO
// ============================================================================

const DEFAULT_HANDLE_CONFIG: HandleConfig = {
  enabled: true,
  position: 0.85,  // Cerca del borde
  material: 'steel',
  radius: 0.04     // Más grande para vista aérea
}

const DEFAULT_MOLDING_CONFIG: MoldingConfig = {
  enabled: true,
  widthRatio: 0.7,
  heightRatio: 0.5,
  depth: 0.015
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Normaliza la configuración de manija
 */
function normalizeHandleConfig(handle?: HandleConfig | boolean): HandleConfig {
  if (handle === false) {
    return { ...DEFAULT_HANDLE_CONFIG, enabled: false }
  }
  if (handle === true || handle === undefined) {
    return DEFAULT_HANDLE_CONFIG
  }
  return { ...DEFAULT_HANDLE_CONFIG, ...handle }
}

/**
 * Normaliza la configuración de moldura
 */
function normalizeMoldingConfig(molding?: MoldingConfig | boolean): MoldingConfig {
  if (molding === false) {
    return { ...DEFAULT_MOLDING_CONFIG, enabled: false }
  }
  if (molding === true || molding === undefined) {
    return DEFAULT_MOLDING_CONFIG
  }
  return { ...DEFAULT_MOLDING_CONFIG, ...molding }
}

/**
 * Obtiene los materiales según el estilo de puerta
 */
function getMaterialsForStyle(style: DoorStyle) {
  switch (style) {
    case 'elegant':
      return {
        panel: doorMaterials.darkWoodPanel,
        frame: doorMaterials.frame,
        molding: doorMaterials.molding
      }
    case 'modern':
      return {
        panel: doorMaterials.paintedPanel,
        frame: doorMaterials.paintedPanel,
        molding: doorMaterials.frame
      }
    case 'painted':
      return {
        panel: doorMaterials.paintedPanel,
        frame: doorMaterials.frame,
        molding: doorMaterials.paintedPanel
      }
    case 'standard':
    default:
      return {
        panel: doorMaterials.woodPanel,
        frame: doorMaterials.frame,
        molding: doorMaterials.molding
      }
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente DoorGeometry
 * 
 * Renderiza una puerta arquitectónica completa con marco, panel, moldura y manija.
 * Optimizado para vista aérea.
 * 
 * @example
 * ```tsx
 * <DoorGeometry
 *   width={0.9}
 *   height={2.0}
 *   depth={0.05}
 *   style="elegant"
 *   handle={{ position: 0.8, material: 'brass' }}
 *   molding={true}
 * />
 * ```
 */
export function DoorGeometry({
  width,
  height,
  depth,
  style = 'standard',
  handle,
  molding,
  emphasizeFrame = true
}: DoorGeometryProps) {
  
  // Normalizar configuraciones
  const handleConfig = useMemo(() => normalizeHandleConfig(handle), [handle])
  const moldingConfig = useMemo(() => normalizeMoldingConfig(molding), [molding])
  const materials = useMemo(() => {
    const baseMaterials = getMaterialsForStyle(style)
    // Clonar materiales para evitar conflictos de referencia
    return {
      panel: baseMaterials.panel.clone(),
      frame: baseMaterials.frame.clone(),
      molding: baseMaterials.molding.clone()
    }
  }, [style])
  
  // Material de la manija
  const handleMaterial = useMemo(() => {
    const baseMaterial = handleConfig.material === 'brass' ? metalMaterials.brass :
                        handleConfig.material === 'bronze' ? metalMaterials.bronze :
                        metalMaterials.steel
    return baseMaterial.clone()
  }, [handleConfig.material])
  
  // Dimensiones calculadas
  const frameThickness = emphasizeFrame ? 0.08 : 0.05
  const frameDepth = depth * 1.5 // Marco más profundo que el panel
  
  // Para vista aérea, el panel debe ser más grueso de lo normal
  const visualDepth = Math.max(depth, 0.1) // Mínimo 0.1 para visibilidad
  
  return (
    <group>
      {/* ===== MARCO EXTERIOR ===== */}
      <group name="door-frame">
        {/* Marco superior */}
        <mesh
          position={[0, height / 2 + frameThickness / 2, 0]}
          material={materials.frame}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        </mesh>
        
        {/* Marco inferior */}
        <mesh
          position={[0, -height / 2 - frameThickness / 2, 0]}
          material={materials.frame}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        </mesh>
        
        {/* Marco lateral izquierdo */}
        <mesh
          position={[-width / 2 - frameThickness / 2, 0, 0]}
          material={materials.frame}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[frameThickness, height, frameDepth]} />
        </mesh>
        
        {/* Marco lateral derecho */}
        <mesh
          position={[width / 2 + frameThickness / 2, 0, 0]}
          material={materials.frame}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[frameThickness, height, frameDepth]} />
        </mesh>
      </group>
      
      {/* ===== PANEL PRINCIPAL ===== */}
      <mesh
        name="door-panel"
        material={materials.panel}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, visualDepth]} />
      </mesh>
      
      {/* ===== MOLDURA DECORATIVA ===== */}
      {moldingConfig.enabled && (
        <group name="door-molding">
          {/* Moldura central */}
          <mesh
            position={[0, 0, visualDepth / 2 + (moldingConfig.depth || 0.015) / 2]}
            material={materials.molding}
            castShadow
          >
            <boxGeometry 
              args={[
                width * (moldingConfig.widthRatio || 0.7),
                height * (moldingConfig.heightRatio || 0.5),
                moldingConfig.depth || 0.015
              ]} 
            />
          </mesh>
          
          {/* Borde de moldura (decorativo) */}
          <mesh
            position={[0, 0, visualDepth / 2 + (moldingConfig.depth || 0.015)]}
            material={materials.frame}
            castShadow
          >
            <boxGeometry 
              args={[
                width * (moldingConfig.widthRatio || 0.7) + 0.02,
                height * (moldingConfig.heightRatio || 0.5) + 0.02,
                0.005
              ]} 
            />
          </mesh>
        </group>
      )}
      
      {/* ===== MANIJA ===== */}
      {handleConfig.enabled && (
        <group name="door-handle">
          {/* Esfera de la manija */}
          <mesh
            position={[
              width * (handleConfig.position || 0.85) - width / 2,
              0,
              visualDepth / 2 + (handleConfig.radius || 0.04)
            ]}
            material={handleMaterial}
            castShadow
          >
            <sphereGeometry args={[handleConfig.radius || 0.04, 16, 16]} />
          </mesh>
          
          {/* Base de la manija (cilindro pequeño) */}
          <mesh
            position={[
              width * (handleConfig.position || 0.85) - width / 2,
              0,
              visualDepth / 2 + (handleConfig.radius || 0.04) / 2
            ]}
            rotation={[Math.PI / 2, 0, 0]}
            material={handleMaterial}
            castShadow
          >
            <cylinderGeometry args={[(handleConfig.radius || 0.04) * 0.6, (handleConfig.radius || 0.04) * 0.6, (handleConfig.radius || 0.04) * 0.8, 12]} />
          </mesh>
          
          {/* Placa de la manija (opcional, para vista aérea) */}
          <mesh
            position={[
              width * (handleConfig.position || 0.85) - width / 2,
              0,
              visualDepth / 2 + 0.005
            ]}
            material={handleMaterial}
            castShadow
          >
            <boxGeometry args={[0.08, 0.15, 0.01]} />
          </mesh>
        </group>
      )}
      
      {/* ===== BISAGRAS (DECORATIVAS) ===== */}
      {emphasizeFrame && (
        <group name="door-hinges">
          {/* Bisagra superior */}
          <mesh
            position={[-width / 2 - frameThickness / 4, height * 0.35, frameDepth / 2]}
            material={handleMaterial}
            castShadow
          >
            <boxGeometry args={[0.04, 0.08, 0.02]} />
          </mesh>
          
          {/* Bisagra central */}
          <mesh
            position={[-width / 2 - frameThickness / 4, 0, frameDepth / 2]}
            material={handleMaterial}
            castShadow
          >
            <boxGeometry args={[0.04, 0.08, 0.02]} />
          </mesh>
          
          {/* Bisagra inferior */}
          <mesh
            position={[-width / 2 - frameThickness / 4, -height * 0.35, frameDepth / 2]}
            material={handleMaterial}
            castShadow
          >
            <boxGeometry args={[0.04, 0.08, 0.02]} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default DoorGeometry
