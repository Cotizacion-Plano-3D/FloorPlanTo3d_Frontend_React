# Plan de Integración de Nuevas Tablas y Flujos (Plano, Modelo3D)

Este documento describe la planificación técnica para integrar las nuevas tablas `Plano` y `Modelo3D` en la base de datos y su uso extremo a extremo en los tres proyectos del monorepo:

- `FloorPlanTo3D-API` (Flask): renderización/conversión de 2D → 3D.
- `FloorPlanTo3d_Fast_Api` (FastAPI): backend principal de negocio, autenticación, pagos y persistencia.
- `FloorPlanTo3d_Frontend_React` (Next.js/React): UI para subir, listar y visualizar planos y sus modelos 3D.

Relacionar con `docs/INTEGRATION_README.md` para detalles de arquitectura y flujo ya implementados.

---

## 1) Objetivos Funcionales

- Como usuario autenticado, puedo subir imágenes de planos 2D, que serán convertidos a 3D por el servicio Flask.
- Puedo ver en cualquier momento la lista de mis `planos` almacenados en la base de datos y, cuando exista, su `modelo 3D` asociado.
- Puedo abrir un viewer 3D para visualizar el resultado almacenado en la base de datos (no depender del `localStorage`).

---

## 2) Modelo de Datos (Tablas Nuevas)

Se asume Postgres (recomendado) o MySQL. Notación: tipos Postgres.

### 2.1 Tabla `plano`

Atributos reales basados en la imagen del diagrama y las necesidades del sistema.

```sql
CREATE TABLE plano (
  id                BIGSERIAL PRIMARY KEY,
  usuario_id        BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nombre            VARCHAR(255) NOT NULL,
  url               TEXT,                              -- ubicación original del archivo (S3/local)
  formato           VARCHAR(32) DEFAULT 'image',       -- jpg|png|pdf|image|svg, etc.
  tipo_plano        VARCHAR(64),                       -- arquitectónico, mano_alzada, etc.
  descripcion       TEXT,
  medidas_extraidas JSONB,                             -- metadatos/medidas detectadas (opcional)
  estado            VARCHAR(24) NOT NULL DEFAULT 'subido',
  fecha_subida      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- índices sugeridos
CREATE INDEX idx_plano_usuario ON plano(usuario_id);
CREATE INDEX idx_plano_estado ON plano(estado);
```

Estados sugeridos de `plano.estado`:
- `subido` → recibido, aún sin enviar a Flask
- `procesando` → en conversión 2D→3D
- `completado` → ya existe un `modelo3d` asociado
- `error` → error al convertir

### 2.2 Tabla `modelo3d`

```sql
CREATE TABLE modelo3d (
  id                 BIGSERIAL PRIMARY KEY,
  plano_id           BIGINT NOT NULL UNIQUE REFERENCES plano(id) ON DELETE CASCADE,
  datos_json         JSONB NOT NULL,                   -- salida de Flask (Three.js-ready)
  estado_renderizado VARCHAR(24) NOT NULL DEFAULT 'generado',
  fecha_generacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_modelo3d_plano ON modelo3d(plano_id);
```

Notas:
- Relación 1:1 → un `plano` puede tener 0..1 `modelo3d`; un `modelo3d` pertenece a exactamente un `plano`.
- `datos_json` almacenará la respuesta cruda/normalizada de Flask para poder renderizar en el viewer sin volver a procesar.

### 2.3 Esquema esperado de `datos_json` (contrato mínimo)

```json
{
  "scene": { "name": "Plano A", "units": "m", "bounds": { "width": 12.3, "height": 9.8 } },
  "objects": [
    {
      "id": "wall-1",
      "type": "wall",          
      "position": { "x": 0, "y": 0, "z": 0 },
      "dimensions": { "width": 3.2, "height": 2.6, "depth": 0.2 },
      "rotation": { "x": 0, "y": 0, "z": 0 }
    }
  ],
  "camera": { "position": { "x": 4, "y": 5, "z": 8 }, "target": { "x": 0, "y": 0, "z": 0 } }
}
```

Este contrato es consistente con lo descrito en `INTEGRATION_README.md` y el viewer actual.

---

## 3) Cambios por Proyecto

### 3.1 `FloorPlanTo3D-API` (Flask)

