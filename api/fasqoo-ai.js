export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Keine Antwort erhalten.";

    return res.status(200).json({ answer: answerText });
  } catch (error) {
    return res.status(500).json({ error: "Fehler bei der API-Anfrage" });
  }
}
