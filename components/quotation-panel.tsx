"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Sparkles } from 'lucide-react'

interface Material {
  id: string
  nombre: string
  categoria: string
  descripcion: string
  precio_base: number
  unidad_medida: string
}

interface SelectedMaterial {
  id: string
  nombre: string
  categoria: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface MaterialSuggestion {
  materialId: string
  cantidad: number
  razon: string
  prioridad: 'alta' | 'media' | 'baja'
}

interface QuotationPanelProps {
  materials: Material[]
  selectedMaterials: SelectedMaterial[]
  suggestions?: MaterialSuggestion[]
  onMaterialSelect: (material: Material, cantidad: number, descuento: number) => void
  onRemoveMaterial: (materialId: string) => void
}

export function QuotationPanel({
  materials,
  selectedMaterials,
  suggestions = [],
  onMaterialSelect,
  onRemoveMaterial,
}: QuotationPanelProps) {
  const categories = Array.from(new Set(materials.map((m) => m.categoria)))
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "")
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [discounts, setDiscounts] = useState<Record<string, number>>({})

  // Pre-llenar cantidades con sugerencias
  useEffect(() => {
    const suggestedQuantities: Record<string, number> = {}
    suggestions.forEach(suggestion => {
      suggestedQuantities[suggestion.materialId] = suggestion.cantidad
    })
    setQuantities(prev => ({
      ...suggestedQuantities,
      ...prev // Mantener las cantidades ya ingresadas por el usuario
    }))
  }, [suggestions])

  const handleQuantityChange = (materialId: string, value: string) => {
    const num = Math.max(0, parseInt(value) || 0)
    setQuantities((prev) => ({ ...prev, [materialId]: num }))
  }

  const handleDiscountChange = (materialId: string, value: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(value) || 0))
    setDiscounts((prev) => ({ ...prev, [materialId]: num }))
  }

  const handleAddMaterial = (material: Material) => {
    const cantidad = quantities[material.id] || 1
    const descuento = discounts[material.id] || 0
    onMaterialSelect(material, cantidad, descuento)
    setQuantities((prev) => ({ ...prev, [material.id]: 0 }))
    setDiscounts((prev) => ({ ...prev, [material.id]: 0 }))
  }

  return (
    <Card className="p-4 sm:p-6 bg-card border-border">
      <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">Agregar Materiales</h2>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <div className="relative">
          <TabsList className="flex w-full overflow-x-auto gap-1 sm:gap-2 pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat} 
                className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-3 sm:space-y-4">
            {materials
              .filter((m) => m.categoria === category)
              .map((material) => {
                const isSelected = selectedMaterials.some((m) => m.id === material.id)
                const suggestion = suggestions.find(s => s.materialId === material.id)
                const quantity = quantities[material.id] || 1
                const discount = discounts[material.id] || 0

                return (
                  <div
                    key={material.id}
                    className={`border rounded-lg p-3 sm:p-4 bg-background hover:bg-accent/5 transition-colors ${
                      suggestion ? 'border-primary/50 bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate">{material.nombre}</h3>
                            {suggestion && (
                              <Badge variant="outline" className="border-primary text-primary flex-shrink-0 text-xs flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Sugerido
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{material.descripcion}</p>
                          {suggestion && (
                            <p className="text-xs text-primary font-medium mt-1 italic">
                              💡 {suggestion.razon}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0 text-xs">
                            ✓ Agregado
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Precio</Label>
                          <div className="text-xs sm:text-sm font-semibold text-secondary">
                            ${material.precio_base.toFixed(0)}
                          </div>
                          <p className="text-xs text-muted-foreground">{material.unidad_medida}</p>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`qty-${material.id}`} className="text-xs">
                            Cantidad
                          </Label>
                          <Input
                            id={`qty-${material.id}`}
                            type="number"
                            min="0"
                            step="1"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                            className="text-xs h-7 sm:h-8"
                          />
                        </div>

                        {/* <div className="space-y-1">
                          <Label htmlFor={`disc-${material.id}`} className="text-xs">
                            Desc. %
                          </Label>
                          <Input
                            id={`disc-${material.id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={discount}
                            onChange={(e) => handleDiscountChange(material.id, e.target.value)}
                            className="text-xs h-7 sm:h-8"
                          />
                        </div> */}
                      </div>

                      <Button
                        onClick={() => handleAddMaterial(material)}
                        size="sm"
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-xs sm:text-sm py-1 sm:py-2"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        {isSelected ? "Actualizar" : "Agregar"}
                      </Button>
                    </div>
                  </div>
                )
              })}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  )
}

