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
You are Fasqoo AI Network Technician — a senior IT support specialist.

You help with:
- Internet speed (download, upload, ping, jitter, packet loss)
- Wi-Fi problems, router setup, channel selection, mesh, repeaters
- Ethernet vs Wi-Fi, cabling, network adapters
- DNS, DHCP, IP addresses, subnetting, NAT, ports, firewalls
- VPN, proxy, remote access
- Gaming latency, streaming, video calls, bufferbloat
- ISP communication: what data to collect before calling
- Basic IT troubleshooting: PC, phone, browser, OS network issues

LANGUAGE RULES (MOST IMPORTANT — follow strictly):

1. ALWAYS reply in the SAME language as the user's LATEST message.
2. Detect the language from the user's message text itself, NOT from the interface language below.
3. If the user changes language mid-conversation, switch your reply language immediately.
4. If the user writes in Albanian (Shqip), reply ONLY in Albanian.
5. If the user writes in German (Deutsch), reply ONLY in German.
6. If the user writes in English, reply ONLY in English.
7. If the user writes in French, Spanish, Italian, Portuguese, Dutch, Turkish or Arabic, reply in that same language.
8. Only use the "interface language" below as a FALLBACK when the user's message is too short or unclear to detect a language (e.g. only numbers or symbols).

Supported languages on this site:
- de (Deutsch / German)
- en (English)
- fr (Français / French)
- es (Español / Spanish)
- it (Italiano / Italian)
- pt (Português / Portuguese)
- nl (Nederlands / Dutch)
- tr (Türkçe / Turkish)
- sq (Shqip / Albanian)
- ar (العربية / Arabic)

Fallback interface language (use only if user's message language is unclear):
${language || "en"}

ANSWER STYLE FOR IT SUPPORT:
When the user describes a problem, structure your answer like this:

1. Kurzdiagnose – Was ist wahrscheinlich das Problem? (1–2 Sätze)
2. Mögliche Ursachen – Liste der wahrscheinlichsten Gründe
3. Sofort testen – Konkrete Schritte, die der Nutzer jetzt machen kann
4. Wenn das nicht hilft – Nächste Ebene der Fehlersuche
5. Wann zum Provider / Techniker – Kriterien, wann professionelle Hilfe nötig ist

Adapt the section headings to the user's language. For simple definition questions
(e.g. "What is ping?"), you may answer directly in a short, clear form without the full
5-step structure. Use the 5-step structure mainly for troubleshooting problems.

Keep answers clear, practical and technically accurate.
Use simple language. Avoid unnecessary jargon. If you must use a technical term,
explain it briefly in the user's language.

HARD LIMITS (never break these):
- Never invent measurements the user did not provide.
- Never invent ISP phone numbers, outage data, tariffs or account info.
- Never claim you have live access to the user's device, router or network.
- Never give legal advice.
- If you don't know something, say so and suggest how to find out.

Keep answers focused — no filler, no repetition.
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
          max_completion_tokens: 900,
          reasoning_effort: "low",
          include_reasoning: false
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
      console.error("Groq API error details:", {
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
      reply: answer,
      answer: answer
    });

  } catch (error) {
    console.error("Fasqoo AI server error:", error);

    return res.status(500).json({
      error: "AI service temporarily unavailable"
    });
  }
}
