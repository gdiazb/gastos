# 💰 App de Gastos Compartidos

Una aplicación web moderna para registrar y gestionar gastos compartidos entre pareja. Sincroniza con Google Sheets y está alojada en GitHub Pages.

## 🎤 Nueva Característica: Dictado de Voz

¡Puedes dictar gastos hablando! Solo haz clic en "🎤 Dictar Gastos" y di:

```
"cine $20000, gaseosa $3000"
```

O si tu esposo pagó:
```
"esposo pizza $15000, café $3000"
```

### Características:
- ✅ Reconocimiento de voz en tiempo real
- ✅ Detecta múltiples gastos en una grabación
- ✅ **Detecta quién pagó** (tú o tu esposo) 🆕
- ✅ **Fecha automática** (se agrega hoy) 🆕
- ✅ Categorización automática según el concepto
- ✅ Modal de confirmación con totales por persona
- ✅ Funciona en Chrome, Firefox, Safari, Edge

**Nota:** Requiere permiso de micrófono en tu navegador.

Para más detalles, consulta [VOICE_GUIDE.md](VOICE_GUIDE.md)

---

## 🎯 Características

- ✅ Interfaz moderna y responsiva
- ✅ Registro de gastos con categorías
- ✅ Sincronización con Google Sheets
- ✅ Compartible entre múltiples usuarios
- ✅ Estadísticas en tiempo real
- ✅ Filtrado por mes y categoría
- ✅ Resumen por categoría
- ✅ Autenticación con Google
- ✅ Almacenamiento local (fallback)
- ✅ Totalmente gratuito

## 📋 Requisitos Previos

Antes de empezar, necesitas:
1. Una cuenta Google (gmail)
2. Una cuenta GitHub
3. Git instalado en tu computadora

## 🚀 Guía de Setup Paso a Paso

### PASO 1: Configurar Google Cloud Project

#### 1.1 Crear el proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Haz clic en el selector de proyecto en la parte superior
3. Haz clic en "NUEVO PROYECTO"
4. Nombre: `App Gastos Compartidos`
5. Haz clic en "CREAR"
6. Espera a que se cree (puede tomar unos minutos)

#### 1.2 Habilitar APIs
1. En el buscador superior, busca "Google Sheets API"
2. Haz clic en el primer resultado
3. Haz clic en "HABILITAR"
4. Vuelve atrás y busca "Google Drive API"
5. Haz clic en "HABILITAR"

#### 1.3 Crear credenciales OAuth
1. En el menú lateral, ve a "Credenciales"
2. Haz clic en "+ CREAR CREDENCIALES"
3. Selecciona "ID de cliente de OAuth"
4. Te pedirá crear una pantalla de consentimiento primero:
   - Haz clic en "CREAR PANTALLA DE CONSENTIMIENTO"
   - Selecciona "Usuario Externo"
   - Rellena los campos básicos
   - En "Scopes", busca y agrega: `sheets`, `drive`
   - Guarda y continúa
5. Vuelve a Credenciales y crea "ID de cliente OAuth"
6. Tipo de aplicación: "Aplicación web"
7. Nombre: `App Gastos`
8. En "Orígenes JavaScript autorizados" agrega:
   ```
   https://tuusuario.github.io
   ```
9. En "URIs de redirección autorizados" agrega:
   ```
   https://tuusuario.github.io/gastos/
   ```
10. **Copia tu Client ID** (lo necesitarás)

### PASO 2: Crear Google Sheet Compartido

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea un nuevo archivo: "Gastos Compartidos"
3. En la fila 1 (encabezados), crea estas columnas:
   ```
   A1: Fecha
   B1: Categoría
   C1: Descripción
   D1: Monto
   E1: Pagado por
   F1: ID
   ```
4. **Copia el ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPIA_ESTE_ID]/edit
   ```
5. Comparte el Sheet con tu esposo:
   - Haz clic en "Compartir"
   - Agrega su email
   - Dale permiso de "Editor"

### PASO 3: Descargar y Configurar el Código

#### 3.1 Opción A: Usando Git (Recomendado)

```bash
# Crea una carpeta para el proyecto
mkdir gastos-compartidos
cd gastos-compartidos

# Clona o copia los archivos aquí:
# - index.html
# - style.css
# - app.js
# - config.js
# - README.md
```

#### 3.2 Editar config.js

1. Abre `config.js` en tu editor de texto
2. Reemplaza:
   ```javascript
   SPREADSHEET_ID: "TU_ID_AQUI",
   ```
   Con el ID que copiaste del Google Sheet

3. Reemplaza:
   ```javascript
   GOOGLE_CLIENT_ID: "TU_CLIENT_ID.apps.googleusercontent.com",
   ```
   Con el Client ID que copiaste de Google Cloud

4. **Guarda el archivo**

### PASO 4: Subir a GitHub Pages

#### 4.1 Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea una nueva cuenta si no tienes
2. Haz clic en "+" en la esquina superior derecha
3. Selecciona "New repository"
4. Nombre: `gastos`
5. Descripción: "App de gastos compartidos"
6. Selecciona "Public"
7. Haz clic en "Create repository"

#### 4.2 Subir archivos

En terminal/línea de comandos:

```bash
# Navega a tu carpeta del proyecto
cd gastos-compartidos

