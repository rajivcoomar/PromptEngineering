exports.handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    const actionGroup = event.actionGroup;
    const func = event.function;
    const messageVersion = event.messageVersion || 1;
    const parameters = event.parameters || [];
    let responseBody = {};

    if (func === "GetTime") {
        const now = new Date();
        responseBody = {
            TEXT: {
                body: "Today's date is: " +
                    now.toISOString().split("T")[0] + ", " +
                    now.toTimeString().split(" ")[0]
            }
        };
    } else if (func === "getweather") {
        try {
            const apiKey = ""; // move to env var in prod
            const cityParam = parameters.find(p => p.name.toLowerCase() === "city");
            const city = cityParam ? cityParam.value : "pune"; // fallback

            const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

            const res = await fetch(url);   // ✅ native fetch
            const data = await res.json();

            const weatherInfo = {
                location: data.location.name + ", " + data.location.region,
                country: data.location.country,
                localtime: data.location.localtime,
                temperature_c: data.current.temp_c,
                condition: data.current.condition.text,
                humidity: data.current.humidity,
                feelslike_c: data.current.feelslike_c,
                wind_kph: data.current.wind_kph
            };

            responseBody = {
                TEXT: {
                    body:
                        `Weather in ${weatherInfo.location}, ${weatherInfo.country}:\n` +
                        `Local time: ${weatherInfo.localtime}\n` +
                        `Condition: ${weatherInfo.condition}\n` +
                        `Temperature: ${weatherInfo.temperature_c}°C (Feels like ${weatherInfo.feelslike_c}°C)\n` +
                        `Humidity: ${weatherInfo.humidity}%\n` +
                        `Wind: ${weatherInfo.wind_kph} kph`
                }
            };
        } catch (err) {
            console.error("Weather API error:", err);
            responseBody = {
                TEXT: { body: "Sorry, I could not fetch weather details right now." }
            };
        }
    } else {
        responseBody = {
            TEXT: { body: "Unsupported function: " + func }
        };
    }

    const actionResponse = {
        actionGroup: actionGroup,
        function: func,
        functionResponse: { responseBody }
    };

    return {
        response: actionResponse,
        messageVersion: messageVersion
    };
};
