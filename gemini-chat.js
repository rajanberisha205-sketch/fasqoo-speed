/**
 * Fasqoo AI Support - Vercel Serverless Function
 *
 * Vercel Environment Variable required:
 *   GEMINI_API_KEY
 *
 * The key stays server-side and is never exposed to visitors.
 */


const MODEL = "gemini-1.5-flash"; 
const GEMINI_URL = `https://googleapis.com{MODEL}:generateContent`;


const FASQOO_SUPPORT_INSTRUCTIONS = `
You are Fasqoo AI Support, the technical support assistant embedded on Fasqoo.

Help visitors with Internet speed tests, download, upload, ping/latency, jitter,
Wi-Fi, gaming latency and basic network troubleshooting.
Reply in the visitor's requested language. Be concise, professional and technically careful.
Never claim access to the visitor's device, IP, router, ISP, live connection or test results
unless the visitor provides the values. Never invent measurements, providers, outages,
server locations or diagnoses.
Explain that a test to one server cannot exactly reproduce the route to every game/service server.
Fasqoo is independent and is not owned, operated, sponsored or endorsed by Cloudflare.
Depending on configuration, Fasqoo may use selected Cloudflare infrastructure or measurement endpoints.
One isolated speed test does not by itself prove an ISP fault.

Fasqoo FAQ facts:
- Speed tests measure download, upload, ping/latency and jitter.
- Download is data transferred from the Internet to the device; results also depend on server,
  routing, Wi-Fi, device performance and congestion.
- Upload is data transferred from the device to the Internet; plan limits, Wi-Fi, router settings,
  congestion, backups and other devices can reduce it.
- Ping is round-trip response time to a particular test server, normally in milliseconds.
- Jitter is variation in response timing and can affect calls, streaming and gaming.
- Slow Wi-Fi does not necessarily mean slow Internet service. Distance, walls, interference,
  channel congestion, router placement and device capabilities can matter. Ethernet comparison helps.
- High gaming ping can come from server distance, routing, congestion, Wi-Fi interference or heavy traffic.
- Repeated comparable tests, preferably including Ethernet, are more useful than one isolated result.
`;

function json(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter(part => typeof part?.text === "string")
    .map(part => part.text)
    .join("\n")
    .trim();
}

function googleError(data, status) {
  if (data?.error?.message) return String(data.error.message);
  return `Gemini API returned HTTP ${status}.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed.", code: "METHOD_NOT_ALLOWED" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return json(res, 503, {
      error: "Gemini AI is not configured. Vercel is not providing GEMINI_API_KEY to this deployment.",
      code: "MISSING_GEMINI_API_KEY"
    });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const language = typeof body.language === "string" ? body.language.slice(0, 10) : "en";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    return json(res, 400, { error: "Please enter a message.", code: "EMPTY_MESSAGE" });
  }
  if (message.length > 1200) {
    return json(res, 413, { error: "Message is too long.", code: "MESSAGE_TOO_LONG" });
  }

  const languageNames = {
    de: "German", en: "English", fr: "French", es: "Spanish", it: "Italian",
    pt: "Portuguese", nl: "Dutch", tr: "Turkish", sq: "Albanian", ar: "Arabic"
  };

  const contents = [];

  // Keep a small, clean conversation history in the request.
  for (const item of history.slice(-10)) {
    if (!item || (item.role !== "user" && item.role !== "model")) continue;
    if (typeof item.text !== "string" || !item.text.trim()) continue;
    contents.push({
      role: item.role,
      parts: [{ text: item.text.slice(0, 3000) }]
    });
  }

  contents.push({
    role: "user",
    parts: [{
      text: `Visitor language: ${languageNames[language] || "English"}.\nVisitor question:\n${message}`
    }]
  });

  const requestBody = {
    system_instruction: {
      parts: [{ text: FASQOO_SUPPORT_INSTRUCTIONS }]
    },
    contents,
    generationConfig: {
      maxOutputTokens: 700,
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
    try { data = raw ? JSON.parse(raw) : {}; } catch {}

    if (!response.ok) {
      const messageFromGoogle = googleError(data, response.status);
      console.error("Gemini API error", {
        status: response.status,
        message: messageFromGoogle
      });
      return json(res, 502, {
        error: "Gemini API error: " + messageFromGoogle,
        code: String(data?.error?.status || data?.error?.code || `HTTP_${response.status}`)
      });
    }

    const reply = extractText(data);
    if (!reply) {
      console.error("Gemini returned no text", JSON.stringify(data).slice(0, 2000));
      return json(res, 502, {
        error: "Gemini returned no text response.",
        code: "EMPTY_GEMINI_RESPONSE"
      });
    }

    return json(res, 200, { reply });
  } catch (error) {
    console.error("Gemini request failed", error);
    return json(res, 500, {
      error: "The server could not reach Gemini. Please try again.",
      code: "GEMINI_REQUEST_FAILED"
    });
  }
}
