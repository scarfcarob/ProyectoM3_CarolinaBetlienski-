
import { describe, it, expect } from 'vitest';
import { buildPayload, normalizeAIResponse } from '../src/transform/chatPayload.js';

describe('buildPayload', () => {
  it('arma el payload con systemInstruction y generationConfig por defecto', () => {
    const contents = [{ role: 'user', parts: [{ text: 'hola' }] }];
    const payload = buildPayload(contents, 'sos Deadpool');

    expect(payload.systemInstruction).toEqual({ parts: [{ text: 'sos Deadpool' }] });
    expect(payload.generationConfig).toEqual({ temperature: 0.9, maxOutputTokens: 150 });
    expect(payload.contents).toEqual(contents);
  });

  it('recorta el historial a los últimos 12 mensajes (MAX_TURNS_HISTORY)', () => {
    const contents = Array.from({ length: 20 }, (_, i) => ({
      role: 'user',
      parts: [{ text: `mensaje ${i}` }],
    }));

    const payload = buildPayload(contents, 'sos Deadpool');

    expect(payload.contents).toHaveLength(12);
    expect(payload.contents[0].parts[0].text).toBe('mensaje 8'); 
    expect(payload.contents.at(-1).parts[0].text).toBe('mensaje 19');
  });
});

describe('normalizeAIResponse', () => {
  it('concatena y limpia el texto de las parts del primer candidato', () => {
    const raw = {
      candidates: [
        { content: { role: 'model', parts: [{ text: ' Hola ' }, { text: 'mundo' }] } },
      ],
    };
    expect(normalizeAIResponse(raw)).toBe('Hola mundo');
  });

  it('devuelve string vacío si no hay candidates o raw es inválido', () => {
    expect(normalizeAIResponse({})).toBe('');
    expect(normalizeAIResponse(null)).toBe('');
    expect(normalizeAIResponse(undefined)).toBe('');
  });

  it('ignora parts sin texto (ej: functionCall) y solo une las que sí tienen', () => {
    const raw = {
      candidates: [
        { content: { parts: [{ text: 'ok' }, { functionCall: {} }] } },
      ],
    };
    expect(normalizeAIResponse(raw)).toBe('ok');
  });
});
