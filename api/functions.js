
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en el servidor' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai?.models?.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      contents: req.body.contents,
      config: {
        systemInstruction: req.body.systemInstruction,
        ...req.body.generationConfig,
      },
    });

    return res.status(200).json(response);
  } catch (err) {
    const status = err.status ?? 500;
    return res.status(status).json({ error: err.message });
  }
}

