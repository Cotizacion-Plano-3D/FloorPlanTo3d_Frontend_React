"use client"

import { Canvas, useLoader } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Grid, ContactShadows, useTexture, Text } from "@react-three/drei"
import { Suspense, useState, useEffect, useCallback } from "react"
import * as THREE from "three"
import { ThreeJSObject, ThreeJSScene } from "@/lib/floorplan-api"
import { TexturePanel, ElementType, TextureAssignment } from "@/components/texture-panel"
import { Material, MaterialModelo3DCreate } from "@/types/api"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Paintbrush, Save, AlertCircle, Ruler } from "lucide-react"
import { DimensionEditorPanel } from "@/components/dimension-editor/DimensionEditorPanel"
import { useDimensionEditor } from "@/components/dimension-editor/useDimensionEditor"

interface IntersectionPoint {
  id: number
  x: number
  y: number
  z: number
  type: 'intersection' | 'corner'
}

interface FloorPlan3DViewerProps {
  imageUrl?: string
  sceneData?: {
    scene: ThreeJSScene
    objects: ThreeJSObject[]
    intersections?: IntersectionPoint[]
    camera?: {
      position: { x: number; y: number; z: number }
      target: { x: number; y: number; z: number }
    }
  }
  modelo3dId?: number
  planoId?: number
  showIntersections?: boolean
}

// Hook personalizado para cargar texturas con fallback
function useTextureWithFallback(url?: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) {
      setTexture(null)
      return
    }

    setIsLoading(true)
    setError(null)

    const loader = new THREE.TextureLoader()
    
    loader.load(
      url,
      (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping
        loadedTexture.wrapT = THREE.RepeatWrapping
        loadedTexture.repeat.set(2, 2)
        loadedTexture.needsUpdate = true
        
        setTexture(loadedTexture)
        setIsLoading(false)
    
      },
      undefined,
      (err) => {
        console.error(`❌ Error cargando textura:`, err, url)
        setError(err as Error)
        setIsLoading(false)
      }
    )
  }, [url])

  return { texture, isLoading, error }
}

// Texturas por defecto para cada tipo de elemento
const DEFAULT_TEXTURES = {
  wall: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/concrete_floor_03/concrete_floor_03_diff_2k.png",
  window: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/glass_01/glass_01_diff_2k.png",
  door: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/wooden_planks_02/wooden_planks_02_diff_2k.png",
  floor: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/ceramic_tiles_03/ceramic_tiles_03_diff_2k.png",
  ceiling: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/painted_plaster_01/painted_plaster_01_diff_2k.png"
} as const