Rol: servicio de conversión/render. No persiste en su propia BD; devuelve la salida JSON para ser guardada por FastAPI.

- Endpoints:
  - `POST /convert` → body: archivo imagen. Respuesta: `datos_json` (formato Three.js-ready). Mantener CORS.
  - `GET /health` → verificación.
- No requiere cambios de modelos/DB propios; sí normalizar la salida conforme al contrato de `datos_json` anterior.
- En caso de errores, devolver estructura `{ error, details }` para trazabilidad.

### 3.2 `FloorPlanTo3d_Fast_Api` (FastAPI)

Rol: backend de negocio y persistencia.

- Migraciones: usar Alembic para crear tablas `plano` y `modelo3d` y relaciones con `usuario`.
- Modelos (ORM): agregar modelos SQLAlchemy equivalentes a los DDL anteriores.
- Reglas de negocio principales:
  1) Solo el propietario (`usuario_id`) puede ver/editar/borrar su `plano` y su `modelo3d`.
  2) El `estado` del `plano` debe reflejar el ciclo de vida (subido → procesando → completado | error).
  3) Tras recibir la respuesta de Flask, crear o actualizar el `modelo3d` y marcar `plano.estado='completado'`.

- Endpoints (propuesta):
  - `POST /planos` → subir metadatos + archivo (multipart). Crea `plano` (estado `subido`). Retorna `plano`.
  - `POST /planos/{plano_id}/convertir` → orquesta llamada a Flask `/convert`, cambia estado a `procesando`, guarda `modelo3d` con `datos_json`, retorna `modelo3d`.
  - `GET /planos` → lista paginada de planos del usuario actual.
  - `GET /planos/{plano_id}` → detalle del plano (incluye `modelo3d` si existe).
  - `DELETE /planos/{plano_id}` → borra plano y cascada a `modelo3d`.
  - `GET /modelos3d/{plano_id}` → retorna solo el `datos_json` del plano.

- Seguridad/CORS: usar el middleware de auth existente; todas las rutas anteriores requieren usuario autenticado.

### 3.3 `FloorPlanTo3d_Frontend_React` (Next.js)

- Nuevas pantallas/funciones:
  - Dashboard → En boton "Mis Planos" en app/components/dashboard/Dashboard.tsx lineas 368 a 371, reutilizar el componente floor-plan-gallery.tsx
  - Mostrar la  informacion de un plano: nombre, estado, fecha, acciones (Ver, Convertir si no existe modelo, Eliminar).
  - Viewer 3D → nueva ruta `app/viewer/[planoId]/page.tsx` que consulta `GET /modelos3d/{plano_id}` y renderiza con el componente existente.
- Servicios:
  - Cliente API para `planos` y `modelos3d` (reutilizar estructura de `lib/*` y lo descrito en `INTEGRATION_README.md`).
  - Manejo de estados de conversión (spinners, toasts de éxito/error).
- Autorización: token/jwt ya manejado por el contexto de auth del proyecto.

---

## 4) Flujo End-to-End

1. Usuario autenticado sube imagen desde el frontend → `POST /planos` (FastAPI) guarda `plano` en estado `subido`.
2. Usuario pulsa "Convertir a 3D" → frontend llama `POST /planos/{id}/convertir`.
3. FastAPI llama a Flask `/convert`, marca `procesando`, recibe `datos_json`.
4. FastAPI persiste `modelo3d(datos_json)` y marca `plano.completado`.
5. Usuario ve su lista en "Mis Planos" y puede abrir el viewer en cualquier momento → `GET /modelos3d/{plano_id}`.

---

## 5) Migraciones y Versionado de Esquema

- Cuando se ejecute el backend de fastapi se crean automaticamente las tablas.
- Semillas: no.

---

## 6) Consideraciones de Seguridad y Privacidad

- Control de acceso por `usuario_id` en todas las consultas.
- Tamaño de archivos: validar límite (p. ej., 10MB) del lado del servidor y cliente.
- Sanitizar `datos_json` recibido desde Flask antes de persistir (validación con `pydantic`).
- CORS consistente entre Frontend ↔ FastAPI ↔ Flask.

---

## 7) Estrategia de Pruebas

