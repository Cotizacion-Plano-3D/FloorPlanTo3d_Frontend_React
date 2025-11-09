"use client"

import { FloorPlan3DViewer } from "@/components/floor-plan-3d-viewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useMemo } from "react"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import datosReales from "./datos.json"
import datos2 from "./datos2.json"
import { ThreeJSObject, ThreeJSScene } from "@/lib/floorplan-api"

// Función de validación de datos
function validateSceneData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.scene) {
    errors.push("Falta el objeto 'scene'")
  } else {
    if (!data.scene.bounds) errors.push("Falta 'scene.bounds'")
    if (typeof data.scene.bounds?.width !== 'number') errors.push("'scene.bounds.width' debe ser un número")
    if (typeof data.scene.bounds?.height !== 'number') errors.push("'scene.bounds.height' debe ser un número")
  }
  
  if (!Array.isArray(data.objects)) {
    errors.push("'objects' debe ser un array")
  } else {
    data.objects?.forEach((obj: any, index: number) => {
      if (!obj.id) errors.push(`Objeto ${index}: falta 'id'`)
      if (!['wall', 'window', 'door'].includes(obj.type)) {
        errors.push(`Objeto ${index}: tipo inválido '${obj.type}'`)
      }
      if (!obj.position || typeof obj.position.x !== 'number') {
        errors.push(`Objeto ${index}: posición inválida`)
      }
      if (!obj.dimensions || typeof obj.dimensions.width !== 'number') {
        errors.push(`Objeto ${index}: dimensiones inválidas`)
      }
    })
  }
  
  return { valid: errors.length === 0, errors }
}

