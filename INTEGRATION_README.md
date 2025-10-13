# Integración FloorPlan To 3D

## 🎯 Descripción

Este proyecto integra el frontend de React con dos backends:
1. **FastAPI Backend** (`FloorPlanTo3d_Fast_Api`) - Para autenticación, pagos y gestión de usuarios
2. **FloorPlanTo3D API** (`FloorPlanTo3D-API`) - Para conversión de planos 2D a 3D usando Deep Learning

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│         Frontend (Next.js + React)              │
│  FloorPlanTo3d_Frontend_React                   │
│                                                  │
│  ┌────────────────┐  ┌─────────────────────┐   │
│  │   Dashboard    │  │   Upload & Viewer   │   │
│  │  (Auth, Pagos) │  │  (Conversión 3D)    │   │
│  └────────┬───────┘  └──────────┬──────────┘   │
└───────────┼──────────────────────┼──────────────┘
            │                      │
            │                      │
    ┌───────▼────────┐     ┌──────▼──────────┐
    │   FastAPI      │     │  FloorPlan API  │
    │   Backend      │     │   (Flask)       │
    │  (Port 8000)   │     │  (Port 5000)    │
    │                │     │                 │
    │ - Auth         │     │ - Mask R-CNN    │
    │ - Pagos        │     │ - Conversión 3D │
    │ - Suscripciones│     │ - Three.js Data │
    └────────────────┘     └─────────────────┘
```

## 📦 Componentes Creados

### 1. **Servicio de API FloorPlan** (`lib/floorplan-api.ts`)
Cliente para comunicarse con el backend de conversión de planos.

**Funcionalidades:**
- `convertFloorPlan()` - Envía imagen y recibe datos 3D
- `getAvailableFormats()` - Obtiene formatos disponibles
- `healthCheck()` - Verifica disponibilidad de la API

**Formatos soportados:**
- `unity` - Formato original para Unity
- `web` - Formato optimizado para web
- `threejs` - Formato específico para Three.js (usado en este proyecto)

### 2. **Sistema de Almacenamiento** (`lib/floor-plan-storage.ts`)
Gestiona el almacenamiento local de planos procesados.

**Funcionalidades:**
- `saveFloorPlan()` - Guarda plano procesado
- `getAllFloorPlans()` - Obtiene todos los planos
- `getFloorPlan(id)` - Obtiene plano por ID
- `deleteFloorPlan(id)` - Elimina plano
- `clearAll()` - Limpia todos los planos

### 3. **Componente UploadZone** (`components/upload-zone.tsx`)
Zona de carga de archivos con procesamiento automático.

**Características:**
- Drag & drop de imágenes
- Procesamiento automático con la API
- Indicadores de progreso por archivo
- Manejo de errores
- Redirección automática al viewer después de procesar

### 4. **Componente FloorPlan3DViewer** (`components/floor-plan-3d-viewer.tsx`)
Visualizador 3D usando Three.js y React Three Fiber.

**Características:**
- Renderiza objetos 3D del backend (paredes, ventanas, puertas)
- Controles de cámara (órbita, zoom)
- Auto-rotación opcional
- Panel de información de objetos detectados
- Iluminación y sombras realistas

### 5. **Página Viewer** (`app/viewer/[id]/page.tsx`)
Página para visualizar planos procesados.

**Características:**
- Carga planos desde almacenamiento local
- Manejo de estados (loading, error)
- Controles de visualización
- Información del plano

## 🚀 Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Configura las URLs de los backends:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FLOORPLAN_API_URL=http://localhost:5000
```

### 2. Iniciar los Backends

#### Backend FastAPI:
```bash
cd FloorPlanTo3d_Fast_Api
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:application --reload --port 8000
```

#### Backend FloorPlanTo3D:
```bash
cd FloorPlanTo3D-API
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python application.py
```

### 3. Iniciar el Frontend

```bash
cd FloorPlanTo3d_Frontend_React
npm install
npm run dev
```

## 🔄 Flujo de Usuario

### 1. **Autenticación y Suscripción**
1. Usuario se registra/inicia sesión (FastAPI Backend)
2. Usuario compra una suscripción (Stripe + FastAPI)
3. Dashboard muestra estado de suscripción

