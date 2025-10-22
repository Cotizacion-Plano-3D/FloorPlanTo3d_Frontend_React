# 🛠️ Comandos Útiles - FloorPlan To 3D

## 🚀 Inicio Rápido

### Iniciar Todos los Servicios

**Windows:**
```bash
cd FloorPlanTo3d_Frontend_React
scripts\start-all.bat
```

**macOS/Linux:**
```bash
cd FloorPlanTo3d_Frontend_React
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

### Iniciar Servicios Individualmente

#### 1️⃣ Backend FloorPlanTo3D (Flask)
```bash
cd FloorPlanTo3D-API
python -m venv venv                          # Solo primera vez
source venv/bin/activate                     # macOS/Linux
# O: venv\Scripts\activate                   # Windows
pip install -r requirements.txt              # Solo primera vez
python application.py
```

#### 2️⃣ Backend FastAPI
```bash
cd FloorPlanTo3d_Fast_Api
python -m venv venv                          # Solo primera vez
source venv/bin/activate                     # macOS/Linux
# O: venv\Scripts\activate                   # Windows
pip install -r requirements.txt              # Solo primera vez
uvicorn main:application --reload --port 8000
```

#### 3️⃣ Frontend React
```bash
cd FloorPlanTo3d_Frontend_React
npm install                                  # Solo primera vez
cp .env.example .env.local                  # Solo primera vez
npm run dev
```

---

## 📦 Instalación de Dependencias

### Frontend
```bash
cd FloorPlanTo3d_Frontend_React
npm install
```

### Backend Flask
```bash
cd FloorPlanTo3D-API
python -m venv venv
source venv/bin/activate  # macOS/Linux
# O: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Backend FastAPI
```bash
cd FloorPlanTo3d_Fast_Api
python -m venv venv
source venv/bin/activate  # macOS/Linux
# O: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

---

## 🔍 Verificación de Servicios

### Verificar Backend Flask
```bash
curl http://localhost:5000/formats
```

### Verificar Backend FastAPI
```bash
curl http://localhost:8000/docs
# O abre en navegador: http://localhost:8000/docs
```

### Verificar Frontend
```bash
# Abre en navegador: http://localhost:3000
```

---

## 🧹 Limpieza y Reinstalación

### Limpiar Frontend
```bash
cd FloorPlanTo3d_Frontend_React
rm -rf node_modules package-lock.json
npm install
```

### Limpiar Backend Flask
```bash
cd FloorPlanTo3D-API
rm -rf venv
python -m venv venv
source venv/bin/activate  # macOS/Linux
# O: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Limpiar Backend FastAPI
```bash
cd FloorPlanTo3d_Fast_Api
rm -rf venv
python -m venv venv
source venv/bin/activate  # macOS/Linux
# O: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

---

## 🐛 Solución de Problemas

### Puerto Ya en Uso

**Encontrar y Matar Proceso en Windows:**
```bash
# Ver qué está usando el puerto 5000
netstat -ano | findstr :5000

# Matar proceso (reemplaza <PID> con el número)
taskkill /PID <PID> /F

# Ejemplo para puertos comunes
netstat -ano | findstr :3000  # Frontend
netstat -ano | findstr :5000  # Flask
netstat -ano | findstr :8000  # FastAPI
```

**En macOS/Linux:**
```bash
# Ver qué está usando el puerto
lsof -ti:5000

# Matar proceso
lsof -ti:5000 | xargs kill -9

# Ejemplo para puertos comunes
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # Flask
lsof -ti:8000 | xargs kill -9  # FastAPI
```

### Reinstalar Dependencias de Python
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Limpiar Caché de npm
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Comandos de Desarrollo

### Frontend

#### Desarrollo
```bash
npm run dev           # Iniciar en modo desarrollo
```

#### Build
```bash
npm run build         # Build para producción
npm start             # Iniciar servidor de producción
```

#### Linting
```bash
npm run lint          # Ejecutar linter
```

#### Tests
```bash
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
```

### Backend Flask

#### Desarrollo
```bash
python application.py
```

#### Con auto-reload (usando flask)
```bash
export FLASK_APP=application.py
export FLASK_ENV=development
flask run --port 5000
```

### Backend FastAPI

#### Desarrollo
```bash
uvicorn main:application --reload --port 8000
```

#### Producción
```bash
uvicorn main:application --host 0.0.0.0 --port 8000
```

---

## 🔧 Configuración

### Ver Variables de Entorno (Frontend)
```bash
cd FloorPlanTo3d_Frontend_React
cat .env.local
```

### Crear archivo .env.local
```bash
cp .env.example .env.local
```

### Editar Variables de Entorno
```bash
# Windows
notepad .env.local

