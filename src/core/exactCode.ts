import { entityId } from './types';

/**
 * Normalización por defecto de un código: sin espacios, en minúsculas y, si
 * es numérico, sin ceros a la izquierda ("01" y "1" son lo mismo).
 */
export function defaultNormalizeCode(code: string): string {
  const text = code.trim().toLowerCase();
  return /^\d+$/.test(text) ? String(Number(text)) : text;
}

export interface ExactCodeMatchOptions<T> {
  getCode: (item: T) => string | number | null | undefined;
  normalize?: (code: string) => string;
  getId?: (item: T) => string;
}

/**
 * DEVA-148: ítem cuyo código coincide EXACTO con el texto escrito.
 *
 * - Compara el texto completo (no prefijo).
 * - Si dos ítems distintos (por id) tienen el mismo código es ambiguo y no
 *   devuelve nada: el usuario elige de la lista.
 */
export function findExactCodeMatch<T>(
  items: readonly T[] | null | undefined,
  rawText: string | null | undefined,
  options: ExactCodeMatchOptions<T>,
): T | undefined {
  if (!items || !rawText || !rawText.trim()) return undefined;
  const normalize = options.normalize ?? defaultNormalizeCode;
  const getId =
    options.getId ?? ((item: T) => entityId(item as Parameters<typeof entityId>[0]));
  const wanted = normalize(rawText);
  if (!wanted) return undefined;

  // Catálogos no estandarizados ("E11.9" y "E119 - ..." conviven): primero
  // manda la coincidencia literal (trim + mayúsculas/minúsculas), sin quitar
  // puntos ni ceros. Sólo si no hay un único literal se normaliza.
  const literal = rawText.trim().toLowerCase();
  const uniqueBy = (matches: (code: string) => boolean): T | undefined => {
    let found: T | undefined;
    let foundId: string | undefined;
    for (const item of items) {
      const code = options.getCode(item);
      if (code === null || code === undefined || code === '') continue;
      if (!matches(String(code))) continue;
      const id = getId(item);
      if (found === undefined) {
        found = item;
        foundId = id;
      } else if (id !== foundId) {
        return undefined;
      }
    }
    return found;
  };

  return (
    uniqueBy((code) => code.trim().toLowerCase() === literal) ??
    uniqueBy((code) => normalize(code) === wanted)
  );
}
