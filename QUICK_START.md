# 🚀 Inicio Rápido - FloorPlan To 3D

## ✅ Pre-requisitos

- Node.js 18+ instalado
- Python 3.9+ instalado
- Git instalado
- Al menos 4GB de RAM disponible

## 📋 Pasos de Instalación

### 1️⃣ Configurar Backend de FloorPlanTo3D (Flask)

```bash
# Navegar al directorio del backend
cd FloorPlanTo3D-API

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor
python application.py
```

El servidor debería estar corriendo en `http://localhost:5000`

### 2️⃣ Configurar Backend FastAPI

```bash
# Navegar al directorio del backend FastAPI
cd FloorPlanTo3d_Fast_Api

# Crear entorno virtual (si no existe)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor
uvicorn main:application --reload --port 8000
```

El servidor debería estar corriendo en `http://localhost:8000`

### 3️⃣ Configurar Frontend React

```bash
# Navegar al directorio del frontend
cd FloorPlanTo3d_Frontend_React

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend debería estar corriendo en `http://localhost:3000`

## 🎮 Uso de la Aplicación

### Paso 1: Registro y Login

1. Abre `http://localhost:3000` en tu navegador
2. Haz clic en "Registrarse"
3. Completa el formulario de registro
4. Inicia sesión con tus credenciales

### Paso 2: Comprar Suscripción (Opcional en desarrollo)

1. En el dashboard, verás opciones de suscripción
2. Para desarrollo, puedes usar el plan "Pro" o "Ultra"
3. Completa el proceso de pago con Stripe (modo test)

### Paso 3: Subir un Plano

1. En el dashboard, haz clic en **"Subir Planos"**
2. Arrastra y suelta una imagen de un plano arquitectónico
   - Formatos soportados: JPG, PNG, WebP
   - Recomendado: Imágenes claras de planos arquitectónicos
3. Haz clic en **"Convertir a 3D"**
4. Espera mientras el backend procesa la imagen (5-30 segundos)
5. Serás redirigido automáticamente al viewer 3D

### Paso 4: Visualizar el Plano 3D

En el viewer 3D podrás:
- **Rotar**: Click izquierdo + arrastrar
- **Zoom**: Scroll del mouse
- **Mover**: Click derecho + arrastrar
- **Auto-rotar**: Botón "Auto Rotar" en la esquina superior izquierda

## 🖼️ Imágenes de Prueba

Puedes usar las imágenes de ejemplo incluidas en el proyecto:

```
FloorPlanTo3D-API/images/
├── example1.png
├── example2.png
├── handDrawn.png
└── wall1.png
```

## 🔍 Verificar que Todo Funciona

### Verificar Backend Flask:

```bash
curl http://localhost:5000/formats
```

Deberías ver una respuesta JSON con los formatos disponibles.

### Verificar Backend FastAPI:

```bash
curl http://localhost:8000/docs
```

Deberías ver la documentación de Swagger.

### Verificar Frontend:

Abre `http://localhost:3000` - deberías ver la página de inicio.

## 🐛 Problemas Comunes

### Error: "Puerto ya en uso"

**Solución:**
```bash
# Para Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Para macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Error: "Módulo no encontrado" (Python)

**Solución:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Error: "Cannot find module" (Node)

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "CUDA not available" o similar

**Solución:**
El modelo funciona sin GPU, solo será más lento. Asegúrate de tener instalado TensorFlow correctamente:
```bash
pip install tensorflow
```

### Error de CORS

**Solución:**
Verifica que los backends tengan CORS habilitado. En `application.py` ya está configurado:
```python
cors = CORS(application, resources={r"/*": {"origins": "*"}})
```

## 📊 Estructura del Proyecto

```
FloorPlanTo3d_Frontend_React/
├── app/                          # Páginas de Next.js
│   ├── dashboard/               # Página del dashboard
│   ├── upload/                  # Página de subida de planos
│   └── viewer/[id]/            # Viewer 3D dinámico
├── components/                  # Componentes React
│   ├── dashboard/              # Componentes del dashboard
│   ├── floor-plan-3d-viewer.tsx # Viewer 3D con Three.js
│   └── upload-zone.tsx         # Zona de carga de archivos
├── lib/                        # Librerías y utilidades
│   ├── api.ts                  # Cliente FastAPI
│   ├── floorplan-api.ts       # Cliente FloorPlanTo3D API ⭐
│   └── floor-plan-storage.ts  # Almacenamiento local ⭐
└── .env.local                  # Variables de entorno

FloorPlanTo3D-API/              # Backend Flask
├── application.py              # Servidor Flask principal
├── mrcnn/                      # Mask R-CNN
└── weights/                    # Pesos del modelo

FloorPlanTo3d_Fast_Api/         # Backend FastAPI
├── main.py                     # Servidor FastAPI
├── routers/                    # Endpoints
└── models/                     # Modelos de base de datos
```

## 🎯 Flujo Completo de Trabajo

1. **Inicio de sesión** → Dashboard muestra estado
2. **Click en "Subir Planos"** → Página de upload
3. **Seleccionar imagen** → Preview del archivo
4. **Click "Convertir a 3D"** → Procesamiento en backend
5. **Backend analiza imagen** → Detecta paredes, ventanas, puertas
6. **Backend devuelve datos 3D** → Frontend guarda en localStorage
7. **Redirección automática** → Viewer 3D
8. **Visualización 3D** → Interacción con el modelo

## 💡 Tips

- **Imágenes claras**: Usa planos arquitectónicos nítidos para mejores resultados
- **Contraste**: Imágenes con buen contraste funcionan mejor
- **Tamaño**: Imágenes de 1000x1000 a 2000x2000 píxeles son ideales
- **Formato**: PNG suele dar mejores resultados que JPG
- **Procesamiento**: La primera carga del modelo puede tardar más

## 📚 Recursos Adicionales

- [Documentación de Three.js](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🆘 Ayuda

Si encuentras problemas:

1. Revisa los logs de los backends en la consola
2. Abre las DevTools del navegador (F12) y revisa la consola
3. Verifica que las tres aplicaciones estén corriendo
4. Verifica que las URLs en `.env.local` sean correctas
5. Consulta el archivo `INTEGRATION_README.md` para más detalles técnicos

## 🎉 ¡Listo!

Ahora tienes todo configurado para convertir planos 2D en modelos 3D interactivos.

¡Disfruta convirtiendo tus planos arquitectónicos! 🏗️✨

