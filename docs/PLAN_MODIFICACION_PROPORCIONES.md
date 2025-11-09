# 📐 Plan: Modificar Proporciones de Paredes, Ventanas y Puertas

## 🎯 Objetivo
Permitir a los usuarios modificar las proporciones (dimensiones) de paredes, ventanas y puertas en el viewer 3D de forma interactiva.

## ❓ Preguntas para Clarificar Requisitos

### 1. **¿Qué dimensiones pueden modificarse?**

#### Para Paredes:
- ✅ Ancho (width)
- ✅ Alto (height) 
- ✅ Profundidad (depth)
- ❓ ¿Posición? (x, y, z)
- ❓ ¿Rotación?

#### Para Ventanas:
- ✅ Ancho (width)
- ✅ Alto (height) - ¿Modificar altura de la ventana o altura total de la pared?
- ✅ Profundidad (depth)
- ❓ ¿Posición vertical (Y) dentro de la pared?
- ❓ ¿Altura de pared inferior/superior?

#### Para Puertas:
- ✅ Ancho (width)
- ✅ Alto (height) - ¿Altura de la puerta o altura total?
- ✅ Profundidad (depth)
- ❓ ¿Altura del dintel superior?
- ❓ ¿Factores de ampliación (doorWidthFactor, topWallHeight)?

### 2. **¿Cómo se modificarán? (Interfaz de Usuario)**

**Opción A: Panel lateral con sliders** (RECOMENDADO)
- Panel deslizable desde la derecha
- Sliders para cada dimensión
- Inputs numéricos para valores exactos
- Vista previa en tiempo real

**Opción B: Controles 3D directos**
- Gizmos en el modelo 3D (manejadores de arrastre)
- Click y arrastrar para modificar
- Más intuitivo pero más complejo de implementar

**Opción C: Híbrido**
- Panel lateral + selección visual de objetos
- Click en objeto → Panel muestra sus propiedades

### 3. **¿Los cambios deben guardarse?**

- ✅ Sí, guardar en backend (base de datos)
- ✅ Sí, guardar en localStorage (temporal)
- ❓ ¿Solo en memoria (perder al recargar)?

### 4. **¿Restricciones y validaciones?**

- ✅ Dimensiones mínimas (ej: pared mínima 0.1m)
- ✅ Dimensiones máximas (ej: pared máxima 10m)
- ✅ Mantener proporciones de ventanas/puertas dentro de paredes
- ✅ Validar que ventanas no excedan altura de pared
- ❓ ¿Limitar proporciones según tipo de objeto?

### 5. **¿Qué objetos pueden modificarse?**

- ✅ Individualmente (un objeto a la vez)
- ❓ Múltiples objetos a la vez (selección múltiple)
- ❓ Todos los objetos del mismo tipo (ej: todas las ventanas)

## 📋 Plan de Implementación (Paso a Paso)

### **FASE 1: Preparación y Estructura de Datos** ✅

#### 1.1 Crear estado para dimensiones modificadas
```typescript
interface ModifiedDimensions {
  [objectId: string]: {
    width?: number
    height?: number
    depth?: number
    position?: { x?: number; y?: number; z?: number }
    // Propiedades específicas
    windowCenterY?: number // Para ventanas
    doorHeightFactor?: number // Para puertas
    topWallHeight?: number // Para puertas
  }
}
```

#### 1.2 Crear hook para manejar modificaciones
```typescript
const useDimensionEditor = (initialObjects: ThreeJSObject[]) => {
  const [modifiedDimensions, setModifiedDimensions] = useState<ModifiedDimensions>({})
  
  const updateDimension = (objectId: string, dimension: string, value: number) => {
    // Actualizar dimensión
  }
  
  const resetDimension = (objectId: string) => {
    // Restaurar dimensión original
  }
  
  const getEffectiveDimensions = (obj: ThreeJSObject) => {
    // Obtener dimensiones efectivas (modificadas o originales)
  }
  
  return { modifiedDimensions, updateDimension, resetDimension, getEffectiveDimensions }
}
```