// Componente para renderizar objetos 3D del backend
function Object3D({ 
  obj, 
  textureUrl, 
  wallTextureUrl,
  effectiveDimensions,
  isSelected,
  onSelect
}: { 
  obj: ThreeJSObject
  textureUrl?: string
  wallTextureUrl?: string
  effectiveDimensions: {
    width: number
    height: number
    depth: number
    position: { x: number; y: number; z: number }
  }
  isSelected?: boolean
  onSelect?: () => void
}) {
  // Si no hay textura específica, usar la textura por defecto según el tipo
  const effectiveTextureUrl = textureUrl || DEFAULT_TEXTURES[obj.type as keyof typeof DEFAULT_TEXTURES] || DEFAULT_TEXTURES.wall
  
  // Cargar textura del objeto (ventana, puerta, o pared)
  const { texture, isLoading, error } = useTextureWithFallback(effectiveTextureUrl)
  
  // 🎨 Cargar textura de PARED para usar en secciones de pared dentro de ventanas/puertas
  const effectiveWallTextureUrl = wallTextureUrl || DEFAULT_TEXTURES.wall
  const { texture: wallTexture, isLoading: wallIsLoading } = useTextureWithFallback(effectiveWallTextureUrl)
  

  // Log del estado de carga
  useEffect(() => {
    console.log(`📊 Texture state [${obj.type}] ${obj.id}:`, {
      hasTexture: !!texture,
      isLoading,
      hasError: !!error
    })
  }, [obj.type, obj.id, texture, isLoading, error])

  // Solo loggear errores
    useEffect(() => {
    if (error) {
      console.error(`❌ Error en Object3D [${obj.type}] ${obj.id}:`, {
        message: error?.message || 'Error desconocido',
        url: effectiveTextureUrl,
        stack: error?.stack
      })
    }
  }, [obj.type, obj.id, error, effectiveTextureUrl])

  const getColor = (type: string) => {
    switch (type) {
      case 'wall':
        return '#E8E8E8' // Gris claro profesional (corregido de 'red')
      case 'window':
        return '#B0E0E6' // Azul cielo suave para ventanas
      case 'door':
        return '#D2B48C' // Beige cálido para puertas
      default:
        return '#F5F5F5' // Blanco suave
    }
  }

  const getOpacity = (type: string) => {
    switch (type) {
      case 'wall':
        return 1.0 // Paredes completamente opacas
      case 'window':
        return 0.25 // Ventanas más transparentes para efecto de vidrio
      case 'door':
        return 1.0
      default:
        return 0.8
    }
  }

  const getRoughness = (type: string) => {
    switch (type) {
      case 'wall':
        return 0.8 // Paredes con superficie mate
      case 'window':
        return 0.1 // Ventanas más reflectantes
      case 'door':
        return 0.6 // Puertas semi-mate
      default:
        return 0.7
    }
  }

  const getMetalness = (type: string) => {
    switch (type) {
      case 'wall':
        return 0.0 // Paredes no metálicas
      case 'window':
        return 0.1 // Ventanas ligeramente metálicas
      case 'door':
        return 0.0
      default:
        return 0.0
    }
  }

  // 🔧 Helper para crear materiales con soporte para textura de pared y de objeto
  const createMaterial = (materialType: 'object' | 'wall', highlight = false) => {
    // Si es 'wall', usar wallTexture; si es 'object', usar texture
    const targetTexture = materialType === 'wall' ? wallTexture : texture
    const targetIsLoading = materialType === 'wall' ? wallIsLoading : isLoading
    const hasTexture = targetTexture && !targetIsLoading
    
    // Determinar el tipo de material base para las propiedades (roughness, metalness, etc.)
    // Si es 'wall', usar propiedades de pared; si es 'object', usar propiedades del objeto actual
    const materialBaseType = materialType === 'wall' ? 'wall' : obj.type
    
    // Color base: si está seleccionado, usar amarillo; si no, usar el color normal
    const baseColor = highlight ? '#FFD700' : (hasTexture ? 'white' : getColor(materialBaseType))
    const emissiveColor = highlight ? '#FFD700' : undefined
    const emissiveIntensity = highlight ? 0.3 : 0
    
    // Si hay textura cargada, aplicarla
    if (hasTexture) {
      return (
        <meshStandardMaterial
          key={targetTexture.uuid} // Key única para forzar re-render cuando cambie la textura
          map={targetTexture}
          color={baseColor} // Color base (blanco para textura, amarillo si seleccionado)
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={getRoughness(materialBaseType)}
          metalness={getMetalness(materialBaseType)}
          side={THREE.DoubleSide} // Ambas caras para que se vea desde cualquier ángulo
          toneMapped={true}
          envMapIntensity={materialBaseType === 'window' ? 1.5 : 0.8}
        />
      )
    }
    
    // Fallback a color sólido con propiedades mejoradas
    return (
      <meshStandardMaterial
        color={baseColor}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        transparent={materialBaseType === 'window'}
        opacity={getOpacity(materialBaseType)}
        roughness={getRoughness(materialBaseType)}
        metalness={getMetalness(materialBaseType)}
        side={THREE.DoubleSide}
        envMapIntensity={materialBaseType === 'window' ? 1.5 : 0.5} // Ventanas más reflectantes
      />
    )
  }

  // Usar dimensiones efectivas (modificadas o originales)
  const dimensions = effectiveDimensions
  const position = effectiveDimensions.position

  // Renderizado especial para ventanas
  if (obj.type === 'window') {
    // CORRECCIÓN: Las ventanas están dentro de paredes completas de tipo WALL
    // Asumir altura estándar de pared: 3.0m (igual que las paredes normales)
    const STANDARD_WALL_HEIGHT = 3.0
    
    // La ventana usa 100% de su altura definida (no se divide)
    const windowHeight = dimensions.height // Ej: 1.5m (100% de la altura de la ventana)
    
    // La posición Y del backend puede estar basada en height/2 de la ventana
    // Necesitamos calcular dónde está realmente la ventana dentro de la pared de 3.0m
    // Si position.y es muy bajo, asumir que la ventana está a una altura típica
    let windowCenterY = position.y
    
    // Si la ventana está muy cerca del suelo (menos de 1.0m), 
    // asumir que debería estar centrada verticalmente en la pared o a altura típica
    if (windowCenterY < 1.0) {
      // Ventana típica: base a 0.8m, centro a 1.55m (0.8 + 1.5/2)
      // O centrada en la pared: 3.0/2 = 1.5m
      windowCenterY = STANDARD_WALL_HEIGHT / 2 // Centrada en la pared de 3.0m
    }
    
    // Calcular límites de la ventana
    const windowBottomY = windowCenterY - (windowHeight / 2) // Base de la ventana
    const windowTopY = windowCenterY + (windowHeight / 2) // Top de la ventana
    
    // Asegurar que la ventana esté dentro de los límites de la pared
    const wallBaseY = 0 // Base de la pared completa
    const wallTopY = STANDARD_WALL_HEIGHT // Top de la pared completa (3.0m)
    
    // Pared inferior: desde la base de la pared (0m) hasta la base de la ventana
    // Esta es una PARED COMPLETA de tipo WALL
    const bottomWallHeight = Math.max(windowBottomY - wallBaseY, 0.1) // Mínimo 0.1m
    const bottomWallY = wallBaseY + (bottomWallHeight / 2)
    
    // Pared superior (dintel): desde el top de la ventana hasta el top de la pared (3.0m)
    // Esta es una PARED COMPLETA de tipo WALL
    const topWallHeight = Math.max(wallTopY - windowTopY, 0.1) // Mínimo 0.1m
    const topWallY = windowTopY + (topWallHeight / 2)
    
    // Hacer las paredes superior e inferior más anchas (efecto de marco de ventana)
    const wallExtensionFactor = 1.1 // Extender 30% más que la ventana
    const bottomWallWidth = dimensions.width * wallExtensionFactor
    const bottomWallDepth = dimensions.depth * wallExtensionFactor
    const topWallWidth = dimensions.width * wallExtensionFactor
    const topWallDepth = dimensions.depth * wallExtensionFactor
    
    // Validar que las alturas sumen correctamente
    const totalHeight = bottomWallHeight + windowHeight + topWallHeight
    if (Math.abs(totalHeight - STANDARD_WALL_HEIGHT) > 0.01) {
      // Ajustar si hay pequeñas discrepancias por redondeo
      const adjustment = STANDARD_WALL_HEIGHT - totalHeight
      if (topWallHeight > bottomWallHeight) {
        // Ajustar la pared superior
        const adjustedTopHeight = topWallHeight + adjustment
        const adjustedTopY = windowTopY + (adjustedTopHeight / 2)
        // Usar valores ajustados
    return (
      <group 
        key={`${obj.id}_${texture?.uuid || 'no-tex'}_${wallTexture?.uuid || 'no-wall'}`} 
            position={[position.x, 0, position.z]} 
        rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
            onClick={onSelect ? (e) => { 
              e.stopPropagation(); 
              onSelect(); 
            } : undefined}
            onPointerOver={onSelect ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            } : undefined}
            onPointerOut={onSelect ? () => {
              document.body.style.cursor = 'default';
            } : undefined}
          >
            {/* ✅ Pared inferior - PARED COMPLETA de tipo WALL (más ancha) */}
            <mesh position={[0, bottomWallY, 0]} receiveShadow>
              <boxGeometry args={[bottomWallWidth, bottomWallHeight, bottomWallDepth]} />
          {createMaterial('wall')}
        </mesh>

            {/* 🪟 Ventana transparente - USA 100% DE SU ALTURA */}
            <mesh position={[0, windowCenterY, 0]} receiveShadow>
              <boxGeometry args={[dimensions.width, windowHeight, dimensions.depth]} />
              {createMaterial('object', isSelected)}
        </mesh>

            {/* ✅ Pared superior (dintel) - PARED COMPLETA de tipo WALL (más ancha) */}
            <mesh position={[0, adjustedTopY, 0]} receiveShadow>
              <boxGeometry args={[topWallWidth, adjustedTopHeight, topWallDepth]} />
              {createMaterial('wall')}
            </mesh>
          </group>
        )
      }
    }

    return (
      <group 
        key={`${obj.id}_${texture?.uuid || 'no-tex'}_${wallTexture?.uuid || 'no-wall'}`} 
        position={[position.x, 0, position.z]} 
        rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
        onClick={onSelect ? (e) => { e.stopPropagation(); onSelect() } : undefined}
        onPointerOver={onSelect ? () => document.body.style.cursor = 'pointer' : undefined}
        onPointerOut={onSelect ? () => document.body.style.cursor = 'default' : undefined}
      >
        {/* ✅ Pared inferior - PARED COMPLETA de tipo WALL (más ancha) */}
        <mesh position={[0, bottomWallY, 0]} receiveShadow>
          <boxGeometry args={[bottomWallWidth, bottomWallHeight, bottomWallDepth]} />
          {createMaterial('wall')}
        </mesh>

        {/* 🪟 Ventana transparente - USA 100% DE SU ALTURA */}
        <mesh position={[0, windowCenterY, 0]} receiveShadow>
          <boxGeometry args={[dimensions.width, windowHeight, dimensions.depth]} />
          {createMaterial('object', isSelected)}
        </mesh>

        {/* ✅ Pared superior (dintel) - PARED COMPLETA de tipo WALL (más ancha) */}
        <mesh position={[0, topWallY, 0]} receiveShadow>
          <boxGeometry args={[topWallWidth, topWallHeight, topWallDepth]} />
          {createMaterial('wall')}
        </mesh>
      </group>
    )
  }

  // Renderizado especial para puertas
  if (obj.type === 'door') {
    const wallHeight = dimensions.height
    const doorHeight = wallHeight * 0.9
    const topWallHeight = 1.2

    const baseY = position.y - (wallHeight / 2)
    const doorY = baseY + (doorHeight / 2)
    const topWallY = baseY + doorHeight + (topWallHeight / 2)

    // Hacer la puerta más ancha (factor de ampliación)
    const doorWidthFactor = 1.25 // Ampliar 15% el ancho de la puerta (ajustable)
    const doorDepthFactor = 1.15 // Ampliar 15% la profundidad de la puerta (ajustable)
    const doorWidth = dimensions.width * doorWidthFactor
    const doorDepth = dimensions.depth * doorDepthFactor

    // Hacer el dintel superior más ancho (efecto de marco de puerta)
    const topWallExtensionFactor = 1.0 // Extender 20% más que la puerta (ajustable)
    const topWallWidth = doorWidth * topWallExtensionFactor // Basado en la puerta ampliada
    const topWallDepth = doorDepth * topWallExtensionFactor // Basado en la puerta ampliada

    return (
      <group 
        key={`${obj.id}_${texture?.uuid || 'no-tex'}_${wallTexture?.uuid || 'no-wall'}`} 
        position={[position.x, 0, position.z]} 
        rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
        onClick={onSelect ? (e) => { e.stopPropagation(); onSelect() } : undefined}
        onPointerOver={onSelect ? () => document.body.style.cursor = 'pointer' : undefined}
        onPointerOut={onSelect ? () => document.body.style.cursor = 'default' : undefined}
      >
        {/* 🚪 Puerta - USA TEXTURA DE PUERTA (más ancha) */}
        <mesh position={[0, doorY, 0]} receiveShadow>
          <boxGeometry args={[doorWidth, doorHeight, doorDepth]} />
          {createMaterial('object', isSelected)}
        </mesh>

        {/* ✅ Dintel superior - PARED COMPLETA de tipo WALL (más ancha) */}
        {topWallHeight > 0 && (
          <mesh position={[0, topWallY, 0]} receiveShadow>
            <boxGeometry args={[topWallWidth, topWallHeight, topWallDepth]} />
            {createMaterial('wall')}
          </mesh>
        )}
      </group>
    )
  }

  // Renderizado normal para otros objetos (paredes)
  return (
    <mesh
      key={`${obj.id}_${texture?.uuid || 'no-tex'}_${wallTexture?.uuid || 'no-wall'}`}
      position={[position.x, position.y, position.z]}
      rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
      receiveShadow
      onClick={onSelect ? (e) => { 
        e.stopPropagation(); 
        onSelect(); 
      } : undefined}
      onPointerOver={onSelect ? (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      } : undefined}
      onPointerOut={onSelect ? () => {
        document.body.style.cursor = 'default';
      } : undefined}
    >
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      {createMaterial('object', isSelected)}
    </mesh>
  )
}

