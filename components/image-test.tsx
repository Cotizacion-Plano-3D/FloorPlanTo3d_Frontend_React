"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ImageTestProps {
  url: string
  title: string
  planoId?: number
}

export function ImageTest({ url, title, planoId }: ImageTestProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const testImage = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('🧪 Probando URL original:', url)
      
      // Test 1: URL original de Google Drive
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'cors',
          credentials: 'omit'
        })
        console.log('📡 Response status (original):', response.status)
        console.log('📡 Response headers (original):', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          console.log('✅ URL original accesible')
        } else {
          console.log('❌ URL original no accesible:', response.status)
        }
      } catch (err) {
        console.log('❌ Error con URL original (esperado):', err)
      }
      
      // Test 2: Endpoint proxy (si tenemos planoId)
      if (planoId) {
        const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/planos/${planoId}/image`
        console.log('🧪 Probando URL proxy:', proxyUrl)
        
        const proxyResponse = await fetch(proxyUrl, { 
          method: 'HEAD',
          mode: 'cors',
          credentials: 'include'
        })
        console.log('📡 Response status (proxy):', proxyResponse.status)
        console.log('📡 Response headers (proxy):', Object.fromEntries(proxyResponse.headers.entries()))
        
        if (proxyResponse.ok) {
          setSuccess(true)
          console.log('✅ URL proxy accesible')
        } else {
          const errorText = await proxyResponse.text()
          setError(`Proxy HTTP ${proxyResponse.status}: ${proxyResponse.statusText} - ${errorText}`)
          console.error('❌ URL proxy no accesible:', proxyResponse.status, proxyResponse.statusText, errorText)
        }
      } else {
        setError('No se puede probar proxy sin planoId')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error: ${errorMsg}`)
      console.error('❌ Error en test:', err)
    } finally {
      setLoading(false)
    }
  }

  const openInNewTab = () => {
    window.open(url, '_blank')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground break-all">{url}</p>
          
          <div className="flex gap-2">
            <Button 
              onClick={testImage} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? 'Probando...' : 'Probar URL'}
            </Button>
            
            <Button 
              onClick={openInNewTab}
              size="sm"
              variant="outline"
            >
              Abrir en Nueva Pestaña
            </Button>
          </div>
          
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              ❌ {error}
            </div>
          )}
          
          {success && (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs">
              ✅ URL accesible
            </div>
          )}
        </div>
        
        <div className="border rounded p-2">
          <img 
            src={planoId ? `${process.env.NEXT_PUBLIC_API_URL}/planos/${planoId}/image` : url} 
            alt={title}
            className="w-full h-32 object-cover"
            onError={(e) => {
              console.error('❌ Error en img tag:', e)
              console.error('❌ URL que falló:', planoId ? `${process.env.NEXT_PUBLIC_API_URL}/planos/${planoId}/image` : url)
              console.error('❌ Evento nativo:', e.nativeEvent)
              setError('Error cargando imagen en img tag')
            }}
            onLoad={() => {
              console.log('✅ Imagen cargada en img tag')
              setSuccess(true)
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
