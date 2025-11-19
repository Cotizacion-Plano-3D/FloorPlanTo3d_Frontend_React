"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Cotizacion, Plano } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Trash2, 
  Calendar, 
  Loader2,
  Mail,
  Phone,
  User,
  DollarSign,
  Package,
  Download,
  Eye,
  Building2,
  X,
  ImageIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface MisCotizacionesProps {
  onClose?: () => void
}

export default function MisCotizaciones({ onClose }: MisCotizacionesProps) {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [planosMap, setPlanosMap] = useState<Map<number, Plano>>(new Map())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadCotizaciones()
  }, [])

  const loadCotizaciones = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getCotizacionesUsuario()
      setCotizaciones(response)

      // Cargar información de los planos
      const planosData = new Map<number, Plano>()
      for (const cotizacion of response) {
        try {
          const plano = await apiClient.getPlano(cotizacion.plano_id)
          planosData.set(cotizacion.plano_id, plano)
        } catch (error) {
          console.error(`Error cargando plano ${cotizacion.plano_id}:`, error)
        }
      }
      setPlanosMap(planosData)
    } catch (error) {
      console.error('Error cargando cotizaciones:', error)
      toast.error('Error al cargar las cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (cotizacionId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      return
    }

    try {
      setDeleting(cotizacionId)
      await apiClient.deleteCotizacion(cotizacionId)
      toast.success('Cotización eliminada exitosamente')
      await loadCotizaciones()
    } catch (error) {
      console.error('Error eliminando cotización:', error)
      toast.error('Error al eliminar la cotización')
    } finally {
      setDeleting(null)
    }
  }

  const handleDescargarPDF = (cotizacionId: number) => {
    // TODO: Implementar descarga de PDF
    toast.info('Descarga de PDF en desarrollo')
  }

  const handleImageError = (planoId: number) => {
    setImageErrors(prev => new Set([...prev, planoId]))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando cotizaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Mis Cotizaciones</h2>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus cotizaciones en un solo lugar
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{cotizaciones.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Generadas hasta ahora</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${cotizaciones.reduce((sum, c) => sum + c.total, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Suma acumulada</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {cotizaciones.filter(c => {
                const cotizacionDate = new Date(c.fecha_creacion)
                const now = new Date()
                return cotizacionDate.getMonth() === now.getMonth() && 
                       cotizacionDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cotizaciones nuevas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cotizaciones */}
      {cotizaciones.length === 0 ? (
        <Card className="border-dashed border-border/40 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No hay cotizaciones aún</h3>
            <p className="text-muted-foreground text-center">
              Las cotizaciones que crees aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {cotizaciones.map((cotizacion) => {
            const plano = planosMap.get(cotizacion.plano_id)
            const hasImageError = imageErrors.has(cotizacion.plano_id)

            return (
              <Card key={cotizacion.id} className="overflow-hidden bg-card border-border/40 hover:border-primary/50 transition-all duration-300">
                <div className="grid md:grid-cols-[350px_1fr] gap-0">
                  {/* Imagen del Plano */}
                  <div className="relative bg-muted/30 border-r border-border/40">
                    {plano?.url && !hasImageError ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/planos/${cotizacion.plano_id}/image`}
                        alt={plano.nombre}
                        className="object-cover w-full h-full min-h-[400px]"
                        onError={(e) => {
                          console.error('❌ Error cargando imagen para plano', cotizacion.plano_id)
                          console.error('URL original:', plano.url)
                          console.error('URL proxy:', `${process.env.NEXT_PUBLIC_API_URL}/planos/${cotizacion.plano_id}/image`)
                          handleImageError(cotizacion.plano_id)
                        }}
                        onLoad={() => {
                          console.log('✅ Imagen cargada exitosamente para plano', cotizacion.plano_id)
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-muted/30 to-muted/10">
                        <div className="text-center">
                          <Building2 className="h-16 w-16 text-primary/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            {plano?.url?.includes('TEMP_') ? 'URL temporal inválida' : 
                             plano?.url ? 'Error cargando imagen' : 'Sin imagen'}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm border-0">
                        #{cotizacion.id}
                      </Badge>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-foreground">{plano?.nombre || 'Plano'}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Creada el {format(new Date(cotizacion.fecha_creacion), "d 'de' MMMM, yyyy", { locale: es })}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDescargarPDF(cotizacion.id)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={deleting === cotizacion.id}
                          onClick={() => handleEliminar(cotizacion.id)}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        >
                          {deleting === cotizacion.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Información del Cliente */}
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border/40">
                      <h4 className="font-semibold text-sm text-primary uppercase tracking-wide flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Información del Cliente
                      </h4>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Nombre</p>
                            <p className="text-sm font-medium text-foreground">{cotizacion.cliente_nombre}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm text-foreground">{cotizacion.cliente_email}</p>
                          </div>
                        </div>
                        {cotizacion.cliente_telefono && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Teléfono</p>
                              <p className="text-sm text-foreground">{cotizacion.cliente_telefono}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descripción */}
                    {cotizacion.descripcion && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">
                          Descripción del Proyecto
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{cotizacion.descripcion}</p>
                      </div>
                    )}

                    {/* Materiales */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">
                          Materiales ({cotizacion.materiales.length})
                        </h4>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {cotizacion.materiales.map((material, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-lg hover:bg-muted/40 hover:border-primary/30 transition-all duration-200"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">{material.nombre}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {material.categoria} • {material.cantidad} unidades
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-primary">${material.subtotal.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                ${material.precio_unitario.toFixed(2)}/u
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Totales */}
                    <div className="space-y-3 bg-muted/20 p-5 rounded-lg border border-border/40">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">${cotizacion.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">IVA</span>
                        <span className="font-medium text-foreground">${cotizacion.iva.toFixed(2)}</span>
                      </div>
                      <Separator className="bg-border/40" />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg text-foreground">Total</span>
                        <span className="font-bold text-3xl text-primary">
                          ${cotizacion.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

