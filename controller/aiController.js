import axios from "axios";

export const generateBlogTitle = async (req, res) => {
  try {

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content required"
      });
    }

     const prompt = `
You are an expert SEO blog title generator.

Read the following blog content and generate 5 short,
catchy and SEO optimized blog titles.

Blog Content:
${content}

Return only titles.
`;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    const titles = text
      .split("\n")
      .map(t => t.replace(/^\d+\.?\s*/, ""))
      .filter(Boolean);

    res.status(200).json({
      success: true,
      titles
    });

  } catch (error) {

    console.error("AI ERROR:", error.response?.data || error);

    res.status(500).json({
      success: false,
      message: "AI generation failed"
    });

  }
};


export const generateBlogSummary = async (req, res) => {
  try {

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success:false,
        message:"Content required"
      });
    }

    const prompt = `
You are an expert blog editor.

Read the blog content below and generate a short SEO friendly blog description.

Rules:
- 1 or 2 sentences only
- under 160 characters
- meaningful summary
- engaging for readers

Blog Content:
${content}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents:[
          {
            parts:[{ text: prompt }]
          }
        ]
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    res.status(200).json({
      success:true,
      summary:text.trim()
    });

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"AI summary failed"
    });

  }
};


