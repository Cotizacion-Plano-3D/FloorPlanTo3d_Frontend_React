# 🎨 MaterialLibrary - Guía de Uso

Sistema centralizado de materiales para Three.js optimizado para el renderizado 3D de planos arquitectónicos.

## 📦 Instalación

```typescript
import MaterialLibrary, { 
  doorMaterials, 
  windowMaterials, 
  wallMaterials,
  floorMaterials,
  metalMaterials 
} from '@/lib/three/materials'
```

## 🎯 Uso Básico

### Aplicar material a un mesh

```typescript
import { doorMaterials } from '@/lib/three/materials'
import * as THREE from 'three'

// Crear geometría
const geometry = new THREE.BoxGeometry(1, 2, 0.1)

// Aplicar material de puerta de madera
const mesh = new THREE.Mesh(geometry, doorMaterials.woodPanel)

// Habilitar sombras
mesh.castShadow = true
mesh.receiveShadow = true
```

### Usar múltiples materiales en un objeto

```typescript
import { doorMaterials, metalMaterials } from '@/lib/three/materials'

// Panel de puerta
const doorPanel = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 2, 0.05),
  doorMaterials.woodPanel
)

// Marco de puerta
const doorFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2.2, 0.1),
  doorMaterials.frame
)

// Manija metálica
const doorHandle = new THREE.Mesh(
  new THREE.SphereGeometry(0.03),
  metalMaterials.steel
)

// Agrupar todo
const doorGroup = new THREE.Group()
doorGroup.add(doorPanel, doorFrame, doorHandle)
```

## 🏗️ Materiales Disponibles

### 🚪 Puertas (doorMaterials)

| Material | Descripción | Color | Uso |
|----------|-------------|-------|-----|
| `woodPanel` | Madera de roble | #8B4513 | Panel principal de puerta |
| `darkWoodPanel` | Madera caoba | #654321 | Puertas elegantes o entrada |
| `paintedPanel` | Puerta pintada | #FFFFFF | Puertas interiores modernas |
| `frame` | Marco de puerta | #5C4033 | Contorno de la puerta |
| `molding` | Moldura decorativa | #654321 | Detalles en relieve |

```typescript
// Ejemplo: Puerta de entrada elegante
const door = new THREE.Mesh(geometry, doorMaterials.darkWoodPanel)
```

### 🪟 Ventanas (windowMaterials)

| Material | Descripción | Color | Transparencia |
|----------|-------------|-------|---------------|
| `frame` | Marco aluminio | #FFFFFF | No |
| `woodFrame` | Marco madera | #C19A6B | No |
| `glass` | Vidrio claro | #87CEEB | Sí (40%) |
| `frostedGlass` | Vidrio esmerilado | #E6F3F7 | Sí (60%) |
| `divider` | Cruz divisoria | #FFFFFF | No |
| `hardware` | Bisagras/herrajes | #C0C0C0 | No |

```typescript
// Ejemplo: Ventana con vidrio transparente
const windowGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1.5),
  windowMaterials.glass
)
```

### 🧱 Paredes (wallMaterials)

| Material | Descripción | Color | Rugosidad |
|----------|-------------|-------|-----------|
| `painted` | Pared pintada | #FFFFFF | 0.9 |
| `concrete` | Concreto | #B0B0B0 | 0.95 |
| `brick` | Ladrillo | #B7410E | 0.85 |
| `exterior` | Fachada | #E5E5E5 | 0.8 |
| `drywall` | Yeso/Drywall | #F5F5DC | 0.85 |

```typescript
// Ejemplo: Pared interior blanca
const wall = new THREE.Mesh(geometry, wallMaterials.painted)
```

### 🏠 Pisos (floorMaterials)

| Material | Descripción | Color | Brillo |
|----------|-------------|-------|--------|
| `ceramic` | Cerámica | #F5F5F5 | Alto |
| `wood` | Madera/parquet | #D2691E | Medio |
| `marble` | Mármol | #F0F0F0 | Alto |
| `concrete` | Concreto pulido | #C8C8C8 | Bajo |

```typescript
// Ejemplo: Piso de cerámica brillante
const floor = new THREE.Mesh(geometry, floorMaterials.ceramic)
```

### 🔩 Metales (metalMaterials)

| Material | Descripción | Color | Metalicidad |
|----------|-------------|-------|-------------|
| `steel` | Acero inoxidable | #C0C0C0 | 0.95 |
| `brass` | Latón | #B5A642 | 0.9 |
| `bronze` | Bronce | #CD7F32 | 0.85 |
| `aluminum` | Aluminio | #D3D3D3 | 0.8 |

```typescript
// Ejemplo: Manija de puerta de acero
const handle = new THREE.Mesh(geometry, metalMaterials.steel)
```

## 🎨 Personalización

### Clonar y modificar material

```typescript
import { cloneMaterial, doorMaterials } from '@/lib/three/materials'

// Clonar material base
const customDoor = cloneMaterial(doorMaterials.woodPanel)

// Modificar propiedades
customDoor.color.set('#FF0000') // Puerta roja
customDoor.roughness = 0.5      // Más brillante
customDoor.emissive.set('#330000') // Ligero brillo rojo
customDoor.emissiveIntensity = 0.1
```

