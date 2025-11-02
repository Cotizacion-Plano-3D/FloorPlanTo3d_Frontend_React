"use client"

import { FloorPlan3DViewer } from "@/components/floor-plan-3d-viewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para pruebas
const EJEMPLO_SCENE_DATA = {
  scene: {
    name: "Test Scene",
    units: "meters",
    bounds: {
      width: 10,
      height: 12
    }
  },
  objects: [
    // Paredes exteriores
    {
      id: "wall_1",
      type: "wall" as const,
      position: { x: 0, y: 1.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 10, height: 3, depth: 0.2 }
    },
    {
      id: "wall_2",
      type: "wall" as const,
      position: { x: 10, y: 1.5, z: 6 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      dimensions: { width: 12, height: 3, depth: 0.2 }
    },
    {
      id: "wall_3",
      type: "wall" as const,
      position: { x: 5, y: 1.5, z: 12 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 10, height: 3, depth: 0.2 }
    },
    {
      id: "wall_4",
      type: "wall" as const,
      position: { x: 0, y: 1.5, z: 6 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      dimensions: { width: 12, height: 3, depth: 0.2 }
    },
    
    // Pared interna
    {
      id: "wall_5",
      type: "wall" as const,
      position: { x: 5, y: 1.5, z: 6 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      dimensions: { width: 6, height: 3, depth: 0.2 }
    },

    // Ventanas
    {
      id: "window_1",
      type: "window" as const,
      position: { x: 7, y: 1.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 2, height: 3, depth: 0.2 }
    },
    {
      id: "window_2",
      type: "window" as const,
      position: { x: 10, y: 1.5, z: 3 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      dimensions: { width: 2, height: 3, depth: 0.2 }
    },

    // Puertas
    {
      id: "door_1",
      type: "door" as const,
      position: { x: 2.5, y: 1.5, z: 6 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      dimensions: { width: 1, height: 3, depth: 0.2 }
    },
    {
      id: "door_2",
      type: "door" as const,
      position: { x: 2, y: 1.5, z: 12 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 1, height: 3, depth: 0.2 }
    }
  ]
}

const TEXTURAS_EJEMPLO = [
  {
    nombre: "Ladrillo Rojo",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/red_brick_02/red_brick_02_diff_2k.png",
    tipo: "wall"
  },
  {
    nombre: "Concreto",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/concrete_floor_02/concrete_floor_02_diff_2k.png",
    tipo: "wall"
  },
  {
    nombre: "Yeso Blanco",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/painted_plaster_01/painted_plaster_01_diff_2k.png",
    tipo: "wall"
  },
  {
    nombre: "Madera",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/wooden_planks_02/wooden_planks_02_diff_2k.png",
    tipo: "floor"
  },
  {
    nombre: "Cerámica",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/ceramic_tiles_03/ceramic_tiles_03_diff_2k.png",
    tipo: "floor"
  },
  {
    nombre: "Mármol",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/marble_01/marble_01_diff_2k.png",
    tipo: "floor"
  }
]

export default function TestRenderPage() {
  const [selectedTexture, setSelectedTexture] = useState<number>(0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Test Render 3D</h1>
                <p className="text-sm text-muted-foreground">Prueba el visualizador con datos de ejemplo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de información */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📊 Información</CardTitle>
                <CardDescription>Datos del modelo de prueba</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Dimensiones:</p>
                  <p className="text-sm text-muted-foreground">10m × 12m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Objetos:</p>
                  <p className="text-sm text-muted-foreground">
                    {EJEMPLO_SCENE_DATA.objects.length} elementos
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Composición:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>🧱 5 paredes</li>
                    <li>🪟 2 ventanas</li>
                    <li>🚪 2 puertas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 Texturas de Prueba</CardTitle>
                <CardDescription>Click para probar diferentes texturas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TEXTURAS_EJEMPLO.map((textura, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTexture(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTexture === index
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">{textura.nombre}</p>
                      <p className="text-xs text-muted-foreground capitalize">{textura.tipo}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🧪 Instrucciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Click en 🎨 "Aplicar Texturas"</p>
                <p>2. Selecciona un tipo de elemento</p>
                <p>3. Elige un material</p>
                <p>4. Click "Aplicar"</p>
                <p className="text-xs mt-3 text-foreground">
                  💡 Tip: Usa el mouse para rotar y zoom
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">ℹ️ Nota</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>Esta es una página de prueba con datos estáticos.</p>
                <p className="mt-2">Los cambios aquí NO se guardan en la base de datos.</p>
              </CardContent>
            </Card>
          </div>

          {/* Viewer 3D */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-180px)]">
              <CardContent className="p-0 h-full">
                <FloorPlan3DViewer
                  sceneData={EJEMPLO_SCENE_DATA}
                  // Sin modelo3dId para que no intente guardar/cargar de BD
                />
              </CardContent>
            </Card>

            {/* Información de la textura seleccionada */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Textura Seleccionada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img
                    src={TEXTURAS_EJEMPLO[selectedTexture].url}
                    alt={TEXTURAS_EJEMPLO[selectedTexture].nombre}
                    className="w-20 h-20 object-cover rounded border border-border"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.jpg'
                    }}
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {TEXTURAS_EJEMPLO[selectedTexture].nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {TEXTURAS_EJEMPLO[selectedTexture].tipo}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      {TEXTURAS_EJEMPLO[selectedTexture].url.substring(0, 60)}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
