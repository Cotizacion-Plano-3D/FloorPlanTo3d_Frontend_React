"use client"

import { useState } from "react"
import { X, Paintbrush, Layers, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TextureSelector } from "@/components/texture-selector"
import { Material } from "@/types/api"
import { cn } from "@/lib/utils"

export type ElementType = 'wall' | 'floor' | 'ceiling' | 'door' | 'window'

export interface TextureAssignment {
  elementType: ElementType
  elementId?: string
  material: Material | null
}

interface TexturePanelProps {
  isOpen: boolean
  onClose: () => void
  onApplyTexture: (elementType: ElementType, material: Material, elementId?: string) => void
  currentAssignments: TextureAssignment[]
  className?: string
}

const ELEMENT_TYPES: { type: ElementType; label: string; icon: string }[] = [
  { type: 'wall', label: 'Paredes', icon: '🧱' },
  { type: 'floor', label: 'Piso', icon: '⬜' },
  { type: 'ceiling', label: 'Techo', icon: '🔲' },
  { type: 'door', label: 'Puertas', icon: '🚪' },
  { type: 'window', label: 'Ventanas', icon: '🪟' },
]

export function TexturePanel({ 
  isOpen, 
  onClose, 
  onApplyTexture,
  currentAssignments,
  className 
}: TexturePanelProps) {
  const [selectedElementType, setSelectedElementType] = useState<ElementType>('wall')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

  const getCurrentMaterial = (elementType: ElementType) => {
    return currentAssignments.find(a => a.elementType === elementType)?.material
  }

  const handleApply = () => {
    if (selectedMaterial) {
      onApplyTexture(selectedElementType, selectedMaterial)
      // Opcional: cerrar el panel o mantenerlo abierto para más selecciones
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        "fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-background border-l border-border shadow-2xl z-50 flex flex-col",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Paintbrush className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Aplicar Texturas</h2>
              <p className="text-sm text-muted-foreground">Personaliza los materiales de tu modelo 3D</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Element Type Selection */}
          <div className="w-48 border-r border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Elementos</span>
            </div>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-1">
                {ELEMENT_TYPES.map((element) => {
                  const currentMaterial = getCurrentMaterial(element.type)
                  return (
                    <button
                      key={element.type}
                      onClick={() => {
                        setSelectedElementType(element.type)
                        setSelectedMaterial(currentMaterial || null)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 p-3 rounded-lg transition-all text-left",
                        selectedElementType === element.type
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card hover:bg-accent text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{element.icon}</span>
                        <span className="text-sm font-medium">{element.label}</span>
                      </div>
                      {currentMaterial && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Texture Selector */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <TextureSelector
                onSelectMaterial={setSelectedMaterial}
                selectedMaterialId={selectedMaterial?.id}
                className="h-full border-0 rounded-none"
              />
            </div>

            {/* Apply Button */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-3">
                {selectedMaterial && (
                  <div className="flex-1 flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {selectedMaterial.imagen_url && (
                      <img
                        src={selectedMaterial.imagen_url}
                        alt={selectedMaterial.nombre}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {selectedMaterial.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${selectedMaterial.precio_base} / {selectedMaterial.unidad_medida}
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleApply}
                  disabled={!selectedMaterial}
                  size="lg"
                  className="min-w-[120px]"
                >
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Assignments Summary */}
        <div className="p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Materiales aplicados:</p>
          <div className="flex flex-wrap gap-2">
            {ELEMENT_TYPES.map((element) => {
              const material = getCurrentMaterial(element.type)
              if (!material) return null
              return (
                <div
                  key={element.type}
                  className="flex items-center gap-2 px-2 py-1 bg-card border border-border rounded text-xs"
                >
                  <span>{element.icon}</span>
                  <span className="text-muted-foreground">{element.label}:</span>
                  <span className="font-medium text-foreground">{material.nombre}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
