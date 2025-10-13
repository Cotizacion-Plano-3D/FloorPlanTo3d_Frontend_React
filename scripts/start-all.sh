#!/bin/bash

# Script para iniciar todos los servicios necesarios
# Uso: ./scripts/start-all.sh

echo "🚀 Iniciando todos los servicios de FloorPlan To 3D..."
echo ""

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

# Verificar Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python no está instalado${NC}"
    exit 1
fi

# Determinar comando de Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

echo -e "${BLUE}1️⃣ Iniciando Backend FloorPlanTo3D (Flask - Puerto 5000)...${NC}"
cd ../FloorPlanTo3D-API
if [ -d "venv" ]; then
    source venv/bin/activate
    $PYTHON_CMD application.py &
    FLASK_PID=$!
    echo -e "${GREEN}✓ Backend Flask iniciado (PID: $FLASK_PID)${NC}"
else
    echo -e "${RED}❌ No se encontró el entorno virtual en FloorPlanTo3D-API${NC}"
    echo "   Ejecuta: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi
cd -

sleep 2

echo -e "${BLUE}2️⃣ Iniciando Backend FastAPI (Puerto 8000)...${NC}"
cd ../FloorPlanTo3d_Fast_Api
if [ -d "venv" ]; then
    source venv/bin/activate
    uvicorn main:application --reload --port 8000 &
    FASTAPI_PID=$!
    echo -e "${GREEN}✓ Backend FastAPI iniciado (PID: $FASTAPI_PID)${NC}"
else
    echo -e "${RED}❌ No se encontró el entorno virtual en FloorPlanTo3d_Fast_Api${NC}"
    echo "   Ejecuta: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi
cd -

sleep 2

echo -e "${BLUE}3️⃣ Iniciando Frontend React (Puerto 3000)...${NC}"
if [ -d "node_modules" ]; then
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ Frontend React iniciado (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ No se encontró node_modules${NC}"
    echo "   Ejecuta: npm install"
    kill $FLASK_PID 2>/dev/null
    kill $FASTAPI_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Todos los servicios iniciados exitosamente!${NC}"
echo ""
echo "📊 Estado de los servicios:"
echo -e "   ${BLUE}Flask API:${NC}    http://localhost:5000"
echo -e "   ${BLUE}FastAPI:${NC}      http://localhost:8000"
echo -e "   ${BLUE}Frontend:${NC}     http://localhost:3000"
echo ""
echo "PIDs de los procesos:"
echo "   Flask: $FLASK_PID"
echo "   FastAPI: $FASTAPI_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "Para detener todos los servicios, presiona Ctrl+C"

# Guardar PIDs en un archivo
echo "$FLASK_PID" > .pids
echo "$FASTAPI_PID" >> .pids
echo "$FRONTEND_PID" >> .pids

# Esperar a que se presione Ctrl+C
trap "echo ''; echo 'Deteniendo servicios...'; kill $FLASK_PID $FASTAPI_PID $FRONTEND_PID 2>/dev/null; rm .pids 2>/dev/null; echo 'Servicios detenidos'; exit 0" INT

# Mantener el script corriendo
wait

