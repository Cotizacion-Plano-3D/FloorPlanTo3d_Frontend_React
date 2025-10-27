# Inicio Rápido - Renderizado 3D

## 🚀 Para Empezar

Esta guía te ayudará a entender y usar el sistema de renderizado 3D de planos en 5 minutos.

---

## 📋 Resumen

El sistema permite:
1. ✅ Subir un plano 2D (imagen)
2. ✅ Convertirlo automáticamente a un modelo 3D
3. ✅ Visualizarlo en un viewer interactivo
4. ✅ Cargar rápidamente modelos ya procesados

---

## 🎯 Flujo de Usuario

### 1. Subir un Plano

```
Usuario → /upload → Selecciona archivo → Click "Subir Plano"
  ↓
Modal de éxito aparece
  ↓
Sistema convierte automáticamente a 3D (~30 segundos)
  ↓
Click "Visualizar en 3D"
```

### 2. Visualizar en 3D

```
Usuario → /dashboard → Click "Ver en 3D" en cualquier plano
  ↓
Carga instantánea desde caché (< 1 segundo)
  ↓
Interactuar con el modelo:
  - Rotar: Click + Arrastrar
  - Zoom: Scroll
  - Mover: Click derecho + Arrastrar
```

---

## 🔧 Para Desarrolladores

### Arquitectura en 3 Capas

```
┌─────────────────┐
│    Frontend     │  React + Three.js
│   (Next.js)     │
└────────┬────────┘
         │
┌────────▼────────┐
│    Fast API     │  Python + FastAPI
│   (Backend)     │  PostgreSQL + Google Drive
└────────┬────────┘
         │
┌────────▼────────┐
│  Flask API      │  Python + TensorFlow
│  (IA Processor) │  Mask R-CNN
└─────────────────┘
```

### Setup Rápido

#### 1. FloorPlanTo3D-API (Flask)

```bash
cd FloorPlanTo3D-API
pip install -r requirements.txt
python application.py
# Corre en http://localhost:5000
```

#### 2. Fast API (Backend)

```bash
cd FloorPlanTo3d_Fast_Api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Corre en http://localhost:8000
```

Configurar `.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost/floorplan_db
FLOORPLAN_API_URL=http://localhost:5000
GOOGLE_DRIVE_CREDENTIALS_FILE=credentials.json
```

#### 3. Frontend (Next.js)

```bash
cd FloorPlanTo3d_Frontend_React
npm install
npm run dev
# Corre en http://localhost:3000
```

Configurar `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 Endpoints Clave

### Subir Plano
```http
POST /planos/
Content-Type: multipart/form-data
Authorization: Bearer {token}

file=<imagen>
nombre="mi_plano.jpg"
```

### Convertir a 3D
```http
POST /planos/{id}/convertir
Authorization: Bearer {token}
```

### Visualizar desde Caché (⚡ Rápido)
```http
GET /planos/{id}/render-3d
Authorization: Bearer {token}
```

---

## 💡 Ejemplo Completo

### Frontend (TypeScript)

```typescript
import { apiClient } from '@/lib/api'

// 1. Subir plano
const uploadPlano = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('nombre', file.name)
  
  const plano = await apiClient.createPlano(formData)
  console.log('Plano creado:', plano.id)
  
  // 2. Convertir automáticamente
  await apiClient.convertirPlanoA3D(plano.id)
  console.log('Conversión iniciada')
}

// 3. Visualizar desde caché
const visualizarPlano = async (planoId: number) => {
  const result = await apiClient.render3DFromCache(planoId)
  
  if (result.success) {
    // result.datos_json contiene el modelo 3D
    renderThreeJS(result.datos_json)
  }
}
```

### Backend (Python)

```python
from fastapi import FastAPI, UploadFile
from services.plano_service import PlanoService

app = FastAPI()

@app.post("/planos/")
async def create_plano(file: UploadFile, db: Session):
    # Leer contenido
    file_content = await file.read()
    
    # Crear plano
    plano_service = PlanoService(db)
    plano = plano_service.create_plano(
        plano_data=PlanoCreate(nombre=file.filename),
        usuario_id=current_user.id,
        file_content=file_content,
        filename=file.filename
    )
    
    return plano

