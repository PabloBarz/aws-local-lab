exports.handler = async (event) => {
    const timestamp = new Date().toISOString();
    console.log(`[SCHEDULER TRIGGER] - Ejecución automática a las: ${timestamp}`);
    console.log("EVENTO RECIBIDO DESDE EL SCHEDULER:", JSON.stringify(event, null, 2));

    // Simulación de una tarea de fondo (ej: verificar stock crítico o registros pendientes)
    const reporteSimulado = {
        estadoSistema: "OPERATIVO",
        modulo: "Control de Inventarios / Kardex",
        accionesRealizadas: "Verificación automática de sincronización completada.",
        tiempoEjecucion: timestamp
    };

    console.log("RESULTADO DE LA TAREA PROGRAMADA:", JSON.stringify(reporteSimulado, null, 2));

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Tarea ejecutada por Scheduler exitosamente",
            data: reporteSimulado
        })
    };
};