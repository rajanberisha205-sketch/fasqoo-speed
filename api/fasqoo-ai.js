export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, language, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY is missing");

      return res.status(500).json({
        error: "AI service is not configured"
      });
    }

    const safeHistory = Array.isArray(history)
      ? history.slice(-10)
      : [];

    const messages = [
      {
        role: "system",
        content: `
You are Fasqoo AI Network Technician.

You are the AI assistant of Fasqoo Internet Speed Test.

Help users understand:
- download speed
- upload speed
- ping
- jitter
- latency
- packet loss
- Wi-Fi problems
- router problems
- Ethernet vs Wi-Fi
- gaming latency
- streaming problems
- slow Internet
- DNS and basic network troubleshooting

Give practical, technically accurate answers.

Do not invent measurements.
If the user has not provided a measurement, do not pretend that you know it.

Keep answers clear and easy to understand.
Use the user's language when possible.

Current interface language:
${language || "en"}
        `.trim()
      },

      ...safeHistory
        .filter(
          x =>
            x &&
            (x.role === "user" || x.role === "assistant") &&
            typeof x.content === "string" &&
            x.content.trim()
        )
        .map(x => ({
          role: x.role,
          content: x.content.trim()
        })),

      {
        role: "user",
        content: message.trim()
      }
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages,
          temperature: 0.3,
          max_completion_tokens: 700
        })
      }
    );

    const rawText = await response.text();

    let data;

    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Groq returned invalid JSON:", rawText);

      return res.status(502).json({
        error: "Invalid response from AI service"
      });
    }

    if (!response.ok) {
      console.error("Groq API error:", {
        status: response.status,
        data
      });

      return res.status(502).json({
        error: "AI service request failed"
      });
    }

    const choice = data?.choices?.[0];

    let answer = choice?.message?.content;

    if (!answer && typeof choice?.text === "string") {
      answer = choice.text;
    }

    if (typeof answer === "string") {
      answer = answer.trim();
    }

    console.log(
      "GROQ CONTENT:",
      JSON.stringify(answer)
    );

    if (!answer) {
      console.error(
        "Groq returned no usable answer:",
        JSON.stringify(data, null, 2)
      );

      return res.status(502).json({
        error: "Fasqoo AI returned an empty response."
      });
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {
    console.error("Fasqoo AI server error:", error);

    return res.status(500).json({
      error: "AI service temporarily unavailable"
    });
  }
}