@app.get("/planos/{plano_id}/render-3d")
async def render_3d(plano_id: int, db: Session):
    plano_service = PlanoService(db)
    
    # Obtener desde caché (rápido)
    result = plano_service.render_modelo3d_from_cache(
        plano_id, 
        current_user.id
    )
    
    return result
```

---

## 🎨 Componentes UI

### UploadZone
Componente de drag & drop para subir planos.

```tsx
import { UploadZone } from '@/components/upload-zone'

<UploadZone onFilesUploaded={(files) => {
  console.log('Archivos subidos:', files)
}} />
```

### FloorPlan3DViewer
Visualizador 3D interactivo con Three.js.

```tsx
import { FloorPlan3DViewer } from '@/components/floor-plan-3d-viewer'

<FloorPlan3DViewer 
  sceneData={{
    scene: modelo3d.scene,
    objects: modelo3d.objects
  }}
/>
```

### UploadResultModal
Modal que muestra el resultado de la subida.

```tsx
import { UploadResultModal } from '@/components/upload-result-modal'

<UploadResultModal
  plano={plano}
  error={null}
  onClose={() => setShowModal(false)}
  onConvert={(id) => convertirPlano(id)}
/>
```

---

## 🔍 Debugging

### Ver logs en tiempo real

**Backend:**
```bash
# Fast API muestra logs automáticamente
tail -f logs/api.log  # Si configuraste logging
```

**Frontend:**
```javascript
// En el navegador (F12 → Console)
// Busca mensajes como:
// 🔄 Cargando modelo 3D desde caché...
// ✅ Modelo 3D cargado desde caché
```

### Verificar estado de un plano

```sql
-- En PostgreSQL
SELECT p.id, p.nombre, p.estado, m.datos_json IS NOT NULL as tiene_modelo3d
FROM plano p
LEFT JOIN modelo3d m ON m.plano_id = p.id
WHERE p.usuario_id = 1;
```

### Test endpoint manualmente

```bash
# Con curl
curl -X GET http://localhost:8000/planos/123/render-3d \
  -H "Authorization: Bearer YOUR_TOKEN"

# Con HTTPie
http GET localhost:8000/planos/123/render-3d \
  Authorization:"Bearer YOUR_TOKEN"
```

---

## ⚡ Optimizaciones

### 1. Caché de Modelos
- Primera carga: ~30 segundos (procesamiento IA)
- Cargas siguientes: < 1 segundo (desde BD)

### 2. Conversión Automática
- Al subir, se inicia conversión automáticamente
- Usuario no necesita hacer nada extra

### 3. Google Drive
- Archivos no ocupan espacio en servidor
- URLs públicas para acceso directo
- CDN global de Google

---

## ❗ Troubleshooting

### Problema: "Modelo 3D no encontrado"
**Solución:**
1. Verificar que el plano esté en estado `completado`
2. Revisar que existe registro en tabla `modelo3d`
3. Verificar que `datos_json` no sea NULL

### Problema: "Error al convertir plano"
**Solución:**
1. Verificar que Flask API esté corriendo
2. Comprobar logs de Flask API
3. Verificar que imagen sea válida

### Problema: "Viewer 3D no carga"
**Solución:**
1. Abrir consola del navegador (F12)
2. Verificar errores de Three.js
3. Comprobar estructura de `datos_json`

---

## 📊 Métricas de Rendimiento

| Operación | Tiempo Promedio |
|-----------|-----------------|
| Subida de archivo | 1-2 segundos |
| Conversión a 3D | 20-40 segundos |
| Carga desde caché | < 1 segundo |
| Renderizado 3D | Instantáneo |

---

## 🎯 Próximos Pasos

1. **Leer la documentación completa:**
   - `IMPLEMENTACION_RENDERIZADO_3D.md`
   - `GUIA_TECNICA_API.md`

2. **Probar el sistema:**
   - Subir un plano de prueba
   - Visualizarlo en 3D
   - Verificar caché

3. **Personalizar:**
   - Agregar nuevos tipos de objetos
   - Modificar colores del viewer
   - Agregar validaciones custom

---

## 📚 Recursos Adicionales

- [Documentación de Three.js](https://threejs.org/docs/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

---

## 🤝 Soporte

¿Tienes preguntas? Revisa:
1. Documentación en `/docs`
2. Logs del sistema
3. Código de ejemplo en los componentes

---

**¡Listo para comenzar! 🚀**

Sube tu primer plano en `/upload` y visualízalo en 3D.

