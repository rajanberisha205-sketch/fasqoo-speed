const MODEL = "gemini-3.8-flash";

const FASQOO_SUPPORT_INSTRUCTIONS = `
You are Fasqoo AI Support, the technical assistant of Fasqoo.

Help visitors with:
- Internet speed
- Download
- Upload
- Ping / latency
- Jitter
- Wi-Fi
- Gaming latency
- Basic network troubleshooting

Rules:
- Be professional, concise and helpful.
- Reply in the visitor's language.
- Never invent measurements or network information.
- Never claim to see the visitor's IP, device, router, ISP or speed-test results.
- Fasqoo is independent and is not owned or endorsed by Cloudflare.
- Explain technical topics clearly.
`;

function getReplyText(data) {
  if (
    typeof data?.output_text === "string" &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

  const steps = Array.isArray(data?.steps)
    ? data.steps
    : [];

  for (let i = steps.length - 1; i >= 0; i--) {
    const content = Array.isArray(steps[i]?.content)
      ? steps[i].content
      : [];

    for (let j = content.length - 1; j >= 0; j--) {
      if (
        content[j]?.type === "text" &&
        typeof content[j]?.text === "string"
      ) {
        return content[j].text.trim();
      }
    }
  }

  return "";
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error:
        "GEMINI_API_KEY is not configured in Vercel."
    });
  }

  const body = req.body || {};

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  const language =
    typeof body.language === "string"
      ? body.language.slice(0, 10)
      : "en";

  const previousInteractionId =
    typeof body.previousInteractionId === "string" &&
    body.previousInteractionId.trim()
      ? body.previousInteractionId.trim()
      : null;

  if (!message) {
    return res.status(400).json({
      error: "Please enter a message."
    });
  }

  if (message.length > 1200) {
    return res.status(413).json({
      error: "Message is too long."
    });
  }

  const languageNames = {
    de: "German",
    en: "English",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    tr: "Turkish",
    sq: "Albanian",
    ar: "Arabic"
  };

  const userInput = `
Visitor language:
${languageNames[language] || "English"}

Visitor question:
${message}
`;

  const requestBody = {
    model: MODEL,
    system_instruction: FASQOO_SUPPORT_INSTRUCTIONS,
    input: userInput
  };

  if (previousInteractionId) {
    requestBody.previous_interaction_id =
      previousInteractionId;
  }

  try {

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify(requestBody)
      }
    );

    const data =
      await response.json().catch(() => ({}));

    if (!response.ok) {

      console.error(
        "Gemini API error:",
        response.status,
        data
      );

      return res.status(502).json({
        error:
          data?.error?.message ||
          "Gemini could not answer right now."
      });
    }

    const reply = getReplyText(data);

    if (!reply) {
      return res.status(502).json({
        error:
          "Gemini returned no text response."
      });
    }

    return res.status(200).json({
      reply,
      interactionId: data.id || null
    });

  } catch (error) {

    console.error(
      "Gemini request failed:",
      error
    );

    return res.status(500).json({
      error:
        "AI support is temporarily unavailable."
    });
  }
}
