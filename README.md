# FloorPlan to 3D - Frontend React

Este repositorio contiene la aplicación frontend para FloorPlan to 3D, una aplicación Next.js preparada para desarrollo y para ejecutarse en Docker.

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

## Contacto
Si quieres que automatice tests o mejore el Dockerfile (caching, usuario no root, etc.), dime y lo implemento.
