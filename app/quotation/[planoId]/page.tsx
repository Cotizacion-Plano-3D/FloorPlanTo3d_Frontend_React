"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { ArrowLeft, Download, Share2, Sparkles, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plano, Material } from "@/types/api"
import { calcularSugerenciasMateriales, MaterialSuggestion } from "@/lib/material-suggestions"

// Lazy load de componentes pesados para optimizar tiempo de carga inicial
const FloorPlan3DViewer = dynamic(
  () => import("@/components/floor-plan-3d-viewer").then(mod => ({ default: mod.FloorPlan3DViewer })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Cargando visor 3D...</p>
        </div>
      </div>
    )
  }
)

const QuotationPanel = dynamic(
  () => import("@/components/quotation-panel").then(mod => ({ default: mod.QuotationPanel })),
  {
    loading: () => (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    )
  }
)

const QuotationSummary = dynamic(
  () => import("@/components/quotation-summary").then(mod => ({ default: mod.QuotationSummary })),
  {
    loading: () => (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }
)

const PlanoMeasurementsCard = dynamic(
  () => import("@/components/plano-measurements-card").then(mod => ({ default: mod.PlanoMeasurementsCard })),
  {
    loading: () => (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }
)

// Lazy load de utilidades de exportación solo cuando se necesitan
const exportUtils = {
  pdf: () => import("@/lib/export-utils").then(mod => mod.exportarCotizacionPDF),
  excel: () => import("@/lib/export-utils").then(mod => mod.exportarCotizacionExcel),
}

interface SelectedMaterial {
  id: string
  nombre: string
  categoria: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export default function QuotationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const planoId = parseInt(params.planoId as string)

  const [plano, setPlano] = useState<Plano | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([])
  const [description, setDescription] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<MaterialSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Cargar plano y materiales de forma optimizada
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Cargar plano y materiales en paralelo para mejor performance
        const [planoData, materialesResponse] = await Promise.all([
          apiClient.getPlano(planoId),
          apiClient.getMateriales(0, 100)
        ])
        
        setPlano(planoData)

        if (materialesResponse.data?.materiales) {
          setMaterials(materialesResponse.data.materiales)
          
          // Calcular sugerencias inteligentes si hay medidas extraídas (diferido)
          if (planoData.medidas_extraidas) {
            // Diferir el cálculo de sugerencias para no bloquear el render
            const medidasExtraidas = planoData.medidas_extraidas
            setTimeout(() => {
              const materialesParaSugerencias = materialesResponse.data.materiales.map(m => ({
                id: m.id.toString(),
                nombre: m.nombre,
                categoria: m.categoria?.nombre || 'Sin categoría',
                unidad_medida: m.unidad_medida
              }))
              
              const sugerenciasCalculadas = calcularSugerenciasMateriales(
                medidasExtraidas as any,
                materialesParaSugerencias
              )
              setSuggestions(sugerenciasCalculadas)
            }, 100)
          }
        }

        // Cargar materiales pre-asignados de forma asíncrona sin bloquear
        if (planoData.modelo3d?.id) {
          apiClient.getMaterialesModelo3D(planoData.modelo3d.id)
            .then((materialesModelo3D) => {
              if (materialesModelo3D.data?.materiales) {
                const preselectedMaterials = materialesModelo3D.data.materiales.map((mm) => ({
                  id: mm.material?.id.toString() || '',
                  nombre: mm.material?.nombre || '',
                  categoria: mm.material?.categoria?.nombre || '',
                  cantidad: mm.cantidad,
                  precio_unitario: mm.precio_unitario,
                  subtotal: mm.subtotal
                }))
                setSelectedMaterials(preselectedMaterials)
              }
            })
            .catch(() => {
              console.log('No hay materiales pre-asignados')
            })
        }
      } catch (error: any) {
        console.error('Error cargando datos:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del plano",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (planoId) {
      loadData()
    }
  }, [planoId, toast])

  const totals = useMemo(() => {
    const subtotal = selectedMaterials.reduce((sum, mat) => sum + mat.subtotal, 0)
    const iva = subtotal * 0.19
    const total = subtotal + iva
    return { subtotal, iva, total }
  }, [selectedMaterials])

  // Preparar datos del modelo 3D para el visor (memoizado) - ANTES de los early returns
  const sceneData = useMemo(() => {
    if (!plano?.modelo3d?.datos_json) return undefined
    
    return {
      scene: plano.modelo3d.datos_json.scene || { bounds: { width: 10, height: 10 } },
      objects: plano.modelo3d.datos_json.objects || [],
      intersections: plano.modelo3d.datos_json.intersections
    }
  }, [plano?.modelo3d?.datos_json])

  // Convertir materiales del backend a formato esperado por QuotationPanel (memoizado) - ANTES de los early returns
  const materialsForPanel = useMemo(() => 
    materials.map(m => ({
      id: m.id.toString(),
      nombre: m.nombre,
      categoria: m.categoria?.nombre || 'Sin categoría',
      descripcion: m.descripcion || '',
      precio_base: m.precio_base,
      unidad_medida: m.unidad_medida
    }))
  , [materials])

  const handleMaterialSelect = (
    material: { id: string; nombre: string; categoria: string; precio_base: number },
    cantidad: number,
    descuento: number = 0
  ) => {
    const precio_unitario = material.precio_base * (1 - descuento / 100)
    const subtotal = precio_unitario * cantidad

    setSelectedMaterials((prev) => {
      const existing = prev.findIndex((m) => m.id === material.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = {
          ...updated[existing],
          cantidad,
          precio_unitario,
          subtotal,
        }
        return updated
      }
      return [
        ...prev,
        {
          id: material.id,
          nombre: material.nombre,
          categoria: material.categoria,
          cantidad,
          precio_unitario,
          subtotal,
        },
      ]
    })
  }

  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId))
  }

  const handleApplySuggestion = (suggestion: MaterialSuggestion) => {
    const material = materials.find(m => m.id.toString() === suggestion.materialId)
    if (material) {
      handleMaterialSelect(
        {
          id: material.id.toString(),
          nombre: material.nombre,
          categoria: material.categoria?.nombre || 'Sin categoría',
          precio_base: material.precio_base
        },
        suggestion.cantidad,
        0 // sin descuento por defecto
      )
      
      toast({
        title: "Material agregado",
        description: `${material.nombre} - ${suggestion.cantidad} ${material.unidad_medida}`,
      })
    }
  }

  const handleApplyAllSuggestions = () => {
    let count = 0
    suggestions.forEach(suggestion => {
      const material = materials.find(m => m.id.toString() === suggestion.materialId)
      if (material) {
        handleMaterialSelect(
          {
            id: material.id.toString(),
            nombre: material.nombre,
            categoria: material.categoria?.nombre || 'Sin categoría',
            precio_base: material.precio_base
          },
          suggestion.cantidad,
          0
        )
        count++
      }
    })
    
    toast({
      title: "Sugerencias aplicadas",
      description: `Se agregaron ${count} materiales basados en las medidas del plano`,
    })
    setShowSuggestions(false)
  }

  const handleGenerateQuotation = async () => {
    if (!clientName || !clientEmail) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa el nombre y correo del cliente",
        variant: "destructive"
      })
      return
    }

    if (selectedMaterials.length === 0) {
      toast({
        title: "Sin materiales",
        description: "Debes seleccionar al menos un material para generar la cotización",
        variant: "destructive"
      })
      return
    }

    try {
      // Preparar datos de la cotización
      const cotizacionData = {
        plano_id: planoId,
        cliente_nombre: clientName,
        cliente_email: clientEmail,
        descripcion: description,
        materiales: selectedMaterials.map(m => ({
          material_id: parseInt(m.id),
          nombre: m.nombre,
          categoria: m.categoria,
          cantidad: m.cantidad,
          precio_unitario: m.precio_unitario,
          subtotal: m.subtotal
        })),
        subtotal: totals.subtotal,
        iva: totals.iva,
        total: totals.total
      }

      // Guardar cotización en el backend
      const cotizacion = await apiClient.createCotizacion(cotizacionData)
      
      toast({
        title: "Cotización generada",
        description: `La cotización #${cotizacion.id} se ha creado exitosamente`
      })

      // Podrías redirigir a una página de vista previa de la cotización
      // router.push(`/quotation/${planoId}/preview/${cotizacion.id}`)
      
      // O volver al dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      console.error('Error generando cotización:', error)
      toast({
        title: "Error",
        description: "No se pudo generar la cotización",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const handleExportPDF = async () => {
    if (selectedMaterials.length === 0) {
      toast({
        title: "Sin materiales",
        description: "Agrega al menos un material antes de exportar",
        variant: "destructive"
      })
      return
    }

    try {
      // Cargar la función de exportación solo cuando se necesite
      const exportarCotizacionPDF = await exportUtils.pdf()
      
      await exportarCotizacionPDF({
        planoNombre: plano?.nombre || 'Plano sin nombre',
        clienteNombre: clientName || 'Cliente',
        clienteEmail: clientEmail || 'email@example.com',
        descripcion: description,
        medidas: plano?.medidas_extraidas || null,
        materiales: selectedMaterials,
        subtotal: totals.subtotal,
        iva: totals.iva,
        total: totals.total
      })
      
      toast({
        title: "PDF generado",
        description: "La cotización se ha exportado exitosamente a PDF"
      })
    } catch (error) {
      console.error('Error exportando PDF:', error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      })
    }
  }

  const handleExportExcel = async () => {
    if (selectedMaterials.length === 0) {
      toast({
        title: "Sin materiales",
        description: "Agrega al menos un material antes de exportar",
        variant: "destructive"
      })
      return
    }

    try {
      // Cargar la función de exportación solo cuando se necesite
      const exportarCotizacionExcel = await exportUtils.excel()
      
      exportarCotizacionExcel({
        planoNombre: plano?.nombre || 'Plano sin nombre',
        clienteNombre: clientName || 'Cliente',
        clienteEmail: clientEmail || 'email@example.com',
        descripcion: description,
        medidas: plano?.medidas_extraidas || null,
        materiales: selectedMaterials,
        subtotal: totals.subtotal,
        iva: totals.iva,
        total: totals.total
      })
      
      toast({
        title: "Excel generado",
        description: "La cotización se ha exportado exitosamente a Excel"
      })
    } catch (error) {
      console.error('Error exportando Excel:', error)
      toast({
        title: "Error",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!plano) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Plano no encontrado</h1>
          <p className="text-muted-foreground mb-4">El plano que buscas no existe</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Presupuesto y Cotización</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{plano.nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {suggestions.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 sm:gap-2 text-xs sm:text-sm border-primary text-primary hover:bg-primary/10"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sugerencias IA</span>
                  <span className="sm:hidden">IA</span>
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Compartir</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary text-primary-foreground gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    Exportar a PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar a Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Side - 3D Viewer and Materials */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Medidas del Plano */}
            {plano.medidas_extraidas ? (
              <PlanoMeasurementsCard medidas={plano.medidas_extraidas} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                ⚠️ Este plano no tiene medidas extraídas. Re-procesa el plano para obtener sugerencias inteligentes.
              </div>
            )}

            {/* Panel de Sugerencias Inteligentes */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-2 border-primary/20 rounded-xl p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Sugerencias Inteligentes
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Basadas en las medidas extraídas del plano ({suggestions.length} sugerencias)
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleApplyAllSuggestions}
                    className="bg-primary text-primary-foreground"
                  >
                    Aplicar Todas
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {suggestions.map((suggestion, index) => {
                    const material = materials.find(m => m.id.toString() === suggestion.materialId)
                    if (!material) return null
                    
                    const isAlreadySelected = selectedMaterials.some(m => m.id === suggestion.materialId)
                    
                    return (
                      <div 
                        key={index}
                        className="bg-card border border-border rounded-lg p-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{material.nombre}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              suggestion.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                              suggestion.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {suggestion.prioridad}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{suggestion.razon}</p>
                          <p className="text-sm font-bold text-primary mt-1">
                            {suggestion.cantidad} {material.unidad_medida} × ${material.precio_base.toLocaleString()} = ${(suggestion.cantidad * material.precio_base).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isAlreadySelected ? "secondary" : "default"}
                          onClick={() => handleApplySuggestion(suggestion)}
                          disabled={isAlreadySelected}
                        >
                          {isAlreadySelected ? 'Agregado' : 'Agregar'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {/* 3D Viewer - Reduced height on mobile */}
            {sceneData && (
              <div className="relative bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden h-[300px] sm:h-[400px] lg:h-[500px]">
                <FloorPlan3DViewer 
                  imageUrl={plano.url ? `${process.env.NEXT_PUBLIC_API_URL}/planos/${plano.id}/image` : undefined}
                  sceneData={sceneData}
                  modelo3dId={plano.modelo3d?.id}
                  planoId={plano.id}
                  showIntersections={false}
                  disableDimensionEditing={true}
                />
              </div>
            )}

            {/* Materials Selection */}
            <div className="max-h-[600px] overflow-y-auto">
              <QuotationPanel
                materials={materialsForPanel}
                selectedMaterials={selectedMaterials}
                suggestions={suggestions}
                onMaterialSelect={handleMaterialSelect}
                onRemoveMaterial={handleRemoveMaterial}
              />
            </div>
          </div>

          {/* Right Side - Summary and Client Info - Stacks below on mobile */}
          <div className="space-y-4 sm:space-y-6">
            <QuotationSummary
              floorPlanName={plano.nombre}
              selectedMaterials={selectedMaterials}
              totals={totals}
              clientName={clientName}
              clientEmail={clientEmail}
              description={description}
              onClientNameChange={setClientName}
              onClientEmailChange={setClientEmail}
              onDescriptionChange={setDescription}
              onRemoveMaterial={handleRemoveMaterial}
              onGenerateQuotation={handleGenerateQuotation}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