### Crear material personalizado

```typescript
import { createCustomMaterial, wallMaterials } from '@/lib/three/materials'

const customWall = createCustomMaterial(wallMaterials.painted, {
  color: '#CCCCCC',
  roughness: 0.5,
  metalness: 0.1
})
```

### Usar la paleta de colores

```typescript
import { COLOR_PALETTE } from '@/lib/three/materials'
import * as THREE from 'three'

const customMaterial = new THREE.MeshStandardMaterial({
  color: COLOR_PALETTE.wood.oak,
  roughness: 0.7,
  metalness: 0.0
})
```

## 🛠️ Utilidades

### Obtener material dinámicamente

```typescript
import { getMaterial } from '@/lib/three/materials'

const material = getMaterial('door', 'woodPanel')
if (material) {
  const mesh = new THREE.Mesh(geometry, material)
}
```

### Listar materiales disponibles

```typescript
import { listMaterials } from '@/lib/three/materials'

const doorTypes = listMaterials('door')
console.log(doorTypes)
// ['woodPanel', 'darkWoodPanel', 'paintedPanel', 'frame', 'molding']
```

### Aplicar configuración de mesh

```typescript
import { applyMeshConfig } from '@/lib/three/materials'

const mesh = new THREE.Mesh(geometry, material)

applyMeshConfig(mesh, {
  castShadow: true,
  receiveShadow: true,
  wireframe: false
})
```

## 📐 Ejemplo Completo: Puerta

```typescript
import { doorMaterials, metalMaterials } from '@/lib/three/materials'
import * as THREE from 'three'

function createDoor(width: number, height: number, depth: number) {
  const doorGroup = new THREE.Group()
  
  // Panel principal
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    doorMaterials.woodPanel
  )
  panel.castShadow = true
  panel.receiveShadow = true
  doorGroup.add(panel)
  
  // Moldura decorativa
  const molding = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.8, height * 0.4, depth * 0.5),
    doorMaterials.molding
  )
  molding.position.z = depth * 0.5
  molding.castShadow = true
  doorGroup.add(molding)
  
  // Manija
  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 16, 16),
    metalMaterials.steel
  )
  handle.position.set(width * 0.4, 0, depth * 0.6)
  handle.castShadow = true
  doorGroup.add(handle)
  
  return doorGroup
}

// Uso
const myDoor = createDoor(0.9, 2.0, 0.05)
scene.add(myDoor)
```

## 🔮 Integración Futura con Backend

El sistema está preparado para recibir datos de materiales desde el backend:

```typescript
import { MaterialBackendData } from '@/lib/three/materials.types'

interface ThreeJSObject {
  id: string
  type: 'door' | 'window' | 'wall'
  // ... otras propiedades
  material?: MaterialBackendData // ← Futuro
}

// El backend podrá enviar:
{
  "id": "door_1",
  "type": "door",
  "material": {
    "id": 5,
    "codigo": "MAD_ROBLE_001",
    "categoria_codigo": "PUERTAS_MADERA",
    "imagen_url": "https://cdn.example.com/textures/oak.jpg",
    "properties": {
      "color": "#8B4513",
      "roughness": 0.7,
      "metalness": 0.0
    }
  }
}
```

## 📊 Parámetros PBR Recomendados

### Roughness (Rugosidad)
- `0.0 - 0.2`: Superficies muy pulidas (espejo, vidrio)
- `0.3 - 0.5`: Superficies semi-brillantes (metal pintado, plástico)
- `0.6 - 0.8`: Superficies mates (madera, cerámica mate)
- `0.9 - 1.0`: Superficies muy rugosas (concreto, yeso)

### Metalness (Metalicidad)
- `0.0`: No metálico (madera, plástico, vidrio)
- `0.1 - 0.3`: Ligeramente metálico (aluminio oxidado)
- `0.8 - 0.95`: Metales (acero, latón, aluminio)
- `1.0`: Metal puro (uso especial)

### Opacity (Opacidad)
- `0.0`: Invisible
- `0.3 - 0.6`: Muy transparente (vidrio, plástico translúcido)
- `0.7 - 0.9`: Semi-transparente (cortinas, telas)
- `1.0`: Completamente opaco

## 🎯 Optimización para Vista Aérea

Los materiales están optimizados considerando que la vista principal es aérea:

- **Puertas**: Colores más fuertes para visibilidad desde arriba
- **Ventanas**: Transparencia equilibrada (40%) para distinguir claramente
- **Paredes**: Rugosidad alta para evitar reflejos que confundan
- **Pisos**: Materiales con suficiente contraste respecto a las paredes

## 📚 Referencias

- [Three.js MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
- [PBR Guide](https://learnopengl.com/PBR/Theory)
- [Material Property Charts](https://substance3d.adobe.com/tutorials/courses/the-pbr-guide-part-1)

---

**Versión:** 1.0.0  
**Última actualización:** 28/10/2025  
**Proyecto:** FloorPlanTo3D
