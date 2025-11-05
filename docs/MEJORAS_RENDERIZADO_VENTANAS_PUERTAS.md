# Mejoras en el Renderizado de Ventanas y Puertas

## Problema Resuelto

Anteriormente, las ventanas y puertas se renderizaban como objetos completos superpuestos a las paredes, causando:
- ❌ Z-fighting (parpadeo visual)
- ❌ Texturas que no se aplicaban correctamente
- ❌ Paredes visibles "a través" de ventanas
- ❌ Imposibilidad de pintar las secciones alrededor de aberturas

## Solución Implementada

### Segmentación Inteligente de Paredes

Ahora las ventanas y puertas se renderizan en **secciones independientes**:

#### Para Ventanas:
```
┌─────────────────┐  ← Sección SUPERIOR (dintel)
│      PARED      │    Altura: 0.5m
├─────────────────┤
│     🪟 VENTANA   │    Altura: 1.5m
│      (vidrio)   │    Desde: 1.0m del suelo
├─────────────────┤
│      PARED      │  ← Sección INFERIOR (antepecho)
└─────────────────┘    Altura: 1.0m
```

**3 componentes separados:**
1. **Sección inferior** (0.0m - 1.0m): Pared sólida pintable
2. **Ventana** (1.0m - 2.5m): Marco + vidrio transparente
3. **Sección superior** (2.5m - 3.0m): Dintel pintable

#### Para Puertas:
```
┌─────────────────┐  ← Sección SUPERIOR (dintel)
│      PARED      │    Altura: 0.9m
├─────────────────┤
│     🚪 PUERTA   │    Altura: 2.1m
│    (hoja)       │    Desde: 0.0m (piso)
└─────────────────┘
```

**2 componentes separados:**
1. **Puerta** (0.0m - 2.1m): Marco + hoja de puerta
2. **Sección superior** (2.1m - 3.0m): Dintel pintable

## Código Implementado

### Constantes de Arquitectura

```typescript
// Ventanas
const WALL_HEIGHT = 3.0                  // Altura total de pared
const WINDOW_HEIGHT = 1.5                // Altura de la ventana
const WINDOW_BOTTOM_FROM_FLOOR = 1.0     // Distancia desde el piso
const WINDOW_TOP = 2.5                   // Parte superior de ventana

// Puertas
const DOOR_HEIGHT = 2.1                  // Altura estándar de puerta
const DOOR_TOP = 2.1                     // Parte superior de puerta
```

### Ventajas de esta Implementación

✅ **No requiere CSG**: Usa solo geometría nativa de Three.js
✅ **Sin z-fighting**: Cada sección es independiente
✅ **Texturas correctas**: Las paredes arriba y abajo se pintan perfectamente
✅ **Realismo arquitectónico**: Respeta proporciones estándar de construcción
✅ **Fácil mantenimiento**: Código claro y documentado
✅ **Debugging incluido**: Logs en consola para verificar dimensiones

## Proporciones Arquitectónicas Reales

### Ventanas:
- **Altura total**: 1.5m (estándar residencial)
- **Base desde piso**: 1.0m (ergonómico para vistas)
- **Antepecho**: 1.0m (protección y privacidad)
- **Dintel**: 0.5m (soporte estructural)

### Puertas:
- **Altura total**: 2.1m (estándar internacional)
- **Base desde piso**: 0.0m (acceso completo)
- **Dintel**: 0.9m (soporte estructural y espacio para instalaciones)

## Verificación Visual

Para verificar que funciona correctamente, observa en el visor 3D:

1. **Ventanas**:
   - ✓ Pared sólida visible DEBAJO de cada ventana
   - ✓ Vidrio transparente EN MEDIO
   - ✓ Pared sólida visible ENCIMA de cada ventana
   - ✓ Marco oscuro alrededor del vidrio

2. **Puertas**:
   - ✓ Hoja de puerta desde el piso
   - ✓ Pared sólida visible ENCIMA (dintel)
   - ✓ Marco oscuro alrededor de la puerta

3. **Texturas**:
   - ✓ Las texturas de pared se aplican a las secciones superior e inferior
   - ✓ El vidrio mantiene su transparencia
   - ✓ Las puertas mantienen su textura de madera

## Logs de Debug

En la consola del navegador verás:
```
🪟 Ventana 1 - Secciones: {
  bottomWallHeight: "1.00",
  windowHeight: "1.50",
  topWallHeight: "0.50",
  bottomWallY: "0.50",
  windowY: "1.75",
  topWallY: "2.75"
}

🚪 Puerta 2 - Secciones: {
  doorHeight: "2.10",
  topWallHeight: "0.90",
  doorY: "1.05",
  topWallY: "2.55"
}
```

## Próximos Pasos (Opcional)

Si necesitas más control:

1. **Ajustar alturas**: Modifica las constantes según tus necesidades
2. **Segmentación lateral**: Añadir secciones a los lados de ventanas/puertas
3. **Texturas específicas**: Diferentes texturas para antepechos vs dinteles
4. **CSG avanzado**: Implementar si necesitas geometrías más complejas

## Archivo Modificado

- `components/floor-plan-3d-viewer.tsx`
  - Función `Object3D` - Renderizado de ventanas
  - Función `Object3D` - Renderizado de puertas

## Fecha de Implementación

3 de noviembre de 2025

---

**Resultado**: Las paredes ahora se pintan correctamente alrededor de ventanas y puertas, sin superposiciones ni z-fighting. ✅
