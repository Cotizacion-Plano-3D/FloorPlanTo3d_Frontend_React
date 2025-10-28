# Extensión JSON para Materiales Dinámicos

**Fecha:** Octubre 2025  
**Estado:** Diseño - No Implementado  
**Versión:** 1.0

## 📋 Resumen Ejecutivo

Este documento diseña una extensión **opcional y retrocompatible** al formato JSON actual para soportar materiales dinámicos desde el backend. La implementación actual funciona con materiales estáticos del frontend, esta extensión permitiría personalización completa desde el backend sin romper compatibilidad.

---

## 🎯 Objetivos

1. **Retrocompatibilidad 100%**: JSON actual debe seguir funcionando sin cambios
2. **Materiales Dinámicos**: Permitir especificar materiales desde backend
3. **Texturas**: Soportar URLs de texturas almacenadas en base de datos
4. **Estilos**: Permitir selección de estilos predefinidos (elegant, modern, etc.)
5. **Propiedades PBR**: Control fino de roughness, metalness, color

---

## 📐 Estructura JSON Actual (Baseline)

### Formato Actual - Sin Materiales
```json
{
  "id": "door_13",
  "type": "door",
  "position": { "x": 1.845, "y": 1.0, "z": 4.015 },
  "dimensions": { "width": 0.25, "height": 2.0, "depth": 0.51 },
  "rotation": { "x": 0, "y": 0, "z": 0 }
}
```

**✅ Ventajas:**
- Simple y compacto
- Funciona con MaterialLibrary estática del frontend

**❌ Limitaciones:**
- No permite personalización por objeto
- Materiales hardcoded en código
- Sin soporte para texturas del backend

---

## 🆕 Estructura JSON Extendida - Propuesta

### Nivel 1: Material Simple (ID)

Referencia a material existente en backend por ID:

```json
{
  "id": "door_13",
  "type": "door",
  "position": { "x": 1.845, "y": 1.0, "z": 4.015 },
  "dimensions": { "width": 0.25, "height": 2.0, "depth": 0.51 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "material": {
    "id": 123,
    "type": "door"
  }
}
```

**Backend Changes Required:**
- Endpoint: `GET /api/materials/{id}` → Retorna propiedades del material
- Tabla: `Material` con campos `id`, `type`, `color`, `roughness`, `metalness`, `texture_url`

---

### Nivel 2: Material con Propiedades

Override de propiedades específicas:

```json
{
  "id": "wall_1",
  "type": "wall",
  "position": { "x": 6.62, "y": 1.5, "z": 5.81 },
  "dimensions": { "width": 1.2, "height": 3.0, "depth": 0.24 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "material": {
    "preset": "painted",
    "color": "#1B4079",
    "roughness": 0.9,
    "metalness": 0.0
  }
}
```

**Campos Disponibles:**
- `preset`: Nombre del material base (`"painted"`, `"concrete"`, `"brick"`, `"drywall"`)
- `color`: Color hexadecimal (`"#1B4079"`)
- `roughness`: 0.0 - 1.0 (0 = brillante, 1 = mate)
- `metalness`: 0.0 - 1.0 (0 = no metálico, 1 = metálico)

---

### Nivel 3: Material con Texturas

URL de textura almacenada en backend:

```json
{
  "id": "wall_1",
  "type": "wall",
  "position": { "x": 6.62, "y": 1.5, "z": 5.81 },
  "dimensions": { "width": 1.2, "height": 3.0, "depth": 0.24 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "material": {
    "id": 456,
    "textures": {
      "map": "https://cdn.example.com/materials/brick_diffuse.jpg",
      "normalMap": "https://cdn.example.com/materials/brick_normal.jpg",
      "roughnessMap": "https://cdn.example.com/materials/brick_roughness.jpg"
    },
    "repeat": { "u": 2, "v": 2 },
    "roughness": 0.85,
    "metalness": 0.0
  }
}
```

**Campos de Texturas:**
- `map`: Textura base (color/diffuse)
- `normalMap`: Mapa de normales (relieve)
- `roughnessMap`: Mapa de rugosidad
- `metalnessMap`: Mapa de metalness
- `aoMap`: Ambient occlusion
- `repeat`: Repetición UV (`{u, v}`)

