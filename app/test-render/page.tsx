'use client'

import { useState } from 'react'
import {FloorPlan3DViewer} from '@/components/floor-plan-3d-viewer'
import { Button } from '@/components/ui/button'
import testRenderData from '@/test-render.json'

export default function TestRenderPage() {
  const [showViewer, setShowViewer] = useState(true)
  const [cameraMode, setCameraMode] = useState<'default' | 'custom'>('default')

  // Transformar los datos del test al formato que espera el viewer
  // El formato esperado es: { scene: ThreeJSScene, objects: ThreeJSObject[] }
  const sceneData = {
    scene: {
      name: testRenderData.datos_json.scene.name,
      units: testRenderData.datos_json.scene.units,
      bounds: {
        width: testRenderData.datos_json.scene.bounds.width,
        height: testRenderData.datos_json.scene.bounds.height
      }
    },
    objects: testRenderData.datos_json.objects as Array<{
      id: string
      type: 'wall' | 'window' | 'door'
      position: { x: number; y: number; z: number }
      dimensions: { width: number; height: number; depth: number }
      rotation: { x: number; y: number; z: number }
    }>
  }

  const medidas = testRenderData.datos_json.medidas_extraidas

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">
            Three.js Renderer Test
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prueba aislada con datos de test-render.json
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-6">
            {/* Controles */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-lg font-semibold mb-4">Controles</h2>
              <div className="space-y-4">
                <Button
                  variant={showViewer ? "default" : "outline"}
                  onClick={() => setShowViewer(!showViewer)}
                  className="w-full"
                >
                  {showViewer ? 'Ocultar' : 'Mostrar'} Viewer
                </Button>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Modo Cámara</label>
                  <div className="flex gap-2">
                    <Button
                      variant={cameraMode === 'default' ? 'default' : 'outline'}
                      onClick={() => setCameraMode('default')}
                      size="sm"
                      className="flex-1"
                    >
                      Default
                    </Button>
                    <Button
                      variant={cameraMode === 'custom' ? 'default' : 'outline'}
                      onClick={() => setCameraMode('custom')}
                      size="sm"
                      className="flex-1"
                    >
                      Custom
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cameraMode === 'default' 
                      ? 'Cámara con controles OrbitControls libres'
                      : 'Cámara según posición del JSON'}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  🔄 Recargar
                </Button>
              </div>
            </div>

            {/* Info del Plano */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-lg font-semibold mb-4">📊 Información</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Área Total</dt>
                  <dd className="font-semibold text-primary">
                    {medidas.area_total_m2.toFixed(2)} m²
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Área Paredes</dt>
                  <dd className="font-semibold">
                    {medidas.area_paredes_m2.toFixed(2)} m²
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Área Ventanas</dt>
                  <dd className="font-semibold">
                    {medidas.area_ventanas_m2.toFixed(2)} m²
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Perímetro</dt>
                  <dd className="font-semibold">
                    {medidas.perimetro_total_m.toFixed(2)} m
                  </dd>
                </div>
                <div className="pt-2 border-t border-border">
                  <dt className="text-muted-foreground">Paredes</dt>
                  <dd className="font-semibold">{medidas.num_paredes}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ventanas</dt>
                  <dd className="font-semibold">{medidas.num_ventanas}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Puertas</dt>
                  <dd className="font-semibold">{medidas.num_puertas}</dd>
                </div>
                <div className="pt-2 border-t border-border">
                  <dt className="text-muted-foreground">Escala Calculada</dt>
                  <dd className="font-mono text-xs">
                    {medidas.escala_calculada.toFixed(4)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Dimensiones */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-lg font-semibold mb-4">📏 Dimensiones</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Ancho:</dt>
                  <dd className="font-medium">
                    {testRenderData.datos_json.scene.bounds.width.toFixed(2)} m
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Alto:</dt>
                  <dd className="font-medium">
                    {testRenderData.datos_json.scene.bounds.height.toFixed(2)} m
                  </dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <dt className="text-muted-foreground">Unidades:</dt>
                  <dd className="font-medium uppercase">
                    {testRenderData.datos_json.scene.units}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Objetos */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-lg font-semibold mb-4">🧱 Objetos Cargados</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#e5e5e5] border border-border rounded shadow-sm" />
                  <span>Paredes ({medidas.num_paredes})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#87ceeb] border border-border rounded shadow-sm opacity-60" />
                  <span>Ventanas ({medidas.num_ventanas})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#8b4513] border border-border rounded shadow-sm" />
                  <span>Puertas ({medidas.num_puertas})</span>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-6 h-6 bg-[#f5f5f5] border border-border rounded shadow-sm" />
                  <span>Piso (1)</span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-lg font-semibold mb-4">📈 Estadísticas</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total Objetos:</dt>
                  <dd className="font-semibold">
                    {testRenderData.datos_json.objects.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Objetos 3D:</dt>
                  <dd className="font-semibold">
                    {sceneData.objects.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Luces:</dt>
                  <dd className="font-semibold">3</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <div className="border-b border-border px-6 py-4 bg-muted/30">
                <h2 className="text-lg font-semibold">
                  🎨 Vista 3D - Modo {cameraMode === 'default' ? 'Predeterminado' : 'Personalizado'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  🖱️ Mouse: Click izquierdo (rotar) · Rueda (zoom) · Click derecho (desplazar)
                </p>
              </div>
              <div className="relative" style={{ height: '600px' }}>
                {showViewer ? (
                  <FloorPlan3DViewer
                    imageUrl="" // No usamos imagen en el test
                    sceneData={sceneData}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                    <div className="text-6xl">👁️</div>
                    <p>Viewer oculto</p>
                    <p className="text-sm">Click en "Mostrar Viewer" para activar</p>
                  </div>
                )}
              </div>
            </div>

            {/* JSON Preview */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <div className="border-b border-border px-6 py-4 bg-muted/30">
                <h2 className="text-lg font-semibold">
                  📄 Preview del JSON Transformado
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Estructura de datos que recibe el componente FloorPlan3DViewer
                </p>
              </div>
              <div className="p-6 max-h-[500px] overflow-y-auto">
                <pre className="text-xs overflow-x-auto bg-muted p-4 rounded font-mono">
                  {JSON.stringify(sceneData, null, 2)}
                </pre>
              </div>
            </div>

            {/* JSON Original */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <div className="border-b border-border px-6 py-4 bg-muted/30">
                <h2 className="text-lg font-semibold">
                  📋 JSON Original (test-render.json)
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Datos originales del backend antes de transformación
                </p>
              </div>
              <div className="p-6 max-h-[500px] overflow-y-auto">
                <pre className="text-xs overflow-x-auto bg-muted p-4 rounded font-mono">
                  {JSON.stringify(testRenderData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
