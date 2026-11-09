import { describe, expect, it } from 'vitest';
import { normalizeDiagnosisCode } from '../src';
import { findExactCodeMatch } from '../src/core/exactCode';

type Item = { id: string; code?: string | number | null };
const getCode = (i: Item) => i.code;

describe('findExactCodeMatch (DEVA-148)', () => {
  const items: Item[] = [
    { id: 'a', code: 1 },
    { id: 'b', code: 167 },
  ];

  it('devuelve el ítem cuyo código coincide exacto', () => {
    expect(findExactCodeMatch(items, '1', { getCode })?.id).toBe('a');
    expect(findExactCodeMatch(items, '167', { getCode })?.id).toBe('b');
  });

  it('no matchea por prefijo ni por contenido', () => {
    expect(findExactCodeMatch(items, '16', { getCode })).toBeUndefined();
    expect(findExactCodeMatch(items, '7', { getCode })).toBeUndefined();
  });

  it('ignora espacios y compara números sin ceros a la izquierda', () => {
    expect(findExactCodeMatch(items, ' 01 ', { getCode })?.id).toBe('a');
  });

  it('con normalize propio ignora mayúsculas y puntos', () => {
    const dx: Item[] = [{ id: 'x', code: 'E11.9' }];
    const opts = { getCode, normalize: normalizeDiagnosisCode };
    expect(findExactCodeMatch(dx, 'e119', opts)?.id).toBe('x');
    expect(findExactCodeMatch(dx, 'E11.9', opts)?.id).toBe('x');
  });

  it('texto vacío, lista null/undefined o sin match → undefined', () => {
    expect(findExactCodeMatch(items, '', { getCode })).toBeUndefined();
    expect(findExactCodeMatch(items, '   ', { getCode })).toBeUndefined();
    expect(findExactCodeMatch(items, null, { getCode })).toBeUndefined();
    expect(findExactCodeMatch(null, '1', { getCode })).toBeUndefined();
    expect(findExactCodeMatch(undefined, '1', { getCode })).toBeUndefined();
    expect(findExactCodeMatch(items, '999', { getCode })).toBeUndefined();
  });

  it('dos ítems distintos con el mismo código → undefined (ambigüedad)', () => {
    const dup: Item[] = [
      { id: 'a', code: 24 },
      { id: 'c', code: 24 },
    ];
    expect(findExactCodeMatch(dup, '24', { getCode })).toBeUndefined();
  });

  it('el mismo ítem repetido (mismo id) no cuenta como ambiguo', () => {
    const dup: Item[] = [
      { id: 'a', code: 24 },
      { id: 'a', code: 24 },
    ];
    expect(findExactCodeMatch(dup, '24', { getCode })?.id).toBe('a');
  });

  it('getCode que devuelve null/undefined se ignora', () => {
    const list: Item[] = [{ id: 'n', code: null }, { id: 'u' }, { id: 'a', code: 1 }];
    expect(findExactCodeMatch(list, '1', { getCode })?.id).toBe('a');
  });

  describe('coincidencia literal primero (follow-up QA)', () => {
    const opts = { getCode, normalize: normalizeDiagnosisCode };
    const dx: Item[] = [
      { id: 'a', code: 'E11.9' },
      { id: 'b', code: 'E119' },
    ];

    it('"e11.9" elige E11.9 aunque E119 normalice igual', () => {
      expect(findExactCodeMatch(dx, 'e11.9', opts)?.id).toBe('a');
    });

    it('"e119" elige E119 (literal)', () => {
      expect(findExactCodeMatch(dx, ' e119 ', opts)?.id).toBe('b');
    });

    it('sin literal vuelve a la normalización y su ambigüedad', () => {
      expect(findExactCodeMatch(dx, 'E11,9', opts)).toBeUndefined();
      const solo: Item[] = [{ id: 'x', code: 'E11.9' }];
      expect(findExactCodeMatch(solo, 'e119', opts)?.id).toBe('x');
    });

    it('dos literales iguales con distinto id: nada', () => {
      const dup: Item[] = [
        { id: 'a', code: 'E11.9' },
        { id: 'b', code: 'e11.9' },
      ];
      expect(findExactCodeMatch(dup, 'E11.9', opts)).toBeUndefined();
    });
  });
});