// Componente para renderizar un punto de intersección
function IntersectionMarker({ point }: { point: IntersectionPoint }) {
  // Colores más distintivos
  const isIntersection = point.type === 'intersection'
  const sphereColor = isIntersection ? '#FF6B35' : '#4ECDC4' // Naranja para intersecciones, Turquesa para esquinas
  const emissiveColor = isIntersection ? '#FF4500' : '#00CED1' // Naranja brillante vs Turquesa brillante
  const textColor = isIntersection ? '#FFFFFF' : '#000000' // Blanco para naranja, negro para turquesa
  
  // Tamaño y posición más realistas
  const sphereRadius = 0.12 // Tamaño moderado
  const heightAboveGround = 0.15 // 15cm sobre el suelo (altura razonable)
  const sphereCenterY = point.y + heightAboveGround + sphereRadius // Centro de la esfera
  
  return (
    <group position={[point.x, sphereCenterY, point.z]}>
      {/* Esfera marcadora */}
      <mesh castShadow>
        <sphereGeometry args={[sphereRadius, 16, 16]} />
        <meshStandardMaterial 
          color={sphereColor}
          emissive={emissiveColor}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      {/* Texto con el número */}
      <Text
        position={[0, sphereRadius + 0.15, 0]}
        fontSize={0.15}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor={isIntersection ? "#000000" : "#FFFFFF"}
      >
        {point.id}
      </Text>
      {/* Línea vertical sutil que conecta con el suelo */}
      <mesh position={[0, -sphereRadius - (heightAboveGround / 2), 0]}>
        <cylinderGeometry args={[0.015, 0.015, heightAboveGround, 8]} />
        <meshStandardMaterial 
          color={sphereColor} 
          opacity={0.6}
          transparent
        />
      </mesh>
    </group>
  )
}

