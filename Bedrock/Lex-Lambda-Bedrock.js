const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require("@aws-sdk/client-bedrock-agent-runtime"); 
const AWS = require('aws-sdk');
const client = new BedrockAgentRuntimeClient({});
const bedrock = new AWS.BedrockRuntime();

exports.handler = async (event, context) => {
    console.info("Lex Event:", JSON.stringify(event));
    var sessionAttributes = event.sessionState.sessionAttributes;
    var userInput = event.inputTranscript;
  
    const sessionId = event.sessionId || 'default-session';
    let current_intent = event.sessionState.intent.name;
      
    console.info("current_intent:", current_intent);
    console.info("User input:", userInput);
    console.info("Session ID:", sessionId);
 
    if (current_intent === 'GetDetails' || current_intent === 'FallbackIntent') {
        const bedrockResult = await callBedrockAgent(sessionId, userInput);
        const { starting_place, destination, date, message, isJSON } = extractJsonResponse(bedrockResult);

        if (isJSON) {
            return {
                sessionState: {
                    dialogAction: {
                        type: "Close",
                    },
                    intent: {
                        name: "GetDetails",
                        state: "Fulfilled",
                        slots: {
                            starting_place: {
                                value: {
                                    originalValue: starting_place,
                                    resolvedValues: [starting_place],
                                    interpretedValue: starting_place
                                },
                                shape: "Scalar"
                            },
                            destination: {
                                value: {
                                    originalValue: destination,
                                    resolvedValues: [destination],
                                    interpretedValue: destination
                                },
                                shape: "Scalar"
                            },
                            date: {
                                value: {
                                    originalValue: date,
                                    resolvedValues: [date],
                                    interpretedValue: date
                                },
                                shape: "Scalar"
                            }
                        }
                    },
                    sessionAttributes: {
                        ...sessionAttributes
                    },						
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: message || "Thank you for sharing the details."
                    }
                ]
            };
        } else {
            return {
                sessionState: {
                    dialogAction: {
                        type: "ElicitSlot",
                        slotToElicit: "starting_place" // start with first slot missing
                    },
                    intent: {
                        name: "GetDetails",
                        state: "InProgress",
                        slots: {}
                    },
                    sessionAttributes: {
                        ...sessionAttributes
                    },
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: bedrockResult
                    }
                ]
            };
        }
    }
};

function extractJsonResponse(bedrockResult) {
    let starting_place = null;
    let destination = null;
    let date = null;
    let message = null;
    let isJSON = false;

    const jsonStart = bedrockResult.indexOf('{');
    const jsonEnd = bedrockResult.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = bedrockResult.substring(jsonStart, jsonEnd + 1);

        try {
            const parsed = JSON.parse(jsonString);
            starting_place = parsed.starting_place || null;
            destination = parsed.destination || null;
            date = parsed.date || null;
            message = parsed.message || null;
            isJSON = true;
        } catch (err) {
            console.warn("Invalid JSON in bedrockResult:", err);
        }
    }

    return { starting_place, destination, date, message, isJSON };
}

async function callBedrockAgent(sessionId, userInput) {
    let finalResponseText ="";
   
    try {
        const command = new InvokeAgentCommand({
            agentId: "",             
            agentAliasId: "",         
            sessionId: sessionId,
            inputText: userInput
        });

        const response = await client.send(command);

        for await (const eventChunk of response.completion) {
            if (eventChunk.chunk) {
                const contentPart = new TextDecoder().decode(eventChunk.chunk.bytes);
                finalResponseText += contentPart;
            }
        }

        console.info("Final Agent Response:", finalResponseText);
        return finalResponseText;

    } catch (err) {
        console.error("Error calling Bedrock Agent:", err);
        return "Sorry, something went wrong while processing your request.";
    }
}
