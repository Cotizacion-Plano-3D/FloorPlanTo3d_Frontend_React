"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Mail, User, Calendar } from 'lucide-react'

interface QuotationFormProps {
  onSubmit?: (data: QuotationFormData) => void
}

export interface QuotationFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  projectName: string
  projectDescription: string
  deliveryDate: string
  paymentTerms: string
}

export function QuotationForm({ onSubmit }: QuotationFormProps) {
  const [formData, setFormData] = useState<QuotationFormData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectName: "",
    projectDescription: "",
    deliveryDate: "",
    paymentTerms: "50-50",
  })

  const handleInputChange = (field: keyof QuotationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-foreground" />
            Información de la Cotización
          </h3>
        </div>

        {/* Client Information Section */}
        <div className="bg-accent/5 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-card-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Datos del Cliente
          </h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName" className="text-sm">
                Nombre del Cliente
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange("clientName", e.target.value)}
                placeholder="Nombre completo"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="clientPhone" className="text-sm">
                Teléfono
              </Label>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="clientEmail" className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo Electrónico
              </Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="mt-1"
                required
              />
            </div>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="bg-muted/10 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-card-foreground">Detalles del Proyecto</h4>

          <div>
            <Label htmlFor="projectName" className="text-sm">
              Nombre del Proyecto
            </Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => handleInputChange("projectName", e.target.value)}
              placeholder="ej: Renovación Departamento Centro"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="projectDescription" className="text-sm">
              Descripción del Proyecto
            </Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription}
              onChange={(e) => handleInputChange("projectDescription", e.target.value)}
              placeholder="Detalles adicionales sobre el proyecto..."
              className="mt-1 resize-none h-24"
            />
          </div>
        </div>

        {/* Delivery and Terms Section */}
        <div className="bg-accent/5 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-card-foreground">Términos de Entrega</h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryDate" className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Entrega Estimada
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="paymentTerms" className="text-sm">
                Términos de Pago
              </Label>
              <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange("paymentTerms", value)}>
                <SelectTrigger id="paymentTerms" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50-50">50% Adelanto - 50% Entrega</SelectItem>
                  <SelectItem value="100">100% Pago Adelantado</SelectItem>
                  <SelectItem value="30-70">30% Adelanto - 70% Entrega</SelectItem>
                  <SelectItem value="crédito">A Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
            Guardar Cotización
          </Button>
          <Button type="button" variant="outline" className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

