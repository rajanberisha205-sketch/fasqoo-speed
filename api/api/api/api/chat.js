import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // CORS-Header für die Kommunikation mit deiner Website
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  try {
    const { prompt } = req.body;
    
    // Holt den Schlüssel sicher aus Vercel
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Holt die Antwort von Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
