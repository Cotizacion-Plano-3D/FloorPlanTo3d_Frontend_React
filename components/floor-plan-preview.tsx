"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ThreeJSObject {
  id: string
  type: string
  position: { x: number; y: number; z: number }
  dimensions: { width: number; height: number; depth: number }
  rotation: { x: number; y: number; z: number }
}

interface FloorPlanPreviewProps {
  imageUrl: string
  planoId?: number
  modelo3dData?: {
    scene?: {
      bounds: { width: number; height: number }
    }
    objects?: ThreeJSObject[]
  }
}

// Componente para renderizar objetos 3D
function Object3D({ obj }: { obj: ThreeJSObject }) {
  const getColor = (type: string) => {
    switch (type) {
      case 'wall':
        return '#8B4513' // Marrón
      case 'window':
        return '#87CEEB' // Azul cielo
      case 'door':
        return '#DEB887' // Beige
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

function FloorPlanMesh({ imageUrl }: { imageUrl: string }) {
  const texture = new THREE.TextureLoader().load(imageUrl)

  return (
    <group>
      {/* Base floor plan */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Extruded walls effect */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#7F9C96" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export function FloorPlanPreview({ imageUrl, planoId, modelo3dData }: FloorPlanPreviewProps) {
  const router = useRouter()
  // Si hay datos del modelo 3D, usarlos
  const hasModel3D = modelo3dData?.objects && modelo3dData.objects.length > 0

  // Calcular centro del modelo para centrar la cámara
  const getCameraPosition = (): [number, number, number] => {
    if (hasModel3D && modelo3dData.scene?.bounds) {
      const { width, height } = modelo3dData.scene.bounds
      const maxDimension = Math.max(width, height)
      const distance = maxDimension * 1.5
      return [distance, distance * 0.8, distance]
    }
    return [8, 8, 8]
  }

  const getCenterPosition = (): [number, number, number] => {
    if (hasModel3D && modelo3dData.scene?.bounds) {
      const { width, height } = modelo3dData.scene.bounds
      return [width / 2, 0, height / 2]
    }
    return [0, 0, 0]
  }

  const centerPosition = getCenterPosition()

  return (
    <div className="w-full h-full relative">
      {planoId && (
        <div className="absolute top-2 right-2 z-10">
          {/* <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/quotation/${planoId}`)
            }}
          >
            <FileText className="w-3 h-3 mr-1" />
            Cotizar
          </Button> */}
        </div>
      )}
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={getCameraPosition()} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={3}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            target={centerPosition as [number, number, number]}
          />
          
          {/* Iluminación manual - sin Environment */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />
          <pointLight position={[0, 8, 0]} intensity={0.5} color="#ffffff" />
          
          {hasModel3D ? (
            <group position={[-centerPosition[0], -centerPosition[1], -centerPosition[2]]}>
              {/* Piso base */}
              <mesh 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[
                  modelo3dData.scene?.bounds.width ? modelo3dData.scene.bounds.width / 2 : 0,
                  -0.01,
                  modelo3dData.scene?.bounds.height ? modelo3dData.scene.bounds.height / 2 : 0
                ]}
              >
                <planeGeometry args={[
                  modelo3dData.scene?.bounds.width ? modelo3dData.scene.bounds.width * 1.2 : 10,
                  modelo3dData.scene?.bounds.height ? modelo3dData.scene.bounds.height * 1.2 : 10
                ]} />
                <meshStandardMaterial color="#f5f5f5" />
              </mesh>
              
              {/* Objetos detectados */}
              {modelo3dData.objects!.map((obj, index) => (
                <Object3D key={`${obj.id}_${index}`} obj={obj} />
              ))}
            </group>
          ) : (
            <FloorPlanMesh imageUrl={imageUrl} />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}

