"use client"

import { useState, useEffect } from "react"
import { Search, Package, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiClient } from "@/lib/api"
import { Material, Categoria } from "@/types/api"
import { cn } from "@/lib/utils"

interface TextureSelectorProps {
  onSelectMaterial: (material: Material) => void
  selectedMaterialId?: number
  className?: string
}

export function TextureSelector({ 
  onSelectMaterial, 
  selectedMaterialId,
  className 
}: TextureSelectorProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [materiales, setMateriales] = useState<Material[]>([])
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategorias()
  }, [])

  useEffect(() => {
    loadMateriales()
  }, [selectedCategoria, searchQuery])

  const loadCategorias = async () => {
    try {
      const response = await apiClient.getCategorias()
      // El backend devuelve SuccessResponse: {message, data: {categorias, total}}
      if (response?.data?.categorias) {
        setCategorias(response.data.categorias)
      } else if (response?.categorias) {
        // Fallback por si cambia la estructura
        setCategorias(response.categorias as any)
      } else {
        console.warn('Respuesta de categorías sin estructura esperada:', response)
        setCategorias([])
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
      setCategorias([]) // Establecer array vacío en caso de error
    }
  }

  const loadMateriales = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getMateriales(
        0, 
        100, 
        selectedCategoria || undefined,
        searchQuery || undefined
      )
      // El backend devuelve SuccessResponse: {message, data: {materiales, total, ...}}
      if (response?.data?.materiales) {
        setMateriales(response.data.materiales)
      } else if (response?.materiales) {
        // Fallback por si cambia la estructura
        setMateriales(response.materiales as any)
      } else {
        setMateriales([])
      }
    } catch (error) {
      console.error('Error cargando materiales:', error)
      setError('Error al cargar materiales. Por favor, intenta de nuevo.')
      setMateriales([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-card border border-border rounded-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Biblioteca de Texturas</h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar materiales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Categorías</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategoria === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoria(null)}
          >
            Todas
          </Button>
          {categorias && categorias.length > 0 && categorias.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategoria === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoria(cat.id)}
            >
              {cat.nombre}
            </Button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">Cargando materiales...</p>
            </div>
          </div>
        ) : materiales && materiales.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {materiales.map((material) => (
              <button
                key={material.id}
                onClick={() => onSelectMaterial(material)}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  selectedMaterialId === material.id
                    ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Image */}
                <div className="absolute inset-0 bg-muted">
                  {material.imagen_url ? (
                    <img
                      src={material.imagen_url}
                      alt={material.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-medium line-clamp-1">{material.nombre}</p>
                    <p className="text-white/70 text-xs">{material.unidad_medida}</p>
                  </div>
                </div>

                {/* Selected Badge */}
                {selectedMaterialId === material.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-destructive/30 mx-auto mb-4" />
            <p className="text-destructive mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMateriales}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron materiales</p>
            {searchQuery && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          {materiales?.length || 0} {materiales?.length === 1 ? 'material' : 'materiales'} disponibles
        </p>
      </div>
    </div>
  )
}
