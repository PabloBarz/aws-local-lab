const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const path = require("path")
const fs = require("fs");

//Solicitar  de los servicios AWS S3 (Subir archivos)
//Otorgar permiso de lectura 
const{S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const{DynamoDBClient, PutItemCommand, ScanCommand, DeleteItemCommand} = require("@aws-sdk/client-dynamodb")

const {LambdaClient, InvokeCommand} = require("@aws-sdk/client-lambda");

const { SchedulerClient, CreateScheduleCommand, DeleteScheduleCommand, GetScheduleCommand} = require("@aws-sdk/client-scheduler");

const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

//Cargar las variables de entorno
dotenv.config();

//Habilitar Framework de entorno
const app = express();

//Leer algunas configuraciones 
const PORT = process.env.PORT || 3000;
const BUCKET = process.env.AWS_S3_BUCKET;
const PREFIX = process.env.AWS_S3_PREFIX || ""; 

//Configuracion de multer (gestionar|subir archivos)
//Backend conservara una copia de manera temporal del archivo a subir 
const upload = multer({
  storage: multer.memoryStorage()
});

//Client S3
//forcePathStyle: true (modo compatibilidad)
const s3Client= new S3Client ({
  region : process.env.AWS_REGION,
  endpoint : process.env.AWS_ENDPOINT_URL,
  credentials:{
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true
});

const dynamoDBClient = new DynamoDBClient ({
  region : process.env.AWS_REGION,
  endpoint : process.env.AWS_ENDPOINT_URL,
  credentials:{
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true
}); 

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true
});

const schedulerClient = new SchedulerClient({
  region: "us-east-1",
  endpoint: "http://localhost.floci.io:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});


//Archivo estatico aplicacion => fronted
app.use(express.static(path.join(__dirname, "public")));

//Ruta
app.get("/",(req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Ruta para listar http://localhost:3000/listar
app.get("/lista", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Ruta para subir archivo
app.post("/upload", upload.single("archivo"), async(req, res) => {
  try{
    //Verificar que se haya seleccionado una archivo 
      if(!req.file){
        return res.status(400).json({
          success: false,
          message: "No adjuntaste el archivo"
        });
      }
    //Obtener el nombre del archivo
    const fileName = req.file.originalname;

    //Ruta del archivo 
    const key = `${PREFIX}${fileName}`;

    //Subir el archivo
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3Client.send(command);


    //Tambien... utilizaremos DynamoDB (METADATOS)
    const id  = `${Date.now()}-${Math.random().toString(36).substring(2,8)}`;
    const dynamoCommand = new PutItemCommand({
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Item:{
        id:{S:id},
        nombre:{S:fileName},
        tipo:{S: req.file.mimetype},
        tamano: {N:req.file.size.toString()},
        fecha: {S: new Date().toISOString()},
        s3Key:{S:key}
      }
    });

    await dynamoDBClient.send(dynamoCommand)
    console.log("Registro creado en Dynamo")

    console.log(`Archivo subido: ${key}`);

    const lambdaPayload = {
      Records: [{
        s3: {
          bucket: { name: BUCKET },
          object: { key: key }
        }
      }]
    };

    await lambdaClient.send(new InvokeCommand({
      FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME, 
      InvocationType: "Event",  
      Payload: Buffer.from(JSON.stringify(lambdaPayload))
    }));

    console.log("Notificación enviada a AWS Lambda correctamente");

    // 1. Invocamos a la Lambda y esperamos su respuesta
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
      InvocationType: "RequestResponse", 
      Payload: Buffer.from(JSON.stringify({
        Records: [{ s3: { bucket: { name: BUCKET }, object: { key: key } } }]
      })) 
    }));
    
    
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(response.Payload);
    const lambdaResult = JSON.parse(jsonString);

    const carpetaNotificaciones = path.join(__dirname, 'notificaciones');
    if (!fs.existsSync(carpetaNotificaciones)) {
      fs.mkdirSync(carpetaNotificaciones, { recursive: true });
    }

    const fechaHora = new Date().toLocaleString();
    const contenidoTxt = `==================================================\n` +
                         `         REPORTE DE NOTIFICACIÓN LAMBDA          \n` +
                         `==================================================\n` +
                         ` Fecha y Hora: ${fechaHora}\n` +
                         ` Estado:       EXITOSO (200)\n` +
                         `--------------------------------------------------\n` +
                         ` DATOS DEL EVENTO RECIBIDO:\n` +
                         `${JSON.stringify(lambdaResult, null, 2)}\n` +
                         `==================================================\n`;

    const nombreTxt = `notificacion-${Date.now()}.txt`;
    const rutaTxt = path.join(carpetaNotificaciones, nombreTxt);

    fs.writeFileSync(rutaTxt, contenidoTxt, 'utf-8');
    console.log(`¡Archivo .txt creado ordenadamente en: notificaciones/${nombreTxt}`);


    res.json({
      success: true,
      message: "Archivo almacenado en DynamoDB y guardado en S3",
      bucket: BUCKET,
      key: key
    });

    

  }catch(error){
    console.error(error);
    res.status(500).json({
      success: false,
      message: "No se pudo subir el archivo",
      error:error.message
    });
  }
});


app.get("/api/archivos", async(req, res) => {
  try{
    const data = await dynamoDBClient.send(new ScanCommand({
      TableName: process.env.AWS_DYNAMODB_TABLE
    }));

    //Si no exiten los archivos 
    //1 (): Retorna un arreglo incluso sino exiten archivos
    //2 (): Filtra la coleccion
    //3 (): Retorna  los datos ya filtrados
    const archivos = (data.Items || [])
      .map(item => unmarshall(item));

    res.json({ success: true, total: archivos.length, archivos });
  }
  catch(e){
    res.status(500).json({ success: false, message: "Error al leer DynamoDB", error: error.message });

  }
});

app.get("/api/archivos/descargar", async (req,res) =>{
  try{
    const key = req.query.key;

    if (!key) {
      return res.status(400).json({ success: false, message: "No se proporcionó el parámetro 'key' del archivo" });
    }

    

    const command = new GetObjectCommand({
      Bucket: BUCKET, 
      Key: key,
      ResponseContentDisposition: "attachment"
    });

    const url = await getSignedUrl(s3Client, command, {expiresIn: 60})

    res.json({success: true, url})
  }catch(e){
     res.status(500).json({ success: false, message: "Error al generar descarga", error: error.message });
  }
});

app.delete("/api/archivos/eliminar", async(req, res) => {
    try{
      const id = req.query.id;  
      const key = req.query.key;

      if (!id || !key) {
        return res.status(400).json({ success: false, message: "Faltan los parámetros obligatorios 'id' o 'key'" });
      }

      await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

      await dynamoDBClient.send(new DeleteItemCommand({
        TableName: process.env.AWS_DYNAMODB_TABLE,
        Key: { id: { S: id } }
      }));

      res.json({ success: true, message: "Archivo eliminado con éxito" });

    }catch(e){
      res.status(500).json({ success: false, message: "Error al eliminar", error: error.message });
    }
})

app.get('/api/scheduler-status', async (req, res) => {
    try {
        const command = new GetScheduleCommand({
            Name: process.env.AWS_SCHEDULER_NAME,
        });
        
        await schedulerClient.send(command);
        // Si no bota error, significa que el schedule existe y está activo
        res.status(200).json({ activo: true });
    } catch (error) {
        // Si el error es porque no existe (ResourceNotFoundException), está detenido
        res.status(200).json({ activo: false });
    }
});

app.post('/api/iniciar-scheduler', async (req, res) => {
    try {
        const command = new CreateScheduleCommand({
            Name: process.env.AWS_SCHEDULER_NAME,
            
            // Configurado en 1 minuto (mínimo permitido por AWS/Floci)
            ScheduleExpression: "rate(1 minutes)", 
            FlexibleTimeWindow: { Mode: "OFF" },
            Target: {
                // Apuntando correctamente a la función de fondo
                Arn: "arn:aws:lambda:us-east-1:000000000000:function:lambda-scheduler-kardex",
                RoleArn: "arn:aws:iam::000000000000:role/scheduler-role"
            },
            ActionAfterCompletion: "NONE"
        });

        await schedulerClient.send(command);
        res.status(200).json({ success: true, message: "Rutina iniciada: Se ejecutará cada 1 minuto en Docker." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/detener-scheduler', async (req, res) => {
    try {
        const command = new DeleteScheduleCommand({
            Name: process.env.AWS_SCHEDULER_NAME,
        });

        await schedulerClient.send(command);
        res.status(200).json({ success: true, message: "Rutina detenida exitosamente." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