# macOS
open -e .env.local

# Linux
nano .env.local
# O: gedit .env.local
```

---

## 📝 Logs y Debugging

### Ver Logs de Frontend
```bash
# Los logs aparecen en la terminal donde ejecutaste 'npm run dev'
# También en el navegador: F12 > Console
```

### Ver Logs de Backend Flask
```bash
# Los logs aparecen en la terminal donde ejecutaste 'python application.py'
```

### Ver Logs de Backend FastAPI
```bash
# Los logs aparecen en la terminal donde ejecutaste 'uvicorn ...'
```

### Limpiar localStorage (Frontend)
```javascript
// Abre la consola del navegador (F12) y ejecuta:
localStorage.clear()
// O específicamente:
localStorage.removeItem('floor_plans')
```

---

## 🐳 Docker (Opcional)

### Construir y Ejecutar con Docker

#### Frontend
```bash
cd FloorPlanTo3d_Frontend_React
docker compose -f docker-compose.dev.yml up --build
```

#### Ver Logs
```bash
docker compose -f docker-compose.dev.yml logs --tail=200 --follow
```

#### Detener
```bash
docker compose -f docker-compose.dev.yml down
```

---

## 📦 Gestión de Paquetes

### Actualizar Dependencias de Frontend
```bash
npm outdated                    # Ver paquetes desactualizados
npm update                      # Actualizar paquetes
```

### Actualizar Dependencias de Backend
```bash
pip list --outdated            # Ver paquetes desactualizados
pip install --upgrade <paquete>
```

---

## 🧪 Testing y Calidad

### Frontend
```bash
npm run lint                   # Linter
npm run type-check            # TypeScript check
npm test                      # Tests
npm run test:coverage         # Coverage
```

### Backend
```bash
# Si hay tests configurados
pytest                        # Ejecutar tests
pytest --cov                  # Con coverage
```

---

## 📊 Monitoreo

### Ver Uso de Puerto
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :3000
lsof -i :5000
lsof -i :8000
```

### Ver Procesos de Python
```bash
# Windows
tasklist | findstr python

# macOS/Linux
ps aux | grep python
```

### Ver Procesos de Node
```bash
# Windows
tasklist | findstr node

# macOS/Linux
ps aux | grep node
```

---

## 🔄 Git

### Estado del Proyecto
```bash
git status
git log --oneline -10
```

### Crear Branch para Features
```bash
git checkout -b feature/nueva-funcionalidad
git add .
git commit -m "Añade nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

---

## 📚 Información del Sistema

### Ver Versiones
```bash
node --version
npm --version
python --version
pip --version
```

### Ver Información del Proyecto
```bash
# Frontend
cd FloorPlanTo3d_Frontend_React
npm list --depth=0

# Backend
pip list
```

---

## 🎯 Comandos Más Usados (Resumen)

### Iniciar Todo
```bash
# Windows
scripts\start-all.bat

# macOS/Linux
./scripts/start-all.sh
```

### Verificar Servicios
```bash
curl http://localhost:5000/formats  # Flask
curl http://localhost:8000/docs     # FastAPI
# Abrir http://localhost:3000       # Frontend
```

### Reinstalar Todo
```bash
# Frontend
rm -rf node_modules && npm install

# Backend Flask
rm -rf venv && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Backend FastAPI
rm -rf venv && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

---

## 💡 Tips

1. **Siempre activa el entorno virtual** antes de trabajar con Python
2. **Usa `npm run dev`** para desarrollo con hot-reload
3. **Revisa la consola del navegador (F12)** para errores del frontend
4. **Revisa la terminal** donde corren los backends para errores del servidor
5. **Usa los scripts de inicio** para ahorrar tiempo

---

**Guardados como favoritos estos comandos te ayudarán en el día a día! 🚀**

