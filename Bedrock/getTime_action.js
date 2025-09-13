exports.handler = async (event, context) => {
    const now = new Date();

    const response = {
        date: now.toISOString().split("T")[0], // YYYY-MM-DD
        time: now.toTimeString().split(" ")[0] // HH:MM:SS
    };

    const responseBody = {
        "application/json": {
            body: JSON.stringify(response)
        }
    };

    const actionResponse = {
        actionGroup: event.actionGroup,
        apiPath: event.apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 200,
        responseBody: responseBody
    };

    return {
        messageVersion: "1.0",
        response: actionResponse,
        sessionAttributes: event.sessionAttributes,
        promptSessionAttributes: event.promptSessionAttributes
    };
};
