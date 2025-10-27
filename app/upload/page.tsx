"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadZone } from "@/components/upload-zone"
import { FloorPlanGallery } from "@/components/floor-plan-gallery"
import { apiClient } from "@/lib/api"
import { Plano, PlanoListResponse } from "@/types/api"
import { useAuth } from "@/contexts/AuthContext"

export default function UploadPage() {
  const [uploadedPlans, setUploadedPlans] = useState<Array<{ id: string; url: string; name: string }>>([])
  const [userPlanos, setUserPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadUserPlanos()
    }
  }, [user])

  const loadUserPlanos = async () => {
    try {
      setLoading(true)
      const response: PlanoListResponse = await apiClient.getPlanos()
      setUserPlanos(response.planos)
    } catch (error) {
      console.error('Error cargando planos del usuario:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanoDeleted = (planoId: number) => {
    setUserPlanos(prev => prev.filter(plano => plano.id !== planoId))
  }

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

          {/* User's Planos Section */}
          {user && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">Mis Planos Guardados ({userPlanos.length})</h3>
                <Button variant="outline" size="sm" onClick={loadUserPlanos}>
                  Actualizar
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando planos...</p>
                  </div>
                </div>
              ) : userPlanos.length > 0 ? (
                <FloorPlanGallery plans={userPlanos} onPlanoDeleted={handlePlanoDeleted} />
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <UploadIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">No tienes planos guardados aún</h3>
                    <p className="text-muted-foreground">Sube tu primer plano para comenzar a visualizarlo en 3D</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Section for newly uploaded files */}
          {uploadedPlans.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">Archivos Recién Subidos ({uploadedPlans.length})</h3>
                <Button variant="outline" size="sm" onClick={() => setUploadedPlans([])}>
                  Limpiar Todo
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedPlans.map((plan) => (
                  <div key={plan.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-md">
                    <div className="relative aspect-[4/3] bg-muted">
                      <img 
                        src={plan.url} 
                        alt={plan.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-card-foreground truncate">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">Archivo recién subido</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State for non-authenticated users */}
          {!user && uploadedPlans.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <UploadIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Inicia sesión para ver tus planos</h3>
                <p className="text-muted-foreground">Necesitas estar autenticado para ver y gestionar tus planos guardados</p>
                <Button asChild>
                  <Link href="/">Iniciar Sesión</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

