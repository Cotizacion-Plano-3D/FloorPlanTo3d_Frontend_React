"use client"

import { Suspense, use, useEffect, useState } from "react"
import { ArrowLeft, Download, Share2, Maximize2, RotateCcw, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FloorPlan3DViewer } from "@/components/floor-plan-3d-viewer"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Plano, Modelo3DDataResponse } from "@/types/api"
import { toast } from "sonner"

export default function PlanoViewerPage({ params }: { params: Promise<{ planoId: string }> }) {
  const { planoId } = use(params)
  const { isAuthenticated, isLoading: authLoading, token } = useAuth()
  const [plano, setPlano] = useState<Plano | null>(null)
  const [modelo3dData, setModelo3dData] = useState<Modelo3DDataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sincronizar token con apiClient cuando cambie
  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      console.log('🔑 Token configurado en apiClient para viewer')
    }
  }, [token])

  useEffect(() => {
    // Esperar a que termine la carga de autenticación
    if (authLoading) return
    
    // Verificar autenticación antes de cargar datos
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para ver este plano')
      setLoading(false)
      return
    }

    loadPlanoData()
  }, [planoId, isAuthenticated, authLoading])

  const loadPlanoData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar datos del plano
      const planoData = await apiClient.getPlano(parseInt(planoId))
      setPlano(planoData)

      // Si el plano está completado, cargar datos del modelo 3D desde caché
      if (planoData.estado === 'completado') {
        try {
          console.log('🔄 Cargando modelo 3D desde caché...')
          const cachedData = await apiClient.render3DFromCache(parseInt(planoId))
          
          if (cachedData && cachedData.success) {
            console.log('✅ Modelo 3D cargado desde caché')
            setModelo3dData({ datos_json: cachedData.datos_json })
          } else {
            // Fallback al método antiguo si no hay caché
            console.log('⚠️ No hay datos en caché, usando método tradicional')
            const modeloData = await apiClient.getModelo3DData(parseInt(planoId))
            setModelo3dData(modeloData)
          }
        } catch (modeloError) {
          console.error('Error cargando modelo 3D:', modeloError)
          toast.error('Error al cargar el modelo 3D')
        }
      }
    } catch (err) {
      console.error('Error al cargar el plano:', err)
      setError('Error al cargar el plano')
      toast.error('Error al cargar el plano')
    } finally {
      setLoading(false)
    }
  }

  const handleConvertir = async () => {
    if (!plano) return

    try {
      await apiClient.convertirPlanoA3D(plano.id)
      toast.success('Conversión iniciada. El plano se procesará en segundo plano.')
      // Recargar datos después de un breve delay
      setTimeout(() => {
        loadPlanoData()
      }, 2000)
    } catch (error) {
      console.error('Error convirtiendo plano:', error)
      toast.error('Error al convertir el plano')
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando plano...</p>
        </div>
      </div>
    )
  }

  if (error || !plano) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-muted-foreground">{error || 'Plano no encontrado'}</p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href="/">Ir al Inicio</Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              )}
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/dashboard">Volver al Dashboard</Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Si el plano no está completado, mostrar estado
  if (plano.estado !== 'completado') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center space-y-4">
            {plano.estado === 'procesando' ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                <h2 className="text-2xl font-bold">Procesando</h2>
                <p className="text-muted-foreground">
                  El plano se está convirtiendo a 3D. Esto puede tomar unos minutos.
                </p>
                <Button onClick={loadPlanoData} variant="outline">
                  Actualizar Estado
                </Button>
              </>
            ) : plano.estado === 'error' ? (
              <>
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <h2 className="text-2xl font-bold">Error en Conversión</h2>
                <p className="text-muted-foreground">
                  Hubo un error al convertir el plano a 3D.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleConvertir}>
                    Reintentar Conversión
                  </Button>
                  <Button variant="outline" onClick={loadPlanoData}>
                    Actualizar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-bold">Plano Subido</h2>
                <p className="text-muted-foreground">
                  El plano ha sido subido pero aún no se ha convertido a 3D.
                </p>
                <Button onClick={handleConvertir}>
                  Convertir a 3D
                </Button>
              </>
            )}
            <Button asChild variant="outline">
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Si no hay datos del modelo 3D, mostrar error
  if (!modelo3dData) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-muted-foreground">
              No se pudieron cargar los datos del modelo 3D.
            </p>
            <Button onClick={loadPlanoData} variant="outline">
              Reintentar
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Volver al Dashboard</Link>
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
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Volver al Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground hidden sm:block">
              <span className="font-medium">{plano.nombre}</span>
              {plano.tipo_plano && (
                <span className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                  {plano.tipo_plano}
                </span>
              )}
            </div>
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
                <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Cargando visualización 3D...</p>
              </div>
            </div>
          }
        >
          <FloorPlan3DViewer 
            imageUrl={plano.url || ''} 
            sceneData={{
              scene: modelo3dData.datos_json.scene,
              objects: modelo3dData.datos_json.objects
            }}
            modelo3dId={plano.modelo3d?.id}
            planoId={plano.id}
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
            
            {plano.descripcion && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium text-card-foreground mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">{plano.descripcion}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
