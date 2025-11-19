"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Plano, PlanoListResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Trash2, 
  Zap, 
  Calendar, 
  FileImage,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Bug,
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

interface MisPlanosProps {
  onClose?: () => void
}

export default function MisPlanos({ onClose }: MisPlanosProps) {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const router = useRouter()

  useEffect(() => {
    loadPlanos()
  }, [])

  const loadPlanos = async () => {
    try {
      setLoading(true)
      const response: PlanoListResponse = await apiClient.getPlanos()
      setPlanos(response.planos)
    } catch (error) {
      console.error('Error cargando planos:', error)
      toast.error('Error al cargar los planos')
    } finally {
      setLoading(false)
    }
  }

  const handleConvertir = async (planoId: number) => {
    try {
      setConverting(planoId)
      await apiClient.convertirPlanoA3D(planoId)
      toast.success('Conversión iniciada. El plano se procesará en segundo plano.')
      // Recargar la lista para actualizar el estado
      await loadPlanos()
    } catch (error) {
      console.error('Error convirtiendo plano:', error)
      toast.error('Error al convertir el plano')
    } finally {
      setConverting(null)
    }
  }

  const handleEliminar = async (planoId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plano?')) {
      return
    }

    try {
      setDeleting(planoId)
      await apiClient.deletePlano(planoId)
      toast.success('Plano eliminado exitosamente')
      // Recargar la lista
      await loadPlanos()
    } catch (error) {
      console.error('Error eliminando plano:', error)
      toast.error('Error al eliminar el plano')
    } finally {
      setDeleting(null)
    }
  }

  const handleVer = (planoId: number) => {
    router.push(`/viewer/plano/${planoId}`)
  }

  const handleCotizacion = (planoId: number) => {
    router.push(`/quotation/${planoId}`)
  }

  const handleImageError = (planoId: number) => {
    setImageErrors(prev => new Set([...prev, planoId]))
  }

  const handleDebugImage = async (planoId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planos/${planoId}/debug-image`, {
        headers: {
          'Authorization': `Bearer ${apiClient.token}`
        }
      })
      const debugInfo = await response.json()
      console.log('🔍 Debug info para plano', planoId, ':', debugInfo)
      toast.info(`Debug info en consola. URL: ${debugInfo.direct_url}`)
    } catch (error) {
      console.error('Error en debug:', error)
      toast.error('Error obteniendo debug info')
    }
  }

  const handleMakeAllPublic = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planos/make-all-public`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.token}`
        }
      })
      const result = await response.json()
      console.log('🔧 Resultado hacer públicos:', result)
      toast.success(result.message)
      // Recargar planos para actualizar las imágenes
      await loadPlanos()
    } catch (error) {
      console.error('Error haciendo públicos:', error)
      toast.error('Error haciendo públicos los archivos')
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'subido': 'secondary',
      'procesando': 'default',
      'completado': 'default',
      'error': 'destructive'
    } as const

    const labels = {
      'subido': 'Subido',
      'procesando': 'Procesando',
      'completado': 'Completado',
      'error': 'Error'
    }

    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'secondary'}>
        {labels[estado as keyof typeof labels] || estado}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando planos...</span>
      </div>
    )
  }

  if (planos.length === 0) {
    return (
      <div className="text-center p-8">
        <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tienes planos aún</h3>
        <p className="text-muted-foreground mb-4">
          Sube tu primer plano para comenzar a crear modelos 3D
        </p>
        <Button onClick={() => window.location.href = '/upload'}>
          Subir Plano
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Planos</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPlanos}>
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleMakeAllPublic}>
            Hacer Públicos
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
      </div>



      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {planos.map((plano) => (
          <Card key={plano.id} className="relative bg-white shadow-md overflow-hidden">
            {/* Imagen del plano */}
            <div className="relative aspect-[4/3] bg-gray-100">
              {plano.url && !imageErrors.has(plano.id) ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/planos/${plano.id}/image`}
                  alt={plano.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('❌ Error cargando imagen para plano', plano.id)
                    console.error('URL original:', plano.url)
                    console.error('URL proxy:', `${process.env.NEXT_PUBLIC_API_URL}/planos/${plano.id}/image`)
                    console.error('Event:', e)
                    
                    // Verificar si la URL es temporal o inválida
                    if (plano.url?.includes('TEMP_') || !plano.url) {
                      console.warn(`⚠️ URL temporal o inválida para plano ${plano.id}`)
                    }
                    
                    handleImageError(plano.id)
                  }}
                  onLoad={() => {
                    console.log('✅ Imagen cargada exitosamente para plano', plano.id)
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {plano.url?.includes('TEMP_') ? 'URL temporal inválida' : 
                       plano.url ? 'Error cargando imagen' : 'Sin imagen'}
                    </p>
                    {plano.url?.includes('TEMP_') && (
                      <p className="text-xs text-gray-400 mt-1">
                        Re-subir el archivo puede solucionarlo
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg truncate text-gray-900">{plano.nombre}</CardTitle>
                  <CardDescription className="mt-1 text-gray-600">
                    {plano.tipo_plano || 'Plano general'}
                  </CardDescription>
                </div>
                {getEstadoBadge(plano.estado)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {plano.descripcion && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {plano.descripcion}
                </p>
              )}
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(plano.fecha_subida)}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVer(plano.id)}
                  disabled={plano.estado !== 'completado'}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                
                <Button
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleCotizacion(plano.id)}
                  disabled={plano.estado !== 'completado'}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Cotización
                </Button>
                
                {plano.estado === 'subido' && (
                  <Button
                    size="sm"
                    onClick={() => handleConvertir(plano.id)}
                    disabled={converting === plano.id}
                  >
                    {converting === plano.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-1" />
                    )}
                    Convertir
                  </Button>
                )}

                {plano.estado === 'error' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConvertir(plano.id)}
                    disabled={converting === plano.id}
                  >
                    {converting === plano.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-1" />
                    )}
                    Reintentar
                  </Button>
                )}

                {imageErrors.has(plano.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDebugImage(plano.id)}
                    title="Debug imagen"
                  >
                    <Bug className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleEliminar(plano.id)}
                  disabled={deleting === plano.id}
                >
                  {deleting === plano.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
                
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
