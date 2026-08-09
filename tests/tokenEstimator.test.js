
import { describe, it, expect } from 'vitest';
import { estimateTokens, estimateContentsTokens } from '../src/services/tokenEstimator.js';

describe('estimateTokens', () => {
  it('devuelve 0 para texto vacío, null o undefined', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens(null)).toBe(0);
    expect(estimateTokens(undefined)).toBe(0);
  });

  it('estima ~1 token cada 4 caracteres, redondeando hacia arriba', () => {
    expect(estimateTokens('abcd')).toBe(1);   
    expect(estimateTokens('abcde')).toBe(2);  
    expect(estimateTokens('a')).toBe(1);      
  });
});

describe('estimateContentsTokens', () => {
  it('suma los tokens de todos los mensajes del array contents', () => {
    const contents = [
      { parts: [{ text: 'hola' }] },        
      { parts: [{ text: 'chimichanga' }] }, 
    ];
    expect(estimateContentsTokens(contents)).toBe(4);
  });

  it('devuelve 0 para array vacío y no rompe si falta parts o text', () => {
    expect(estimateContentsTokens([])).toBe(0);
    expect(estimateContentsTokens([{ parts: [] }, {}])).toBe(0);
  });
});
