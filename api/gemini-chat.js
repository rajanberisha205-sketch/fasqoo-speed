/**
 * Fasqoo AI Support - Vercel Streaming Function
 *
 * Required Vercel Environment Variable:
 *   GEMINI_API_KEY
 *
 * The API key NEVER goes to the browser.
 */

const MODEL = "gemini-3.6-flash";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 8;
const MAX_HISTORY_TEXT_LENGTH = 1500;
const MAX_OUTPUT_TOKENS = 350;

const FASQOO_SUPPORT_INSTRUCTIONS = `
You are Fasqoo AI Support, the technical support assistant on Fasqoo.

Help visitors with:
- Internet speed tests
- download speed
- upload speed
- ping / latency
- jitter
- Wi-Fi
- gaming latency
- video calls
- streaming
- basic network troubleshooting

Reply in the visitor's requested language.

Be concise, professional and technically accurate.
Prefer short answers that are easy to read.

Never claim access to the visitor's:
- device
- IP address
- router
- ISP
- live connection
- live network
- live test results

unless the visitor explicitly provides the information.

Never invent:
- measurements
- providers
- outages
- server locations
- diagnoses
- network conditions

A speed test to one server cannot exactly reproduce the route to every
game server, website, streaming service or other Internet destination.

Fasqoo FAQ facts:

- Download is data transferred from the Internet to the device.
- Upload is data transferred from the device to the Internet.
- Ping is round-trip response time to a particular test server.
- Ping is normally measured in milliseconds.
- Jitter is variation in response timing.
- High jitter can affect gaming, calls and real-time applications.
- Download results can depend on server, routing, Wi-Fi, device performance
  and network congestion.
- Upload results can depend on plan limits, Wi-Fi, router settings,
  congestion, backups and other devices.
- Slow Wi-Fi does not necessarily mean slow Internet service.
- Ethernet testing can help determine whether Wi-Fi contributes to a problem.
- High gaming ping can result from server distance, routing, congestion,
  Wi-Fi interference or heavy network traffic.
- Repeated comparable tests are more useful than one isolated result.

Fasqoo is independent and is not owned, operated, sponsored or endorsed
by Cloudflare.

Depending on configuration, Fasqoo may use selected Cloudflare infrastructure
or measurement endpoints.
`;

function sendJson(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(body));
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

function extractChunkText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .filter(part => typeof part?.text === "string")
    .map(part => part.text)
    .join("");
}

export default async function handler(req, res) {

  // ---------------------------------------------------------
  // METHOD CHECK
  // ---------------------------------------------------------

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return sendJson(res, 405, {
      error: "Method not allowed.",
      code: "METHOD_NOT_ALLOWED"
    });
  }

  // ---------------------------------------------------------
  // API KEY
  // ---------------------------------------------------------

  const apiKey = process.env.GEMINI_API_KEY;

  console.log("Fasqoo Gemini ENV CHECK:", {
    exists: typeof apiKey === "string",
    hasValue: Boolean(apiKey && apiKey.trim()),
    length: typeof apiKey === "string" ? apiKey.length : 0
  });

  if (!apiKey || !apiKey.trim()) {
    console.error("GEMINI_API_KEY is missing.");

    return sendJson(res, 503, {
      error:
        "Gemini AI is temporarily unavailable. Please try again later.",
      code: "MISSING_GEMINI_API_KEY"
    });
  }

  // ---------------------------------------------------------
  // BODY
  // ---------------------------------------------------------

  let body = req.body || {};

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return sendJson(res, 400, {
      error: "Please enter a message.",
      code: "EMPTY_MESSAGE"
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return sendJson(res, 413, {
      error: "Message is too long.",
      code: "MESSAGE_TOO_LONG"
    });
  }

  const language = getSafeLanguage(body.language);
  const history = sanitizeHistory(body.history);

  // ---------------------------------------------------------
  // GEMINI CONTENT
  // ---------------------------------------------------------

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
      temperature: 0.2
    }
  };

  // ---------------------------------------------------------
  // CALL GEMINI STREAM
  // ---------------------------------------------------------

  try {

    const response = await fetch(GEMINI_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey.trim()
      },

      body: JSON.stringify(requestBody)
    });

    // -------------------------------------------------------
    // GEMINI ERROR
    // -------------------------------------------------------

    if (!response.ok) {

      const raw = await response.text();

      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      console.error("Gemini API error:", {
        status: response.status,
        providerStatus: data?.error?.status,
        providerCode: data?.error?.code,
        providerMessage: data?.error?.message
      });

      return sendJson(res, 502, {
        error:
          "The AI service is temporarily unavailable. Please try again.",
        code: "GEMINI_API_ERROR"
      });
    }

    // -------------------------------------------------------
    // STREAM HEADERS
    // -------------------------------------------------------

    res.statusCode = 200;

    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    res.setHeader(
      "X-Accel-Buffering",
      "no"
    );

    // -------------------------------------------------------
    // READ GEMINI SSE STREAM
    // -------------------------------------------------------

    const reader = response.body?.getReader();

    if (!reader) {
      console.error("Gemini returned no readable stream.");

      return res.end(
        "\n[ERROR: EMPTY_GEMINI_STREAM]"
      );
    }

    const decoder = new TextDecoder();

    let buffer = "";
    let totalText = "";

    try {

      while (true) {

        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true
        });

        const events = buffer.split("\n");

        buffer = events.pop() || "";

        for (const line of events) {

          const trimmed = line.trim();

          if (!trimmed.startsWith("data:")) {
            continue;
          }

          const jsonText = trimmed.slice(5).trim();

          if (!jsonText || jsonText === "[DONE]") {
            continue;
          }

          let chunk;

          try {
            chunk = JSON.parse(jsonText);
          } catch {
            continue;
          }

          const text = extractChunkText(chunk);

          if (!text) {
            continue;
          }

          totalText += text;

          // Send text immediately to browser.
          res.write(text);
        }
      }

      // Flush remaining decoder data.
      const remaining = decoder.decode();

      if (remaining) {
        buffer += remaining;
      }

      console.log(
        "Fasqoo Gemini stream completed:",
        {
          characters: totalText.length
        }
      );

      res.end();

    } catch (streamError) {

      console.error(
        "Gemini streaming error:",
        streamError
      );

      if (!res.writableEnded) {
        res.end();
      }
    }

  } catch (error) {

    console.error(
      "Gemini request failed:",
      error
    );

    if (!res.headersSent) {
      return sendJson(res, 500, {
        error:
          "The AI service could not be reached. Please try again.",
        code: "GEMINI_REQUEST_FAILED"
      });
    }

    if (!res.writableEnded) {
      res.end();
    }
  }
}