### 2. **Subir y Convertir Plano**
1. Usuario hace clic en "Subir Planos" en el Dashboard
2. Usuario arrastra/selecciona imagen del plano
3. Usuario hace clic en "Convertir a 3D"
4. El frontend envía la imagen a FloorPlanTo3D API
5. La API procesa la imagen con Mask R-CNN
6. La API devuelve objetos 3D detectados (paredes, ventanas, puertas)
7. El frontend guarda los datos en localStorage
8. Usuario es redirigido automáticamente al viewer

### 3. **Visualizar Plano 3D**
1. Viewer carga datos del plano desde localStorage
2. Renderiza objetos 3D usando Three.js
3. Usuario puede rotar, hacer zoom, activar auto-rotación
4. Se muestran estadísticas de objetos detectados

## 📊 Estructura de Datos

### Datos guardados en localStorage:

```typescript
interface StoredFloorPlan {
  id: string                          // ID único del plano
  name: string                        // Nombre del archivo
  uploadDate: string                  // Fecha de subida
  imageUrl: string                    // Blob URL de la imagen
  threejsData: {
    scene: {
      name: string
      units: string
      bounds: {
        width: number
        height: number
      }
    }
    objects: Array<{
      id: string
      type: 'wall' | 'window' | 'door'
      position: { x, y, z }
      dimensions: { width, height, depth }
      rotation: { x, y, z }
    }>
    camera: {
      position: { x, y, z }
      target: { x, y, z }
    }
  }
}
```

## 🎨 Personalización

### Colores de Objetos 3D

En `components/floor-plan-3d-viewer.tsx`:

```typescript
const getColor = (type: string) => {
  switch (type) {
    case 'wall':
      return '#8B4513'  // Marrón para paredes
    case 'window':
      return '#87CEEB'  // Azul cielo para ventanas
    case 'door':
      return '#DEB887'  // Beige para puertas
  }
}
```

### Opacidad de Objetos

```typescript
const getOpacity = (type: string) => {
  switch (type) {
    case 'wall':
      return 0.9  // Paredes casi opacas
    case 'window':
      return 0.3  // Ventanas transparentes
    case 'door':
      return 0.7  // Puertas semi-transparentes
  }
}
```

## 🐛 Troubleshooting

### Error: "FloorPlan API no disponible"

**Solución:**
1. Verifica que el backend Flask esté corriendo en el puerto 5000
2. Verifica que `NEXT_PUBLIC_FLOORPLAN_API_URL` esté configurado correctamente
3. Verifica CORS en `application.py`

### Error: "Plano no encontrado"

**Solución:**
1. El plano puede haber sido eliminado del localStorage
2. Verifica que el ID en la URL sea correcto
3. Intenta subir el plano nuevamente

### Error al procesar imagen

**Solución:**
1. Verifica que la imagen sea un formato válido (JPG, PNG)
2. Verifica que el modelo de Mask R-CNN esté cargado correctamente
3. Revisa los logs del backend Flask

### Objetos 3D no se renderizan correctamente

**Solución:**
1. Verifica que los datos de `threejsData` estén completos
2. Abre la consola del navegador para ver errores de Three.js
3. Verifica que las dimensiones de los objetos no sean 0

## 📝 Notas Técnicas

### Limitaciones del Backend

- El backend procesa un archivo a la vez
- El procesamiento puede tardar de 5-30 segundos según la imagen
- Los modelos requieren al menos 2GB de RAM

### Almacenamiento Local

- Los planos se guardan en localStorage del navegador
- Límite aproximado: 5-10MB
- Los datos se pierden si se limpia el navegador
- Para producción, considerar backend storage

### Rendimiento del Viewer

- Three.js puede ser intensivo en GPU
- Se recomienda limitar a <100 objetos por escena
- Usar decimation si hay demasiados objetos

## 🎯 Próximos Pasos

1. **Persistencia Backend**: Guardar planos en base de datos
2. **Exportación**: Añadir exportación a diferentes formatos (OBJ, FBX, GLTF)
3. **Edición**: Permitir editar objetos 3D en el viewer
4. **Colaboración**: Compartir planos entre usuarios
5. **Optimización**: Mejorar velocidad de procesamiento
6. **Texturas**: Añadir texturas realistas a objetos 3D

## 📞 Soporte

Para preguntas o problemas:
1. Revisa los logs de ambos backends
2. Revisa la consola del navegador
3. Verifica la configuración de variables de entorno

