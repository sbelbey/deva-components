import { describe, expect, it } from 'vitest';
import { buildHaystack, longestTerm, matchesAllTerms, matchText, normalizeText, splitTerms } from '../src';

describe('normalize', () => {
  it('saca acentos, puntos y mayúsculas', () => {
    expect(normalizeText('  Gómez  PEÑA ')).toBe('gomez pena');
    expect(normalizeText('A09.9')).toBe('a099');
    expect(normalizeText('G.O.T.')).toBe('got');
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(475)).toBe('475');
  });

  it('parte en términos', () => {
    expect(splitTerms('Gómez   Juan')).toEqual(['gomez', 'juan']);
    expect(splitTerms('   ')).toEqual([]);
  });

  it('multi-término AND en cualquier orden', () => {
    const hay = buildHaystack('Gómez', 'Juan Carlos', 1234, null, undefined, '');
    expect(matchesAllTerms(hay, splitTerms('juan gomez'))).toBe(true);
    expect(matchesAllTerms(hay, splitTerms('1234 carl'))).toBe(true);
    expect(matchesAllTerms(hay, splitTerms('juan perez'))).toBe(false);
    expect(matchesAllTerms(hay, [])).toBe(true);
    expect(matchText('a09.9', 'A099', 'Diarrea')).toBe(true);
  });

  it('término más largo, sin normalizar', () => {
    expect(longestTerm('Gómez Juan')).toBe('Gómez');
    expect(longestTerm('  ')).toBe('');
  });
});
