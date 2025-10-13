"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, ImageIcon, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { floorPlanApi, FloorPlanThreeJSResponse } from "@/lib/floorplan-api"
import { floorPlanStorage } from "@/lib/floor-plan-storage"
import { useRouter } from "next/navigation"

interface UploadZoneProps {
  onFilesUploaded?: (files: File[]) => void
}

export function UploadZone({ onFilesUploaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<{ [key: string]: 'pending' | 'processing' | 'success' | 'error' }>({})
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({})
  const router = useRouter()

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

    setProcessing(true)

    try {
      // Procesar cada archivo
      for (const file of selectedFiles) {
        try {
          // Marcar como procesando
          setProgress(prev => ({ ...prev, [file.name]: 'processing' }))

          // Convertir el plano usando la API de FloorPlan
          const result = await floorPlanApi.convertFloorPlan(file, 'threejs')

          // Crear URL de la imagen
          const imageUrl = URL.createObjectURL(file)

          // Generar ID único
          const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

          // Guardar el plano procesado
          floorPlanStorage.saveFloorPlan({
            id: planId,
            name: file.name,
            uploadDate: new Date().toISOString(),
            imageUrl: imageUrl,
            threejsData: result as FloorPlanThreeJSResponse,
          })

          // Marcar como exitoso
          setProgress(prev => ({ ...prev, [file.name]: 'success' }))

          // Callback opcional
          if (onFilesUploaded) {
            onFilesUploaded([file])
          }

          // Esperar un momento antes de redirigir al viewer
          setTimeout(() => {
            router.push(`/viewer/${planId}`)
          }, 1000)

        } catch (error) {
          console.error(`Error procesando ${file.name}:`, error)
          setProgress(prev => ({ ...prev, [file.name]: 'error' }))
          setErrorMessages(prev => ({
            ...prev,
            [file.name]: error instanceof Error ? error.message : 'Error desconocido'
          }))
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

  return (
    <div className="space-y-4">
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
                    Convertir a 3D
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
                      {progress[file.name] === 'success' && ' - ✓ Convertido exitosamente'}
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