---

### Nivel 4: Estilos Predefinidos

Uso de estilos predefinidos del frontend:

```json
{
  "id": "door_13",
  "type": "door",
  "position": { "x": 1.845, "y": 1.0, "z": 4.015 },
  "dimensions": { "width": 0.25, "height": 2.0, "depth": 0.51 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "style": "elegant",
  "material": {
    "panel": {
      "preset": "darkWood",
      "color": "#654321"
    },
    "frame": {
      "preset": "darkWood",
      "color": "#5C4033"
    },
    "handle": {
      "material": "brass",
      "roughness": 0.2
    }
  }
}
```

**Estilos Disponibles:**

**Puertas:** `standard`, `elegant`, `modern`, `painted`  
**Ventanas:** `standard`, `casement`, `sliding`, `bay`, `modern`  
**Paredes:** `interior`, `exterior`, `brick`, `drywall`, `accent`

---

## 🔄 Lógica de Retrocompatibilidad

### Frontend: Cascade de Materiales

```typescript
function getMaterial(obj: ThreeJSObject): Material {
  // 1. Si tiene material.textures → Cargar texturas desde URL
  if (obj.material?.textures) {
    return loadTexturedMaterial(obj.material)
  }
  
  // 2. Si tiene material.id → Fetch desde backend
  if (obj.material?.id) {
    return fetchMaterialFromBackend(obj.material.id)
  }
  
  // 3. Si tiene material.preset → Usar MaterialLibrary
  if (obj.material?.preset) {
    return getMaterialFromLibrary(obj.material.preset, obj.material)
  }
  
  // 4. Si tiene style → Aplicar preset de estilo
  if (obj.style) {
    return getStylePreset(obj.type, obj.style)
  }
  
  // 5. FALLBACK: Material por defecto según tipo
  return getDefaultMaterial(obj.type)
}
```

**✅ Garantías:**
- JSON sin campo `material` → Usa MaterialLibrary actual
- JSON con `material` → Usa especificación dinámica
- Errores en carga → Fallback a material por defecto

---

## 🗄️ Cambios en Backend Requeridos

### Tabla `Material` (Ya existe)

```sql
CREATE TABLE material (
  id INTEGER PRIMARY KEY,
  nombre VARCHAR(100),
  color VARCHAR(7),  -- Hex color
  roughness FLOAT DEFAULT 0.8,
  metalness FLOAT DEFAULT 0.0,
  imagen_url VARCHAR(500),  -- URL textura base
  normal_map_url VARCHAR(500),
  roughness_map_url VARCHAR(500),
  categoria_id INTEGER,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);
```

### Tabla `MaterialModelo3D` (Relación)

```sql
CREATE TABLE material_modelo3d (
  id INTEGER PRIMARY KEY,
  modelo3d_id INTEGER,
  material_id INTEGER,
  tipo_elemento VARCHAR(20),  -- 'door', 'window', 'wall'
  FOREIGN KEY (modelo3d_id) REFERENCES modelo3d(id),
  FOREIGN KEY (material_id) REFERENCES material(id)
);
```

### Nuevos Endpoints

```python
# Obtener material por ID
GET /api/materials/{material_id}
Response: {
  "id": 123,
  "nombre": "Madera Roble",
  "color": "#8B4513",
  "roughness": 0.7,
  "metalness": 0.0,
  "imagen_url": "https://cdn.../oak_diffuse.jpg",
  "categoria": "door"
}

# Obtener materiales por categoría
GET /api/materials?categoria=door
Response: [
  { "id": 123, "nombre": "Roble", ... },
  { "id": 124, "nombre": "Caoba", ... }
]

# Asignar material a objeto 3D
POST /api/modelo3d/{modelo_id}/materials
Body: {
  "objeto_id": "door_13",
  "material_id": 123
}
```

---

## 📊 Ejemplos Completos

### Ejemplo 1: Proyecto Básico (Sin Materiales)

