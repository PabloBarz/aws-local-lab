# ⚙️ Guía de Instalación y Creación de Recursos

Esta guía explica cómo instalar, configurar y levantar el proyecto utilizando **Floci**, **AWS CLI**, **Node.js** y los servicios AWS emulados localmente.

Los recursos utilizados por el proyecto son:

- **S3:** bucket `laboratorio-floci`
- **DynamoDB:** tabla `archivos`
- **Lambda:** `notificador-s3`
- **Lambda:** `lambda-scheduler-kardex`
- **Node.js:** servidor de la aplicación

---

# 📋 1. Requisitos previos

Antes de comenzar, debes tener instalado:

1. Docker / Docker Desktop.
2. Floci ejecutándose.
3. AWS CLI.
4. Node.js y npm.
5. El proyecto descargado o clonado.
6. Los archivos `.zip` de las funciones Lambda.

Puedes comprobar AWS CLI con:

```bash
aws --version
```

Puedes comprobar Node.js con:

```bash
node --version
```

Puedes comprobar npm con:

```bash
npm --version
```

Floci debe estar disponible mediante:

```text
http://localhost.floci.io:4566
```

---

# 🚀 2. Creación de recursos mediante terminal

La creación mediante terminal es el método recomendado.

Los comandos siguientes utilizan AWS CLI y apuntan a Floci mediante:

```text
http://localhost.floci.io:4566
```

> **Importante:** en los comandos se coloca `--endpoint-url` al final, tal como requiere esta configuración de Floci.

---

# 🪣 3. Crear el bucket S3

El bucket que utiliza el proyecto se llama:

```text
laboratorio-floci
```

## Linux (Bash)

```bash
aws s3 mb s3://laboratorio-floci \
    --endpoint-url http://localhost.floci.io:4566
```

También puede ejecutarse en una sola línea:

```bash
aws s3 mb s3://laboratorio-floci --endpoint-url http://localhost.floci.io:4566
```

## Windows (PowerShell)

En PowerShell también puedes utilizar el comando en una sola línea:

```powershell
aws s3 mb s3://laboratorio-floci --endpoint-url http://localhost.floci.io:4566
```

Para comprobar que el bucket fue creado:

### Linux / Windows

```bash
aws s3 ls --endpoint-url http://localhost.floci.io:4566
```

Debe aparecer:

```text
laboratorio-floci
```

---

# 🗄️ 4. Crear la tabla DynamoDB

La tabla utilizada por el proyecto se llama:

```text
archivos
```

La tabla utiliza:

- **Partition Key:** `id`
- **Tipo:** `String (S)`
- **Billing Mode:** `PAY_PER_REQUEST`

## Linux (Bash)

En Bash se utiliza `\` para continuar el comando en la siguiente línea:

```bash
aws dynamodb create-table \
    --table-name archivos \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost.floci.io:4566
```

También puedes escribirlo en una sola línea:

```bash
aws dynamodb create-table --table-name archivos --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost.floci.io:4566
```

## Windows (PowerShell)

En PowerShell se utiliza la comilla invertida `` ` `` para continuar un comando:

```powershell
aws dynamodb create-table `
    --table-name archivos `
    --attribute-definitions AttributeName=id,AttributeType=S `
    --key-schema AttributeName=id,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --endpoint-url http://localhost.floci.io:4566
