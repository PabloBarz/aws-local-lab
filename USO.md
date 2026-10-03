# 🧪 Guía de Uso, Pruebas y Logs

Una vez que los servicios de Floci están creados y el servidor en Node.js está en ejecución, sigue estos pasos para probar todas las funcionalidades del proyecto.

---

## 📂 1. Flujo de Subida de Archivos

1. Abre tu navegador y dirígete a [http://localhost:3000](http://localhost:3000).
2. En la pantalla principal, haz clic en **Seleccionar archivo** y elige un archivo de tu computadora.
3. Haz clic en el botón **Subir archivo**.
4. **¿Qué sucede internamente?**
   - El archivo físico se envía al bucket de S3 (`laboratorio-floci`).
   - Los metadatos (nombre, tipo, tamaño) se guardan como un nuevo registro en la tabla DynamoDB (`archivos`).
   - El backend invoca de forma asíncrona a la función Lambda `notificador-s3`.
5. **Verificación Local:** 
   - Ve a la interfaz de Floci y verifica que el archivo exista en S3 y el registro en DynamoDB.
   - Revisa la carpeta raíz de este proyecto Node.js; se habrá generado automáticamente una carpeta llamada `/notificaciones`. Abre el archivo `.txt` que está dentro para confirmar que la Lambda fue ejecutada y generó el reporte.

---

## 🗂 2. Visualización, Descarga y Eliminación

1. En la página principal, haz clic en el botón **Ver listado**.
2. **Listar:** Verás una tabla dinámica que consume la API del backend, la cual lee todos los registros directamente desde DynamoDB.
3. **Descargar:** Al hacer clic en descargar, el sistema busca el objeto en S3 y te permite guardarlo en tu equipo.
4. **Eliminar:** Si haces clic en eliminar, el backend ejecutará dos acciones simultáneas:
   - Borrará el registro de la tabla `archivos` en DynamoDB.
   - Eliminará el objeto físico del bucket en S3.

---

## ⏱ 3. Automatización (EventBridge Scheduler)

1. Desde el inicio, haz clic en el botón **Funciones LAMBDA** para acceder al panel de control de automatización.
2. Haz clic en **Iniciar Rutina**.
3. **¿Qué sucede internamente?** 
   - El sistema crea un Schedule en AWS EventBridge que invocará la función `lambda-scheduler-kardex` automáticamente cada 1 minuto (ideal para simular cierres de inventario o reportes programados).
4. El estado en la interfaz cambiará para indicar que la rutina está activa.
5. Puedes detenerla haciendo clic en **Detener**, lo cual eliminará la regla del Scheduler.

---

## 🔍 4. Cómo visualizar los Logs de ejecución (Docker / Floci)

Para confirmar que las Lambdas y el Scheduler se están ejecutando correctamente a nivel de contenedor, es necesario revisar los logs de Floci.

### Opción A: Usando Docker Desktop (Recomendado para Windows / Mac)
1. Abre **Docker Desktop**.
2. Dirígete a la pestaña de **Containers** (Contenedores).
3. Busca el contenedor asociado a Floci.
4. Haz clic sobre el nombre del contenedor y ve a la pestaña **Logs**.
5. Aquí verás la terminal en tiempo real. Cada vez que subas un archivo o el Scheduler dispare la rutina de 1 minuto, verás los `console.log` de la ejecución de la Lambda reflejados en esta pantalla.

### Opción B: Usando la Terminal (Linux / Windows PowerShell)
1. Abre tu terminal.
2. Identifica el ID o nombre del contenedor ejecutando:
   ```bash
   docker ps
   ```
3. Copia el CONTAINER ID (o el nombre de la columna NAMES) que corresponda Floci.
4. Ejecuta el siguiente comando para ver los logs en vivo (reemplaza ID_DEL_CONTENEDOR con tu ID):
    ```bash
   docker logs -f ID_DEL_CONTENEDOR
   ```
5. Nota: Para salir de la visualización de logs en la terminal, presiona Ctrl + C.

### 📋 5. Resumen de pruebas

| Funcionalidad | Acción | Servicio involucrado | Resultado esperado |
| :--- | :--- | :--- | :--- |
| Subir archivo | Seleccionar y subir | S3 + DynamoDB + Lambda | Archivo y metadatos almacenados |
| Ver listado | Clic en `Ver listado` | DynamoDB | Aparece el archivo |
| Descargar | Clic en `Descargar` | S3 | Archivo descargado |
| Eliminar | Clic en `Eliminar` | S3 + DynamoDB | Archivo y registro eliminados |
| Notificación | Subir archivo | Lambda `notificador-s3` | Se genera la notificación |
| Iniciar rutina | Clic en `Iniciar Rutina` | EventBridge Scheduler | Scheduler activo |
| Ejecución automática | Esperar 1 minuto | Lambda `lambda-scheduler-kardex` | Lambda ejecutada |
| Detener rutina | Clic en `Detener` | EventBridge Scheduler | Scheduler eliminado |
| Logs | `docker logs -f` | Docker + Floci | Logs visibles en tiempo real |