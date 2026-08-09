
import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordUsage,
  recordRealUsage,
  getSessionUsage,
  isSessionQuotaExceeded,
  resetSessionUsage,
} from '../src/services/quotaSimulator.js';

describe('quotaSimulator', () => {
 
  beforeEach(() => {
    resetSessionUsage();
  });

  it('getSessionUsage arranca en cero con el límite de 4000 tokens', () => {
    expect(getSessionUsage()).toEqual({
      requestCount: 0,
      promptTokens: 0,
      candidateTokens: 0,
      totalTokens: 0,
      limit: 4000,
      remaining: 4000,
    });
  });

  it('recordUsage acumula tokens de prompt y de respuesta, y cuenta requests', () => {
    recordUsage(100, 50);
    recordUsage(200, 80);

    const usage = getSessionUsage();
    expect(usage.promptTokens).toBe(300);
    expect(usage.candidateTokens).toBe(130);
    expect(usage.totalTokens).toBe(430);
    expect(usage.requestCount).toBe(2);
    expect(usage.remaining).toBe(4000 - 430);
  });

  it('recordRealUsage lee promptTokenCount/candidatesTokenCount del usageMetadata de Gemini', () => {
    recordRealUsage({ usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 40 } });
    expect(getSessionUsage().totalTokens).toBe(160);
  });

  it('recordRealUsage no rompe ni suma nada si falta usageMetadata', () => {
    recordRealUsage({});
    recordRealUsage(null);
    expect(getSessionUsage().totalTokens).toBe(0);
  });

  it('isSessionQuotaExceeded se activa al llegar o superar el límite de 4000', () => {
    expect(isSessionQuotaExceeded()).toBe(false);

    recordUsage(3999, 0);
    expect(isSessionQuotaExceeded()).toBe(false);

    recordUsage(1, 0);
    expect(isSessionQuotaExceeded()).toBe(true);
    expect(getSessionUsage().remaining).toBe(0); 
  });

  it('resetSessionUsage vuelve todo a cero', () => {
    recordUsage(500, 500);
    resetSessionUsage();

    expect(getSessionUsage()).toEqual({
      requestCount: 0,
      promptTokens: 0,
      candidateTokens: 0,
      totalTokens: 0,
      limit: 4000,
      remaining: 4000,
    });
  });
});