```

También puedes utilizar una sola línea:

```powershell
aws dynamodb create-table --table-name archivos --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost.floci.io:4566
```

Para comprobar la tabla:

### Linux / Windows

```bash
aws dynamodb list-tables --endpoint-url http://localhost.floci.io:4566
```

Debe aparecer:

```text
archivos
```

---

# λ 5. Crear las funciones Lambda

El proyecto utiliza dos funciones Lambda:

```text
notificador-s3
lambda-scheduler-kardex
```

Los archivos ZIP deben encontrarse dentro de la carpeta:

```text
funciones.zip
```

La estructura esperada es:

```text
funciones.zip/
├── notificador-s3.zip
└── lambda-scheduler-kardex.zip
```

> **Importante:** antes de ejecutar los comandos Lambda debes entrar a la carpeta `funciones.zip`, porque AWS CLI necesita encontrar los archivos `.zip`.

---

## 5.1 Entrar a la carpeta de las funciones

### Linux (Bash)

Desde la raíz del proyecto:

```bash
cd funciones.zip
```

### Windows (PowerShell)

```powershell
cd funciones.zip
```

Para comprobar que los archivos están presentes:

### Linux

```bash
ls
```

### Windows PowerShell

```powershell
Get-ChildItem
```

Debes encontrar:

```text
notificador-s3.zip
lambda-scheduler-kardex.zip
```

---

# λ 6. Crear Lambda `notificador-s3`

La primera función Lambda se llama:

```text
notificador-s3
```

Su archivo ZIP es:

```text
notificador-s3.zip
```

Su handler es:

```text
notificador-s3.handler
```

El runtime utilizado es:

```text
nodejs20.x
```

## Linux (Bash)

```bash
aws lambda create-function \
    --function-name notificador-s3 \
    --runtime nodejs20.x \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --handler notificador-s3.handler \
    --zip-file fileb://notificador-s3.zip \
    --endpoint-url http://localhost.floci.io:4566
```

### Explicación del comando

```text
aws lambda create-function
```

Indica que AWS CLI va a crear una función Lambda.

```text
--function-name notificador-s3
```

Define el nombre de la función.

```text
--runtime nodejs20.x
```

Indica que la función utiliza Node.js 20.

```text
--role arn:aws:iam::000000000000:role/lambda-role
```

Indica el rol de ejecución utilizado por la Lambda dentro del entorno emulado.

```text
--handler notificador-s3.handler
```

Indica que el archivo principal es `notificador-s3` y que la función exportada que se ejecutará se llama `handler`.

```text
--zip-file fileb://notificador-s3.zip
```

Indica el archivo ZIP que contiene el código de la Lambda.

```text
--endpoint-url http://localhost.floci.io:4566
```

Indica que la operación debe realizarse contra Floci en lugar de AWS real.

---

## Windows (PowerShell)

En PowerShell debes utilizar `` ` `` para continuar el comando en varias líneas:

```powershell
aws lambda create-function `
    --function-name notificador-s3 `
    --runtime nodejs20.x `
    --role arn:aws:iam::000000000000:role/lambda-role `
    --handler notificador-s3.handler `
    --zip-file fileb://notificador-s3.zip `
    --endpoint-url http://localhost.floci.io:4566
```

También puedes ejecutarlo en una sola línea:

```powershell
aws lambda create-function --function-name notificador-s3 --runtime nodejs20.x --role arn:aws:iam::000000000000:role/lambda-role --handler notificador-s3.handler --zip-file fileb://notificador-s3.zip --endpoint-url http://localhost.floci.io:4566
```

> **Importante:** en PowerShell no debes utilizar `\` al final de las líneas. Para continuar un comando debes utilizar `` ` ``.

---

# λ 7. Crear Lambda `lambda-scheduler-kardex`

La segunda función Lambda se llama:

```text
lambda-scheduler-kardex
```

Su archivo ZIP es:

```text
lambda-scheduler-kardex.zip
```

Su handler es:

```text
scheduler-kardex.handler
```

El runtime utilizado es:

```text
nodejs20.x
```

## Linux (Bash)

```bash
aws lambda create-function \
    --function-name lambda-scheduler-kardex \
    --runtime nodejs20.x \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --handler scheduler-kardex.handler \
    --zip-file fileb://lambda-scheduler-kardex.zip \
    --endpoint-url http://localhost.floci.io:4566
```

### Explicación del comando

```text
aws lambda create-function
```

Crea una función Lambda.

