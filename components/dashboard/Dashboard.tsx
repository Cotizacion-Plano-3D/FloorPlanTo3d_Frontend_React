'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMembresias, useSuscripciones, usePagos } from '@/hooks/useApi'
import { SessionDebugger } from '@/components/SessionDebugger'
import { ApiClientDebugger } from '@/components/ApiClientDebugger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Loader2, 
  LogOut, 
  User, 
  CreditCard, 
  Calendar, 
  Settings,
  Upload,
  Download,
  Eye,
  Zap,
  Shield,
  Users,
  FileText,
  ArrowRight,
  Crown,
  Star,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PricingSection } from '@/components/pricing-section'

// Mockup de funcionalidades por tipo de membresía
const MEMBRESIA_FEATURES = {
  'Gratis': {
    features: [
      { name: 'Subir planos básicos', icon: Upload, available: true },
      { name: 'Conversión 2D a 3D limitada', icon: Eye, available: true },
      { name: 'Exportación PDF', icon: Download, available: true },
      { name: 'Soporte por email', icon: FileText, available: true },
    ],
    limits: {
      uploadsPerMonth: 5,
      rendersPerMonth: 10,
      maxFileSize: '10MB'
    }
  },
  'Pro': {
    features: [
      { name: 'Subir planos ilimitados', icon: Upload, available: true },
      { name: 'Conversión 2D a 3D avanzada', icon: Eye, available: true },
      { name: 'Renderizado en tiempo real', icon: Zap, available: true },
      { name: 'Exportación múltiples formatos', icon: Download, available: true },
      { name: 'Colaboración en equipo', icon: Users, available: true },
      { name: 'Soporte prioritario', icon: Shield, available: true },
    ],
    limits: {
      uploadsPerMonth: 'Ilimitado',
      rendersPerMonth: 'Ilimitado',
      maxFileSize: '100MB'
    }
  },
  'Ultra': {
    features: [
      { name: 'Todas las funciones Pro', icon: Crown, available: true },
      { name: 'Procesamiento en servidores dedicados', icon: Zap, available: true },
      { name: 'API personalizada', icon: Settings, available: true },
      { name: 'Soporte dedicado 24/7', icon: Shield, available: true },
      { name: 'Integración BIM avanzada', icon: FileText, available: true },
      { name: 'Despliegue local', icon: Shield, available: true },
    ],
    limits: {
      uploadsPerMonth: 'Ilimitado',
      rendersPerMonth: 'Ilimitado',
      maxFileSize: 'Sin límite'
    }
  }
}

// Componente para usuarios SIN suscripción activa
function NoSubscriptionDashboard() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section')
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <span className="text-foreground text-xl font-semibold">FloorPlan3D</span>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <span className="text-sm text-muted-foreground">
                Bienvenido, {user?.nombre || 'Usuario'}
              </span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="space-y-8">
          
          {/* Estado de suscripción */}
          <Card className="border-orange-500/20 bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-orange-300">Suscripción Requerida</CardTitle>
              </div>
              <CardDescription className="text-orange-200/80">
                Para acceder a todas las funcionalidades de FloorPlan3D, necesitas una suscripción activa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-orange-400/30 text-orange-300 bg-orange-900/20">
                  Sin Suscripción Activa
                </Badge>
                <Button onClick={scrollToPricing} className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Star className="mr-2 h-4 w-4" />
                  Ver Planes Disponibles
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-300">¿Listo para más?</CardTitle>
              <CardDescription className="text-blue-200/80">
                Desbloquea todas las funcionalidades profesionales con nuestros planes de suscripción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={scrollToPricing} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowRight className="mr-2 h-4 w-4" />
                Explorar Planes
              </Button>
            </CardContent>
          </Card>

          {/* Sección de precios */}
          <div id="pricing-section">
            <PricingSection />
          </div>
        </div>
      </main>
    </div>
  )
}

