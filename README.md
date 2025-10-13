# FloorPlan to 3D - Frontend React

Este repositorio contiene la aplicación frontend para FloorPlan to 3D, una aplicación Next.js que permite convertir planos arquitectónicos 2D en modelos 3D interactivos usando Deep Learning.

## 🌟 Características Principales

- ✅ **Autenticación de usuarios** con JWT
- 💳 **Sistema de suscripciones** con Stripe
- 📤 **Carga de planos** con drag & drop
- 🤖 **Conversión automática 2D → 3D** usando Mask R-CNN
- 🎮 **Visualizador 3D interactivo** con Three.js
- 💾 **Almacenamiento local** de planos procesados
- 📊 **Dashboard** con estadísticas y gestión de suscripciones

## 🏗️ Arquitectura del Sistema

Este proyecto se conecta con dos backends:

1. **FastAPI Backend** (`FloorPlanTo3d_Fast_Api`) - Autenticación, pagos y gestión de usuarios
2. **FloorPlanTo3D API** (`FloorPlanTo3D-API`) - Conversión de planos usando Deep Learning

## 🚀 Inicio Rápido

Para una guía completa paso a paso, consulta **[QUICK_START.md](QUICK_START.md)**

### Configuración Básica

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FLOORPLAN_API_URL=http://localhost:5000
```

3. **Iniciar en modo desarrollo:**
```bash
npm run dev
```

Abre http://localhost:3000

### Iniciar Todos los Servicios

Para iniciar el frontend y ambos backends simultáneamente:

**En Windows:**
```bash
scripts\start-all.bat
```

**En macOS/Linux:**
```bash
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

## Requisitos
- Node.js 22.x (probado con v22.14.0)
- npm (incluido con Node)
- (Opcional) Docker Desktop si quieres ejecutar en contenedores

## Instalación local (desarrollo)
1. Instalar dependencias:
```powershell
npm install
```
> Nota: originalmente el proyecto tenía `react@^19` pero varios paquetes no eran compatibles; por estabilidad se fijaron `react` y `react-dom` a `18.2.0`.

2. Levantar en modo desarrollo:
```powershell
npm run dev
```
Abre http://localhost:3000

## Ejecutar con Docker (desarrollo)
1. Asegúrate de tener Docker Desktop instalado y ejecutándose.
2. Levantar con Docker Compose:
```powershell
docker compose -f docker-compose.dev.yml up --build
```
3. (Opcional) Ejecutar en background:
```powershell
docker compose -f docker-compose.dev.yml up --build -d
docker ps
docker compose -f docker-compose.dev.yml logs --tail=200
```
4. Detener y limpiar:
```powershell
docker compose -f docker-compose.dev.yml down
```

## Build para producción (local)
```powershell
npm run build
npm start
```

## Notas técnicas y decisiones
- Se añadió un `Dockerfile` multi-stage y `docker-compose.dev.yml` para facilitar onboarding y reproducibilidad.
- Para resolver conflictos de peer-dependencies detectados durante la instalación, se fijaron `react` y `react-dom` a la versión `18.2.0`. Si deseas migrar a React 19 en el futuro, revisa dependencias como `vaul` y otras que puedan requerir soporte.

## Problemas comunes
- Error `open //./pipe/dockerDesktopLinuxEngine: El sistema no puede encontrar el archivo especificado.`
  - Asegúrate de que Docker Desktop esté en ejecución. Reinicia Docker Desktop o el sistema si es necesario.

## 📚 Documentación

- **[QUICK_START.md](QUICK_START.md)** - Guía de inicio rápido
- **[INTEGRATION_README.md](INTEGRATION_README.md)** - Documentación técnica de la integración
- **[.env.example](.env.example)** - Variables de entorno necesarias

## 🎯 Uso de la Aplicación

### 1. Registro y Login
1. Abre `http://localhost:3000`
2. Regístrate como nuevo usuario
3. Inicia sesión con tus credenciales

### 2. Suscripción
1. En el dashboard, selecciona un plan (Pro o Ultra)
2. Completa el proceso de pago con Stripe
3. Tu suscripción se activará automáticamente

### 3. Convertir Planos a 3D
1. Haz clic en **"Subir Planos"** en el dashboard
2. Arrastra y suelta una imagen de un plano arquitectónico
3. Haz clic en **"Convertir a 3D"**
4. Espera mientras se procesa (5-30 segundos)
5. Visualiza el modelo 3D interactivo

### Controles del Viewer 3D
- **Rotar**: Click izquierdo + arrastrar
- **Zoom**: Scroll del mouse
- **Mover**: Click derecho + arrastrar
- **Auto-rotar**: Botón en la esquina superior izquierda

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Three.js** - Renderizado 3D
- **React Three Fiber** - Three.js para React
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI

### Backend Integration
- **FastAPI** - API de autenticación y pagos
- **Flask** - API de conversión de planos
- **Mask R-CNN** - Detección de objetos en planos
- **TensorFlow** - Framework de Deep Learning

## 📁 Estructura del Proyecto

```
FloorPlanTo3d_Frontend_React/
├── app/                          # Páginas de Next.js
│   ├── dashboard/               # Dashboard de usuario
│   ├── upload/                  # Página de carga
│   └── viewer/[id]/            # Visualizador 3D
├── components/                  # Componentes React
│   ├── dashboard/              
│   ├── floor-plan-3d-viewer.tsx # ⭐ Viewer 3D
│   └── upload-zone.tsx         # ⭐ Zona de carga
├── lib/                        
│   ├── api.ts                  # Cliente FastAPI
│   ├── floorplan-api.ts       # ⭐ Cliente FloorPlanTo3D
│   └── floor-plan-storage.ts  # ⭐ Almacenamiento local
├── scripts/                    # Scripts de utilidad
│   ├── start-all.sh           # Iniciar todos los servicios (Unix)
│   └── start-all.bat          # Iniciar todos los servicios (Windows)
├── .env.example               # Variables de entorno
├── QUICK_START.md            # Guía de inicio rápido
└── INTEGRATION_README.md     # Documentación técnica
```

## 🔧 Variables de Entorno

```env
# Backend FastAPI (autenticación y pagos)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend FloorPlanTo3D (conversión de planos)
NEXT_PUBLIC_FLOORPLAN_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Error: "FloorPlan API no disponible"
- Verifica que el backend Flask esté corriendo en el puerto 5000
- Verifica que `NEXT_PUBLIC_FLOORPLAN_API_URL` esté configurado

### Error: "Cannot convert floor plan"
- Verifica que la imagen sea un formato válido (JPG, PNG)
- Verifica que el modelo de Mask R-CNN esté cargado
- Revisa los logs del backend Flask

### Objetos 3D no se renderizan
- Abre DevTools (F12) y revisa la consola
- Verifica que los datos de `threejsData` estén completos
- Intenta recargar la página

Para más ayuda, consulta [INTEGRATION_README.md](INTEGRATION_README.md)

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## 📦 Build para Producción

```bash
# Build local
npm run build
npm start

# Build con Docker
docker compose -f docker-compose.dev.yml up --build
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de un trabajo académico para el curso INF422 - Ingeniería de Software I.

## 💬 Contacto

Si tienes preguntas o sugerencias sobre la integración, consulta la documentación técnica en [INTEGRATION_README.md](INTEGRATION_README.md)
