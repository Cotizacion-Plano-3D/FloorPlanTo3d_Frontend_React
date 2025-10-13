"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei"
import { Suspense } from "react"
import * as THREE from "three"

interface FloorPlanPreviewProps {
  imageUrl: string
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

export function FloorPlanPreview({ imageUrl }: FloorPlanPreviewProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[3, 3, 3]} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <FloorPlanMesh imageUrl={imageUrl} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

