"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from 'lucide-react'

interface SelectedMaterial {
  id: string
  nombre: string
  categoria: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface Totals {
  subtotal: number
  iva: number
  total: number
}

interface QuotationSummaryProps {
  floorPlanName: string
  selectedMaterials: SelectedMaterial[]
  totals: Totals
  clientName: string
  clientEmail: string
  description: string
  onClientNameChange: (name: string) => void
  onClientEmailChange: (email: string) => void
  onDescriptionChange: (description: string) => void
  onRemoveMaterial: (materialId: string) => void
  onGenerateQuotation?: () => void
  onCancel?: () => void
}

export function QuotationSummary({
  floorPlanName,
  selectedMaterials,
  totals,
  clientName,
  clientEmail,
  description,
  onClientNameChange,
  onClientEmailChange,
  onDescriptionChange,
  onRemoveMaterial,
  onGenerateQuotation,
  onCancel,
}: QuotationSummaryProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Client Information */}
      <Card className="p-4 sm:p-6 bg-card border-border">
        <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-3 sm:mb-4">Información del Cliente</h3>

        <div className="space-y-2 sm:space-y-3">
          <div>
            <Label htmlFor="client-name" className="text-xs sm:text-sm">
              Nombre del Cliente
            </Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              placeholder="Nombre completo"
              className="mt-1 text-xs sm:text-sm"
            />
          </div>

          <div>
            <Label htmlFor="client-email" className="text-xs sm:text-sm">
              Correo Electrónico
            </Label>
            <Input
              id="client-email"
              type="email"
              value={clientEmail}
              onChange={(e) => onClientEmailChange(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="mt-1 text-xs sm:text-sm"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-xs sm:text-sm">
              Notas / Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Detalles adicionales del proyecto..."
              className="mt-1 resize-none h-16 sm:h-20 text-xs sm:text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Selected Materials List */}
      <Card className="p-4 sm:p-6 bg-card border-border">
        <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-3 sm:mb-4">Materiales Seleccionados</h3>

        {selectedMaterials.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
            Selecciona materiales para comenzar el presupuesto
          </p>
        ) : (
          <ScrollArea className="h-[250px] sm:h-[300px]">
            <div className="space-y-2 pr-4">
              {selectedMaterials.map((material) => (
                <div key={material.id} className="border border-border rounded-lg p-2 sm:p-3 bg-background space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-card-foreground truncate">{material.nombre}</p>
                      <p className="text-xs text-muted-foreground">{material.categoria}</p>
                    </div>
                    <Button
                      onClick={() => onRemoveMaterial(material.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div>
                      <p className="text-muted-foreground">Cantidad</p>
                      <p className="font-semibold text-card-foreground">{material.cantidad}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unitario</p>
                      <p className="font-semibold text-secondary truncate">${material.precio_unitario.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-semibold text-accent-foreground">${material.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Cost Summary */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-3 sm:mb-4">Resumen de Costos</h3>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Subtotal</span>
            <span className="text-xs sm:text-sm font-semibold text-card-foreground">${totals.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">IVA (19%)</span>
            <span className="text-xs sm:text-sm font-semibold text-secondary">${totals.iva.toFixed(2)}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm sm:text-base font-bold text-foreground">Total Presupuesto</span>
            <span className="text-lg sm:text-2xl font-bold text-accent-foreground">${totals.total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          className="w-full mt-4 sm:mt-6 bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm"
          onClick={onGenerateQuotation}
        >
          Generar Presupuesto
        </Button>

        <Button 
          variant="outline" 
          className="w-full mt-2 text-xs sm:text-sm"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </Card>

      {/* Project Info */}
      <Card className="p-3 sm:p-4 bg-muted/20 border-border">
        <p className="text-xs text-muted-foreground line-clamp-1">
          <span className="font-semibold text-card-foreground">Proyecto:</span> {floorPlanName}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="font-semibold text-card-foreground">Materiales:</span> {selectedMaterials.length}{" "}
          seleccionados
        </p>
      </Card>
    </div>
  )
}