```text
--function-name lambda-scheduler-kardex
```

Establece el nombre de la función.

```text
--runtime nodejs20.x
```

Indica que la función utiliza Node.js 20.

```text
--role arn:aws:iam::000000000000:role/lambda-role
```

Define el rol de ejecución de la Lambda.

```text
--handler scheduler-kardex.handler
```

Indica que el archivo principal es `scheduler-kardex` y que la función exportada es `handler`.

```text
--zip-file fileb://lambda-scheduler-kardex.zip
```

Indica el archivo ZIP que contiene el código de la función.

```text
--endpoint-url http://localhost.floci.io:4566
```

Indica que AWS CLI debe comunicarse con Floci.

---

## Windows (PowerShell)

```powershell
aws lambda create-function `
    --function-name lambda-scheduler-kardex `
    --runtime nodejs20.x `
    --role arn:aws:iam::000000000000:role/lambda-role `
    --handler scheduler-kardex.handler `
    --zip-file fileb://lambda-scheduler-kardex.zip `
    --endpoint-url http://localhost.floci.io:4566
```

También puedes utilizar una sola línea:

```powershell
aws lambda create-function --function-name lambda-scheduler-kardex --runtime nodejs20.x --role arn:aws:iam::000000000000:role/lambda-role --handler scheduler-kardex.handler --zip-file fileb://lambda-scheduler-kardex.zip --endpoint-url http://localhost.floci.io:4566
```

---

# 🔍 8. Comprobar las funciones Lambda

Después de crear las dos funciones puedes comprobarlas mediante:

```bash
aws lambda list-functions --endpoint-url http://localhost.floci.io:4566
```

Deberían aparecer:

```text
notificador-s3
lambda-scheduler-kardex
```

---

# 📁 9. Regresar a la raíz del proyecto

Después de crear las funciones Lambda debes regresar a la raíz del proyecto.

### Linux (Bash)

```bash
cd ..
```

### Windows (PowerShell)

```powershell
cd ..
```

La estructura del proyecto debería ser similar a:

```text
proyecto/
├── funciones.zip/
│   ├── notificador-s3.zip
│   └── lambda-scheduler-kardex.zip
├── package.json
├── index.js
├── ...
└── INSTALACION.md
```

---

# 🖥️ 10. Creación desde la interfaz de Floci

La creación mediante interfaz gráfica es una alternativa al método de terminal.

## 10.1 Crear el bucket S3

En la interfaz de Floci:

1. Ingresa a la sección **S3**.
2. Selecciona la opción para crear un bucket.
3. Introduce:

```text
laboratorio-floci
```

4. Confirma la creación.

---

## 10.2 Crear la tabla DynamoDB

En la sección **DynamoDB**:

1. Selecciona crear una tabla.
2. Nombre:

```text
archivos
```

3. Partition Key:

```text
id
```

4. Tipo de dato:

```text
String
```

5. Utiliza el modo:

```text
PAY_PER_REQUEST
```

6. Confirma la creación.

---

## 10.3 Crear la Lambda `notificador-s3`

En la sección **Lambda**:

- Nombre:

```text
notificador-s3
```

- Runtime:

```text
Node.js 20.x
```

- Handler:

```text
notificador-s3.handler
```

- Archivo ZIP:

```text
notificador-s3.zip
```

El archivo se encuentra dentro de:

```text
funciones.zip/notificador-s3.zip
```

---

## 10.4 Crear la Lambda `lambda-scheduler-kardex`

En la sección **Lambda**:

- Nombre:

```text
lambda-scheduler-kardex
```

- Runtime:

```text
Node.js 20.x
```

- Handler:

```text
scheduler-kardex.handler
```

- Archivo ZIP:

```text
lambda-scheduler-kardex.zip
```

El archivo se encuentra dentro de:

```text
funciones.zip/lambda-scheduler-kardex.zip
```

---

# 📦 11. Instalar las dependencias de Node.js

Después de crear los recursos de Floci, regresa a la raíz del proyecto.

Ejecuta:

```bash
npm install
```

Este comando instala todas las dependencias declaradas en:

```text
package.json
```

---

# ⚙️ 12. Configurar las variables de entorno

El proyecto utiliza un archivo:

```text
.env
```

Si el proyecto proporciona un archivo de ejemplo como:

```text
.env.example
```

puedes copiarlo.

## Linux (Bash)

```bash
cp .env.example .env
```

## Windows (PowerShell)

```powershell
Copy-Item .env.example .env
```

Después configura el archivo `.env`.

Una configuración de referencia puede ser:

```env
PORT=3000
AWS_REGION=us-east-1
AWS_ENDPOINT_URL=http://localhost.floci.io:4566
AWS_S3_BUCKET=laboratorio-floci
AWS_DYNAMODB_TABLE=archivos
AWS_LAMBDA_FUNCTION_NAME=notificador-s3
AWS_SCHEDULER_NAME=lambda-scheduler-txt
```

> **Nota:** si el proyecto ya proporciona un `.env` preparado, utiliza los valores definidos por el proyecto.

---

# ▶️ 13. Iniciar el servidor Node.js

Una vez instaladas las dependencias y configurado `.env`, inicia el servidor.

Si `package.json` tiene configurado el script `start`:

```bash
npm start
```

Como alternativa, si el archivo principal es `index.js`:

```bash
node index.js
```

---

# 🌐 14. Abrir la aplicación

Cuando el servidor esté ejecutándose, abre el navegador en:

```text
http://localhost:3000
```

La aplicación Node.js se comunicará con los servicios emulados de Floci mediante:

```text
http://localhost.floci.io:4566
```

---

# 🔎 15. Verificación final

Antes de utilizar la aplicación, puedes comprobar que todos los recursos fueron creados correctamente.

## S3

```bash
aws s3 ls --endpoint-url http://localhost.floci.io:4566
```

Debe aparecer:

```text
laboratorio-floci
```

---

## DynamoDB

```bash
aws dynamodb list-tables --endpoint-url http://localhost.floci.io:4566
```

Debe aparecer:

```text
archivos
```

---

## Lambda

```bash
aws lambda list-functions --endpoint-url http://localhost.floci.io:4566
```

Deben aparecer:

```text
notificador-s3
lambda-scheduler-kardex
```

---

# ✅ 16. Orden completo de instalación

El procedimiento completo recomendado es:

```text
1. Instalar Docker
        ↓
