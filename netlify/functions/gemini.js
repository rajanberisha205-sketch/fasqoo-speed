import { GoogleGenAI } from "@google/genai";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Nur POST erlaubt" };
  }
  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) return { statusCode: 400, body: "Prompt fehlt" };

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: "KI-Fehler" };
  }
}
