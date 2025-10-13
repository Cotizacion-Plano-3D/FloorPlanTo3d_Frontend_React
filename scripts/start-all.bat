@echo off
REM Script para iniciar todos los servicios en Windows
REM Uso: scripts\start-all.bat

echo 🚀 Iniciando todos los servicios de FloorPlan To 3D...
echo.

REM Verificar Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado
    exit /b 1
)

REM Verificar Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python no está instalado
    exit /b 1
)

echo 1️⃣ Iniciando Backend FloorPlanTo3D (Flask - Puerto 5000)...
cd ..\FloorPlanTo3D-API
if exist venv (
    call venv\Scripts\activate.bat
    start "Flask Backend" cmd /k "python application.py"
    echo ✓ Backend Flask iniciado
) else (
    echo ❌ No se encontró el entorno virtual en FloorPlanTo3D-API
    echo    Ejecuta: python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    exit /b 1
)
cd ..\FloorPlanTo3d_Frontend_React

timeout /t 3 /nobreak >nul

echo 2️⃣ Iniciando Backend FastAPI (Puerto 8000)...
cd ..\FloorPlanTo3d_Fast_Api
if exist venv (
    call venv\Scripts\activate.bat
    start "FastAPI Backend" cmd /k "uvicorn main:application --reload --port 8000"
    echo ✓ Backend FastAPI iniciado
) else (
    echo ❌ No se encontró el entorno virtual en FloorPlanTo3d_Fast_Api
    echo    Ejecuta: python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    exit /b 1
)
cd ..\FloorPlanTo3d_Frontend_React

timeout /t 3 /nobreak >nul

echo 3️⃣ Iniciando Frontend React (Puerto 3000)...
if exist node_modules (
    start "React Frontend" cmd /k "npm run dev"
    echo ✓ Frontend React iniciado
) else (
    echo ❌ No se encontró node_modules
    echo    Ejecuta: npm install
    exit /b 1
)

echo.
echo ✅ Todos los servicios iniciados exitosamente!
echo.
echo 📊 Estado de los servicios:
echo    Flask API:    http://localhost:5000
echo    FastAPI:      http://localhost:8000
echo    Frontend:     http://localhost:3000
echo.
echo Para detener los servicios, cierra las ventanas de terminal
echo.

pause