- Unitarias (FastAPI): servicios y repositorios para CRUD de `plano` y `modelo3d`.
- Integración: orquestación `convertir` simulando respuesta de Flask.
- E2E manual: subir → convertir → listar → ver en viewer.

---

## 8) Tareas (Backlog Técnico)

### ✅ COMPLETADO - Backend FastAPI
- ✅ Crear modelos SQLAlchemy (`Plano`, `Modelo3D`) con relaciones correctas
- ✅ Crear esquemas Pydantic para validación de datos
- ✅ Implementar repositorios para CRUD de planos y modelos3d
- ✅ Crear servicios de negocio para orquestación con Flask
- ✅ Implementar endpoints REST completos:
  - `POST /planos` - Subir plano con archivo
  - `GET /planos` - Lista paginada de planos del usuario
  - `GET /planos/{id}` - Detalle del plano
  - `PUT /planos/{id}` - Actualizar plano
  - `DELETE /planos/{id}` - Eliminar plano
  - `POST /planos/{id}/convertir` - Convertir a 3D
  - `GET /planos/{id}/modelo3d` - Datos del modelo 3D
- ✅ Configurar CORS y autenticación
- ✅ Agregar variable de entorno `FLOORPLAN_API_URL`

### ✅ COMPLETADO - Frontend React
- ✅ Crear tipos TypeScript para `Plano`, `Modelo3D`, etc.
- ✅ Extender cliente API con métodos para planos
- ✅ Crear componente `MisPlanos` con funcionalidades completas
- ✅ Integrar "Mis Planos" en Dashboard con modal
- ✅ Crear página viewer `/viewer/plano/[planoId]` que consume API
- ✅ Manejar estados de conversión (subido, procesando, completado, error)
- ✅ Implementar acciones: Ver, Convertir, Eliminar, Reintentar

### 🔄 PENDIENTE - Flask
- ⏳ Normalizar salida a contrato `datos_json` (formato Three.js)
- ⏳ Asegurar CORS y endpoint `health`
- ⏳ Verificar compatibilidad con contrato de datos esperado

---

## 9) Instrucciones de Uso

### Configuración Inicial

1. **Variables de Entorno FastAPI** (`.env`):
   ```env
   FLOORPLAN_API_URL=http://localhost:5000
   ```

2. **Iniciar Backend FastAPI**:
   ```bash
   cd FloorPlanTo3d_Fast_Api
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:application --reload --port 8000
   ```

3. **Iniciar Frontend**:
   ```bash
   cd FloorPlanTo3d_Frontend_React
   npm install
   npm run dev
   ```

### Flujo de Usuario

1. **Subir Plano**: Usuario va a Dashboard → "Subir Planos" → Selecciona archivo → Se crea registro en BD
2. **Convertir a 3D**: Usuario va a "Mis Planos" → Click "Convertir" → FastAPI llama a Flask → Se guarda modelo3d
3. **Visualizar**: Usuario click "Ver" → Se abre viewer 3D con datos de la BD

### Estructura de Archivos Creados

**Backend FastAPI:**
- `models/plano.py` - Modelo SQLAlchemy para Plano
- `models/modelo3d.py` - Modelo SQLAlchemy para Modelo3D
- `schemas/plano_schemas.py` - Esquemas Pydantic para Plano
- `schemas/modelo3d_schemas.py` - Esquemas Pydantic para Modelo3D
- `repositories/plano_repository.py` - Repositorio CRUD para Plano
- `repositories/modelo3d_repository.py` - Repositorio CRUD para Modelo3D
- `services/plano_service.py` - Servicio de negocio con orquestación Flask
- `routers/planos.py` - Endpoints REST para planos

**Frontend React:**
- `types/api.ts` - Tipos TypeScript actualizados
- `lib/api.ts` - Cliente API extendido
- `components/mis-planos.tsx` - Componente para listar planos
- `app/viewer/plano/[planoId]/page.tsx` - Página viewer para planos específicos
- `components/dashboard/Dashboard.tsx` - Dashboard actualizado con "Mis Planos"

## 10) Anexos

- El diagrama ER de referencia es el proporcionado en la imagen del usuario.
- Ver `docs/INTEGRATION_README.md` para detalles de arquitectura, viewer y formatos soportados.


