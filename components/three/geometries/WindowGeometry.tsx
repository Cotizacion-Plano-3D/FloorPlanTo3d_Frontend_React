'use client';

import React, { useMemo } from 'react';
import { Mesh, BoxGeometry, PlaneGeometry, MeshStandardMaterial } from 'three';
import { windowMaterials, metalMaterials } from '@/lib/three/materials';
import type { BaseGeometryProps } from './types';
import { 
  calculateVisibleDepth, 
  applyAerialOptimization,
  applyShadows 
} from './utils';

/**
 * WindowGeometry Component
 * 
 * Renders realistic architectural windows optimized for aerial view.
 * Includes frame, glass panes, dividers (cross pattern), and optional hardware.
 * 
 * Features:
 * - 4-piece outer frame (top/bottom/left/right)
 * - Transparent glass pane with realistic material
 * - Horizontal and vertical dividers creating cross pattern
 * - Optional hardware (hinges, latches)
 * - Multiple window styles (standard, casement, sliding, bay)
 * - Aerial view optimization (minimum depth, emphasized frames)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WindowStyle = 'standard' | 'casement' | 'sliding' | 'bay';
export type DividerPattern = 'cross' | 'grid' | 'horizontal' | 'vertical' | 'none';

export interface DividerConfig {
  pattern: DividerPattern;
  thickness: number;  // Thickness of divider bars (default: 0.02)
  depth: number;      // Depth of divider bars (default: 0.03)
  gridCount?: number; // For 'grid' pattern: number of divisions (default: 2)
}

export interface HardwareConfig {
  enabled: boolean;
  hingeCount?: number;    // Number of hinges (default: 2)
  hingeSize?: number;     // Size of hinges (default: 0.03)
  latchEnabled?: boolean; // Show window latch (default: true)
  latchSize?: number;     // Size of latch (default: 0.025)
}

export interface WindowGeometryProps {
  // Dimensions
  width: number;
  height: number;
  depth: number;
  
  // Window Style
  style?: WindowStyle;
  
  // Frame Configuration
  frameThickness?: number;    // Thickness of frame (default: 0.08 for aerial visibility)
  frameDepth?: number;        // Depth of frame (default: 0.12)
  frameColor?: string;        // Color of frame (default: white)
  
  // Glass Configuration
  glassOpacity?: number;      // Opacity of glass (default: 0.3 for visibility)
  glassThickness?: number;    // Thickness of glass pane (default: 0.01)
  glassTint?: string;         // Optional tint color (default: light blue)
  
  // Dividers Configuration
  dividers?: DividerConfig;
  
  // Hardware Configuration
  hardware?: HardwareConfig;
  
  // Aerial Optimization
  emphasizeFrame?: boolean;   // Thicken frame for aerial view (default: true)
  minDepth?: number;          // Minimum depth for visibility (default: 0.1)
  
  // Material Overrides
  customFrameMaterial?: MeshStandardMaterial;
  customGlassMaterial?: MeshStandardMaterial;
  customDividerMaterial?: MeshStandardMaterial;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * WindowFrame - 4-piece outer frame
 * Creates top, bottom, left, right frame pieces
 */
const WindowFrame: React.FC<{
  width: number;
  height: number;
  depth: number;
  thickness: number;
  material: MeshStandardMaterial;
}> = ({ width, height, depth, thickness, material }) => {
  const frameGeometries = useMemo(() => {
    const outerWidth = width + thickness * 2;
    const outerHeight = height + thickness * 2;
    
    return {
      top: {
        geometry: new BoxGeometry(outerWidth, thickness, depth),
        position: [0, outerHeight / 2 - thickness / 2, 0] as [number, number, number]
      },
      bottom: {
        geometry: new BoxGeometry(outerWidth, thickness, depth),
        position: [0, -outerHeight / 2 + thickness / 2, 0] as [number, number, number]
      },
      left: {
        geometry: new BoxGeometry(thickness, height, depth),
        position: [-width / 2 - thickness / 2, 0, 0] as [number, number, number]
      },
      right: {
        geometry: new BoxGeometry(thickness, height, depth),
        position: [width / 2 + thickness / 2, 0, 0] as [number, number, number]
      }
    };
  }, [width, height, depth, thickness]);

  return (
    <group name="window-frame">
      <mesh
        geometry={frameGeometries.top.geometry}
        material={material}
        position={frameGeometries.top.position}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={frameGeometries.bottom.geometry}
        material={material}
        position={frameGeometries.bottom.position}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={frameGeometries.left.geometry}
        material={material}
        position={frameGeometries.left.position}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={frameGeometries.right.geometry}
        material={material}
        position={frameGeometries.right.position}
        castShadow
        receiveShadow
      />
    </group>
  );
};

/**
 * GlassPane - Transparent glass surface
 * Uses PlaneGeometry with transparent material for realistic glass
 */