// Componente para usuarios CON suscripción activa
function ActiveSubscriptionDashboard() {
  const { user, logout } = useAuth()
  const { membresias, isLoading: membresiasLoading } = useMembresias()
  const { suscripciones, isLoading: suscripcionesLoading, fetchSuscripciones } = useSuscripciones()
  const { pagos, isLoading: pagosLoading } = usePagos()

  // Refrescar datos cuando el usuario cambie
  useEffect(() => {
    if (user?.id) {
      fetchSuscripciones()
    }
  }, [user?.id]) // Removido fetchSuscripciones de las dependencias

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Obtener la suscripción activa del usuario
  const activeSubscription = suscripciones.find(sub => sub.estado === 'activa')
  const userMembresia = activeSubscription?.membresia?.nombre || 'Pro'
  const membresiaFeatures = MEMBRESIA_FEATURES[userMembresia as keyof typeof MEMBRESIA_FEATURES] || MEMBRESIA_FEATURES['Pro']

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <span className="text-foreground text-xl font-semibold">FloorPlan3D</span>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <span className="text-sm text-muted-foreground">
                Bienvenido, {user?.nombre || 'Usuario'}
              </span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="space-y-6">

          {/* Estado de suscripción */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Suscripción Activa</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                Plan {userMembresia} - Acceso completo a todas las funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="default" className="bg-green-600">
                  {userMembresia} Activo
                </Badge>
                {activeSubscription && (
                  <span className="text-sm text-muted-foreground">
                    Vence: {format(new Date(activeSubscription.fecha_fin), 'dd/MM/yyyy', { locale: es })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades disponibles */}
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades Disponibles</CardTitle>
              <CardDescription>
                Todas las funciones incluidas en tu plan {userMembresia}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {membresiaFeatures.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/50 border-green-200">
                    <feature.icon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium mb-2 text-green-800">Límites de tu Plan:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Subidas por mes: {membresiaFeatures.limits.uploadsPerMonth}</li>
                  <li>• Renders por mes: {membresiaFeatures.limits.rendersPerMonth}</li>
                  <li>• Tamaño máximo de archivo: {membresiaFeatures.limits.maxFileSize}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planos Procesados</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Renders Completados</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Ahorrado</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48h</div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="default" className="bg-green-600">Activo</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Plan {userMembresia}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="funcionalidades" className="space-y-4">
            <TabsList>
              <TabsTrigger value="funcionalidades">Funcionalidades</TabsTrigger>
              <TabsTrigger value="suscripciones">Mis Suscripciones</TabsTrigger>
              <TabsTrigger value="pagos">Historial de Pagos</TabsTrigger>
              <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="funcionalidades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Herramientas de Trabajo</CardTitle>
                  <CardDescription>
                    Accede a todas las herramientas profesionales de FloorPlan3D
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button className="h-20 flex flex-col items-center justify-center gap-2">
                      <Upload className="h-6 w-6" />
                      <span>Subir Planos</span>
                    </Button>
                    <Button className="h-20 flex flex-col items-center justify-center gap-2">
                      <Eye className="h-6 w-6" />
                      <span>Vista Previa 3D</span>
                    </Button>
                    <Button className="h-20 flex flex-col items-center justify-center gap-2">
                      <Zap className="h-6 w-6" />
                      <span>Renderizado</span>
                    </Button>
                    <Button className="h-20 flex flex-col items-center justify-center gap-2">
                      <Download className="h-6 w-6" />
                      <span>Exportar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suscripciones" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Suscripciones</CardTitle>
                  <CardDescription>
                    Gestiona tus suscripciones activas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {suscripcionesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Membresía</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha Inicio</TableHead>
                          <TableHead>Fecha Fin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suscripciones.map((suscripcion) => (
                          <TableRow key={suscripcion.id}>
                            <TableCell>{suscripcion.membresia?.nombre || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={suscripcion.estado === 'activa' ? 'default' : 'secondary'}
                              >
                                {suscripcion.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(suscripcion.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                            </TableCell>
                            <TableCell>
                              {format(new Date(suscripcion.fecha_fin), 'dd/MM/yyyy', { locale: es })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pagos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pagos</CardTitle>
                  <CardDescription>
                    Revisa todas tus transacciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pagosLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagos.map((pago) => (
                          <TableRow key={pago.id}>
                            <TableCell>
                              {format(new Date(pago.fecha_pago), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </TableCell>
                            <TableCell>${pago.monto}</TableCell>
                            <TableCell>{pago.metodo_pago}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={pago.estado === 'completado' ? 'default' : 'secondary'}
                              >
                                {pago.estado}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="perfil" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>
                    Gestiona tu información personal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nombre</label>
                      <p className="text-sm text-muted-foreground">{user?.nombre || 'No disponible'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Correo</label>
                      <p className="text-sm text-muted-foreground">{user?.correo || 'No disponible'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Plan Actual</label>
                      <p className="text-sm text-muted-foreground">{userMembresia}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Miembro desde</label>
                      <p className="text-sm text-muted-foreground">
                        {user?.fecha_creacion ? 
                          format(new Date(user.fecha_creacion), 'dd/MM/yyyy', { locale: es }) : 
                          'No disponible'
                        }
                      </p>
                    </div>
                    <Button>
                      <Settings className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// Componente principal del Dashboard
export function Dashboard() {
  const { user, isLoading: authLoading, hasActiveSubscription, checkSubscription } = useAuth()
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  // Manejar parámetros de URL para pagos
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const canceled = urlParams.get('canceled')
    
    if (success === 'true') {
      setPaymentStatus('success')
      // Refrescar el estado de suscripción después de un pago exitoso
      if (user?.id) {
        // Esperar un poco para que el webhook procese la suscripción
        setTimeout(async () => {
          console.log('🔄 Refrescando estado de suscripción después del pago...')
          await checkSubscription()
          // También refrescar los datos del usuario para obtener el estado más reciente
          window.location.reload()
        }, 2000) // 2 segundos de delay
      }
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (canceled === 'true') {
      setPaymentStatus('canceled')
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [user?.id, checkSubscription])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No estás autenticado</h2>
          <p className="text-muted-foreground mb-4">Por favor, inicia sesión para acceder al dashboard.</p>
          <Button onClick={() => window.location.href = '/'}>
            Ir al Inicio
          </Button>
        </div>
      </div>
    )
  }

  // Renderizar el dashboard apropiado según el estado de suscripción
  return (
    <>
      {/* Mostrar estado del pago */}
      {paymentStatus === 'success' && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2" />
            <span>¡Pago exitoso! Tu suscripción ha sido activada.</span>
          </div>
        </div>
      )}
      
      {paymentStatus === 'canceled' && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <span>Pago cancelado. Puedes intentar nuevamente cuando quieras.</span>
          </div>
        </div>
      )}
      
      {hasActiveSubscription ? <ActiveSubscriptionDashboard /> : <NoSubscriptionDashboard />}
    </>
  )
}