// Función para procesar datos del JSON
function processSceneData(data: any): { 
  scene: ThreeJSScene
  objects: ThreeJSObject[]
  intersections?: Array<{ id: number; x: number; y: number; z: number; type: 'intersection' | 'corner' }>
  camera?: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } }
} | null {
  const validation = validateSceneData(data)
  
  if (!validation.valid) {
    console.error("❌ Errores de validación:", validation.errors)
    return null
  }
  
  return {
    scene: data.scene as ThreeJSScene,
    objects: data.objects.map((obj: any) => ({
      id: String(obj.id),
      type: obj.type as "wall" | "window" | "door",
      position: {
        x: Number(obj.position.x) || 0,
        y: Number(obj.position.y) || 0,
        z: Number(obj.position.z) || 0
      },
      dimensions: {
        width: Number(obj.dimensions.width) || 0,
        height: Number(obj.dimensions.height) || 0,
        depth: Number(obj.dimensions.depth) || 0
      },
      rotation: {
        x: Number(obj.rotation?.x) || 0,
        y: Number(obj.rotation?.y) || 0,
        z: Number(obj.rotation?.z) || 0
      }
    })) as ThreeJSObject[],
    // Incluir intersecciones si están disponibles
    intersections: data.intersections ? data.intersections.map((point: any) => ({
      id: Number(point.id) || 0,
      x: Number(point.x) || 0,
      y: Number(point.y) || 0,
      z: Number(point.z) || 0,
      type: (point.type === 'intersection' || point.type === 'corner') ? point.type : 'corner' as 'intersection' | 'corner'
    })) : undefined,
    // Incluir datos de cámara si están disponibles
    camera: data.camera ? {
      position: {
        x: Number(data.camera.position?.x) || 0,
        y: Number(data.camera.position?.y) || 0,
        z: Number(data.camera.position?.z) || 0
      },
      target: {
        x: Number(data.camera.target?.x) || 0,
        y: Number(data.camera.target?.y) || 0,
        z: Number(data.camera.target?.z) || 0
      }
    } : undefined
  }
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
  const [selectedDataset, setSelectedDataset] = useState<"datos" | "datos2">("datos")
  
  // Seleccionar el dataset actual
  const currentData = useMemo(() => {
    return selectedDataset === "datos" ? datosReales : datos2
  }, [selectedDataset])
  
  // Procesar y validar datos con memoización
  const REAL_SCENE_DATA = useMemo(() => processSceneData(currentData), [currentData])
  const validation = useMemo(() => validateSceneData(currentData), [currentData])
  
  // Estadísticas calculadas
  const stats = useMemo(() => {
    if (!REAL_SCENE_DATA) return null
    
    const walls = REAL_SCENE_DATA.objects.filter(o => o.type === 'wall').length
    const windows = REAL_SCENE_DATA.objects.filter(o => o.type === 'window').length
    const doors = REAL_SCENE_DATA.objects.filter(o => o.type === 'door').length
    
    return { walls, windows, doors, total: REAL_SCENE_DATA.objects.length }
  }, [REAL_SCENE_DATA])

  // Si hay errores de validación, mostrar mensaje
  if (!validation.valid || !REAL_SCENE_DATA) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error de Validación de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Los datos del JSON no son válidos. Por favor, verifica el archivo.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Errores encontrados:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
            <Link href="/" className="mt-4 inline-block">
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <p className="text-sm text-muted-foreground">
                  Visualizador con datos reales procesados desde example1.png
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">Dataset:</label>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value as "datos" | "datos2")}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="datos">Datos Complejos (example1.png)</option>
                  <option value="datos2">Habitación Simple (4 paredes + 1 puerta)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de información */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Información del Modelo
                </CardTitle>
                <CardDescription>Datos reales procesados por Mask R-CNN</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Dimensiones:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentData.scene.bounds.width.toFixed(2)}m × {currentData.scene.bounds.height.toFixed(2)}m
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Objetos:</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.total || REAL_SCENE_DATA.objects.length} elementos
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Composición:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>🧱 {stats?.walls || currentData.medidas_extraidas.num_paredes} paredes</li>
                    <li>🪟 {stats?.windows || currentData.medidas_extraidas.num_ventanas} ventanas</li>
                    <li>🚪 {stats?.doors || currentData.medidas_extraidas.num_puertas} puertas</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2">📐 Medidas Calculadas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-muted-foreground">Área Total</p>
                      <p className="font-semibold text-foreground">{currentData.medidas_extraidas.area_total_m2} m²</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-muted-foreground">Perímetro</p>
                      <p className="font-semibold text-foreground">{currentData.medidas_extraidas.perimetro_total_m} m</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-muted-foreground">Área Paredes</p>
                      <p className="font-semibold text-foreground">{currentData.medidas_extraidas.area_paredes_m2} m²</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-muted-foreground">Área Ventanas</p>
                      <p className="font-semibold text-foreground">{currentData.medidas_extraidas.area_ventanas_m2} m²</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-foreground mb-2">🎯 Calidad de Detección:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Confianza promedio:</span>
                      <span className="text-xs font-semibold text-green-600">
                        {(currentData.test_metadata.detection_stats.avg_confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Escala:</span>
                      <span className={`text-xs font-semibold ${
                        currentData.medidas_extraidas.confianza_escala === "alta" 
                          ? "text-green-600" 
                          : "text-yellow-600"
                      }`}>
                        {currentData.medidas_extraidas.confianza_escala === "alta" ? "✅ Alta" : "⚠️ Estimada"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Detecciones:</span>
                      <span className="text-xs font-semibold text-foreground">
                        {currentData.test_metadata.detection_stats.total_detections}
                      </span>
                    </div>
                  </div>
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
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Estado de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>Datos validados correctamente</span>
                </div>
                <p className="pt-2 border-t border-border">
                  {selectedDataset === "datos" 
                    ? "Datos reales procesados desde example1.png"
                    : "Habitación simple: 4 paredes + 1 puerta"}
                </p>
                <p>
                  Procesado: {new Date(currentData.test_metadata.test_timestamp).toLocaleString()}
                </p>
                <p className="pt-2 border-t border-border text-foreground">
                  ⚠️ Los cambios aquí NO se guardan en la base de datos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Viewer 3D */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-180px)]">
              <CardContent className="p-0 h-full">
                <FloorPlan3DViewer
                  sceneData={REAL_SCENE_DATA}
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
