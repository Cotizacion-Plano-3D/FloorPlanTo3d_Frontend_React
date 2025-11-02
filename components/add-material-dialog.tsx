"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Loader2, Image as ImageIcon } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Categoria } from "@/types/api"
import { toast } from "sonner"

export function AddMaterialDialog({ onMaterialAdded }: { onMaterialAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_base: '',
    unidad_medida: 'm2',
    categoria_id: '',
  })

  useEffect(() => {
    if (open) {
      loadCategorias()
    }
  }, [open])

  const loadCategorias = async () => {
    try {
      const response = await apiClient.getCategorias()
      if (response?.data?.categorias) {
        setCategorias(response.data.categorias)
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
      toast.error('Error al cargar categorías')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Usa JPG, PNG, WEBP o GIF')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB')
      return
    }

    setSelectedFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Por favor selecciona una imagen de textura')
      return
    }

    if (!formData.categoria_id) {
      toast.error('Por favor selecciona una categoría')
      return
    }

    try {
      setLoading(true)

      // Crear FormData para enviar al backend
      const submitData = new FormData()
      submitData.append('imagen', selectedFile)
      submitData.append('codigo', formData.codigo)
      submitData.append('nombre', formData.nombre)
      submitData.append('categoria_id', formData.categoria_id)
      submitData.append('precio_base', formData.precio_base)
      submitData.append('unidad_medida', formData.unidad_medida)
      if (formData.descripcion) {
        submitData.append('descripcion', formData.descripcion)
      }

      const response = await apiClient.createMaterialWithImage(submitData)

      if (response?.data) {
        toast.success('Material creado exitosamente con textura')
        setOpen(false)
        resetForm()
        onMaterialAdded?.()
      }
    } catch (error: any) {
      console.error('Error creando material:', error)
      toast.error(error.message || 'Error al crear material')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio_base: '',
      unidad_medida: 'm2',
      categoria_id: '',
    })
    setSelectedFile(null)
    setImagePreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Material con Textura</DialogTitle>
          <DialogDescription>
            Agrega un nuevo material con su imagen de textura a la biblioteca
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview de imagen */}
          <div className="space-y-2">
            <Label>Imagen de Textura *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedFile(null)
                      setImagePreview(null)
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click para subir imagen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP, GIF (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: CER-001"
                required
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoria_id}
                onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Cerámica Blanca Mate 30x30"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del material..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="precio">Precio Base *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_base}
                onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            {/* Unidad de medida */}
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad de Medida *</Label>
              <Select
                value={formData.unidad_medida}
                onValueChange={(value) => setFormData({ ...formData, unidad_medida: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m2">m² (metro cuadrado)</SelectItem>
                  <SelectItem value="m">m (metro lineal)</SelectItem>
                  <SelectItem value="unidad">Unidad</SelectItem>
                  <SelectItem value="kg">kg (kilogramo)</SelectItem>
                  <SelectItem value="l">l (litro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Material
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
