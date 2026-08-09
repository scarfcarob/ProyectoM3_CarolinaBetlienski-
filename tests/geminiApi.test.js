
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchGeminiAPI } from '../src/services/geminiApi.js';

describe('fetchGeminiAPI', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devuelve el JSON parseado cuando la respuesta es ok', async () => {
    const mockData = { candidates: [{ content: { parts: [{ text: 'hola' }] } }] };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchGeminiAPI({ contents: [] });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/functions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('lanza un error con status y retryAfterSeconds ante un 429', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit' }),
    });

    await expect(fetchGeminiAPI({ contents: [] })).rejects.toMatchObject({
      status: 429,
      retryAfterSeconds: 5,
      message: 'Rate limit',
    });
  });

  it('lanza un error con status 0 ante una falla de red (fetch rechaza)', async () => {
    global.fetch.mockRejectedValue(new Error('failed to fetch'));

    await expect(fetchGeminiAPI({ contents: [] })).rejects.toMatchObject({ status: 0 });
  });
});
