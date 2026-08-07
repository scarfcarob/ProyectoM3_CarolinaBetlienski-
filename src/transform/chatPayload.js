
// src/transform/chatPayload.js
//
// Responsabilidad única: transformar datos entre el "idioma" de tu chat
// (historial, personaje) y el "idioma" que espera/devuelve el SDK de Gemini.
// No hace fetch, no toca el DOM — solo arma y parsea objetos.

//este no se parece al de la profe, porque no tiene const MODEL_NAME = "gemini-2.0-flash"; ni la función buildPayload() que usa ese modelo, porque en este proyecto usamos el modelo por defecto de Gemini (que se define en .env.local) y no necesitamos exponerlo acá.


const MAX_OUTPUT_TOKENS = 150;
const TEMPERATURE = 0.9;
const MAX_TURNS_HISTORY = 12; // últimos N mensajes que se mandan como contexto, para no gastar tokens de más en charlas largas

export function buildPayload(contents, systemInstruction) {
  const contentsRecortado = contents.slice(-MAX_TURNS_HISTORY);

  return {
    contents: contentsRecortado,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS
    }
  };
}

export function normalizeAIResponse(raw) {
  const firstCandidate = raw?.candidates?.[0];
  const parts = firstCandidate?.content?.parts;

  if (!Array.isArray(parts)) return '';

  return parts
    .filter(p => typeof p?.text === 'string')
    .map(p => p.text)
    .join('')
    .trim();
}