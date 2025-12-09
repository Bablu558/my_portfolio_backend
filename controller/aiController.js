import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateTitleAI = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
Generate a powerful, meaningful, SEO-optimized blog title.
- 6 to 10 words only.
- Professional tone.
- No quotes, no symbols.
Content:
${text.slice(0, 700)}
Return ONLY the title.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",   // Super cheap + fast + accurate
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    const title = response.choices[0].message.content;

    res.json({ success: true, title });
  } catch (error) {
    console.log("AI ERROR:", error);
    res.status(500).json({ success: false, message: "AI failed", error: error.message });
  }
};


export const generateShortDescAI = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
Write a short 2–3 line description for this blog.
- Simple English.
- SEO friendly.
- Human-written tone.
Content:
${text.slice(0, 600)}
Return ONLY the description.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });

    const summary = response.choices[0].message.content;

    res.json({ success: true, summary });
  } catch (error) {
    console.log("AI ERROR:", error);
    res.status(500).json({ success: false, message: "AI failed", error: error.message });
  }
};
