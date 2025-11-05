"use client"

import { Canvas, useLoader } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Grid, ContactShadows, useTexture } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import * as THREE from "three"
import { ThreeJSObject, ThreeJSScene } from "@/lib/floorplan-api"
import { TexturePanel, ElementType, TextureAssignment } from "@/components/texture-panel"
import { Material, MaterialModelo3DCreate } from "@/types/api"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Paintbrush, Save, AlertCircle } from "lucide-react"

interface FloorPlan3DViewerProps {
  imageUrl?: string
  sceneData?: {
    scene: ThreeJSScene
    objects: ThreeJSObject[]
  }
  modelo3dId?: number
  planoId?: number
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
function Object3D({ obj, textureUrl, wallTextureUrl }: { obj: ThreeJSObject; textureUrl?: string; wallTextureUrl?: string }) {
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
        return 'red' // Gris muy claro (más visible que blanco puro)
      case 'window':
        return '#87CEEB' // Azul cielo para ventanas
      case 'door':
        return '#DEB887' // Beige para puertas
      default:
        return  'white' //'#CCCCCC'
    }
  }

  const getOpacity = (type: string) => {
    switch (type) {
      case 'wall':
        return 0.9
      case 'window':
        return 0.3
      case 'door':
        return 1.0
      default:
        return 0.5
    }
  }

  // 🔧 Helper para crear materiales con soporte para textura de pared y de objeto
  const createMaterial = (materialType: 'object' | 'wall') => {
    // Si es 'wall', usar wallTexture; si es 'object', usar texture
    const targetTexture = materialType === 'wall' ? wallTexture : texture
    const targetIsLoading = materialType === 'wall' ? wallIsLoading : isLoading
    const hasTexture = targetTexture && !targetIsLoading
    
    // Si hay textura cargada, aplicarla
    if (hasTexture) {
      return (
        <meshStandardMaterial
          key={targetTexture.uuid} // Key única para forzar re-render cuando cambie la textura
          map={targetTexture}
          color="white" // Color base blanco para que la textura se vea correcta
          roughness={0.7}
          metalness={0.0} // Sin metalness para texturas normales
          side={THREE.DoubleSide} // Ambas caras para que se vea desde cualquier ángulo
          toneMapped={true}
        />
      )
    }
    
    // Fallback a color sólido
    return (
      <meshStandardMaterial
        color={getColor(obj.type)}
        transparent={obj.type === 'window'}
        opacity={getOpacity(obj.type)}
        roughness={0.7}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    )
  }

  // Renderizado especial para ventanas
  if (obj.type === 'window') {
    const wallHeight = obj.dimensions.height
    const bottomWallHeight = wallHeight * 0.70
    const windowHeight = wallHeight * 0.80
    const topWallHeight = wallHeight * 0.50
    
    const baseY = obj.position.y - (wallHeight / 2)
    const bottomWallY = baseY + (bottomWallHeight / 2)
    const windowY = baseY + bottomWallHeight + (windowHeight / 2)
    const topWallY = baseY + bottomWallHeight + windowHeight + (topWallHeight / 2)

    return (
      <group 
        key={`${obj.id}_${texture?.uuid || 'no-tex'}_${wallTexture?.uuid || 'no-wall'}`} 
        position={[obj.position.x, 0, obj.position.z]} 
        rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
      >
        {/* ✅ Pared inferior - USA TEXTURA DE PARED */}
        <mesh position={[0, bottomWallY, 0]} castShadow receiveShadow>
          <boxGeometry args={[obj.dimensions.width, bottomWallHeight, obj.dimensions.depth]} />
          {createMaterial('wall')}
        </mesh>

        {/* 🪟 Ventana transparente - USA TEXTURA DE VENTANA */}
        <mesh position={[0, windowY, 0]} castShadow receiveShadow>
          <boxGeometry args={[obj.dimensions.width, windowHeight, obj.dimensions.depth]} />
          {createMaterial('object')}
        </mesh>

        {/* ✅ Pared superior - USA TEXTURA DE PARED */}
        <mesh position={[0, topWallY, 0]} castShadow receiveShadow>
          <boxGeometry args={[obj.dimensions.width, topWallHeight, obj.dimensions.depth]} />
          {createMaterial('wall')}
        </mesh>
      </group>
    )
  }

  // Renderizado especial para puertas
  if (obj.type === 'door') {
    const wallHeight = obj.dimensions.height
    const doorHeight = wallHeight * 0.9
    const topWallHeight = 1.1

    const baseY = obj.position.y - (wallHeight / 2)
    const doorY = baseY + (doorHeight / 2)
    const topWallY = baseY + doorHeight + (topWallHeight / 2)

    return (
      <group 
        key={`${obj.id}_${texture?.uuid || 'no-tex'}_${wallTexture?.uuid || 'no-wall'}`} 
        position={[obj.position.x, 0, obj.position.z]} 
        rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
      >
        {/* 🚪 Puerta - USA TEXTURA DE PUERTA */}
        <mesh position={[0, doorY, 0]} castShadow receiveShadow>
          <boxGeometry args={[obj.dimensions.width, doorHeight, obj.dimensions.depth]} />
          {createMaterial('object')}
        </mesh>

        {/* ✅ Dintel superior - USA TEXTURA DE PARED */}
        {topWallHeight > 0 && (
          <mesh position={[0, topWallY, 0]} castShadow receiveShadow>
            <boxGeometry args={[obj.dimensions.width, topWallHeight, obj.dimensions.depth]} />
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
      position={[obj.position.x, obj.position.y, obj.position.z]}
      rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[obj.dimensions.width, obj.dimensions.height, obj.dimensions.depth]} />
      {createMaterial('object')}
    </mesh>
  )
}

// Modelo 3D generado desde los datos del backend
function FloorPlan3DModel({ 
  imageUrl, 
  sceneData,
  textureAssignments
}: { 
  imageUrl?: string
  sceneData?: { scene: ThreeJSScene; objects: ThreeJSObject[] }
  textureAssignments: TextureAssignment[]
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[scene.bounds.width / 2, -0.01, scene.bounds.height / 2]} receiveShadow>
          <planeGeometry args={[scene.bounds.width * 1.2, scene.bounds.height * 1.2]} />
          {floorTexture ? (
            <meshStandardMaterial 
              map={floorTexture} 
              roughness={0.9} 
              metalness={0.1}
              side={THREE.DoubleSide}
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
              roughness={0.8} 
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* ✨ Renderizar objetos con herencia de textura de pared */}
        {objects.map((obj, index) => {
          const objectTextureUrl = getTextureForElement(obj.type as ElementType)
          
          return (
            <Object3D 
              key={`${obj.id}_${index}`} 
              obj={obj} 
              textureUrl={objectTextureUrl}
              wallTextureUrl={wallTextureUrl} // 🔑 Pasar textura de pared para heredar
            />
          )
        })}
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

export function FloorPlan3DViewer({ imageUrl, sceneData, modelo3dId, planoId }: FloorPlan3DViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false)
  const [isTexturePanelOpen, setIsTexturePanelOpen] = useState(false)
  const [textureAssignments, setTextureAssignments] = useState<TextureAssignment[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Cargar asignaciones existentes si hay modelo3dId
  useEffect(() => {
    if (modelo3dId) {
      loadExistingAssignments()
    }
  }, [modelo3dId])

  const loadExistingAssignments = async () => {
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
  }

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

  // Calcular posición de cámara según el tamaño de la escena
  const getCameraPosition = (): [number, number, number] => {
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
            dampingFactor={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            minDistance={5}
            maxDistance={sceneData ? 50 : 20}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.1}
          />

          {/* Lighting - Aumentado para mejor visibilidad de texturas */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.6} />
          <pointLight position={[0, 8, 0]} intensity={0.8} color="#CBDF90" />
          <hemisphereLight args={['blue', '#444444', 0.4]} />

          {/* 3D Model */}
          <FloorPlan3DModel 
            imageUrl={imageUrl} 
            sceneData={sceneData} 
            textureAssignments={textureAssignments}
          />

          {/* Ground */}
          <ContactShadows 
            position={[sceneData ? sceneData.scene.bounds.width / 2 : 0, -0.02, sceneData ? sceneData.scene.bounds.height / 2 : 0]} 
            opacity={0.3} 
            scale={sceneData ? Math.max(sceneData.scene.bounds.width, sceneData.scene.bounds.height) * 1.5 : 15} 
            blur={2.5} 
            far={4} 
          />

          <Grid
            position={[sceneData ? sceneData.scene.bounds.width / 2 : 0, -0.02, sceneData ? sceneData.scene.bounds.height / 2 : 0]}
            args={[30, 30]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#7F9C96"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#4D7C8A"
            fadeDistance={40}
            fadeStrength={1}
            infiniteGrid
          />

          {/* Fog for depth */}
          <fog attach="fog" args={["#f5f5f5", 20, 50]} />
        </Suspense>
      </Canvas>

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="px-4 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg text-sm font-medium text-card-foreground hover:bg-card transition-colors shadow-lg"
        >
          {autoRotate ? "Detener Rotación" : "Auto Rotar"}
        </button>

        <Button
          onClick={() => setIsTexturePanelOpen(true)}
          className="shadow-lg"
          size="default"
        >
          <Paintbrush className="w-4 h-4 mr-2" />
          Aplicar Texturas
        </Button>

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
    </div>
  )
}

