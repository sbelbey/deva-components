import { buildHaystack, matchesAllTerms, splitTerms } from '../core/normalize';
import { entityId, type SearchOption } from '../core/types';
import { isBlank } from '../core/entity';

/** Forma mínima de un diagnóstico (DEVA `{ id, code, name }`, portal `WardDiagnosisOption`). */
export interface DiagnosisLike {
  id?: string;
  _id?: string;
  code?: string | null;
  name?: string | null;
}

/** "code - name" (si falta uno, el otro; si faltan los dos, el id). */
export function diagnosisLabel(diagnosis: DiagnosisLike): string {
  const label = [diagnosis.code, diagnosis.name].filter((part) => !isBlank(part)).join(' - ');
  return label || entityId(diagnosis);
}

/**
 * Clave para comparar codes de diagnóstico (CIE10): sin acentos, en
 * mayúsculas y sólo letras y números. "a09.9" y "A099" dan "A099". Es la
 * misma normalización que usa Orden digital en DEVA.
 */
export function normalizeDiagnosisCode(code: string | null | undefined): string {
  return String(code || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function diagnosisSearchText(diagnosis: DiagnosisLike): unknown[] {
  return [diagnosis.code, diagnosis.name];
}

/** Code ignorando los puntos ("A099" encuentra "A09.9") y nombre, multi-término. */
export function matchDiagnosis(diagnosis: DiagnosisLike, query: string): boolean {
  return matchesAllTerms(buildHaystack(...diagnosisSearchText(diagnosis)), splitTerms(query));
}

/** Diagnóstico por code exacto, ignorando puntos y mayúsculas. */
export function findDiagnosisByCode<T extends DiagnosisLike>(
  diagnoses: readonly T[] | null | undefined,
  code: string | null | undefined,
): T | undefined {
  const key = normalizeDiagnosisCode(code);
  if (!key || !diagnoses) return undefined;
  return diagnoses.find((diagnosis) => normalizeDiagnosisCode(diagnosis.code) === key);
}

export function diagnosisToOption<T extends DiagnosisLike>(diagnosis: T): SearchOption<T> {
  return { id: entityId(diagnosis), label: diagnosisLabel(diagnosis), raw: diagnosis };
}
