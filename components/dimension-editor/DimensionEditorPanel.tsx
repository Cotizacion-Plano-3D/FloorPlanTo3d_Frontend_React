"use client"

import { ThreeJSObject } from '@/lib/floorplan-api'
import { DimensionSlider } from './DimensionSlider'
import { Button } from '@/components/ui/button'
import { X, RotateCcw, Save } from 'lucide-react'
import { useDimensionEditor, DEFAULT_CONSTRAINTS } from './useDimensionEditor'
import { useEffect, useState } from 'react'

interface DimensionEditorPanelProps {
  selectedObject: ThreeJSObject | null
  onClose: () => void
  onUpdate: (objectId: string | number, dimension: 'width' | 'height' | 'depth' | 'position', value: number, axis?: 'x' | 'y' | 'z') => void
  onReset: (objectId: string | number) => void
  onSave: () => void
  getEffectiveDimensions: (obj: ThreeJSObject) => {
    width: number
    height: number
    depth: number
    position: { x: number; y: number; z: number }
  }
  modelo3dId?: number
}

export function DimensionEditorPanel({
  selectedObject,
  onClose,
  onUpdate,
  onReset,
  onSave,
  getEffectiveDimensions,
  modelo3dId
}: DimensionEditorPanelProps) {
  const [localDimensions, setLocalDimensions] = useState<{
    width: number
    height: number
    depth: number
    position: { x: number; y: number; z: number }
  } | null>(null)

  // Cargar dimensiones efectivas cuando se selecciona un objeto
  useEffect(() => {
    if (selectedObject) {
      const effective = getEffectiveDimensions(selectedObject)
      setLocalDimensions(effective)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObject?.id]) // Solo dependemos del ID del objeto para evitar loops

  if (!selectedObject || !localDimensions) {
    return null
  }

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    setLocalDimensions(prev => prev ? { ...prev, [dimension]: value } : null)
    onUpdate(selectedObject.id, dimension, value)
  }

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setLocalDimensions(prev => prev ? {
      ...prev,
      position: { ...prev.position, [axis]: value }
    } : null)
    onUpdate(selectedObject.id, 'position', value, axis)
  }

  const handleReset = () => {
    onReset(selectedObject.id)
    // Recargar dimensiones originales después de un pequeño delay para asegurar que el estado se actualice
    setTimeout(() => {
      const effective = getEffectiveDimensions(selectedObject)
      setLocalDimensions(effective)
    }, 150)
  }

  const handleSave = () => {
    onSave()
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'wall': return 'Pared'
      case 'window': return 'Ventana'
      case 'door': return 'Puerta'
      default: return 'Objeto'
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Editor de Dimensiones</h2>
            <p className="text-sm text-muted-foreground">
              {getTypeLabel(selectedObject.type)} #{selectedObject.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dimensiones */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Dimensiones</h3>
          
          <DimensionSlider
            label="Ancho"
            value={localDimensions.width}
            min={DEFAULT_CONSTRAINTS.width.min}
            max={DEFAULT_CONSTRAINTS.width.max}
            step={DEFAULT_CONSTRAINTS.width.step}
            unit="m"
            onChange={(value) => handleDimensionChange('width', value)}
          />

          <DimensionSlider
            label="Alto"
            value={localDimensions.height}
            min={DEFAULT_CONSTRAINTS.height.min}
            max={DEFAULT_CONSTRAINTS.height.max}
            step={DEFAULT_CONSTRAINTS.height.step}
            unit="m"
            onChange={(value) => handleDimensionChange('height', value)}
          />

          <DimensionSlider
            label="Profundidad"
            value={localDimensions.depth}
            min={DEFAULT_CONSTRAINTS.depth.min}
            max={DEFAULT_CONSTRAINTS.depth.max}
            step={DEFAULT_CONSTRAINTS.depth.step}
            unit="m"
            onChange={(value) => handleDimensionChange('depth', value)}
          />
        </div>

        {/* Posición */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-medium text-muted-foreground">Posición</h3>
          
          <DimensionSlider
            label="Posición X"
            value={localDimensions.position.x}
            min={DEFAULT_CONSTRAINTS.position.min}
            max={DEFAULT_CONSTRAINTS.position.max}
            step={DEFAULT_CONSTRAINTS.position.step}
            unit="m"
            onChange={(value) => handlePositionChange('x', value)}
          />

          <DimensionSlider
            label="Posición Y"
            value={localDimensions.position.y}
            min={DEFAULT_CONSTRAINTS.position.min}
            max={DEFAULT_CONSTRAINTS.position.max}
            step={DEFAULT_CONSTRAINTS.position.step}
            unit="m"
            onChange={(value) => handlePositionChange('y', value)}
          />

          <DimensionSlider
            label="Posición Z"
            value={localDimensions.position.z}
            min={DEFAULT_CONSTRAINTS.position.min}
            max={DEFAULT_CONSTRAINTS.position.max}
            step={DEFAULT_CONSTRAINTS.position.step}
            unit="m"
            onChange={(value) => handlePositionChange('z', value)}
          />
        </div>

        {/* Información adicional */}
        <div className="space-y-2 border-t pt-4">
          <div className="text-xs text-muted-foreground">
            <p><strong>Tipo:</strong> {selectedObject.type}</p>
            <p><strong>ID:</strong> {selectedObject.id}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2 border-t pt-4">
          <Button
            onClick={handleSave}
            className="w-full"
            variant="default"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
          
          <Button
            onClick={handleReset}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Originales
          </Button>
        </div>
      </div>
    </div>
  )
}