const GlassPane: React.FC<{
  width: number;
  height: number;
  material: MeshStandardMaterial;
}> = ({ width, height, material }) => {
  const geometry = useMemo(
    () => new PlaneGeometry(width, height),
    [width, height]
  );

  return (
    <mesh
      name="glass-pane"
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
};

/**
 * WindowDividers - Cross or grid pattern dividers
 * Creates horizontal and/or vertical bars that divide the glass
 */
const WindowDividers: React.FC<{
  width: number;
  height: number;
  config: DividerConfig;
  material: MeshStandardMaterial;
}> = ({ width, height, config, material }) => {
  const dividers = useMemo(() => {
    const { pattern, thickness, depth, gridCount = 2 } = config;
    const elements: Array<{
      geometry: BoxGeometry;
      position: [number, number, number];
      key: string;
    }> = [];

    switch (pattern) {
      case 'cross':
        // Horizontal divider
        elements.push({
          geometry: new BoxGeometry(width, thickness, depth),
          position: [0, 0, 0],
          key: 'horizontal'
        });
        // Vertical divider
        elements.push({
          geometry: new BoxGeometry(thickness, height, depth),
          position: [0, 0, 0],
          key: 'vertical'
        });
        break;

      case 'horizontal':
        elements.push({
          geometry: new BoxGeometry(width, thickness, depth),
          position: [0, 0, 0],
          key: 'horizontal'
        });
        break;

      case 'vertical':
        elements.push({
          geometry: new BoxGeometry(thickness, height, depth),
          position: [0, 0, 0],
          key: 'vertical'
        });
        break;

      case 'grid':
        // Horizontal dividers
        for (let i = 1; i < gridCount; i++) {
          const y = (i / gridCount - 0.5) * height;
          elements.push({
            geometry: new BoxGeometry(width, thickness, depth),
            position: [0, y, 0],
            key: `h-${i}`
          });
        }
        // Vertical dividers
        for (let i = 1; i < gridCount; i++) {
          const x = (i / gridCount - 0.5) * width;
          elements.push({
            geometry: new BoxGeometry(thickness, height, depth),
            position: [x, 0, 0],
            key: `v-${i}`
          });
        }
        break;

      case 'none':
      default:
        break;
    }

    return elements;
  }, [width, height, config]);

  if (config.pattern === 'none' || dividers.length === 0) {
    return null;
  }

  return (
    <group name="window-dividers">
      {dividers.map((divider) => (
        <mesh
          key={divider.key}
          geometry={divider.geometry}
          material={material}
          position={divider.position}
          castShadow
        />
      ))}
    </group>
  );
};

/**
 * WindowHardware - Hinges and latches
 * Adds realistic hardware details for casement windows
 */
const WindowHardware: React.FC<{
  width: number;
  height: number;
  depth: number;
  config: HardwareConfig;
  material: MeshStandardMaterial;
}> = ({ width, height, depth, config, material }) => {
  const hardware = useMemo(() => {
    const {
      hingeCount = 2,
      hingeSize = 0.03,
      latchEnabled = true,
      latchSize = 0.025
    } = config;

    const elements: Array<{
      geometry: BoxGeometry;
      position: [number, number, number];
      key: string;
    }> = [];

    // Hinges on left side
    for (let i = 0; i < hingeCount; i++) {
      const y = ((i / (hingeCount - 1)) - 0.5) * height * 0.7;
      elements.push({
        geometry: new BoxGeometry(hingeSize * 0.5, hingeSize, hingeSize * 0.8),
        position: [-width / 2 - hingeSize * 0.25, y, depth / 2],
        key: `hinge-${i}`
      });
    }

    // Latch on right side (middle)
    if (latchEnabled) {
      elements.push({
        geometry: new BoxGeometry(latchSize * 0.6, latchSize * 0.4, latchSize * 1.2),
        position: [width / 2 + latchSize * 0.3, 0, depth / 2],
        key: 'latch'
      });
    }

    return elements;
  }, [width, height, depth, config]);

  if (!config.enabled) {
    return null;
  }

  return (
    <group name="window-hardware">
      {hardware.map((hw) => (
        <mesh
          key={hw.key}
          geometry={hw.geometry}
          material={material}
          position={hw.position}
          castShadow
        />
      ))}
    </group>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WindowGeometry: React.FC<WindowGeometryProps> = ({
  width,
  height,
  depth,
  style = 'standard',
  frameThickness: initialFrameThickness = 0.08,
  frameDepth: initialFrameDepth = 0.12,
  frameColor = '#ffffff',
  glassOpacity = 0.3,
  glassThickness = 0.01,
  glassTint = '#e0f2ff',
  dividers = {
    pattern: 'cross',
    thickness: 0.02,
    depth: 0.03
  },
  hardware = {
    enabled: false
  },
  emphasizeFrame = true,
  minDepth = 0.1,
  customFrameMaterial,
  customGlassMaterial,
  customDividerMaterial,
}) => {
  // Apply aerial optimizations
  const frameThickness = emphasizeFrame 
    ? Math.max(initialFrameThickness, 0.08) 
    : initialFrameThickness;
  
  const frameDepth = calculateVisibleDepth(initialFrameDepth, minDepth);
  
  const actualDividers: DividerConfig = {
    ...dividers,
    thickness: emphasizeFrame 
      ? Math.max(dividers.thickness, 0.02) 
      : dividers.thickness,
    depth: calculateVisibleDepth(dividers.depth, minDepth * 0.3)
  };

  // Create materials
  const frameMaterial = useMemo(() => {
    if (customFrameMaterial) return customFrameMaterial;
    
    // Choose frame material based on style
    let baseMaterial: MeshStandardMaterial;
    switch (style) {
      case 'casement':
        baseMaterial = windowMaterials.woodFrame;
        break;
      case 'sliding':
        baseMaterial = windowMaterials.frame; // Aluminum-like frame
        break;
      case 'bay':
        baseMaterial = windowMaterials.frame; // White frame
        break;
      case 'standard':
      default:
        baseMaterial = windowMaterials.frame; // Default white frame
    }
    
    // Clone and apply custom color if provided
    const material = baseMaterial.clone();
    if (frameColor !== '#ffffff') {
      material.color.set(frameColor);
    }
    
    return material;
  }, [style, frameColor, customFrameMaterial]);

  const glassMaterial = useMemo(() => {
    if (customGlassMaterial) return customGlassMaterial;
    
    // Choose glass material based on style
    const baseGlass = style === 'bay' 
      ? windowMaterials.frostedGlass 
      : windowMaterials.glass;
    
    const material = baseGlass.clone();
    material.opacity = glassOpacity;
    material.transparent = true;
    
    if (glassTint) {
      material.color.set(glassTint);
    }
    
    return material;
  }, [style, glassOpacity, glassTint, customGlassMaterial]);

  const dividerMaterial = useMemo(() => {
    if (customDividerMaterial) return customDividerMaterial;
    
    // Dividers use same material as frame
    return frameMaterial;
  }, [frameMaterial, customDividerMaterial]);

  const hardwareMaterial = useMemo(() => {
    const material = metalMaterials.steel.clone();
    return material;
  }, []);

  // Apply aerial optimizations to dimensions
  const optimizedDimensions = useMemo(() => {
    const baseDims = { width, height, depth };
    return applyAerialOptimization(baseDims, { minDepth });
  }, [width, height, depth, minDepth]);

  return (
    <group name={`window-${style}`}>
      {/* Outer Frame */}
      <WindowFrame
        width={optimizedDimensions.width}
        height={optimizedDimensions.height}
        depth={frameDepth}
        thickness={frameThickness}
        material={frameMaterial}
      />

      {/* Glass Pane */}
      <GlassPane
        width={optimizedDimensions.width}
        height={optimizedDimensions.height}
        material={glassMaterial}
      />

      {/* Dividers */}
      {actualDividers.pattern !== 'none' && (
        <WindowDividers
          width={optimizedDimensions.width}
          height={optimizedDimensions.height}
          config={actualDividers}
          material={dividerMaterial}
        />
      )}

      {/* Hardware (for casement style) */}
      {hardware.enabled && (
        <WindowHardware
          width={optimizedDimensions.width}
          height={optimizedDimensions.height}
          depth={frameDepth}
          config={hardware}
          material={hardwareMaterial}
        />
      )}
    </group>
  );
};

// ============================================================================
// STYLE PRESETS
// ============================================================================

/**
 * Pre-configured window styles for common architectural patterns
 */
export const WindowStylePresets = {
  standard: {
    style: 'standard' as WindowStyle,
    frameColor: '#ffffff',
    dividers: {
      pattern: 'cross' as DividerPattern,
      thickness: 0.02,
      depth: 0.03
    },
    hardware: { enabled: false }
  },
  
  casement: {
    style: 'casement' as WindowStyle,
    frameColor: '#8b7355',
    dividers: {
      pattern: 'horizontal' as DividerPattern,
      thickness: 0.02,
      depth: 0.03
    },
    hardware: {
      enabled: true,
      hingeCount: 3,
      latchEnabled: true
    }
  },
  
  sliding: {
    style: 'sliding' as WindowStyle,
    frameColor: '#c0c0c0',
    dividers: {
      pattern: 'vertical' as DividerPattern,
      thickness: 0.025,
      depth: 0.04
    },
    hardware: { enabled: false }
  },
  
  bay: {
    style: 'bay' as WindowStyle,
    frameColor: '#ffffff',
    dividers: {
      pattern: 'grid' as DividerPattern,
      thickness: 0.02,
      depth: 0.03,
      gridCount: 2
    },
    hardware: { enabled: false },
    glassOpacity: 0.4
  },
  
  modern: {
    style: 'standard' as WindowStyle,
    frameColor: '#2c3e50',
    dividers: {
      pattern: 'none' as DividerPattern,
      thickness: 0.02,
      depth: 0.03
    },
    hardware: { enabled: false },
    glassOpacity: 0.2
  }
};

export default WindowGeometry;