// Modelo 3D generado desde los datos del backend
function FloorPlan3DModel({ 
  imageUrl, 
  sceneData,
  textureAssignments,
  showIntersections = true,
  getEffectiveDimensions,
  selectedObjectId,
  onObjectSelect
}: { 
  imageUrl?: string
  sceneData?: { scene: ThreeJSScene; objects: ThreeJSObject[]; intersections?: IntersectionPoint[] }
  textureAssignments: TextureAssignment[]
  showIntersections?: boolean
  getEffectiveDimensions: (obj: ThreeJSObject) => {
    width: number
    height: number
    depth: number
    position: { x: number; y: number; z: number }
  }
  selectedObjectId?: string | number | null
  onObjectSelect?: (obj: ThreeJSObject) => void
}) {
  const [floorTexture, setFloorTexture] = useState<THREE.Texture | null>(null)
  const [ceilingTexture, setCeilingTexture] = useState<THREE.Texture | null>(null)

  // Función helper para obtener la textura según el tipo de elemento
  const getTextureForElement = (type: string): string | undefined => {
    const assignment = textureAssignments.find(a => a.elementType === type)
    const textureUrl = assignment?.material?.imagen_url
    
    
    return textureUrl
  }

  // Cargar texturas de piso y techo
  useEffect(() => {
    const floorUrl = getTextureForElement('floor')
    const ceilingUrl = getTextureForElement('ceiling')

    if (floorUrl) {
      const loader = new THREE.TextureLoader()
      loader.load(floorUrl, (texture) => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(4, 4)
        texture.needsUpdate = true
        setFloorTexture(texture)
  
      }, undefined, (error) => {
        console.error('❌ Error cargando textura de piso:', error)
      })
    } else {
      setFloorTexture(null)
    }

    if (ceilingUrl) {
      const loader = new THREE.TextureLoader()
      loader.load(ceilingUrl, (texture) => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(4, 4)
        texture.needsUpdate = true
        setCeilingTexture(texture)
   
      }, undefined, (error) => {
        console.error('❌ Error cargando textura de techo:', error)
      })
    } else {
      setCeilingTexture(null)
    }
  }, [textureAssignments])

  // Si tenemos datos del backend, renderizar esos objetos
  if (sceneData && sceneData.objects.length > 0) {
    const { scene, objects } = sceneData
    
    // 🎨 Obtener textura de pared para heredar en secciones de ventanas/puertas
    const wallTextureUrl = getTextureForElement('wall')
    
    return (
      <group>
        {/* Piso base con dimensiones del plano */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[scene.bounds.width / 2, 0, scene.bounds.height / 2]} 
          receiveShadow
        >
          <planeGeometry args={[scene.bounds.width * 1.2, scene.bounds.height * 1.2]} />
          {floorTexture ? (
            <meshStandardMaterial 
              map={floorTexture} 
              color="white"
              roughness={0.9} 
              metalness={0.1}
              side={THREE.DoubleSide}
              transparent={true}
            />
          ) : (
            <meshStandardMaterial 
              color="#048F0B" 
              roughness={0.9} 
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          )}
        </mesh>

        {/* Techo opcional */}
        {ceilingTexture && (
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[scene.bounds.width / 2, 3, scene.bounds.height / 2]}
          >
            <planeGeometry args={[scene.bounds.width * 1.2, scene.bounds.height * 1.2]} />
            <meshStandardMaterial 
              map={ceilingTexture} 
              color="white"
              roughness={0.8} 
              metalness={0.1}
              side={THREE.DoubleSide}
              transparent={false}
            />
          </mesh>
        )}

        {/* ✨ Renderizar objetos con herencia de textura de pared */}
        {objects.map((obj, index) => {
          const objectTextureUrl = getTextureForElement(obj.type as ElementType)
          const effectiveDimensions = getEffectiveDimensions(obj)
          const isSelected = selectedObjectId === obj.id
          
          return (
            <Object3D 
              key={`${obj.id}_${index}`} 
              obj={obj} 
              textureUrl={objectTextureUrl}
              wallTextureUrl={wallTextureUrl} // 🔑 Pasar textura de pared para heredar
              effectiveDimensions={effectiveDimensions}
              isSelected={isSelected}
              onSelect={onObjectSelect ? () => onObjectSelect(obj) : undefined}
            />
          )
        })}

        {/* 🎯 Renderizar puntos de intersección y esquinas */}
        {showIntersections && sceneData.intersections && sceneData.intersections.length > 0 && (
          <>
            {sceneData.intersections.map((point) => (
              <IntersectionMarker key={`intersection_${point.id}`} point={point} />
            ))}
          </>
        )}
      </group>
    )
  }

  // Fallback: Renderizar vista simple con la imagen si no hay datos del backend
  if (imageUrl) {
    const texture = new THREE.TextureLoader().load(imageUrl)

    return (
      <group>
        {/* Main floor plan surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <planeGeometry args={[8, 6]} />
          <meshStandardMaterial map={texture} roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Extruded walls - simulating 3D structure */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[8, 0.6, 6]} />
          <meshStandardMaterial color="#4D7C8A" transparent opacity={0.15} roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Border frame */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[8.2, 0.05, 6.2]} />
          <meshStandardMaterial color="#1B4079" />
        </mesh>

        {/* Corner accents */}
        {[
          [-4, 0.3, -3],
          [4, 0.3, -3],
          [-4, 0.3, 3],
          [4, 0.3, 3],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
            <meshStandardMaterial color="#CBDF90" />
          </mesh>
        ))}
      </group>
    )
  }

  return null
}

