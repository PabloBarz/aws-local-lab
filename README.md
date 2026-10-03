# 🚀 Proyecto Serverless con Node.js y AWS Local (Floci/LocalStack)

Este proyecto es una aplicación web interactiva que simula un entorno Cloud utilizando **Node.js (Express)** en el backend y **(Floci/Docker)** para emular los servicios de AWS de manera local.

El sistema permite subir archivos a la nube (S3), guardar sus metadatos en una base de datos NoSQL (DynamoDB), ejecutar procesos en segundo plano mediante eventos (AWS Lambda) y automatizar rutinas programadas (EventBridge Scheduler).

---

## 📂 Documentación del Proyecto

Dado que el entorno local con Floci es efímero (los recursos se eliminan al apagar Docker), es estrictamente necesario recrear los servicios cada vez que se inicia el proyecto.

Para facilitar la evaluación y el uso de este proyecto, la documentación está dividida en dos guías detalladas. **Por favor, sigue el orden a continuación:**

1. [⚙️ Guía de Instalación y Creación de Recursos](./INSTALACION.md)
   *Aquí encontrarás paso a paso cómo levantar el entorno, instalar dependencias y crear los servicios (S3, DynamoDB, Lambdas) usando comandos de terminal (Linux/Windows) o la interfaz gráfica.*

2. [🧪 Guía de Uso, Pruebas y Logs](./USO.md)
   *Manual para probar la subida de archivos, listar elementos, disparar el EventBridge Scheduler y cómo visualizar los logs de ejecución en Docker.*

---

## 🛠 Arquitectura y Tecnologías
- **Backend:** Node.js, Express.js.
- **AWS SDK:** `@aws-sdk/client-s3`, `@aws-sdk/client-dynamodb`, `@aws-sdk/client-lambda`, `@aws-sdk/client-scheduler`.
- **Servicios Emulados (Floci/LocalStack):** S3, DynamoDB, Lambda, EventBridge.

---
**Desarrollado por:** Roberto Pablo Barzola Claudio  
*Ingeniería de Software con Inteligencia Artificial - SENATI*