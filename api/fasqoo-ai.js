```javascript
module.exports = async function handler(req, res) {

  // ============================================
  // FASQOO AI TECHNICIAN
  // VERCEL SERVERLESS FUNCTION
  // ============================================

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ONLY POST
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST requests are allowed."
    });
  }

  // ============================================
  // CHECK API KEY
  // ============================================

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {

    console.error(
      "FASQOO ERROR: GEMINI_API_KEY is missing."
    );

    return res.status(500).json({
      ok: false,
      error: "GEMINI_API_KEY is missing in Vercel."
    });
  }

  try {

    // ==========================================
    // READ BODY
    // ==========================================

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (error) {
        return res.status(400).json({
          ok: false,
          error: "Invalid JSON."
        });
      }
    }

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        ok: false,
        error: "Invalid request."
      });
    }

    // ==========================================
    // GET USER MESSAGES
    // ==========================================

    let messages = [];

    if (Array.isArray(body.messages)) {

      messages = body.messages
        .filter(function (message) {
          return (
            message &&
            typeof message.content === "string" &&
            message.content.trim().length > 0
          );
        })
        .slice(-10)
        .map(function (message) {

          return {
            role:
              message.role === "assistant" ||
              message.role === "model"
                ? "AI"
                : "User",

            content:
              message.content
                .trim()
                .slice(0, 3000)
          };

        });

    }

    // ==========================================
    // ALSO SUPPORT prompt
    // ==========================================

    if (
      messages.length === 0 &&
      typeof body.prompt === "string" &&
      body.prompt.trim()
    ) {

      messages.push({
        role: "User",
        content: body.prompt
          .trim()
          .slice(0, 3000)
      });

    }

    if (messages.length === 0) {

      return res.status(400).json({
        ok: false,
        error: "Please enter a question."
      });

    }

    // ==========================================
    // CREATE CHAT HISTORY
    // ==========================================

    const history = messages
      .map(function (message) {

        return (
          message.role +
          ": " +
          message.content
        );

      })
      .join("\n\n");

    // ==========================================
    // PROMPT
    // ==========================================

    const prompt = `
You are Fasqoo AI Technician.

You are the official technical support assistant
for the Fasqoo Internet Speed Test.

Help users with:

- slow internet
- Wi-Fi
- download speed
- upload speed
- ping
- latency
- jitter
- packet loss
- DNS
- router problems
- gaming
- streaming
- YouTube
- Netflix
- video calls
- Zoom
- Microsoft Teams
- internet speed tests

RULES:

1. Answer in the same language as the user.

2. Give practical and easy instructions.

3. Use numbered steps when troubleshooting.

4. Never invent measurements.

5. Never claim that you can access the user's device,
router or internet connection.

6. Only analyze measurements that the user provides.

7. If the user gives Download, Upload, Ping,
Jitter or Packet Loss values, explain them.

8. If necessary, ask a short follow-up question.

9. Remember the conversation history.

10. Continue the conversation naturally.

11. Keep answers concise but helpful.

12. Never reveal API keys or server secrets.

RECENT CONVERSATION:

${history}

Answer the latest user message now.
`.trim();

    // ==========================================
    // GEMINI
    // ==========================================

    const model = "gemini-3.8-flash";

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent";

    console.log(
      "FASQOO AI: Calling Gemini..."
    );

    // ==========================================
    // TIMEOUT
    // ==========================================

    const controller = new AbortController();

    const timeout = setTimeout(function () {
      controller.abort();
    }, 30000);

    let geminiResponse;

    try {

      geminiResponse = await fetch(url, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({

          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            maxOutputTokens: 1000
          }

        }),

        signal: controller.signal

      });

    } finally {

      clearTimeout(timeout);

    }

    // ==========================================
    // READ RESPONSE
    // ==========================================

    const rawText =
      await geminiResponse.text();

    console.log(
      "FASQOO AI: Gemini status:",
      geminiResponse.status
    );

    let data;

    try {

      data = JSON.parse(rawText);

    } catch (error) {

      console.error(
        "FASQOO AI: Gemini returned invalid JSON:",
        rawText.slice(0, 1000)
      );

      return res.status(502).json({
        ok: false,
        error:
          "Gemini returned an invalid response."
      });

    }

    // ==========================================
    // GEMINI ERROR
    // ==========================================

    if (!geminiResponse.ok) {

      const errorMessage =
        data &&
        data.error &&
        data.error.message
          ? data.error.message
          : "Gemini API request failed.";

      console.error(
        "FASQOO GEMINI ERROR:",
        geminiResponse.status,
        errorMessage
      );

      if (geminiResponse.status === 429) {

        return res.status(429).json({
          ok: false,
          error:
            "Gemini rate limit reached. Please wait and try again."
        });

      }

      if (
        geminiResponse.status === 400 ||
        geminiResponse.status === 401 ||
        geminiResponse.status === 403
      ) {

        return res.status(geminiResponse.status).json({
          ok: false,
          error:
            "Gemini rejected the request. Check your Gemini API key and API access in Google AI Studio."
        });

      }

      return res.status(502).json({
        ok: false,
        error: errorMessage
      });

    }

    // ==========================================
    // GET ANSWER
    // ==========================================

    let answer = "";

    if (
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      Array.isArray(
        data.candidates[0].content.parts
      )
    ) {

      answer =
        data.candidates[0].content.parts
          .map(function (part) {
            return part.text || "";
          })
          .join("")
          .trim();

    }

    // ==========================================
    // NO ANSWER
    // ==========================================

    if (!answer) {

      console.error(
        "FASQOO AI: No answer from Gemini.",
        JSON.stringify(data)
      );

      return res.status(502).json({
        ok: false,
        error:
          "Gemini returned no usable answer."
      });

    }

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      "FASQOO AI: SUCCESS"
    );

    return res.status(200).json({
      ok: true,
      answer: answer
    });

  } catch (error) {

    console.error(
      "FASQOO AI CRASH:",
      error
    );

    if (
      error &&
      error.name === "AbortError"
    ) {

      return res.status(504).json({
        ok: false,
        error:
          "Gemini took too long to respond."
      });

    }

    return res.status(500).json({
      ok: false,
      error:
        error && error.message
          ? error.message
          : "Fasqoo AI server error."
    });

  }

};
```
