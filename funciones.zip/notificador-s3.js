exports.handler = async (event) => {
    console.log("EVENTO RECIBIDO:", JSON.stringify(event));

    return {
        statusCode: 200,
        body: JSON.stringify(event)
    };
};