**Backend JSON:**
```json
{
  "scene": { "bounds": { "width": 10, "height": 8 } },
  "objects": [
    {
      "id": "door_1",
      "type": "door",
      "position": { "x": 5, "y": 1, "z": 0 },
      "dimensions": { "width": 0.9, "height": 2.0, "depth": 0.05 }
    }
  ]
}
```

**Frontend:** Usa `DoorGeometry` con estilo `elegant` por defecto

---

### Ejemplo 2: Proyecto con Estilos

**Backend JSON:**
```json
{
  "scene": { "bounds": { "width": 10, "height": 8 } },
  "objects": [
    {
      "id": "door_1",
      "type": "door",
      "style": "modern",
      "position": { "x": 5, "y": 1, "z": 0 },
      "dimensions": { "width": 0.9, "height": 2.0, "depth": 0.05 }
    }
  ]
}
```

**Frontend:** Usa `DoorGeometry` con estilo `modern` (panel pintado)

---

### Ejemplo 3: Proyecto con Materiales Personalizados

**Backend JSON:**
```json
{
  "scene": { "bounds": { "width": 10, "height": 8 } },
  "objects": [
    {
      "id": "wall_1",
      "type": "wall",
      "position": { "x": 5, "y": 1.5, "z": 0 },
      "dimensions": { "width": 3.0, "height": 3.0, "depth": 0.2 },
      "material": {
        "preset": "brick",
        "color": "#B7410E",
        "roughness": 0.85
      }
    },
    {
      "id": "door_1",
      "type": "door",
      "position": { "x": 2, "y": 1, "z": 0 },
      "dimensions": { "width": 0.9, "height": 2.0, "depth": 0.05 },
      "style": "elegant",
      "material": {
        "id": 456,
        "panel": { "color": "#654321" },
        "handle": { "material": "brass" }
      }
    }
  ]
}
```

**Frontend:** 
- Pared → Material brick con color custom
- Puerta → Estilo elegant con panel custom y manija de latón

---

### Ejemplo 4: Proyecto con Texturas

**Backend JSON:**
```json
{
  "scene": { "bounds": { "width": 10, "height": 8 } },
  "objects": [
    {
      "id": "wall_1",
      "type": "wall",
      "position": { "x": 5, "y": 1.5, "z": 0 },
      "dimensions": { "width": 3.0, "height": 3.0, "depth": 0.2 },
      "material": {
        "id": 789,
        "textures": {
          "map": "https://storage.example.com/materials/789/diffuse.jpg",
          "normalMap": "https://storage.example.com/materials/789/normal.jpg"
        },
        "repeat": { "u": 3, "v": 2 },
        "roughness": 0.9
      }
    }
  ]
}
```

**Frontend:** Carga texturas desde URLs y las aplica al material

---

## 🚀 Plan de Implementación por Fases

### Fase 1: Estilos Predefinidos (✅ Completado)
- MaterialLibrary con presets
- DoorGeometry, WindowGeometry, WallGeometry con estilos
- Sin cambios en backend

### Fase 2: Campo `style` Opcional (🔄 Siguiente)
- Backend añade campo `style` opcional al JSON
- Frontend usa estilo si existe, default si no
- Cambios mínimos en backend

**Backend Change:**
```python
# En la función que genera el JSON:
def objeto_to_json(objeto):
    data = {
        "id": objeto.id,
        "type": objeto.type,
        # ... campos existentes
    }
    
    # NUEVO: Campo opcional
    if objeto.style:
        data["style"] = objeto.style  # 'elegant', 'modern', etc.
    
    return data
```

### Fase 3: Campo `material` con Presets (📅 Futuro)
- Backend añade campo `material.preset`
- Frontend usa preset del MaterialLibrary
- Permite override de color/roughness/metalness

### Fase 4: Materiales por ID (📅 Futuro)
- Backend implementa endpoint `/api/materials/{id}`
- Frontend fetch material desde API
- Cache de materiales en frontend

### Fase 5: Texturas Completas (📅 Largo Plazo)
- Backend almacena URLs de texturas en tabla Material
- Frontend carga texturas con TextureLoader
- Sistema de cache para texturas

---

## 📝 Validación y Testing

### Test Suite Requerida

