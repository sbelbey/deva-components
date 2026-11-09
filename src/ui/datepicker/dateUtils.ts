/** Día calendario sin hora ni huso (mes de 1 a 12). */
export interface Ymd {
  y: number;
  m: number;
  d: number;
}

export type Section = 'day' | 'month' | 'year';

/** Lo que se ve en cada parte del campo: texto, posiblemente a medias o vacío. */
export interface Parts {
  day: string;
  month: string;
  year: string;
}

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2099;

const pad = (value: number, size = 2) => String(value).padStart(size, '0');

export const emptyParts = (): Parts => ({ day: '', month: '', year: '' });

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function today(): Ymd {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

export const ymdKey = (value: Ymd) => value.y * 10000 + value.m * 100 + value.d;
export const sameDay = (a: Ymd | null, b: Ymd | null) => Boolean(a && b && ymdKey(a) === ymdKey(b));

/**
 * Valor de entrada → día. `YYYY-MM-DD` se lee tal cual; un ISO completo se lee
 * por sus partes UTC, igual que el DatePicker de DEVA (`dayjs(value).utc()`):
 * la medianoche local de Argentina (03:00Z) cae en el mismo día.
 */
export function parseValue(value: string | null | undefined): Ymd | null {
  if (!value) return null;
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (plain) {
    const result = { y: Number(plain[1]), m: Number(plain[2]), d: Number(plain[3]) };
    return result.d <= daysInMonth(result.y, result.m) ? result : null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

/** Día → lo que se avisa afuera: `iso` es la medianoche local (como DEVA) y `date` es `YYYY-MM-DD`. */
export function formatOutput(value: Ymd, format: 'iso' | 'date'): string {
  if (format === 'date') return `${pad(value.y, 4)}-${pad(value.m)}-${pad(value.d)}`;
  return new Date(value.y, value.m - 1, value.d, 0, 0, 0, 0).toISOString();
}

export function partsFromYmd(value: Ymd): Parts {
  return { day: pad(value.d), month: pad(value.m), year: pad(value.y, 4) };
}

/** Partes → día, sólo si están completas y la fecha existe. */
export function composeParts(parts: Parts): Ymd | null {
  if (!parts.day || !parts.month || parts.year.length !== 4) return null;
  const result = { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
  // Mientras se escribe el año (0002, 0020, 0202) todavía no es una fecha.
  if (result.y < MIN_YEAR || result.y > MAX_YEAR) return null;
  if (result.m < 1 || result.m > 12 || result.d < 1) return null;
  if (result.d > daysInMonth(result.y, result.m)) return null;
  return result;
}

export interface TypeResult {
  parts: Parts;
  /** Dígitos escritos desde que se entró a la parte (para saber si es el primero o el segundo). */
  buffer: string;
  /** La parte quedó completa: el foco pasa a la siguiente. */
  advance: boolean;
}

/**
 * Escribir un dígito en una parte, como el campo de fecha de MUI:
 * - día y mes: un primer dígito que no puede ser el comienzo de dos (día > 3,
 *   mes > 1) completa la parte; si no, espera el segundo. Si juntos no forman un
 *   número válido (35, 13) se arranca de nuevo con el último dígito.
 * - año: cuatro dígitos.
 */
export function typeDigit(parts: Parts, section: Section, buffer: string, digit: string): TypeResult {
  if (!/^\d$/.test(digit)) return { parts, buffer, advance: false };

  if (section === 'year') {
    const next = buffer.length >= 4 ? digit : buffer + digit;
    return { parts: { ...parts, year: next.padStart(4, '0') }, buffer: next, advance: next.length === 4 };
  }

  const max = section === 'day' ? 31 : 12;
  const firstLimit = section === 'day' ? 3 : 1;
  let combined = buffer + digit;
  if (combined.length === 2 && Number(combined) > max) combined = digit;
  if (combined.length === 2 && Number(combined) < 1) combined = digit;

  const done = combined.length === 2 || Number(combined) > firstLimit;
  const value = pad(Number(combined));
  return { parts: { ...parts, [section]: value }, buffer: done ? '' : combined, advance: done };
}

/** Flecha arriba (+1) o abajo (-1) sobre una parte: da la vuelta; una parte vacía arranca en la de hoy. */
export function stepSection(parts: Parts, section: Section, direction: 1 | -1, now: Ymd): Parts {
  if (section === 'year') {
    const current = parts.year ? Number(parts.year) : null;
    if (current === null) return { ...parts, year: pad(now.y, 4) };
    const next = Math.min(MAX_YEAR, Math.max(MIN_YEAR, current + direction));
    return { ...parts, year: pad(next, 4) };
  }
  if (section === 'month') {
    const current = parts.month ? Number(parts.month) : null;
    if (current === null) return { ...parts, month: pad(now.m) };
    return { ...parts, month: pad(((current - 1 + direction + 12) % 12) + 1) };
  }
  const year = parts.year.length === 4 ? Number(parts.year) : now.y;
  const month = parts.month ? Number(parts.month) : now.m;
  const max = daysInMonth(year, Math.min(12, Math.max(1, month)));
  const current = parts.day ? Number(parts.day) : null;
  if (current === null) return { ...parts, day: pad(now.d) };
  return { ...parts, day: pad(((current - 1 + direction + max) % max) + 1) };
}

export interface GridCell extends Ymd {
  /** Día de relleno de otro mes. */
  outside: boolean;
}

/** Semanas del mes, empezando en lunes, con días de relleno de los meses vecinos. */
export function monthGrid(year: number, month: number): GridCell[][] {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const total = Math.ceil((offset + daysInMonth(year, month)) / 7) * 7;
  const cells: GridCell[] = [];
  for (let i = 0; i < total; i += 1) {
    const date = new Date(year, month - 1, 1 - offset + i);
    cells.push({
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      outside: date.getMonth() !== month - 1,
    });
  }
  const weeks: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Suma (o resta) meses a un mes del calendario. */
export function addMonths(year: number, month: number, delta: number): { y: number; m: number } {
  const index = year * 12 + (month - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}

export const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Lunes a domingo. */
export const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const WEEKDAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
