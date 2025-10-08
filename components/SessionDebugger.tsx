'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, User, Key, Shield } from 'lucide-react'

export function SessionDebugger() {
  const { user, token, isAuthenticated, isLoading, hasActiveSubscription, clearSession, forceLogout } = useAuth()

  const checkLocalStorage = () => {
    const savedToken = localStorage.getItem('auth_token')
    console.log('🔍 LocalStorage check:', {
      hasToken: !!savedToken,
      tokenLength: savedToken?.length || 0,
      tokenPreview: savedToken?.substring(0, 20) + '...'
    })
    return savedToken
  }

  const handleClearSession = () => {
    clearSession()
    console.log('🗑️ Session cleared using context function')
    window.location.reload()
  }

  const handleForceLogout = () => {
    forceLogout()
    console.log('🚨 Force logout executed')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Debug de Sesión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de Autenticación */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Autenticado:</span>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "Sí" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="text-sm font-medium">Token:</span>
            <Badge variant={token ? "default" : "secondary"}>
              {token ? "Presente" : "Ausente"}
            </Badge>
          </div>
        </div>

        {/* Información del Usuario */}
        {user && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Usuario Actual:</h4>
            <div className="text-sm space-y-1">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Nombre:</strong> {user.nombre}</p>
              <p><strong>Correo:</strong> {user.correo}</p>
              <p><strong>Suscripción:</strong> 
                <Badge variant={hasActiveSubscription ? "default" : "secondary"} className="ml-2">
                  {hasActiveSubscription ? "Activa" : "Inactiva"}
                </Badge>
              </p>
            </div>
          </div>
        )}

        {/* Estado de Carga */}
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando...</span>
          </div>
        )}

        {/* Botones de Debug */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkLocalStorage}
          >
            Verificar LocalStorage
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Recargar Página
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleClearSession}
          >
            Limpiar Sesión
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleForceLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            Forzar Logout
          </Button>
        </div>

        {/* Información del Token */}
        {token && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Token Info:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Longitud:</strong> {token.length} caracteres</p>
              <p><strong>Preview:</strong> {token.substring(0, 20)}...</p>
              <p><strong>LocalStorage:</strong> {localStorage.getItem('auth_token') ? 'Sincronizado' : 'No sincronizado'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
