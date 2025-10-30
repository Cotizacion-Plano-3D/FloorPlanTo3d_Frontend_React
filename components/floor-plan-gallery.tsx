"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Download, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { FloorPlanPreview } from "@/components/floor-plan-preview"
import Image from "next/image"
import { Plano } from "@/types/api"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface FloorPlanGalleryProps {
  plans: Plano[]
  onPlanoDeleted?: (planoId: number) => void
}

export function FloorPlanGallery({ plans, onPlanoDeleted }: FloorPlanGalleryProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [modelo3dCache, setModelo3dCache] = useState<Map<number, any>>(new Map())
  const [loadingModels, setLoadingModels] = useState<Set<number>>(new Set())
  const [active3DPreview, setActive3DPreview] = useState<number | null>(null) // ✅ NUEVO: Solo un Canvas activo
  const { toast } = useToast()

  const handleImageError = (planId: number) => {
    setImageErrors(prev => new Set([...prev, planId]))
  }

  const loadModelo3D = async (planId: number) => {
    // Si ya está en caché, no cargar de nuevo
    if (modelo3dCache.has(planId) || loadingModels.has(planId)) {
      return
    }

    try {
      setLoadingModels(prev => new Set([...prev, planId]))
      
      const result = await apiClient.render3DFromCache(planId)
      
      if (result && result.success && result.datos_json) {
        setModelo3dCache(prev => new Map(prev).set(planId, result.datos_json))
      }
    } catch (error) {
      console.error('Error cargando modelo 3D:', error)
      // No mostrar error al usuario, solo no mostrar el preview 3D
    } finally {
      setLoadingModels(prev => {
        const newSet = new Set(prev)
        newSet.delete(planId)
        return newSet
      })
    }
  }

  const handleMouseEnter = (planId: number, estado: string) => {
    setHoveredId(planId)
    // Cargar modelo 3D si el plano está completado
    if (estado === 'completado') {
      loadModelo3D(planId)
      // ✅ NUEVO: Activar preview 3D solo para este plano
      setActive3DPreview(planId)
    }
  }

  const handleMouseLeave = () => {
    setHoveredId(null)
    // ✅ NUEVO: Desactivar preview 3D al salir
    setActive3DPreview(null)
  }

  const handleDownload = async (plan: Plano) => {
    try {
      if (!plan.url) {
        toast({
          title: "Error",
          description: "No se puede descargar el plano: no tiene URL disponible",
          variant: "destructive"
        })
        return
      }

      // Usar fetch con autenticación para descargar
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/planos/${plan.id}/download`
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Obtener el blob del archivo
      const blob = await response.blob()
      
      // Crear URL temporal para el blob
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Crear enlace temporal para descargar
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${plan.nombre}.${plan.formato || 'jpg'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar la URL temporal
      window.URL.revokeObjectURL(blobUrl)

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${plan.nombre}...`
      })
    } catch (error) {
      console.error('Error descargando plano:', error)
      toast({
        title: "Error",
        description: "No se pudo descargar el plano",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (plan: Plano) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el plano "${plan.nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setDeletingIds(prev => new Set([...prev, plan.id]))
      
      await apiClient.deletePlano(plan.id)
      
      toast({
        title: "Plano eliminado",
        description: `El plano "${plan.nombre}" ha sido eliminado exitosamente`
      })

      // Notificar al componente padre para actualizar la lista
      if (onPlanoDeleted) {
        onPlanoDeleted(plan.id)
      }
    } catch (error) {
      console.error('Error eliminando plano:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el plano. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(plan.id)
        return newSet
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className="group overflow-hidden bg-card border-border hover:shadow-xl transition-all duration-300"
          onMouseEnter={() => handleMouseEnter(plan.id, plan.estado)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {plan.url && !imageErrors.has(plan.id) ? (
              // ✅ OPTIMIZADO: Solo renderizar Canvas si es el preview activo
              hoveredId === plan.id && active3DPreview === plan.id ? (
                <FloorPlanPreview 
                  imageUrl={`${process.env.NEXT_PUBLIC_API_URL}/planos/${plan.id}/image`}
                  modelo3dData={modelo3dCache.get(plan.id)}
                />
              ) : (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/planos/${plan.id}/image`}
                  alt={plan.nombre} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('❌ Error cargando imagen para plano', plan.id)
                    console.error('URL original:', plan.url)
                    console.error('URL proxy:', `${process.env.NEXT_PUBLIC_API_URL}/planos/${plan.id}/image`)
                    console.error('Event:', e)
                    
                    // Verificar si la URL es temporal o inválida
                    if (plan.url?.includes('TEMP_') || !plan.url) {
                      console.warn(`⚠️ URL temporal o inválida para plano ${plan.id}`)
                    }
                    
                    handleImageError(plan.id)
                  }}
                  onLoad={() => {
                    console.log('✅ Imagen cargada exitosamente para plano', plan.id)
                  }}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {plan.url?.includes('TEMP_') ? 'URL temporal inválida' : 
                     plan.url ? 'Error cargando imagen' : 'Sin imagen'}
                  </p>
                  {plan.url?.includes('TEMP_') && (
                    <p className="text-xs text-gray-400 mt-1">
                      Re-subir el archivo puede solucionarlo
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick Actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {plan.estado === 'completado' ? (
                <Link href={`/viewer/plano/${plan.id}`}>
                  <Button 
                    size="sm" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver en 3D
                  </Button>
                </Link>
              ) : plan.estado === 'subido' ? (
                <Button 
                  size="sm" 
                  onClick={() => {
                    // Redirigir a convertir
                    if (window.confirm('¿Deseas convertir este plano a 3D?')) {
                      apiClient.convertirPlanoA3D(plan.id).then(() => {
                        toast({
                          title: "Conversión iniciada",
                          description: "El plano se está procesando..."
                        })
                      }).catch(err => {
                        toast({
                          title: "Error",
                          description: "No se pudo iniciar la conversión",
                          variant: "destructive"
                        })
                      })
                    }
                  }}
                  className="bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Convertir a 3D
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  disabled
                  className="bg-gray-400 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {plan.estado === 'procesando' ? 'Procesando...' : 'No disponible'}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-card-foreground truncate">{plan.nombre}</h3>
              <p className="text-sm text-muted-foreground">
                {plan.tipo_plano || 'Plano arquitectónico'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  plan.estado === 'completado' ? 'bg-green-100 text-green-800' :
                  plan.estado === 'procesando' ? 'bg-yellow-100 text-yellow-800' :
                  plan.estado === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {plan.estado === 'completado' ? 'Completado' :
                   plan.estado === 'procesando' ? 'Procesando' :
                   plan.estado === 'error' ? 'Error' : 'Subido'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/viewer/plano/${plan.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-transparent"
                  disabled={plan.estado !== 'completado'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDownload(plan)}
                disabled={!plan.url}
                title="Descargar plano"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="text-destructive hover:text-destructive bg-transparent"
                onClick={() => handleDelete(plan)}
                disabled={deletingIds.has(plan.id)}
                title="Eliminar plano"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