#### 1.3 Modificar componente Object3D para usar dimensiones modificadas
- Usar `getEffectiveDimensions()` en lugar de `obj.dimensions` directamente
- Aplicar modificaciones en tiempo real

---

### **FASE 2: Interfaz de Usuario (Panel de Edición)** ✅

#### 2.1 Crear componente DimensionEditorPanel
```typescript
interface DimensionEditorPanelProps {
  selectedObject: ThreeJSObject | null
  onUpdate: (objectId: string, dimension: string, value: number) => void
  onClose: () => void
}
```

**Características:**
- Panel deslizable desde la derecha
- Mostrar objeto seleccionado
- Sliders para cada dimensión
- Inputs numéricos con unidades (metros)
- Botones: Reset, Aplicar, Cancelar
- Validación de valores

#### 2.2 Integrar selección de objetos
- Click en objeto 3D → Seleccionar
- Resaltar objeto seleccionado
- Mostrar panel de edición
- Click fuera → Deseleccionar

#### 2.3 Crear componentes de control
- `DimensionSlider`: Slider con label y unidades
- `DimensionInput`: Input numérico con validación
- `ObjectSelector`: Lista de objetos para seleccionar

---

### **FASE 3: Lógica de Modificación** ✅

#### 3.1 Modificar renderizado de paredes
- Usar dimensiones modificadas si existen
- Mantener validaciones (dimensiones mínimas/máximas)

#### 3.2 Modificar renderizado de ventanas
- Ajustar altura de ventana
- Recalcular paredes superior/inferior
- Validar que ventana no exceda altura de pared
- Ajustar posición Y si es necesario

#### 3.3 Modificar renderizado de puertas
- Ajustar altura de puerta
- Ajustar altura de dintel
- Recalcular factores de ampliación
- Validar proporciones

---

### **FASE 4: Persistencia y Backend** ✅

#### 4.1 Guardar modificaciones en localStorage (temporal)
```typescript
const saveToLocalStorage = (modifiedDimensions: ModifiedDimensions) => {
  localStorage.setItem('modifiedDimensions', JSON.stringify(modifiedDimensions))
}
```

#### 4.2 Guardar modificaciones en backend
- Crear endpoint en FastAPI: `PUT /api/modelos3d/{modelo3d_id}/objects/{object_id}/dimensions`
- Guardar dimensiones modificadas en base de datos
- Asociar con modelo3d_id y object_id

#### 4.3 Cargar modificaciones guardadas
- Al cargar modelo 3D, verificar si hay dimensiones guardadas
- Aplicar dimensiones guardadas al renderizar

---

### **FASE 5: Validaciones y Restricciones** ✅

#### 5.1 Validaciones básicas
- Dimensiones mínimas: 0.1m
- Dimensiones máximas: 10m (configurable)
- Valores numéricos válidos

#### 5.2 Validaciones específicas por tipo
- **Ventanas**: No exceder altura de pared (3.0m)
- **Puertas**: Mantener proporciones razonables
- **Paredes**: Validar que no colapsen otros elementos

#### 5.3 Feedback visual
- Mostrar errores de validación
- Resaltar objetos con problemas
- Mensajes de advertencia

---

### **FASE 6: Mejoras y Optimizaciones** ✅

#### 6.1 Selección múltiple
- Seleccionar múltiples objetos
- Aplicar cambios a todos los seleccionados
- Edición en lote

#### 6.2 Undo/Redo
- Historial de cambios
- Deshacer/Rehacer modificaciones
- Limitar historial a N cambios

#### 6.3 Exportar/Importar dimensiones
- Exportar dimensiones modificadas a JSON
- Importar dimensiones desde JSON
- Compartir configuraciones

---

## 🛠️ Estructura de Archivos

```
components/
├── floor-plan-3d-viewer.tsx (modificado)
├── dimension-editor/
│   ├── DimensionEditorPanel.tsx
│   ├── DimensionSlider.tsx
│   ├── DimensionInput.tsx
│   ├── ObjectSelector.tsx
│   └── useDimensionEditor.ts (hook)
└── ...

lib/
├── api.ts (añadir endpoints)
└── dimension-storage.ts (localStorage)
```

