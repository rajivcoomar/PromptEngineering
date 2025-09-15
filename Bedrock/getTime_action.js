exports.handler = async (event) => {
	
	console.log("Event:", JSON.stringify(event));
        const actionGroup = event.actionGroup;
        const func = event.function;
        const messageVersion = event.messageVersion || 1;
        const parameters = event.parameters || [];
		let responseBody = "";
	
		const now = new Date();

   

		responseBody = { TEXT: { body: "Today's date is :" +  now.toISOString().split("T")[0] +"," + now.toTimeString().split(" ")[0] } };
		const actionResponse = {
            actionGroup: actionGroup,
            function: func,
            functionResponse: { responseBody }
        };

        const response = {
            response: actionResponse,
            messageVersion: messageVersion
        };

        console.info("Response:", (response));
        return response;

};
