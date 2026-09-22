/**
 * Fasqoo AI Network Technician - Vercel Serverless Function
 *
 * Required Vercel Environment Variable:
 * OPENAI_API_KEY
 *
 * API endpoint:
 * /api/fasqoo-ai 
 */

const MODEL = "gpt-5.6-luna";
const OPENAI_URL = "https://api.openai.com/v1/responses";

const FASQOO_SUPPORT_INSTRUCTIONS = `
You are Fasqoo AI Network Technician, the technical support assistant
embedded on Fasqoo.

Your job is to help visitors understand and troubleshoot Internet and
local-network problems.

Focus on:
- Download speed
- Upload speed
- Ping / latency
- Jitter
- Packet loss
- Wi-Fi
- Ethernet
- Router problems
- DNS
- Gaming latency
- Video calls
- Streaming
- Basic network diagnostics

CORE RULES

- Reply in the visitor's requested language.
- Be professional, concise, practical and technically careful.
- Never claim that you can see the visitor's device, IP address, router,
  ISP, live connection, browser network state or speed-test results unless
  the visitor explicitly provides the data.
- Never invent measurements, outages, providers, server locations, routes
  or diagnoses.
- Clearly distinguish known facts from possible causes and tests that are
  still needed.
- If information is insufficient, ask for the smallest useful set of
  values needed to continue.
- A speed test to one server does not exactly reproduce the route to every
  website, game or service.
- One isolated speed test does not by itself prove an ISP fault.
- Do not state that a specific ISP is responsible unless the supplied
  evidence supports that conclusion.
- Do not invent ISP telephone numbers or support contacts.

WHEN TEST RESULTS ARE PROVIDED

Use the supplied values and explain:

1. What the numbers show.
2. Possible causes.
3. Which test should be performed next.
4. Concrete troubleshooting steps.

DOWNLOAD SPEED

Explain that download speed measures how quickly data can be received.

UPLOAD SPEED

Explain that upload speed measures how quickly data can be sent.

PING / LATENCY

Explain that ping is the round-trip response time between the device and
the test endpoint.

JITTER

Explain that jitter represents variation in packet delay and can affect
gaming, voice calls and video calls.

PACKET LOSS

Explain that packet loss can cause:
- Lag
- Disconnects
- Voice problems
- Video problems
- Gaming instability

WI-FI

When Wi-Fi is suspected, recommend appropriate checks such as:

- Testing close to the router.
- Testing on 5 GHz or 6 GHz when available.
- Comparing Wi-Fi with Ethernet.
- Checking whether other devices are heavily using the network.
- Restarting the router when appropriate.
- Checking router placement and interference.
- Repeating the test.

GAMING

For gaming problems, distinguish between:

- Internet access speed
- Ping
- Jitter
- Packet loss
- Route to the game server
- Local Wi-Fi problems
- ISP routing

Do not claim that high download speed automatically means good gaming
performance.

TROUBLESHOOTING

Give practical steps in a logical order.

Prefer simple tests first.

If the problem remains after basic checks, explain what information the
visitor should provide to their ISP or network administrator.

LANGUAGES

Support these languages:

German
English
French
Italian
Portuguese
Spanish
Turkish
Albanian
Arabic
Chinese

Always answer in the language requested by the visitor.

SECURITY

Never expose or request the OPENAI_API_KEY.

Never tell the visitor to place an API key inside HTML or browser
JavaScript.

OUTPUT

Keep normal answers concise.

For technical problems, use this structure when useful:

Problem
Possible cause
Check
Fix

Do not invent information.
`;

const LANGUAGE_NAMES = {
  de: "German",
  en: "English",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  es: "Spanish",
  tr: "Turkish",
  sq: "Albanian",
  ar: "Arabic",
  zh: "Chinese"
};

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-10)
    .filter(item => item && typeof item === "object")
    .map(item => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: cleanText(item.content, 3000)
    }))
    .filter(item => item.content);
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (!Array.isArray(data?.output)) {
    return "";
  }

  const parts = [];

  for (const item of data.output) {
    if (!Array.isArray(item?.content)) continue;

    for (const content of item.content) {
      if (
        content?.type === "output_text" &&
        typeof content.text === "string"
      ) {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("OPENAI_API_KEY is missing.");

    return res.status(503).json({
      error: "AI service is not configured."
    });
  }

  try {
    const body = req.body || {};

    const message = cleanText(body.message, 1200);
    const language = cleanText(body.language, 10).toLowerCase();

    if (!message) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const requestedLanguage =
      LANGUAGE_NAMES[language] || "English";

    const history = normalizeHistory(body.history);

    const input = [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text:
              FASQOO_SUPPORT_INSTRUCTIONS +
              `\n\nThe visitor's requested language is ${requestedLanguage}.`
          }
        ]
      }
    ];

    for (const item of history) {
      input.push({
        role: item.role,
        content: [
          {
            type: "input_text",
            text: item.content
          }
        ]
      });
    }

    input.push({
      role: "user",
      content: [
        {
          type: "input_text",
          text: message
        }
      ]
    });

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
     body: JSON.stringify({
  model: MODEL,
  input,
  max_output_tokens: 700
})
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", {
        status: response.status,
        data
      });

      return res.status(502).json({
        error: "AI service request failed."
      });
    }

    const reply = extractResponseText(data);

    if (!reply) {
      console.error("No response text returned by OpenAI.", data);

      return res.status(502).json({
        error: "AI service returned an empty response."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("Fasqoo AI error:", error);

    return res.status(500).json({
      error: "Internal AI service error."
    });
  }
};
