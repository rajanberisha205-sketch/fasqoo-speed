export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is not configured on Vercel."
    });
  }

  try {
    const body = req.body || {};

    let messages = [];

    if (Array.isArray(body.messages)) {
      messages = body.messages
        .filter(
          message =>
            message &&
            typeof message.content === "string" &&
            message.content.trim()
        )
        .map(message => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [
            {
              text: message.content.trim().slice(0, 5000)
            }
          ]
        }));
    }

    if (
      messages.length === 0 &&
      typeof body.prompt === "string" &&
      body.prompt.trim()
    ) {
      messages.push({
        role: "user",
        parts: [
          {
            text: body.prompt.trim().slice(0, 5000)
          }
        ]
      });
    }

    if (!messages.length) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    // Begrenze den Gesprächsverlauf
    messages = messages.slice(-20);

    const systemInstruction = {
      parts: [
        {
          text: `
You are Fasqoo AI Technician.

You are a professional Internet and network troubleshooting assistant.

Help users with:

- Internet connection problems
- Wi-Fi problems
- Slow Internet
- Download speed
- Upload speed
- Ping
- Latency
- Jitter
- Packet loss
- DNS
- Router problems
- Gaming latency
- Network stability
- Speed test results
- Streaming
- Video calls
- Home office
- Network troubleshooting

Give practical and easy-to-follow step-by-step solutions.

Never invent measurements.

Never claim that you measured the user's connection unless actual measurements were provided.

If important information is missing, ask the user for it.

Explain technical concepts simply.

Keep answers concise but useful.

Answer in exactly the same language as the user.

You are the official Fasqoo AI Technician.
          `.trim()
        }
      ]
    };

    const model = "gemini-3.8-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction,
        contents: messages,
        generationConfig: {
          maxOutputTokens: 1200
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", result);

      return res.status(response.status).json({
        error:
          result?.error?.message ||
          "Gemini API request failed."
      });
    }

    const answer = result?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return res.status(502).json({
        error: "Gemini returned no answer."
      });
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("Fasqoo AI error:", error);

    return res.status(500).json({
      error: "The Fasqoo AI Technician is temporarily unavailable."
    });
  }
}
