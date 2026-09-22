/**
 * Fasqoo AI Support - Vercel Serverless Function
 *
 * Required Vercel Environment Variable:
 *   GEMINI_API_KEY
 *
 * IMPORTANT:
 * The Gemini API key stays server-side.
 * Never put the key into HTML, frontend JavaScript or GitHub.
 */

const MODEL = "gemini-2.5-flash";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 8;
const MAX_HISTORY_TEXT_LENGTH = 1500;
const MAX_OUTPUT_TOKENS = 700;

const FASQOO_SUPPORT_INSTRUCTIONS = `
You are Fasqoo AI Support, the technical support assistant embedded on Fasqoo.

Help visitors with Internet speed tests, download, upload, ping/latency, jitter,
Wi-Fi, gaming latency and basic network troubleshooting.

Reply in the visitor's requested language.

Be concise, professional and technically careful.

Never claim access to the visitor's:
- device
- IP address
- router
- ISP
- live connection
- live network
- test results

unless the visitor explicitly provides the information.

Never invent:
- measurements
- providers
- outages
- server locations
- diagnoses
- network conditions

Explain that a test to one server cannot exactly reproduce the route to every
game server, website, streaming service or other Internet destination.

Fasqoo is independent and is not owned, operated, sponsored or endorsed by Cloudflare.

Depending on configuration, Fasqoo may use selected Cloudflare infrastructure
or measurement endpoints.

One isolated speed test does not by itself prove an ISP fault.

Fasqoo FAQ facts:

- Speed tests measure download, upload, ping/latency and jitter.
- Download is data transferred from the Internet to the device.
- Download results can depend on the test server, routing, Wi-Fi,
  device performance and network congestion.
- Upload is data transferred from the device to the Internet.
- Upload results can be affected by plan limits, Wi-Fi, router settings,
  congestion, backups and other devices.
- Ping is round-trip response time to a particular test server,
  normally measured in milliseconds.
- Jitter is variation in response timing and can affect calls,
  streaming and gaming.
- Slow Wi-Fi does not necessarily mean slow Internet service.
- Distance, walls, interference, channel congestion, router placement
  and device capabilities can affect Wi-Fi.
- An Ethernet comparison can help determine whether Wi-Fi is contributing
  to a problem.
- High gaming ping can come from server distance, routing, congestion,
  Wi-Fi interference or heavy traffic.
- Repeated comparable tests, preferably including Ethernet,
  are more useful than one isolated result.
`;

function json(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  return res.status(status).json(body);
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .filter(part => typeof part?.text === "string")
    .map(part => part.text)
    .join("\n")
    .trim();
}

function getSafeLanguage(value) {
  const languages = {
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

  if (typeof value !== "string") {
    return "English";
  }

  const code = value.trim().slice(0, 2).toLowerCase();

  return languages[code] || "English";
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  const result = [];

  for (const item of history.slice(-MAX_HISTORY_ITEMS)) {
    if (!item) continue;

    if (item.role !== "user" && item.role !== "model") {
      continue;
    }

    if (typeof item.text !== "string") {
      continue;
    }

    const text = item.text.trim();

    if (!text) {
      continue;
    }

    result.push({
      role: item.role,
      parts: [
        {
          text: text.slice(0, MAX_HISTORY_TEXT_LENGTH)
        }
      ]
    });
  }

  return result;
}

export default async function handler(req, res) {
  /*
   * Only POST requests are allowed.
   */
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return json(res, 405, {
      error: "Method not allowed.",
      code: "METHOD_NOT_ALLOWED"
    });
  }

  /*
   * Gemini API key must exist in Vercel Environment Variables.
   *
   * IMPORTANT:
   * Never replace this with the actual key.
   */
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    console.error("GEMINI_API_KEY is missing.");

    return json(res, 503, {
      error: "Gemini AI is temporarily unavailable.",
      code: "MISSING_GEMINI_API_KEY"
    });
  }

  /*
   * Read request body.
   */
  let body = req.body || {};

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  /*
   * Validate visitor message.
   */
  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return json(res, 400, {
      error: "Please enter a message.",
      code: "EMPTY_MESSAGE"
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return json(res, 413, {
      error: "Message is too long.",
      code: "MESSAGE_TOO_LONG"
    });
  }

  /*
   * Determine requested language.
   */
  const language = getSafeLanguage(body.language);

  /*
   * Sanitize conversation history.
   */
  const history = sanitizeHistory(body.history);

  /*
   * Build Gemini conversation.
   */
  const contents = [...history];

  contents.push({
    role: "user",
    parts: [
      {
        text:
          `Visitor language: ${language}.\n\n` +
          `Visitor question:\n${message}`
      }
    ]
  });

  /*
   * Gemini request.
   */
  const requestBody = {
    system_instruction: {
      parts: [
        {
          text: FASQOO_SUPPORT_INSTRUCTIONS
        }
      ]
    },

    contents,

    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.35
    }
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey.trim()
      },

      body: JSON.stringify(requestBody)
    });

    const raw = await response.text();

    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    /*
     * Gemini returned an error.
     */
    if (!response.ok) {
      console.error("Gemini API error:", {
        status: response.status,
        providerStatus: data?.error?.status,
        providerCode: data?.error?.code,
        providerMessage: data?.error?.message
      });

      /*
       * Do NOT expose Google's internal error message
       * to the visitor.
       */
      return json(res, 502, {
        error: "The AI service is temporarily unavailable. Please try again.",
        code: "GEMINI_API_ERROR"
      });
    }

    /*
     * Extract Gemini response.
     */
    const reply = extractText(data);

    if (!reply) {
      console.error(
        "Gemini returned no text response."
      );

      return json(res, 502, {
        error: "The AI service returned an empty response. Please try again.",
        code: "EMPTY_GEMINI_RESPONSE"
      });
    }

    /*
     * Successful response.
     */
    return json(res, 200, {
      reply
    });

  } catch (error) {
    /*
     * Network/server error.
     */
    console.error("Gemini request failed:", error);

    return json(res, 500, {
      error: "The AI service could not be reached. Please try again.",
      code: "GEMINI_REQUEST_FAILED"
    });
  }
}
