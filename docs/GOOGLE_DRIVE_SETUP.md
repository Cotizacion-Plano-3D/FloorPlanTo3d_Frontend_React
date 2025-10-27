# Configuración de Google Drive API

## Pasos para configurar Google Drive

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Drive API:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Drive API"
   - Haz clic en "Enable"

### 2. Crear credenciales OAuth 2.0

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth client ID"
3. Selecciona "Desktop application" como tipo de aplicación
4. Dale un nombre a tu aplicación (ej: "FloorPlan3D API")
5. Descarga el archivo JSON de credenciales

### 3. Configurar el archivo de credenciales

1. Renombra el archivo descargado a `credentials.json`
2. Colócalo en la raíz del proyecto FastAPI: `FloorPlanTo3d_Fast_Api/credentials.json`

### 4. Estructura de archivos esperada

```
FloorPlanTo3d_Fast_Api/
├── credentials.json          # Archivo de credenciales de Google Cloud
├── token.pickle             # Token de autenticación (se crea automáticamente)
├── services/
│   └── google_drive_service.py
└── ...
```

### 5. Permisos del folder de Google Drive

El folder compartido debe tener los siguientes permisos:
- **ID del folder**: `1_Mv_vpgc-0LCEuPaI49Ym3xvzvRhW7OW`
- **Permisos necesarios**: 
  - Lectura y escritura para la cuenta de servicio
  - Acceso público para lectura (para que las URLs funcionen)

### 6. Primera ejecución

La primera vez que ejecutes la aplicación:

1. Se abrirá automáticamente el navegador para autenticación
2. Inicia sesión con la cuenta que tiene acceso al folder compartido
3. Autoriza la aplicación
4. Se creará automáticamente el archivo `token.pickle` para futuras autenticaciones

### 7. Variables de entorno

Asegúrate de que tu archivo `.env` tenga:

```env
GOOGLE_DRIVE_FOLDER_ID=1_Mv_vpgc-0LCEuPaI49Ym3xvzvRhW7OW
```

### 8. Instalación de dependencias

```bash
pip install -r requirements.txt
```

### 9. Prueba de funcionamiento

Una vez configurado, cuando subas un plano:

1. El archivo se subirá automáticamente a Google Drive
2. Se guardará la URL de Google Drive en el campo `url` de la tabla `plano`
3. Las imágenes serán accesibles públicamente a través de la URL generada

## Solución de problemas

### Error: "Archivo de credenciales no encontrado"
- Verifica que `credentials.json` esté en la raíz del proyecto FastAPI
- Asegúrate de que el archivo tenga el nombre correcto

### Error: "Token expirado"
- Elimina el archivo `token.pickle`
- Reinicia la aplicación para reautenticar

### Error: "Sin permisos para acceder al folder"
- Verifica que la cuenta autenticada tenga acceso al folder compartido
- Asegúrate de que el ID del folder sea correcto

### Error: "Archivo no se puede hacer público"
- Verifica que la cuenta tenga permisos de administrador en el folder
- Asegúrate de que el folder permita archivos públicos
