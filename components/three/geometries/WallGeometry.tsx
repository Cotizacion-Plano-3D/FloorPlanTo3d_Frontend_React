'use client';

import React, { useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { wallMaterials } from '@/lib/three/materials';

/**
 * WallGeometry Component
 * 
 * Renders architectural walls with realistic materials.
 * This is a Phase 1 implementation using simple BoxGeometry.
 * Future Phase 2 will integrate CSG for door/window openings.
 * 
 * Features:
 * - Multiple wall materials (concrete, painted, brick, drywall)
 * - Proper PBR material properties
 * - Optimized for aerial view
 * - Prepared for future CSG integration
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WallMaterial = 'concrete' | 'painted' | 'brick' | 'drywall';

export interface WallGeometryProps {
  // Dimensions
  width: number;
  height: number;
  depth: number;
  
  // Material
  material?: WallMaterial;
  customColor?: string;
  
  // Surface properties
  roughness?: number;
  metalness?: number;
  
  // Future CSG preparation
  openings?: Array<{
    type: 'door' | 'window';
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
  }>;
  
  // Material override
  customMaterial?: MeshStandardMaterial;
}

// ============================================================================
// MATERIAL SELECTION
// ============================================================================

/**
 * Selects the appropriate material based on wall type
 */
function getMaterialForWallType(
  wallType: WallMaterial,
  customColor?: string,
  roughness?: number,
  metalness?: number
): MeshStandardMaterial {
  let baseMaterial: MeshStandardMaterial;
  
  switch (wallType) {
    case 'concrete':
      baseMaterial = wallMaterials.concrete;
      break;
    case 'brick':
      baseMaterial = wallMaterials.brick;
      break;
    case 'drywall':
      baseMaterial = wallMaterials.drywall;
      break;
    case 'painted':
    default:
      baseMaterial = wallMaterials.painted;
  }
  
  // Clone material to allow customization
  const material = baseMaterial.clone();
  
  // Apply custom properties if provided
  if (customColor) {
    material.color.set(customColor);
  }
  if (roughness !== undefined) {
    material.roughness = roughness;
  }
  if (metalness !== undefined) {
    material.metalness = metalness;
  }
  
  return material;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WallGeometry: React.FC<WallGeometryProps> = ({
  width,
  height,
  depth,
  material: wallType = 'painted',
  customColor,
  roughness,
  metalness,
  openings,
  customMaterial,
}) => {
  // Create or select material
  const material = useMemo(() => {
    if (customMaterial) return customMaterial.clone();
    
    return getMaterialForWallType(wallType, customColor, roughness, metalness);
  }, [wallType, customColor, roughness, metalness, customMaterial]);

  // Phase 1: Simple box geometry
  // Phase 2: Will integrate CSG for openings
  if (openings && openings.length > 0) {
    // TODO: Phase 2 - CSG integration
    // For now, we just render the wall as-is
    // Future implementation will use three-bvh-csg to create actual holes
    console.warn('WallGeometry: CSG openings not yet implemented. Will be added in Phase 2.');
  }

  return (
    <mesh
      material={material}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[width, height, depth]} />
    </mesh>
  );
};

// ============================================================================
// WALL STYLE PRESETS
// ============================================================================

/**
 * Pre-configured wall styles for common architectural patterns
 */
export const WallStylePresets = {
  /**
   * Interior wall - painted white
   * Standard for residential interiors
   */
  interior: {
    material: 'painted' as WallMaterial,
    customColor: '#F5F5F5',
    roughness: 0.8,
    metalness: 0.1
  },
  
  /**
   * Exterior wall - concrete
   * Typical for modern buildings
   */
  exterior: {
    material: 'concrete' as WallMaterial,
    roughness: 0.9,
    metalness: 0.0
  },
  
  /**
   * Brick wall - exposed brick
   * For industrial or rustic styles
   */
  brick: {
    material: 'brick' as WallMaterial,
    roughness: 0.85,
    metalness: 0.0
  },
  
  /**
   * Drywall - unpainted
   * For construction/under-development views
   */
  drywall: {
    material: 'drywall' as WallMaterial,
    roughness: 0.75,
    metalness: 0.0
  },
  
  /**
   * Feature wall - colored accent
   * For architectural highlights
   */
  accent: {
    material: 'painted' as WallMaterial,
    customColor: '#4A90E2',
    roughness: 0.6,
    metalness: 0.2
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates the optimal wall depth based on height
 * Ensures walls are proportional and visible from aerial view
 */
export function calculateWallDepth(height: number): number {
  // Standard wall thickness: 10-15cm for interior, 20-30cm for exterior
  // For aerial view visibility, minimum 0.15
  const standardDepth = height > 3.0 ? 0.25 : 0.15;
  return Math.max(standardDepth, 0.12); // Minimum 12cm for visibility
}

/**
 * Validates wall dimensions
 * Ensures walls meet minimum standards
 */
export function validateWallDimensions(
  width: number,
  height: number,
  depth: number
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (width < 0.1) issues.push('Width too small (min 0.1m)');
  if (height < 0.5) issues.push('Height too small (min 0.5m)');
  if (depth < 0.05) issues.push('Depth too small (min 0.05m)');
  
  if (width > 50) issues.push('Width too large (max 50m)');
  if (height > 10) issues.push('Height too large (max 10m)');
  if (depth > 1) issues.push('Depth too large (max 1m)');
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default WallGeometry;
