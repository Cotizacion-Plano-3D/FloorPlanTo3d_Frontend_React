"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Grid, ContactShadows } from "@react-three/drei"
import { Suspense, useState } from "react"
import * as THREE from "three"
import { ThreeJSObject, ThreeJSScene } from "@/lib/floorplan-api"

interface FloorPlan3DViewerProps {
  imageUrl?: string
  sceneData?: {
    scene: ThreeJSScene
    objects: ThreeJSObject[]
  }
}

// Componente para renderizar objetos 3D del backend
function Object3D({ obj }: { obj: ThreeJSObject }) {
  const getColor = (type: string) => {
    switch (type) {
      case 'wall':
        return '#8B4513' // Marrón para paredes
      case 'window':
        return '#87CEEB' // Azul cielo para ventanas
      case 'door':
        return '#DEB887' // Beige para puertas
      default:
        return '#CCCCCC'
    }
  }

  const getOpacity = (type: string) => {
    switch (type) {
      case 'wall':
        return 0.9
      case 'window':
        return 0.3
      case 'door':
        return 0.7
      default:
        return 0.5
    }
  }

  return (
    <mesh
      position={[obj.position.x, obj.position.y, obj.position.z]}
      rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[obj.dimensions.width, obj.dimensions.height, obj.dimensions.depth]} />
      <meshStandardMaterial
        color={getColor(obj.type)}
        transparent={obj.type !== 'wall'}
        opacity={getOpacity(obj.type)}
        roughness={0.7}
        metalness={0.2}
      />
    </mesh>
  )
}

// Modelo 3D generado desde los datos del backend
function FloorPlan3DModel({ 
  imageUrl, 
  sceneData 
}: { 
  imageUrl?: string
  sceneData?: { scene: ThreeJSScene; objects: ThreeJSObject[] }
}) {
  // Si tenemos datos del backend, renderizar esos objetos
  if (sceneData && sceneData.objects.length > 0) {
    const { scene, objects } = sceneData
    
    return (
      <group>
        {/* Piso base con dimensiones del plano */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[scene.bounds.width / 2, -0.01, scene.bounds.height / 2]} receiveShadow>
          <planeGeometry args={[scene.bounds.width * 1.2, scene.bounds.height * 1.2]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Renderizar todos los objetos detectados */}
        {objects.map((obj, index) => (
          <Object3D key={`${obj.id}_${index}`} obj={obj} />
        ))}
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

export function FloorPlan3DViewer({ imageUrl, sceneData }: FloorPlan3DViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false)

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
    <div className="w-full h-full bg-gradient-to-b from-background to-muted/20">
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

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />
          <pointLight position={[0, 8, 0]} intensity={0.6} color="#CBDF90" />

          {/* 3D Model */}
          <FloorPlan3DModel imageUrl={imageUrl} sceneData={sceneData} />

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

          {/* Environment */}
          <Environment preset="city" />

          {/* Fog for depth */}
          <fog attach="fog" args={["#f5f5f5", 20, 50]} />
        </Suspense>
      </Canvas>

      {/* Toggle auto-rotate button */}
      <button
        onClick={() => setAutoRotate(!autoRotate)}
        className="absolute top-4 left-4 px-4 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg text-sm font-medium text-card-foreground hover:bg-card transition-colors shadow-lg"
      >
        {autoRotate ? "Detener Rotación" : "Auto Rotar"}
      </button>

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
          </div>
        </div>
      )}
    </div>
  )
}

