"use client"

import { Suspense, use, useEffect, useState } from "react"
import { ArrowLeft, Download, Share2, Maximize2, RotateCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FloorPlan3DViewer } from "@/components/floor-plan-3d-viewer"
import { Card } from "@/components/ui/card"
import { floorPlanStorage, StoredFloorPlan } from "@/lib/floor-plan-storage"

export default function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [floorPlan, setFloorPlan] = useState<StoredFloorPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const plan = floorPlanStorage.getFloorPlan(id)
      if (!plan) {
        setError('Plano no encontrado')
      } else {
        setFloorPlan(plan)
      }
    } catch (err) {
      console.error('Error al cargar el plano:', err)
      setError('Error al cargar el plano')
    } finally {
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando visualización 3D...</p>
        </div>
      </div>
    )
  }

  if (error || !floorPlan) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-muted-foreground">{error || 'Plano no encontrado'}</p>
            <Button asChild>
              <Link href="/upload">Volver a Subir Planos</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm z-50 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/upload"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Volver a Galería</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" size="icon" className="sm:hidden bg-transparent">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Cargando visualización 3D...</p>
              </div>
            </div>
          }
        >
          <FloorPlan3DViewer 
            imageUrl={floorPlan.imageUrl} 
            sceneData={{
              scene: floorPlan.threejsData.scene,
              objects: floorPlan.threejsData.objects
            }}
          />
        </Suspense>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Card className="px-4 py-3 bg-card/95 backdrop-blur-sm border-border shadow-lg">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-xs">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetear Vista
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button variant="ghost" size="sm" className="text-xs">
                <Maximize2 className="w-4 h-4 mr-2" />
                Pantalla Completa
              </Button>
            </div>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="absolute top-6 right-6 z-10 hidden lg:block">
          <Card className="p-4 bg-card/95 backdrop-blur-sm border-border shadow-lg w-64">
            <h3 className="font-semibold text-card-foreground mb-3">Controles</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Click + Arrastrar</span>
                <span>Rotar vista</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Scroll</span>
                <span>Zoom in/out</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Click Derecho</span>
                <span>Mover cámara</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

