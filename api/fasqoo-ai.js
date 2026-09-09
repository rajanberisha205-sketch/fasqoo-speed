export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ 
      answer: "Fehler: Der GEMINI_API_KEY ist in Vercel nicht gesetzt." 
    });
  }

  const userQuery = prompt || (messages && messages.length > 0 ? messages[messages.length - 1].content : "Hallo");

  try {
    // Aktualisiertes Modell: gemini-3.6-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userQuery }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        answer: `Google API Fehler: ${data.error.message}` 
      });
    }

    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answerText) {
      return res.status(200).json({ 
        answer: "Fehler: Google hat eine leere Antwort zurückgegeben." 
      });
    }

    return res.status(200).json({ answer: answerText });
  } catch (error) {
    return res.status(200).json({ 
      answer: `Server-Fehler: ${error.message}` 
    });
  }
}
