/**
 * Normalización de texto para buscar: sin acentos, sin puntos, en minúsculas
 * y con los espacios colapsados. "Gómez" → "gomez", "A09.9" → "a099",
 * "G.O.T." → "got".
 */
export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parte la consulta en términos normalizados ("Gómez  Juan" → ["gomez", "juan"]). */
export function splitTerms(query: unknown): string[] {
  const normalized = normalizeText(query);
  return normalized ? normalized.split(' ') : [];
}

/** Arma el texto donde se busca a partir de varios campos (ignora vacíos). */
export function buildHaystack(...parts: unknown[]): string {
  return normalizeText(
    parts
      .filter((part) => part !== null && part !== undefined && part !== '')
      .map((part) => String(part))
      .join(' '),
  );
}

/**
 * true si TODOS los términos aparecen en el texto (AND, en cualquier orden).
 * `haystack` tiene que venir normalizado (ver `buildHaystack`). Sin términos
 * devuelve true.
 */
export function matchesAllTerms(haystack: string, terms: readonly string[]): boolean {
  for (const term of terms) {
    if (!haystack.includes(term)) return false;
  }
  return true;
}

/** Atajo: ¿la consulta coincide con alguno de los campos? (multi-término AND). */
export function matchText(query: unknown, ...parts: unknown[]): boolean {
  return matchesAllTerms(buildHaystack(...parts), splitTerms(query));
}

/**
 * El término más largo de la consulta, tal como lo escribió el usuario (sin
 * normalizar). Sirve para mandarle al servidor un solo término cuando el
 * servidor no entiende varios, y filtrar el resto en el cliente.
 */
export function longestTerm(query: string): string {
  const terms = String(query ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let best = '';
  for (const term of terms) {
    if (term.length > best.length) best = term;
  }
  return best;
}
