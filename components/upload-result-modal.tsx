"use client"

import { CheckCircle, AlertCircle, Eye, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Plano } from "@/types/api"

interface UploadResultModalProps {
  plano: Plano | null
  error: string | null
  onClose: () => void
  onConvert?: (planoId: number) => void
  isVerificationError?: boolean
}

export function UploadResultModal({ plano, error, onClose, onConvert, isVerificationError = false }: UploadResultModalProps) {
  const router = useRouter()

  if (!plano && !error) return null

  const handleViewPlano = () => {
    if (plano) {
      // Ir al viewer sin importar el estado
      // El viewer manejará el estado y mostrará el progreso si es necesario
      router.push(`/viewer/plano/${plano.id}`)
    }
  }

  const handleConvert = () => {
    if (plano && onConvert) {
      onConvert(plano.id)
    }
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success State */}
        {plano && !error && (
          <>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">¡Plano Convertido a 3D!</h2>
              <p className="text-muted-foreground">
                Tu plano <span className="font-semibold text-foreground">"{plano.nombre}"</span> ha sido verificado y convertido exitosamente a 3D.
              </p>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Plano verificado como válido<br/>
                  ✅ Convertido a modelo 3D<br/>
                  ✅ Listo para visualizar
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <span className={`text-sm font-medium ${
                  plano.estado === 'completado' ? 'text-green-600' :
                  plano.estado === 'procesando' ? 'text-yellow-600' :
                  plano.estado === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {plano.estado === 'completado' ? 'Completado' :
                   plano.estado === 'procesando' ? 'Procesando' :
                   plano.estado === 'error' ? 'Error' : 'Subido'}
                </span>
              </div>

              {plano.tipo_plano && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <span className="text-sm font-medium text-foreground">{plano.tipo_plano}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {plano.estado === 'completado' ? (
                <>
                  <Button onClick={handleViewPlano} className="w-full" size="lg">
                    <Eye className="w-5 h-5 mr-2" />
                    Visualizar en 3D
                  </Button>
                  <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                    Ir al Dashboard
                  </Button>
                </>
              ) : plano.estado === 'subido' || plano.estado === 'procesando' ? (
                <>
                  <Button onClick={handleViewPlano} className="w-full" size="lg">
                    <Eye className="w-5 h-5 mr-2" />
                    {plano.estado === 'procesando' ? 'Ver Progreso' : 'Visualizar en 3D'}
                  </Button>
                  <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                    Ver Mis Planos
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-center text-muted-foreground">
                    El plano se está procesando. Puedes ver el progreso en tu dashboard.
                  </p>
                  <Button onClick={handleGoToDashboard} className="w-full">
                    Ir al Dashboard
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Error State */}
        {error && (
          <>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {isVerificationError ? 'Archivo No Válido' : 'Error al Subir'}
              </h2>
              <p className="text-muted-foreground">
                {isVerificationError 
                  ? 'El archivo no es un plano arquitectónico válido.'
                  : 'Hubo un problema al procesar tu archivo.'
                }
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
                {isVerificationError && (
                  <div className="mt-2 text-xs text-red-700">
                    <p><strong>Tipos de archivos válidos:</strong></p>
                    <p>• Planos arquitectónicos con paredes, puertas y ventanas</p>
                    <p>• Imágenes claras de plantas arquitectónicas</p>
                    <p>• Formatos: JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={onClose} className="w-full">
                Intentar Nuevamente
              </Button>
              <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                Ir al Dashboard
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

