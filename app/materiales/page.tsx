"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { AddMaterialDialog } from "@/components/add-material-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Edit, Trash2, Image as ImageIcon } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Material, Categoria } from "@/types/api"
import { toast } from "sonner"

export default function MaterialesPage() {
  const { user, isLoading: authLoading, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [materiales, setMateriales] = useState<Material[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all")

  // Sincronizar token con apiClient
  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
    }
  }, [token])

  // Verificar autenticación y cargar datos
  useEffect(() => {
    if (authLoading) {
      return // Esperar a que termine de cargar
    }

    if (!user || !token) {
      // No hay usuario o token, redirigir a login
      router.push('/login')
      return
    }

    // Usuario autenticado, cargar datos
    loadData()
  }, [authLoading, user, token, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [materialesRes, categoriasRes] = await Promise.all([
        apiClient.getMateriales(),
        apiClient.getCategorias()
      ])

      if (materialesRes?.data?.materiales) {
        setMateriales(materialesRes.data.materiales)
      }

      if (categoriasRes?.data?.categorias) {
        setCategorias(categoriasRes.data.categorias)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar materiales')
    } finally {
      setLoading(false)
    }
  }

  const filteredMateriales = materiales.filter(material => {
    const matchesSearch = material.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = selectedCategoria === "all" || material.categoria_id.toString() === selectedCategoria
    return matchesSearch && matchesCategoria
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Biblioteca de Materiales</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona texturas y materiales para tus proyectos 3D
              </p>
            </div>
            <AddMaterialDialog onMaterialAdded={loadData} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid de materiales */}
        {filteredMateriales.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay materiales</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedCategoria !== "all" 
                  ? "No se encontraron materiales con los filtros aplicados"
                  : "Comienza agregando tu primer material"}
              </p>
              {!searchTerm && selectedCategoria === "all" && (
                <AddMaterialDialog onMaterialAdded={loadData} />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMateriales.map((material) => (
              <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-muted">
                  {material.imagen_url ? (
                    <img
                      src={material.imagen_url}
                      alt={material.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2">
                    {material.codigo}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-base line-clamp-1">{material.nombre}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {material.descripcion || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Categoría:</span>
                      <Badge variant="outline">
                        {categorias.find(c => c.id === material.categoria_id)?.nombre || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="font-semibold">
                        ${material.precio_base}/{material.unidad_medida}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredMateriales.length} de {materiales.length} materiales
          </p>
          <p>
            {categorias.length} categorías disponibles
          </p>
        </div>
      </div>
    </div>
  )
}
