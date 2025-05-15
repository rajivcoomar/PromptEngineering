const OpenAI = require('openai');

// wondow : set OpenAIKey=Simba

const openai = new OpenAI({
  apiKey: process.env.OpenAIKey,
});

test();

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: ""
        },
		{
          role: "user",
          content: ""
        }
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1
    });

    const content = response.choices[0].message.content;
    console.log(content); // OpenAI returns sentences separated with \n or \n\n
  } catch (error) {
    console.error("Error:", error);
  }
}
