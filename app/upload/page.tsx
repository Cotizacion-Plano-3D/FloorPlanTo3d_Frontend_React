"use client"

import { useState } from "react"
import { ArrowLeft, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadZone } from "@/components/upload-zone"
import { FloorPlanGallery } from "@/components/floor-plan-gallery"

export default function UploadPage() {
  const [uploadedPlans, setUploadedPlans] = useState<Array<{ id: string; url: string; name: string }>>([])

  const handleFilesUploaded = (files: File[]) => {
    const newPlans = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setUploadedPlans((prev) => [...prev, ...newPlans])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver</span>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Subir Planos</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Sube tus Planos 2D</h2>
              <p className="text-muted-foreground text-lg">
                Arrastra y suelta tus imágenes o haz clic para seleccionar
              </p>
            </div>
            <UploadZone onFilesUploaded={handleFilesUploaded} />
          </div>

          {/* Gallery Section */}
          {uploadedPlans.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">Tus Planos ({uploadedPlans.length})</h3>
                <Button variant="outline" size="sm" onClick={() => setUploadedPlans([])}>
                  Limpiar Todo
                </Button>
              </div>
              <FloorPlanGallery plans={uploadedPlans} />
            </div>
          )}

          {/* Empty State */}
          {uploadedPlans.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <UploadIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No hay planos subidos aún</h3>
                <p className="text-muted-foreground">Sube tu primer plano para comenzar a visualizarlo en 3D</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