# Inicializa git
git init

# Agrega los archivos
git add .

# Crea el primer commit
git commit -m "Initial commit: App de gastos compartidos"

# Vincula con GitHub (reemplaza con tu usuario)
git remote add origin https://github.com/tuusuario/gastos.git

# Cambia la rama a main (si es necesario)
git branch -M main

# Sube los cambios
git push -u origin main
```

#### 4.3 Habilitar GitHub Pages

1. En GitHub, ve a tu repositorio
2. Ve a "Settings" (Configuración)
3. En el menú lateral, haz clic en "Pages"
4. En "Source", selecciona "main"
5. En "Branch", selecciona "main"
6. En "Folder", selecciona "/ (root)"
7. Haz clic en "Save"
8. Espera 2-3 minutos

**Tu app estará en:** `https://tuusuario.github.io/gastos`

## 💡 Cómo Usar la App

### Agregar un Gasto

1. Abre la app en el navegador
2. Haz clic en el botón "Iniciar sesión con Google"
3. Selecciona tu cuenta Google
4. Rellena el formulario:
   - **Fecha**: Selecciona la fecha del gasto
   - **Categoría**: Elige una categoría
   - **Descripción**: Describe el gasto
   - **Monto**: Ingresa la cantidad
   - **Pagado por**: Quién pagó
5. Haz clic en "Agregar Gasto"

### Ver Historial

Los gastos aparecen en la tabla abajo, ordenados por fecha más reciente.

### Filtrar Gastos

- Usa "Filtrar por mes" para ver gastos de un mes específico
- Usa "Filtrar por categoría" para ver solo una categoría
- Haz clic en "Limpiar filtros" para verlos todos

### Ver Resumen

- **Total Gastos**: Suma de todos los gastos
- **Tu Monto**: Lo que pagaste tú
- **Monto de Pareja**: Lo que pagó tu pareja
- **Balance**: Quién debe dinero a quién
- **Por Categoría**: Gasto total por cada categoría

### Eliminar un Gasto

Haz clic en el botón "Eliminar" en la última columna de la tabla.

## ⚙️ Sincronización con Google Sheets

La app intenta sincronizar con Google Sheets automáticamente. Si el acceso a la API no funciona, los datos se guardan en el almacenamiento local del navegador.

### Para sincronización completa bidireccional:

Necesitarías un backend pequeño (recomiendo Firebase o un servidor Node.js simple). Por ahora:

- **Guardar en Sheets manualmente**: Copia los datos de la tabla
- **Importar desde Sheets**: Abre el Sheet y copia los datos
- **O usa Firebase** (te muestro cómo si lo necesitas)

## 🔐 Seguridad

- Las credenciales se manejan a través de Google OAuth
- Tu Client ID y Sheet ID son públicos pero seguros
- Los datos se almacenan en Google Sheets (compartible)
- No se recopila ni vende información personal

## 🛠️ Desarrollo y Personalización

### Agregar una Nueva Categoría

1. Abre `config.js`
2. En `CATEGORIES`, agrega tu nueva categoría
3. Guarda y actualiza la página

### Cambiar Moneda

En `app.js`, busca `formatCurrency()` y cambia:
```javascript
currency: 'COP',  // Cambia a 'USD', 'EUR', etc.
```

### Personalizar Colores

En `style.css`, cambiar los valores de `:root`:
```css
--primary-color: #2563eb;  /* Azul */
--danger-color: #ef4444;   /* Rojo */
```

## 🐛 Troubleshooting

### Error: "CORS policy"
- Significa que la API no está correctamente configurada
- Verifica que tu Google Cloud Project esté completamente configurado

### Error: "Spreadsheet not found"
- Verifica que el SPREADSHEET_ID sea correcto
- Asegúrate de que el Sheet sea accesible

### No aparecen los datos
- Recarga la página
- Abre la consola (F12) para ver errores
- Verifica que hayas iniciado sesión

### Datos no se guardan en Sheets
- Por ahora, los datos se guardan en localStorage
- Para sincronización real, necesitas un backend

## 📱 Responsividad

La app funciona en:
- ✅ Escritorio (Chrome, Firefox, Safari, Edge)
- ✅ Tablet
- ✅ Móvil

## 🚀 Próximos Pasos (Opcional)

1. **Agregar gráficas**: Usa una librería como Chart.js
2. **Exportar a PDF**: Usa jsPDF
3. **Sincronización en tiempo real**: Usa Firebase Realtime Database
4. **App móvil**: Convierte a Progressive Web App (PWA)
5. **Múltiples monedas**: Integra tasas de cambio

## 📝 Notas Importantes

- **Almacenamiento**: Actualmente usa localStorage (local del navegador)
- **Sincronización**: Sincroniza con Sheets solo si OAuth está bien configurado
- **Privacidad**: Los datos están en tu Google Drive, no en servidores terceros

## 📞 Soporte

Si encuentras problemas:
1. Abre la consola (F12) y revisa los errores
2. Verifica que todas las variables en `config.js` estén correctas
3. Asegúrate de tener las APIs habilitadas en Google Cloud

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente.

---

¡Disfruta tu app de gastos! 💰✨
