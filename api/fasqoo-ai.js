export default async function handler(req, res) {
  // Nur POST erlauben
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  // API-Key aus Vercel Environment Variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is not configured on the server."
    });
  }

  try {
    const data = req.body || {};

    let messages = [];

    /*
     * Hauptformat:
     * {
     *   messages: [
     *     { role: "user", content: "..." },
     *     { role: "assistant", content: "..." }
     *   ]
     * }
     */

    if (Array.isArray(data.messages)) {
      messages = data.messages
        .filter(
          (message) =>
            message &&
            typeof message.content === "string" &&
            message.content.trim() !== ""
        )
        .map((message) => {
          const role =
            message.role === "assistant"
              ? "model"
              : "user";

          return {
            role,
            parts: [
              {
                text: message.content
                  .trim()
                  .slice(0, 5000)
              }
            ]
          };
        });
    }

    /*
     * Fallback für:
     * { prompt: "..." }
     */

    if (
      messages.length === 0 &&
      typeof data.prompt === "string" &&
      data.prompt.trim() !== ""
    ) {
      messages.push({
        role: "user",
        parts: [
          {
            text: data.prompt.trim().slice(0, 5000)
          }
        ]
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    /*
     * Nur die letzten Nachrichten verwenden,
     * damit der Request nicht unnötig groß wird.
     */
    messages = messages.slice(-20);

    /*
     * Fasqoo AI Technician System Instruction
     */
    const systemInstruction = {
      parts: [
        {
          text: `
You are the Fasqoo AI Technician Assistant.

You are a professional Internet and network troubleshooting assistant.

Help users with:

- Internet connection problems
- Wi-Fi problems
- Download speed
- Upload speed
- Ping and latency
- Jitter
- Packet loss
- DNS
- Router problems
- Gaming latency
- Network stability
- Speed test results
- Slow Internet
- Connection drops
- Network troubleshooting

Give practical, clear, step-by-step solutions.

Do not invent measurements.

Do not claim to have measured the user's Internet connection unless actual measurements are provided by the website or the user.

If important information is missing, ask the user for it.

Explain technical problems in a simple way.

Keep answers useful and relatively concise.

Always answer in the same language as the user.

You are the Fasqoo AI Technician.
          `.trim()
        }
      ]
    };

    /*
     * Gemini 3.8 Flash
     */
    const model = "gemini-3.8-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const requestBody = {
      systemInstruction,
      contents: messages,
      generationConfig: {
        maxOutputTokens: 1200
      }
    };

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },

      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    /*
     * Gemini API Fehler
     */
    if (!response.ok) {
      console.error("Gemini API error:", result);

      return res.status(response.status).json({
        error:
          result?.error?.message ||
          "Gemini API request failed."
      });
    }

    /*
     * Antwort aus Gemini holen
     */
    const answer = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      console.error("Gemini returned no answer:", result);

      return res.status(502).json({
        error: "Gemini returned no answer."
      });
    }

    /*
     * Erfolgreiche Antwort
     */
    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("Fasqoo AI error:", error);

    return res.status(500).json({
      error: "The AI Technician could not process your request."
    });
  }
}