export function FloorPlan3DViewer({ imageUrl, sceneData, modelo3dId, planoId, showIntersections: initialShowIntersections = true }: FloorPlan3DViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false)
  const [isTexturePanelOpen, setIsTexturePanelOpen] = useState(false)
  const [textureAssignments, setTextureAssignments] = useState<TextureAssignment[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showIntersections, setShowIntersections] = useState(initialShowIntersections)
  const [selectedObject, setSelectedObject] = useState<ThreeJSObject | null>(null)
  const [isDimensionEditorOpen, setIsDimensionEditorOpen] = useState(false)

  // Hook para manejar dimensiones modificadas
  const dimensionEditor = useDimensionEditor(sceneData?.objects || [])

  // Función para cargar asignaciones existentes (memoizada para evitar re-renders)
  const loadExistingAssignments = useCallback(async () => {
    if (!modelo3dId) return
    
    try {
      console.log('📥 Cargando texturas guardadas para modelo3d_id:', modelo3dId)
      const response = await apiClient.getMaterialesModelo3D(modelo3dId)
      
      // El backend devuelve un SuccessResponse: {success, message, data: {materiales: [...], ...}}
      let materiales = []
      
      if (response?.data?.materiales) {
        // Estructura: {message, data: {materiales}}
        materiales = response.data.materiales
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor:', response)
        setTextureAssignments([])
        return
      }
      
      console.log('📦 Materiales cargados:', materiales)
      
      // 🔍 Mapear materiales a textureAssignments con detección inteligente de tipo
      const assignments: TextureAssignment[] = materiales
        .filter((ma: any) => ma && ma.material)
        .map((ma: any) => {
          // Detectar tipo basándose en el nombre del material (heurística)
          let elementType: ElementType = 'wall'
          const materialName = ma.material.nombre?.toLowerCase() || ''
          
          if (materialName.includes('piso') || materialName.includes('floor') || materialName.includes('tile') || materialName.includes('ceramic')) {
            elementType = 'floor'
          } else if (materialName.includes('techo') || materialName.includes('ceiling') || materialName.includes('plaster')) {
            elementType = 'ceiling'
          } else if (materialName.includes('ventana') || materialName.includes('window') || materialName.includes('glass') || materialName.includes('vidrio')) {
            elementType = 'window'
          } else if (materialName.includes('puerta') || materialName.includes('door') || materialName.includes('wood') || materialName.includes('madera')) {
            elementType = 'door'
          }

          return {
            elementType,
            elementId: undefined,
            material: ma.material
          }
        })
      
      console.log('✅ Asignaciones de texturas cargadas:', assignments)
      setTextureAssignments(assignments)
    } catch (error) {
      console.error('❌ Error cargando asignaciones de texturas:', error)
      setTextureAssignments([])
    }
  }, [modelo3dId])

  // Cargar asignaciones existentes si hay modelo3dId (solo una vez cuando cambia modelo3dId)
  useEffect(() => {
    if (modelo3dId) {
      loadExistingAssignments()
    }
  }, [modelo3dId, loadExistingAssignments])

  // Cargar dimensiones modificadas desde localStorage (independiente)
  useEffect(() => {
    if (modelo3dId) {
      dimensionEditor.loadFromLocalStorage(modelo3dId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo3dId]) // Solo dependemos de modelo3dId

  const handleApplyTexture = (elementType: ElementType, material: Material, elementId?: string) => {
    console.log('🎨 Aplicando textura:', { elementType, materialName: material.nombre, elementId })

    setTextureAssignments(prev => {
      const existing = prev.find(a => a.elementType === elementType && a.elementId === elementId)
      
      let newAssignments
      if (existing) {
        // Actualizar asignación existente
        newAssignments = prev.map(a => 
          a.elementType === elementType && a.elementId === elementId
            ? { ...a, material }
            : a
        )
        console.log('🔄 Actualizando asignación existente')
      } else {
        // Agregar nueva asignación
        newAssignments = [...prev, { elementType, elementId, material }]
        console.log('➕ Agregando nueva asignación')
      }

      console.log('📊 Nuevas asignaciones:', newAssignments)
      return newAssignments
    })

    setSaveMessage({ type: 'success', text: `✓ Textura aplicada a ${elementType}` })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleSaveTextures = async () => {
    if (!modelo3dId) {
      setSaveMessage({ type: 'error', text: 'No se puede guardar: falta el ID del modelo 3D' })
      return
    }

    setIsSaving(true)
    try {
      console.log('💾 Guardando texturas en el backend...')
      
      // Guardar cada asignación en el backend
      for (const assignment of textureAssignments) {
        if (assignment.material) {
          // Calcular cantidad basada en tipo de elemento
          const cantidad = assignment.elementType === 'floor' || assignment.elementType === 'ceiling' 
            ? 100.0 // m² para pisos y techos
            : 50.0  // m² para paredes, ventanas, puertas

          const data: MaterialModelo3DCreate = {
            modelo3d_id: modelo3dId,
            material_id: assignment.material.id,
            cantidad: cantidad,
            unidad_medida: assignment.material.unidad_medida,
            precio_unitario: assignment.material.precio_base
          }
          
          console.log('📤 Guardando:', data)
          await apiClient.assignMaterialToModelo3D(data)
        }
      }

      console.log('✅ Texturas guardadas exitosamente')
      setSaveMessage({ type: 'success', text: '✓ Texturas guardadas exitosamente' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('❌ Error guardando texturas:', error)
      setSaveMessage({ type: 'error', text: 'Error al guardar texturas' })
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Handlers para el editor de dimensiones
  const handleObjectSelect = (obj: ThreeJSObject) => {
    setSelectedObject(obj)
    setIsDimensionEditorOpen(true)
    console.log('🎯 Objeto seleccionado:', obj.id, obj.type)
  }

  const handleDimensionUpdate = (objectId: string | number, dimension: 'width' | 'height' | 'depth' | 'position', value: number, axis?: 'x' | 'y' | 'z') => {
    if (dimension === 'position' && axis) {
      dimensionEditor.updatePosition(objectId, axis, value)
    } else if (dimension !== 'position') {
      dimensionEditor.updateDimension(objectId, dimension, value)
    }
  }

  const handleDimensionReset = (objectId: string | number) => {
    dimensionEditor.resetObjectDimensions(objectId)
    // Actualizar dimensiones locales después del reset
    if (selectedObject && String(selectedObject.id) === String(objectId)) {
      const effective = dimensionEditor.getEffectiveDimensions(selectedObject)
      // Forzar actualización del panel
      setTimeout(() => {
        const updated = dimensionEditor.getEffectiveDimensions(selectedObject)
        console.log('🔄 Dimensiones reseteadas:', updated)
      }, 100)
    }
  }

  const handleDimensionSave = async () => {
    if (!planoId) {
      setSaveMessage({ type: 'error', text: 'No se puede guardar: falta el ID del plano' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    try {
      // Preparar objetos con dimensiones modificadas
      const objectsToUpdate = Object.entries(dimensionEditor.modifiedDimensions).map(([objectId, dimensions]) => {
        const update: any = { object_id: objectId }
        
        if (dimensions.width !== undefined) update.width = dimensions.width
        if (dimensions.height !== undefined) update.height = dimensions.height
        if (dimensions.depth !== undefined) update.depth = dimensions.depth
        if (dimensions.position) {
          update.position = {}
          if (dimensions.position.x !== undefined) update.position.x = dimensions.position.x
          if (dimensions.position.y !== undefined) update.position.y = dimensions.position.y
          if (dimensions.position.z !== undefined) update.position.z = dimensions.position.z
        }
        
        return update
      })

      if (objectsToUpdate.length === 0) {
        setSaveMessage({ type: 'error', text: 'No hay cambios para guardar' })
        setTimeout(() => setSaveMessage(null), 3000)
        return
      }

      // Guardar en el backend
      const response = await apiClient.updateModelo3DObjects(planoId, objectsToUpdate)
      
      // También guardar en localStorage como backup
      if (modelo3dId) {
        dimensionEditor.saveToLocalStorage(modelo3dId)
      }

      setSaveMessage({ type: 'success', text: `✓ ${response.message || 'Dimensiones guardadas exitosamente'}` })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      console.error('❌ Error guardando dimensiones:', error)
      setSaveMessage({ type: 'error', text: `Error al guardar: ${error.message || 'Error desconocido'}` })
      setTimeout(() => setSaveMessage(null), 5000)
    }
  }

  const handleCloseDimensionEditor = () => {
    setIsDimensionEditorOpen(false)
    // No limpiar selectedObject para mantener el resaltado
  }

  // Calcular posición de cámara según el tamaño de la escena o usar datos del JSON
  const getCameraPosition = (): [number, number, number] => {
    // Si hay datos de cámara en el JSON, usarlos
    if (sceneData?.camera?.position) {
      const cam = sceneData.camera.position
      return [cam.x, cam.y, cam.z]
    }
    
    // Fallback: calcular automáticamente
    if (sceneData?.scene) {
      const { width, height } = sceneData.scene.bounds
      const maxDimension = Math.max(width, height)
      const distance = maxDimension * 1.5
      return [distance, distance * 0.75, distance]
    }
    return [8, 6, 8]
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-background to-muted/20 relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={getCameraPosition()} fov={50} />
          <OrbitControls
            enableDamping
            dampingFactor={0.1}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            minDistance={5}
            maxDistance={sceneData ? 50 : 20}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.1}
            enablePan={true}
            enableZoom={true}
          />

          {/* Lighting - Optimizado para mejor rendimiento */}
          {/* Luz ambiental */}
          <ambientLight intensity={0.5} color="#FFF8E1" />
          
          {/* Luz principal del sol (direccional) - Única luz con sombras */}
          <directionalLight
            position={[15, 20, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
            shadow-bias={-0.0001}
            shadow-radius={2}
            color="#FFF8DC"
          />
          
          {/* Luz de relleno (sin sombras para mejor rendimiento) */}
          <directionalLight 
            position={[-10, 8, -8]} 
            intensity={0.4} 
            color="#E3F2FD"
          />
          
          {/* Luz hemisférica para ambiente natural */}
          <hemisphereLight 
            args={['#87CEEB', '#E8F5E9', 0.4]} 
          />

          {/* 3D Model */}
          <FloorPlan3DModel 
            imageUrl={imageUrl} 
            sceneData={sceneData} 
            textureAssignments={textureAssignments}
            showIntersections={showIntersections}
            getEffectiveDimensions={dimensionEditor.getEffectiveDimensions}
            selectedObjectId={selectedObject?.id}
            onObjectSelect={handleObjectSelect}
          />

          {/* Ground - Sombras de contacto optimizadas */}
          <ContactShadows 
            position={[sceneData ? sceneData.scene.bounds.width / 2 : 0, -0.01, sceneData ? sceneData.scene.bounds.height / 2 : 0]} 
            opacity={0.3} 
            scale={sceneData ? Math.max(sceneData.scene.bounds.width, sceneData.scene.bounds.height) * 1.5 : 15} 
            blur={2} 
            far={6}
            resolution={256}
            color="#000000"
          />

          <Grid
            position={[sceneData ? sceneData.scene.bounds.width / 2 : 0, -0.02, sceneData ? sceneData.scene.bounds.height / 2 : 0]}
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.3}
            cellColor="#7F9C96"
            sectionSize={2}
            sectionThickness={0.8}
            sectionColor="#4D7C8A"
            fadeDistance={30}
            fadeStrength={1}
            infiniteGrid
          />

          {/* Fog mejorado para profundidad y ambiente */}
          <fog attach="fog" args={["#E8F5E9", 25, 60]} />
        </Suspense>
      </Canvas>

      {/* Controls - Mejorados visualmente */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-4 py-2 backdrop-blur-sm border rounded-lg text-sm font-medium transition-all shadow-lg ${
            autoRotate 
              ? "bg-primary/90 text-primary-foreground border-primary hover:bg-primary" 
              : "bg-card/95 text-card-foreground border-border hover:bg-card/80"
          }`}
        >
          {autoRotate ? "⏸ Detener Rotación" : "▶ Auto Rotar"}
        </button>

        {sceneData?.intersections && sceneData.intersections.length > 0 && (
          <button
            onClick={() => setShowIntersections(!showIntersections)}
            className={`px-4 py-2 backdrop-blur-sm border rounded-lg text-sm font-medium transition-all shadow-lg ${
              showIntersections 
                ? "bg-primary/90 text-primary-foreground border-primary hover:bg-primary" 
                : "bg-card/95 text-card-foreground border-border hover:bg-card/80"
            }`}
          >
            {showIntersections ? "🔴 Ocultar Puntos" : "⚪ Mostrar Puntos"}
          </button>
        )}

        <Button
          onClick={() => setIsTexturePanelOpen(true)}
          className="shadow-lg"
          size="default"
        >
          <Paintbrush className="w-4 h-4 mr-2" />
          Aplicar Texturas
        </Button>

        {selectedObject && (
          <Button
            onClick={() => setIsDimensionEditorOpen(true)}
            className="shadow-lg"
            size="default"
            variant="outline"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Editar Dimensiones
          </Button>
        )}

        {modelo3dId && textureAssignments.length > 0 && (
          <Button
            onClick={handleSaveTextures}
            disabled={isSaving}
            variant="default"
            className="shadow-lg bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Texturas
              </>
            )}
          </Button>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${
          saveMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium flex items-center gap-2`}>
          {saveMessage.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {saveMessage.text}
        </div>
      )}

      {/* Info panel */}
      {sceneData && (
        <div className="absolute top-4 right-4 px-4 py-3 bg-card/95 backdrop-blur-sm border border-border rounded-lg text-sm text-card-foreground shadow-lg">
          <div className="space-y-1">
            <div className="font-semibold">Objetos Detectados:</div>
            <div className="text-xs space-y-0.5">
              <div>🧱 Paredes: {sceneData.objects.filter(o => o.type === 'wall').length}</div>
              <div>🪟 Ventanas: {sceneData.objects.filter(o => o.type === 'window').length}</div>
              <div>🚪 Puertas: {sceneData.objects.filter(o => o.type === 'door').length}</div>
            </div>
            {sceneData.intersections && sceneData.intersections.length > 0 && (
              <div className="border-t border-border pt-2 mt-2">
                <div className="font-semibold">Intersecciones/Esquinas:</div>
                <div className="text-xs flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#FF6B35]"></span>
                  <span>{sceneData.intersections.filter(i => i.type === 'intersection').length} intersecciones</span>
                </div>
                <div className="text-xs flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#4ECDC4]"></span>
                  <span>{sceneData.intersections.filter(i => i.type === 'corner').length} esquinas</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Total: {sceneData.intersections.length} puntos
                </div>
              </div>
            )}
            {textureAssignments.length > 0 && (
              <>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="font-semibold">Texturas Aplicadas:</div>
                  <div className="text-xs">{textureAssignments.filter(a => a.material).length} elementos</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Texture Panel */}
      <TexturePanel
        isOpen={isTexturePanelOpen}
        onClose={() => setIsTexturePanelOpen(false)}
        onApplyTexture={handleApplyTexture}
        currentAssignments={textureAssignments}
      />

      {/* Dimension Editor Panel */}
      {isDimensionEditorOpen && selectedObject && (
        <DimensionEditorPanel
          selectedObject={selectedObject}
          onClose={handleCloseDimensionEditor}
          onUpdate={handleDimensionUpdate}
          onReset={handleDimensionReset}
          onSave={handleDimensionSave}
          getEffectiveDimensions={dimensionEditor.getEffectiveDimensions}
          modelo3dId={modelo3dId}
        />
      )}
    </div>
  )
}

