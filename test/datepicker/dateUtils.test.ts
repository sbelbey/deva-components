import { describe, expect, it } from 'vitest';
import {
  composeParts,
  daysInMonth,
  emptyParts,
  formatOutput,
  monthGrid,
  parseValue,
  partsFromYmd,
  stepSection,
  typeDigit,
  type Parts,
} from '../../src/ui/datepicker/dateUtils';

const parts = (day: string, month: string, year: string): Parts => ({ day, month, year });

describe('daysInMonth', () => {
  it('cuenta los días y los años bisiestos', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe('parseValue', () => {
  it('lee YYYY-MM-DD tal cual', () => {
    expect(parseValue('2026-11-09')).toEqual({ y: 2026, m: 11, d: 9 });
  });

  it('lee un ISO por sus partes UTC, como el DatePicker de DEVA (dayjs.utc)', () => {
    expect(parseValue('2026-11-09T03:00:00.000Z')).toEqual({ y: 2026, m: 11, d: 9 });
  });

  it('lo vacío o inválido es null', () => {
    expect(parseValue('')).toBeNull();
    expect(parseValue(null)).toBeNull();
    expect(parseValue('no es fecha')).toBeNull();
  });
});

describe('formatOutput', () => {
  it('iso: medianoche local del día elegido', () => {
    const iso = formatOutput({ y: 2026, m: 11, d: 9 }, 'iso');
    const back = new Date(iso);
    expect([back.getFullYear(), back.getMonth() + 1, back.getDate(), back.getHours()]).toEqual([2026, 11, 9, 0]);
  });

  it('date: YYYY-MM-DD', () => {
    expect(formatOutput({ y: 2026, m: 1, d: 5 }, 'date')).toBe('2026-01-05');
  });
});

describe('composeParts', () => {
  it('con las tres partes completas y válidas da la fecha', () => {
    expect(composeParts(parts('09', '11', '2026'))).toEqual({ y: 2026, m: 11, d: 9 });
  });

  it('con partes a medias, año corto o día que no existe da null', () => {
    expect(composeParts(parts('', '11', '2026'))).toBeNull();
    expect(composeParts(parts('09', '11', '26'))).toBeNull();
    expect(composeParts(parts('09', '11', '0202'))).toBeNull();
    expect(composeParts(parts('31', '04', '2026'))).toBeNull();
    expect(composeParts(parts('29', '02', '2026'))).toBeNull();
    expect(composeParts(parts('29', '02', '2028'))).toEqual({ y: 2028, m: 2, d: 29 });
  });
});

describe('typeDigit: escribir dígitos en una parte', () => {
  it('día: un 1 espera el segundo dígito y un 4 o más completa y pasa a la siguiente', () => {
    let r = typeDigit(emptyParts(), 'day', '', '1');
    expect(r).toMatchObject({ parts: { day: '01' }, buffer: '1', advance: false });
    r = typeDigit(r.parts, 'day', r.buffer, '3');
    expect(r).toMatchObject({ parts: { day: '13' }, advance: true });

    r = typeDigit(emptyParts(), 'day', '', '4');
    expect(r).toMatchObject({ parts: { day: '04' }, advance: true });
  });

  it('día: un número que no existe (35) arranca de nuevo con el último dígito', () => {
    const first = typeDigit(emptyParts(), 'day', '', '3');
    const second = typeDigit(first.parts, 'day', first.buffer, '5');
    expect(second).toMatchObject({ parts: { day: '05' }, advance: true });
  });

  it('mes: un 1 espera y un 2 lo completa (12); un 2 solo ya es 02', () => {
    const first = typeDigit(emptyParts(), 'month', '', '1');
    expect(first.parts.month).toBe('01');
    expect(typeDigit(first.parts, 'month', first.buffer, '2')).toMatchObject({ parts: { month: '12' }, advance: true });
    expect(typeDigit(emptyParts(), 'month', '', '2')).toMatchObject({ parts: { month: '02' }, advance: true });
  });

  it('mes: 13 no existe y arranca de nuevo con el 3', () => {
    const first = typeDigit(emptyParts(), 'month', '', '1');
    expect(typeDigit(first.parts, 'month', first.buffer, '3')).toMatchObject({ parts: { month: '03' }, advance: true });
  });

  it('año: cuatro dígitos y recién ahí pasa a la siguiente', () => {
    let r = typeDigit(emptyParts(), 'year', '', '2');
    expect(r).toMatchObject({ parts: { year: '0002' }, advance: false });
    r = typeDigit(r.parts, 'year', r.buffer, '0');
    r = typeDigit(r.parts, 'year', r.buffer, '2');
    expect(r.advance).toBe(false);
    r = typeDigit(r.parts, 'year', r.buffer, '6');
    expect(r).toMatchObject({ parts: { year: '2026' }, advance: true });
  });

  it('ignora lo que no es un dígito', () => {
    expect(typeDigit(emptyParts(), 'day', '', 'a').parts.day).toBe('');
  });
});

describe('stepSection: flechas arriba y abajo', () => {
  const today = { y: 2026, m: 11, d: 9 };

  it('día: sube y baja dando la vuelta dentro del mes', () => {
    expect(stepSection(parts('30', '11', '2026'), 'day', 1, today).day).toBe('01');
    expect(stepSection(parts('01', '11', '2026'), 'day', -1, today).day).toBe('30');
    expect(stepSection(parts('28', '02', '2026'), 'day', 1, today).day).toBe('01');
  });

  it('mes: da la vuelta entre 1 y 12', () => {
    expect(stepSection(parts('09', '12', '2026'), 'month', 1, today).month).toBe('01');
    expect(stepSection(parts('09', '01', '2026'), 'month', -1, today).month).toBe('12');
  });

  it('año: suma y resta de a uno', () => {
    expect(stepSection(parts('09', '11', '2026'), 'year', 1, today).year).toBe('2027');
    expect(stepSection(parts('09', '11', '2026'), 'year', -1, today).year).toBe('2025');
  });

  it('una parte vacía arranca en la de hoy', () => {
    expect(stepSection(emptyParts(), 'day', 1, today).day).toBe('09');
    expect(stepSection(emptyParts(), 'month', -1, today).month).toBe('11');
    expect(stepSection(emptyParts(), 'year', 1, today).year).toBe('2026');
  });
});

describe('partsFromYmd', () => {
  it('rellena con ceros', () => {
    expect(partsFromYmd({ y: 2026, m: 1, d: 5 })).toEqual({ day: '05', month: '01', year: '2026' });
  });
});

describe('monthGrid', () => {
  it('arma las semanas empezando en lunes, con los días de relleno', () => {
    const grid = monthGrid(2026, 11); // 1/11/2026 es domingo
    expect(grid[0]).toHaveLength(7);
    expect(grid[0][6]).toEqual({ y: 2026, m: 11, d: 1, outside: false });
    expect(grid[0][0]).toMatchObject({ y: 2026, m: 10, d: 26, outside: true });
    expect(grid.flat().filter((cell) => !cell.outside)).toHaveLength(30);
    expect(grid.length).toBeGreaterThanOrEqual(5);
  });
});