2. Instalar AWS CLI
        ↓
3. Instalar Node.js
        ↓
4. Iniciar Floci
        ↓
5. Verificar Floci
        ↓
6. Crear bucket S3
        ↓
7. Crear tabla DynamoDB
        ↓
8. Entrar a funciones.zip
        ↓
9. Crear Lambda notificador-s3
        ↓
10. Crear Lambda lambda-scheduler-kardex
        ↓
11. Regresar a la raíz del proyecto
        ↓
12. Ejecutar npm install
        ↓
13. Configurar .env
        ↓
14. Ejecutar npm start
        ↓
15. Abrir http://localhost:3000
```

---

# 📋 17. Resumen de recursos

| Servicio | Recurso | Nombre |
|---|---|---|
| S3 | Bucket | `laboratorio-floci` |
| DynamoDB | Tabla | `archivos` |
| DynamoDB | Partition Key | `id` |
| Lambda | Función | `notificador-s3` |
| Lambda | Runtime | `nodejs20.x` |
| Lambda | Handler | `notificador-s3.handler` |
| Lambda | Función | `lambda-scheduler-kardex` |
| Lambda | Runtime | `nodejs20.x` |
| Lambda | Handler | `scheduler-kardex.handler` |
| Floci | Endpoint | `http://localhost.floci.io:4566` |
| Node.js | Servidor | `http://localhost:3000` |
