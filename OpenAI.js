const axios = require('axios');

// wondow : set OpenAIKey=Simba
test();

async function test() {
  let data = JSON.stringify({
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "user",
        "content": "create 5 sentence using the phrase : account balance."
      }
    ],
    "temperature": 1,
    "top_p": 1
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.openai.com/v1/chat/completions',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + process.env.OpenAIKey
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    const content = response.data.choices[0].message.content;
    console.log(content); // This will print each sentence in a new line (as OpenAI formats with `\n`)
  } catch (error) {
    console.error(error);
  }
}
