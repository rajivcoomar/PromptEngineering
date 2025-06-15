const OpenAI = require('openai');
const axios = require('axios');

// Set these env vars before running: set OpenAIKey=Simba && set WeatherKey=your_weather_key
const openai = new OpenAI({ apiKey: process.env.OpenAIKey });

const city = "Pune";                  // You can change or make this dynamic
const date = "2025-06-15";           // Must be in YYYY-MM-DD format
const weatherApiKey = process.env.WeatherKey;

const weatherApiUrl = `http://api.weatherapi.com/v1/history.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&dt=${date}`;

getHistoricalWeatherAndAskAI(city, date);

async function getHistoricalWeatherAndAskAI(cityName, dateStr) {
  try {
    // Step 1: Fetch historical weather data
    const { data } = await axios.get(weatherApiUrl);

    const {
      location,
      forecast: {
        forecastday: [dayData]
      }
    } = data;

    const {
      date,
      day: {
        maxtemp_c,
        mintemp_c,
        avgtemp_c,
        avghumidity,
        condition,
        totalprecip_mm,
        daily_chance_of_rain,
        maxwind_kph
      },
      astro: { sunrise, sunset }
    } = dayData;

    // Step 2: Format a weather summary
    const weatherSummary = `On ${date} in ${location.name}, ${location.region}, the weather was '${condition.text}' with an average temperature of ${avgtemp_c}°C (min: ${mintemp_c}°C, max: ${maxtemp_c}°C). Humidity averaged ${avghumidity}%, precipitation was ${totalprecip_mm}mm, and wind reached up to ${maxwind_kph} km/h. Sunrise was at ${sunrise}, and sunset at ${sunset}. Rain chance was ${daily_chance_of_rain}%.`;

    console.log("Weather Summary:\n", weatherSummary);

    // Step 3: Call OpenAI with the summary
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant giving brief advice based on past weather, in one line with  thought, action, and observation step. ${weatherSummary}`
        },
        {
          role: "user",
          content: `Shall I carry umbrella in ${cityName}?`
        }
      ],
      temperature: 0.1,
      max_tokens: 512,
      top_p: 0.1
    });

    console.log("\nAI Response:\n", response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message || error);
  }
}