```typescript
describe('Material Extension', () => {
  it('should use default material when no material field', () => {
    const obj = { type: 'door', dimensions: {...} }
    const material = getMaterial(obj)
    expect(material).toBe(doorMaterials.woodPanel)
  })
  
  it('should apply style when style field present', () => {
    const obj = { type: 'door', style: 'elegant', dimensions: {...} }
    const material = getMaterial(obj)
    expect(material.color.getHex()).toBe(0x654321) // Dark wood
  })
  
  it('should override color with material.color', () => {
    const obj = { 
      type: 'wall', 
      material: { preset: 'painted', color: '#FF0000' }
    }
    const material = getMaterial(obj)
    expect(material.color.getHex()).toBe(0xFF0000)
  })
  
  it('should load texture from URL', async () => {
    const obj = { 
      type: 'wall',
      material: {
        textures: { map: 'http://example.com/texture.jpg' }
      }
    }
    const material = await getMaterial(obj)
    expect(material.map).toBeDefined()
  })
})
```

---

## 🎨 UI/UX Considerations

### Admin Panel - Material Selector

Interfaz sugerida para asignar materiales en backend:

```
┌─────────────────────────────────────────┐
│ Editar Objeto: door_13                  │
├─────────────────────────────────────────┤
│                                          │
│ Tipo: Puerta                             │
│                                          │
│ Estilo: [Dropdown]                       │
│   ○ Standard                             │
│   ● Elegant                              │
│   ○ Modern                               │
│   ○ Painted                              │
│                                          │
│ Material:                                │
│   Panel: [Color Picker] #654321         │
│   Marco: [Color Picker] #5C4033         │
│   Manija: [Dropdown] Latón              │
│                                          │
│ [ Guardar ] [ Cancelar ]                │
└─────────────────────────────────────────┘
```

---

## ⚠️ Consideraciones de Performance

### Carga de Texturas

**Problema:** Cargar muchas texturas puede impactar performance

**Solución:**
```typescript
const textureCache = new Map<string, THREE.Texture>()

async function loadTexture(url: string): Promise<THREE.Texture> {
  if (textureCache.has(url)) {
    return textureCache.get(url)!
  }
  
  const loader = new THREE.TextureLoader()
  const texture = await loader.loadAsync(url)
  textureCache.set(url, texture)
  
  return texture
}
```

### Límites Recomendados

- **Texturas por escena:** Máximo 20-30
- **Resolución:** 1024x1024 o menor
- **Formato:** JPG (diffuse), PNG (normal/roughness)
- **Compresión:** Usar JPEG con calidad 80-85%

---

## 📚 Referencias

### Documentos Relacionados
- `RENDERER_ANALYSIS.md` - Análisis del renderer actual
- `MATERIALS_GUIDE.md` - Guía de uso de MaterialLibrary
- Backend: `models/material.py` - Modelo de datos Material

### Three.js Documentation
- [MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
- [TextureLoader](https://threejs.org/docs/#api/en/loaders/TextureLoader)
- [PBR Materials](https://threejs.org/examples/#webgl_materials_physical_clearcoat)

---

## ✅ Conclusiones

### Ventajas de la Extensión

1. **Retrocompatible:** JSON actual sigue funcionando
2. **Incremental:** Se puede implementar por fases
3. **Flexible:** Múltiples niveles de personalización
4. **Escalable:** Desde presets hasta texturas completas

### Próximos Pasos

1. ✅ **Fase 1 Completa:** MaterialLibrary implementada
2. 🔄 **Fase 2 Next:** Añadir campo `style` opcional en backend
3. 📅 **Fase 3 Future:** Implementar campo `material` con presets
4. 📅 **Fase 4 Future:** Sistema de materiales por ID
5. 📅 **Fase 5 Future:** Soporte completo de texturas

### Recomendación

**Implementar Fase 2 primero:** Solo requiere añadir campo `style` opcional en el JSON del backend. Es el cambio con mejor ROI (retorno sobre inversión) - mínimo esfuerzo, máximo impacto visual.

---

**Última actualización:** Octubre 2025  
**Autores:** Equipo FloorPlanTo3D  
**Estado:** Diseño Aprobado - Pendiente Implementación
