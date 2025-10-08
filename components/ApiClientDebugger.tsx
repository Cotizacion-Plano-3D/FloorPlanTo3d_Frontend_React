'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { Server, Database, Key } from 'lucide-react'

export function ApiClientDebugger() {
  const checkApiClientState = () => {
    // Acceder al estado interno del API client (usando any para debugging)
    const clientState = (apiClient as any)
    console.log('🔍 API Client State:', {
      hasToken: !!clientState.token,
      tokenLength: clientState.token?.length || 0,
      tokenPreview: clientState.token?.substring(0, 20) + '...' || 'No token'
    })
    
    return {
      hasToken: !!clientState.token,
      tokenLength: clientState.token?.length || 0,
      tokenPreview: clientState.token?.substring(0, 20) + '...' || 'No token'
    }
  }

  const clearApiClientToken = () => {
    apiClient.setToken(null)
    console.log('🗑️ API Client token cleared')
  }

  const syncWithLocalStorage = () => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      apiClient.setToken(savedToken)
      console.log('🔄 API Client synced with localStorage')
    } else {
      console.log('❌ No token in localStorage to sync')
    }
  }

  const state = checkApiClientState()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          API Client Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado del API Client */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="text-sm font-medium">Token:</span>
            <Badge variant={state.hasToken ? "default" : "secondary"}>
              {state.hasToken ? "Presente" : "Ausente"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">Longitud:</span>
            <Badge variant="outline">
              {state.tokenLength} chars
            </Badge>
          </div>
        </div>

        {/* Información del Token */}
        {state.hasToken && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Token Info:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Preview:</strong> {state.tokenPreview}</p>
              <p><strong>Longitud:</strong> {state.tokenLength} caracteres</p>
            </div>
          </div>
        )}

        {/* Botones de Debug */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkApiClientState}
          >
            Verificar Estado
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearApiClientToken}
          >
            Limpiar Token
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncWithLocalStorage}
          >
            Sincronizar con LocalStorage
          </Button>
        </div>

        {/* Comparación con localStorage */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Comparación:</h4>
          <div className="text-sm space-y-1">
            <p><strong>API Client Token:</strong> {state.hasToken ? 'Presente' : 'Ausente'}</p>
            <p><strong>LocalStorage Token:</strong> {localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'}</p>
            <p><strong>Sincronizado:</strong> {
              state.hasToken === !!localStorage.getItem('auth_token') ? 'Sí' : 'No'
            }</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
