# Sistema de Texturas para Modelos 3D

## 📋 Descripción

Sistema completo para aplicar y guardar texturas/materiales en modelos 3D generados desde planos 2D.

## 🚀 Características Implementadas

### Frontend (Next.js + React + Three.js)
- ✅ **TextureSelector**: Componente para buscar y seleccionar materiales
  - Búsqueda por nombre
  - Filtrado por categorías
  - Vista previa de texturas
  - Grid responsivo
  
- ✅ **TexturePanel**: Panel lateral para gestionar texturas
  - Selección por tipo de elemento (paredes, piso, techo, puertas, ventanas)
  - Preview del material seleccionado
  - Resumen de asignaciones actuales
  
- ✅ **FloorPlan3DViewer**: Visor 3D mejorado
  - Aplicación de texturas en tiempo real
  - Carga de texturas desde URLs
  - Guardado persistente en base de datos
  - Mensajes de estado (éxito/error)

### Backend (FastAPI + SQLAlchemy)
- ✅ Endpoints completos para materiales y categorías
- ✅ Sistema de asignación material-modelo3d
- ✅ Cálculo de costos y cantidades
- ✅ Seed data con materiales de ejemplo

## 📦 Instalación y Configuración

### 1. Backend (FastAPI)

```powershell
# Navegar al directorio del backend
cd FloorPlanTo3d_Fast_Api

# Activar entorno virtual (si tienes uno)
# .\venv\Scripts\Activate.ps1

# Instalar dependencias (si es necesario)
pip install -r requirements.txt

# Ejecutar el seed de materiales (solo la primera vez)
python seed_materiales.py

# Iniciar el servidor
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)

```powershell
# Navegar al directorio del frontend
cd FloorPlanTo3d_Frontend_React

# Instalar dependencias (si es necesario)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## 🎨 Uso del Sistema

### 1. Cargar un Plano 2D

1. Ve a `/upload`
2. Sube una imagen de plano arquitectónico
3. El sistema detectará paredes, puertas y ventanas

### 2. Visualizar en 3D

1. Haz clic en "Ver en 3D" en el plano subido
2. El visor 3D renderizará el modelo

### 3. Aplicar Texturas

1. Click en el botón **"Aplicar Texturas"** en el visor 3D
2. Se abrirá el panel lateral con:
   - **Elementos**: Lista de tipos (paredes, piso, techo, etc.)
   - **Biblioteca**: Categorías y materiales disponibles
   
3. Selecciona un elemento (ej: "Paredes")
4. Busca o filtra materiales por categoría
5. Haz clic en un material para seleccionarlo
6. Click en **"Aplicar"** para ver el cambio en tiempo real

### 4. Guardar Texturas

1. Una vez aplicadas las texturas deseadas
2. Click en **"Guardar Texturas"**
3. Las asignaciones se guardan en la base de datos
4. Puedes cerrar y volver a abrir - las texturas se cargarán automáticamente

## 🗂️ Estructura de Archivos

### Frontend
```
components/
├── texture-selector.tsx      # Selector de materiales
├── texture-panel.tsx          # Panel de gestión de texturas
└── floor-plan-3d-viewer.tsx  # Visor 3D con soporte de texturas

lib/
└── api.ts                     # Cliente API con métodos de materiales

types/
└── api.ts                     # Interfaces TypeScript actualizadas
```

### Backend
```
models/
├── categoria.py               # Modelo de categorías
├── material.py                # Modelo de materiales
└── material_modelo3d.py       # Relación material-modelo3d

routers/
├── categoria.py               # Endpoints de categorías
├── material.py                # Endpoints de materiales
└── material_modelo3d.py       # Endpoints de asignaciones

schemas/
├── categoria_schemas.py       # Validación categorías
├── material_schemas.py        # Validación materiales
└── material_modelo3d_schemas.py

seed_materiales.py             # Script de datos de prueba
```

## 🔌 Endpoints del API

### Categorías
- `GET /categorias/` - Listar todas las categorías
- `GET /categorias/{id}` - Obtener una categoría
- `POST /categorias/` - Crear categoría
- `PUT /categorias/{id}` - Actualizar categoría
- `DELETE /categorias/{id}` - Eliminar categoría

### Materiales
- `GET /materiales/` - Listar materiales (con filtros)
  - Query params: `skip`, `limit`, `categoria_id`, `search`
- `GET /materiales/{id}` - Obtener un material
- `POST /materiales/` - Crear material
- `PUT /materiales/{id}` - Actualizar material
- `DELETE /materiales/{id}` - Eliminar material

### Material-Modelo3D
- `POST /materiales-modelo3d/` - Asignar material a modelo
- `GET /materiales-modelo3d/modelo3d/{id}` - Obtener materiales de un modelo
- `PUT /materiales-modelo3d/{id}` - Actualizar asignación
- `DELETE /materiales-modelo3d/{id}` - Eliminar asignación

## 📊 Datos de Prueba

El script `seed_materiales.py` crea:
- **4 categorías**: Pisos, Paredes, Maderas, Piedras
- **12 materiales** con imágenes de ejemplo de Unsplash
- Precios realistas en dólares
- URLs de texturas funcionales

## 🎯 Próximas Mejoras

### Backend
- [ ] Agregar campos `elemento_tipo` y `elemento_id` al modelo MaterialModelo3D
- [ ] Endpoint para actualizar múltiples asignaciones en batch
- [ ] Subida de imágenes de texturas propias
- [ ] Sistema de texturas favoritas por usuario

### Frontend
- [ ] Selector de múltiples paredes individuales
- [ ] Preview 3D más grande del material antes de aplicar
- [ ] Historial de texturas aplicadas (undo/redo)
- [ ] Exportación de lista de materiales con costos
- [ ] Modo "pintar" para aplicar texturas haciendo clic en el modelo

## 🐛 Troubleshooting

### Las texturas no se cargan
- Verifica que el backend esté corriendo en `localhost:8000`
- Revisa la consola del navegador para errores CORS
- Asegúrate de haber ejecutado `seed_materiales.py`

### Error al guardar
- Verifica que tengas un `modelo3d_id` válido
- Confirma que estés autenticado (token válido)
- Revisa los logs del backend FastAPI

### Texturas se ven negras o no aparecen
- Las URLs de Unsplash pueden fallar ocasionalmente
- Puedes reemplazar las URLs en el seed con tus propias imágenes
- Verifica que las URLs sean accesibles desde el navegador

## 📝 Notas Técnicas

- **Texturas**: Se cargan dinámicamente usando `THREE.TextureLoader`
- **Wrapping**: Las texturas usan `RepeatWrapping` para cubrir áreas grandes
- **Caché**: Las texturas se cachean automáticamente por Three.js
- **Performance**: Las texturas se cargan de forma lazy (solo cuando se necesitan)

## 🤝 Contribuciones

Este sistema es parte del proyecto FloorPlanTo3D. Para contribuir:
1. Crea un branch desde `hu-x`
2. Implementa tu feature
3. Haz commit con mensajes descriptivos
4. Crea un Pull Request

## 📄 Licencia

Parte del proyecto FloorPlanTo3D - SW1 2025
