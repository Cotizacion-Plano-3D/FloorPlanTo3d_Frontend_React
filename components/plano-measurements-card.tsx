"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Home, Square, DoorOpen, Layers, Box as WindowIcon } from "lucide-react"

interface MedidasExtraidas {
  area_total?: number
  area_paredes?: number
  area_ventanas?: number
  area_puertas?: number
  perimetro_total?: number
  num_paredes?: number
  num_ventanas?: number
  num_puertas?: number
  bounds?: {
    ancho?: number
    alto?: number
  }
}

interface PlanoMeasurementsCardProps {
  medidas: MedidasExtraidas | null | undefined
}

export function PlanoMeasurementsCard({ medidas }: PlanoMeasurementsCardProps) {
  if (!medidas) {
    return null
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "N/A"
    return num.toFixed(2)
  }

  const measurements = [
    {
      icon: Home,
      label: "Área Total",
      value: formatNumber(medidas.area_total),
      unit: "m²",
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      icon: Layers,
      label: "Área Paredes",
      value: formatNumber(medidas.area_paredes),
      unit: "m²",
      iconColor: "text-foreground",
      bgColor: "bg-muted",
      borderColor: "border-border",
    },
    {
      icon: WindowIcon,
      label: "Área Ventanas",
      value: formatNumber(medidas.area_ventanas),
      unit: "m²",
      iconColor: "text-foreground",
      bgColor: "bg-muted",
      borderColor: "border-border",
    },
    {
      icon: DoorOpen,
      label: "Área Puertas",
      value: formatNumber(medidas.area_puertas),
      unit: "m²",
      iconColor: "text-foreground",
      bgColor: "bg-muted",
      borderColor: "border-border",
    },
    {
      icon: Ruler,
      label: "Perímetro Total",
      value: formatNumber(medidas.perimetro_total),
      unit: "m",
      iconColor: "text-foreground",
      bgColor: "bg-muted",
      borderColor: "border-border",
    },
  ]

  const counts = [
    {
      label: "Paredes",
      value: medidas.num_paredes || 0,
      variant: "secondary" as const,
    },
    {
      label: "Ventanas",
      value: medidas.num_ventanas || 0,
      variant: "secondary" as const,
    },
    {
      label: "Puertas",
      value: medidas.num_puertas || 0,
      variant: "secondary" as const,
    },
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Square className="w-5 h-5 text-primary" />
          Medidas del Plano
        </CardTitle>
        <CardDescription>
          Medidas extraídas automáticamente del plano
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid de medidas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {measurements.map((measurement, index) => {
            const Icon = measurement.icon
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg ${measurement.bgColor} border ${measurement.borderColor} transition-colors hover:opacity-90`}
              >
                <div className={`p-2.5 rounded-lg ${measurement.bgColor} ${measurement.borderColor} border flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${measurement.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate mb-1">
                    {measurement.label}
                  </p>
                  <p className="text-xl font-bold text-foreground truncate">
                    {measurement.value} <span className="text-sm font-normal text-muted-foreground ml-1">{measurement.unit}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contadores de elementos */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Elementos:</span>
          {counts.map((count, index) => (
            <Badge key={index} variant={count.variant}>
              {count.label}: {count.value}
            </Badge>
          ))}
        </div>

        {/* Dimensiones del plano */}
        {medidas.bounds && (
          <div className="flex items-center gap-2 pt-2 border-t border-border text-sm">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Dimensiones:</span>
            <span className="font-medium text-foreground">
              {formatNumber(medidas.bounds.ancho)} m × {formatNumber(medidas.bounds.alto)} m
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

