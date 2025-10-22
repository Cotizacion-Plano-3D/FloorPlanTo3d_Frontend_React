"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, ImageIcon, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { UploadResultModal } from "@/components/upload-result-modal"
import { Plano } from "@/types/api"

interface UploadZoneProps {
  onFilesUploaded?: (files: File[]) => void
}

export function UploadZone({ onFilesUploaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<{ [key: string]: 'pending' | 'processing' | 'success' | 'error' }>({})
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({})
  const [uploadedPlano, setUploadedPlano] = useState<Plano | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [isVerificationError, setIsVerificationError] = useState(false)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

    if (files.length > 0) {
      setSelectedFiles(files)
      // Inicializar estado de progreso
      const initialProgress: { [key: string]: 'pending' } = {}
      files.forEach(file => {
        initialProgress[file.name] = 'pending'
      })
      setProgress(initialProgress)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))

    if (files.length > 0) {
      setSelectedFiles(files)
      // Inicializar estado de progreso
      const initialProgress: { [key: string]: 'pending' } = {}
      files.forEach(file => {
        initialProgress[file.name] = 'pending'
      })
      setProgress(initialProgress)
    }
  }, [])

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    // Verificar autenticación
    if (!isAuthenticated || !user) {
      toast.error("Debes estar autenticado para subir planos")
      router.push('/')
      return
    }

    console.log('👤 Usuario autenticado:', user.correo)
    console.log('🔑 Token presente:', !!apiClient.token)

    setProcessing(true)

    try {
      // Procesar cada archivo
      for (const file of selectedFiles) {
        try {
          // Marcar como procesando
          setProgress(prev => ({ ...prev, [file.name]: 'processing' }))

          // Crear FormData para enviar el archivo
          const formData = new FormData()
          formData.append('file', file)
          formData.append('nombre', file.name)
          formData.append('formato', file.type.split('/')[1] || 'image')
          formData.append('tipo_plano', 'arquitectónico')
          formData.append('descripcion', `Plano subido el ${new Date().toLocaleDateString()}`)

          // Subir el plano usando la nueva API (ahora incluye verificación y conversión)
          console.log(`🔄 Procesando archivo: ${file.name}`)
          const plano = await apiClient.createPlano(formData)

          // Marcar como exitoso
          setProgress(prev => ({ ...prev, [file.name]: 'success' }))

          // Callback opcional
          if (onFilesUploaded) {
            onFilesUploaded([file])
          }

          toast.success(`Plano "${file.name}" verificado y convertido a 3D exitosamente`)

          // Mostrar modal de éxito (ya convertido)
          setUploadedPlano(plano)
          setUploadError(null)
          setIsVerificationError(false)
          setShowResultModal(true)

        } catch (error) {
          console.error(`Error procesando ${file.name}:`, error)
          setProgress(prev => ({ ...prev, [file.name]: 'error' }))
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
          setErrorMessages(prev => ({
            ...prev,
            [file.name]: errorMsg
          }))
          
          // Determinar si es error de verificación
          const isVerificationError = errorMsg.includes('no es un plano') || 
                                    errorMsg.includes('no contiene elementos') ||
                                    errorMsg.includes('arquitectónico válido') ||
                                    errorMsg.includes('reconocibles') ||
                                    errorMsg.includes('no pudo procesar la imagen') ||
                                    errorMsg.includes('Formato de imagen no soportado') ||
                                    errorMsg.includes('Imagen corrupta o inválida') ||
                                    errorMsg.includes('Respuesta inválida del sistema') ||
                                    errorMsg.includes('Tiempo de procesamiento excedido')
          
          if (isVerificationError) {
            toast.error(`"${file.name}" no es un plano arquitectónico válido`)
          } else {
            toast.error(`Error procesando "${file.name}"`)
          }
          
          // Mostrar modal de error
          setUploadedPlano(null)
          setUploadError(errorMsg)
          setIsVerificationError(isVerificationError)
          setShowResultModal(true)
        }
      }
    } finally {
      setProcessing(false)
      // Limpiar archivos después de un tiempo si todos fueron exitosos
      setTimeout(() => {
        const allSuccess = Object.values(progress).every(status => status === 'success')
        if (allSuccess) {
          setSelectedFiles([])
          setProgress({})
        }
      }, 2000)
    }
  }

  const removeFile = (index: number) => {
    const file = selectedFiles[index]
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[file.name]
      return newProgress
    })
    setErrorMessages(prev => {
      const newErrors = { ...prev }
      delete newErrors[file.name]
      return newErrors
    })
  }

  const getFileStatusIcon = (fileName: string) => {
    const status = progress[fileName]
    switch (status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <ImageIcon className="w-5 h-5 text-primary" />
    }
  }

  const handleConvertPlano = async (planoId: number) => {
    try {
      await apiClient.convertirPlanoA3D(planoId)
      toast.success('Conversión iniciada')
      setShowResultModal(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error convirtiendo plano:', error)
      toast.error('Error al iniciar la conversión')
    }
  }

  return (
    <div className="space-y-4">
      {/* Modal de resultado */}
      {showResultModal && (
        <UploadResultModal
          plano={uploadedPlano}
          error={uploadError}
          isVerificationError={isVerificationError}
          onClose={() => {
            setShowResultModal(false)
            setUploadedPlano(null)
            setUploadError(null)
            setIsVerificationError(false)
          }}
          onConvert={handleConvertPlano}
        />
      )}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-accent/5",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="block cursor-pointer">
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
          <div className="p-12 text-center space-y-4">
            <div
              className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors",
                isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Upload className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {isDragging ? "¡Suelta aquí!" : "Arrastra y suelta tus planos"}
              </h3>
              <p className="text-muted-foreground">
                o <span className="text-primary font-medium">haz clic para seleccionar</span>
              </p>
              <p className="text-sm text-muted-foreground">Soporta JPG, PNG, WebP y otros formatos de imagen</p>
            </div>
          </div>
        </label>
      </Card>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-card-foreground">Archivos Seleccionados ({selectedFiles.length})</h4>
              <Button 
                onClick={handleUpload} 
                className="bg-primary text-primary-foreground"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Plano
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getFileStatusIcon(file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                      {progress[file.name] === 'processing' && ' - Procesando...'}
                      {progress[file.name] === 'success' && ' - ✓ Subido exitosamente'}
                      {progress[file.name] === 'error' && ` - Error: ${errorMessages[file.name]}`}
                    </p>
                  </div>
                  {!processing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