---

## 📊 Flujo de Usuario

1. **Usuario abre viewer 3D**
   - Carga modelo 3D
   - Carga dimensiones guardadas (si existen)

2. **Usuario selecciona objeto**
   - Click en objeto 3D
   - Objeto se resalta
   - Panel de edición se abre

3. **Usuario modifica dimensiones**
   - Ajusta sliders o inputs
   - Vista previa en tiempo real
   - Validaciones en tiempo real

4. **Usuario guarda cambios**
   - Click en "Guardar"
   - Cambios se guardan en backend
   - Confirmación visual

5. **Usuario puede resetear**
   - Click en "Reset"
   - Restaura dimensiones originales
   - Confirma acción

---

## 🎨 Mockup de UI

```
┌─────────────────────────────────────────┐
│  Viewer 3D                    [X] Panel │
│  ┌─────────────────┐         ┌─────────┐│
│  │                 │         │ Objeto: ││
│  │   [Modelo 3D]   │  ←──→   │ Ventana ││
│  │                 │         │   #123  ││
│  │                 │         ├─────────┤│
│  │                 │         │ Ancho:  ││
│  └─────────────────┘         │ [━━━━●] ││
│                               │ 1.5 m  ││
│                               ├─────────┤│
│                               │ Alto:   ││
│                               │ [━━●━━] ││
│                               │ 2.0 m  ││
│                               ├─────────┤│
│                               │ [Reset] ││
│                               │ [Guardar]│
│                               └─────────┘│
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Fase 1: Preparación
- [ ] Crear interfaz `ModifiedDimensions`
- [ ] Crear hook `useDimensionEditor`
- [ ] Modificar `Object3D` para usar dimensiones modificadas
- [ ] Probar que las modificaciones se aplican correctamente

### Fase 2: UI
- [ ] Crear componente `DimensionEditorPanel`
- [ ] Crear componente `DimensionSlider`
- [ ] Crear componente `DimensionInput`
- [ ] Integrar selección de objetos
- [ ] Añadir resaltado de objetos seleccionados

### Fase 3: Lógica
- [ ] Implementar modificaciones para paredes
- [ ] Implementar modificaciones para ventanas
- [ ] Implementar modificaciones para puertas
- [ ] Validar cálculos de proporciones

### Fase 4: Persistencia
- [ ] Guardar en localStorage
- [ ] Crear endpoint en backend
- [ ] Guardar en base de datos
- [ ] Cargar dimensiones guardadas

### Fase 5: Validaciones
- [ ] Validaciones básicas
- [ ] Validaciones específicas por tipo
- [ ] Feedback visual de errores

### Fase 6: Mejoras
- [ ] Selección múltiple
- [ ] Undo/Redo
- [ ] Exportar/Importar

---

## 🚀 Próximos Pasos

1. **Confirmar requisitos** con el usuario
2. **Empezar con Fase 1** (Preparación)
3. **Implementar Fase 2** (UI básica)
4. **Probar y ajustar** según feedback
5. **Continuar con fases restantes**

---

## 📝 Notas Técnicas

### Consideraciones de Rendimiento
- Usar `useMemo` para cálculos costosos
- Debounce en sliders para evitar re-renders excesivos
- Actualizar solo objetos modificados

### Consideraciones de UX
- Feedback visual inmediato
- Confirmación antes de guardar
- Posibilidad de cancelar cambios
- Mostrar valores originales vs modificados

### Consideraciones de Backend
- Validar dimensiones en backend
- Mantener historial de cambios
- Soportar múltiples usuarios editando

---

## ❓ Preguntas Pendientes

1. ¿Qué dimensiones específicas pueden modificarse para cada tipo?
2. ¿Prefieres panel lateral o controles 3D directos?
3. ¿Los cambios deben guardarse en backend o solo en memoria?
4. ¿Hay restricciones específicas de proporciones?
5. ¿Se pueden modificar múltiples objetos a la vez?


