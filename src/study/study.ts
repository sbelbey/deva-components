import { buildHaystack, matchesAllTerms, splitTerms } from '../core/normalize';
import { entityId, type SearchOption } from '../core/types';
import { isBlank } from '../core/entity';

/**
 * Forma mínima de un estudio. Acepta el `Analises` de DEVA
 * (`{ id, code: number, name, abbreviation, ... }`) y el `WardStudyOption`
 * del portal (`{ id, name?, code? }`), y también documentos con `_id`.
 */
export interface StudyLike {
  id?: string;
  _id?: string;
  code?: number | string | null;
  name?: string | null;
  abbreviation?: string | null;
}

/** Perfil / atajo de DEVA (`analysis-profiles`): se elige por `shortcutCode`. */
export interface StudyProfileLike<S = StudyLike> {
  id?: string;
  _id?: string;
  name?: string | null;
  shortcutCode?: string | number | null;
  studies?: S[];
}

/**
 * Regex real de DEVA (`compositeAnalysis.dao.ts`, getAllAnalyses) sobre el
 * code como texto: prefijo "151" y al menos 6 dígitos. Cubre las familias
 * 1515xxx/1516xxx/1517xxx y los hijos de 6 dígitos del EAB
 * (151515/151525/151535), y deja afuera el 151 real (Ceruloplasmina).
 */
export const COMPOUND_SUBITEM_CODE_REGEX = /^151\d{3,}/;

/** true si el code es de un sub-ítem sintético de un compuesto (no se puede pedir suelto). */
export function isCompoundSubItemCode(code: unknown): boolean {
  if (code === null || code === undefined || code === '') return false;
  return COMPOUND_SUBITEM_CODE_REGEX.test(String(code));
}

/** true si el estudio es un sub-ítem sintético (ver `isCompoundSubItemCode`). */
export function isCompoundSubItem(study: Pick<StudyLike, 'code'> | null | undefined): boolean {
  return Boolean(study) && isCompoundSubItemCode(study?.code);
}

/** Etiqueta "code - name", como en DEVA. Sin code: el nombre (y si no, el id). */
export function studyLabel(study: StudyLike): string {
  const name = isBlank(study.name) ? '' : String(study.name);
  if (!isBlank(study.code)) return name ? `${study.code} - ${name}` : String(study.code);
  return name || entityId(study);
}

/** Texto donde se busca un estudio: code, nombre y abreviatura. */
export function studySearchText(study: StudyLike): unknown[] {
  return [study.code, study.name, study.abbreviation];
}

/** ¿El estudio coincide con la consulta? Code, nombre o abreviatura, multi-término. */
export function matchStudy(study: StudyLike, query: string): boolean {
  return matchesAllTerms(buildHaystack(...studySearchText(study)), splitTerms(query));
}

export function studyToOption<T extends StudyLike>(study: T): SearchOption<T> {
  return { id: entityId(study), label: studyLabel(study), raw: study, kind: 'study' };
}

/**
 * Lo que hace Enter en el selector de estudios de DEVA (findStudyByCode):
 * acepta "475" o "475 - lo que sea" y busca por code exacto. Si el code se
 * repite devuelve el primero, así que conviene pasarle la lista ya sin
 * sub-ítems.
 */
export function findStudyByExactCode<T extends StudyLike>(
  studies: readonly T[] | null | undefined,
  rawValue: string,
): T | undefined {
  const normalizedValue = String(rawValue || '').trim();
  if (!normalizedValue || !studies) return undefined;

  const match = normalizedValue.match(/^(\d+)$/) ?? normalizedValue.match(/^(\d+)\s*-\s*/);
  if (!match) return undefined;
  const code = Number(match[1]);
  return studies.find((study) => !isBlank(study.code) && Number(study.code) === code);
}

/** Etiqueta del perfil, como en DEVA: "shortcutCode - name". */
export function profileLabel(profile: StudyProfileLike<unknown>): string {
  return `${profile.shortcutCode ?? ''} - ${profile.name ?? ''}`;
}

/** ¿El perfil coincide con la consulta? (atajo o nombre, multi-término). */
export function matchProfile(profile: StudyProfileLike<unknown>, query: string): boolean {
  return matchesAllTerms(buildHaystack(profile.shortcutCode, profile.name), splitTerms(query));
}

export function profileToOption<P extends StudyProfileLike<unknown>>(profile: P): SearchOption<P> {
  return { id: entityId(profile), label: profileLabel(profile), raw: profile, kind: 'profile' };
}

/**
 * Perfil por atajo exacto, como en DEVA: el texto es el `shortcutCode` o la
 * etiqueta completa "shortcutCode - name".
 */
export function findProfileByShortcut<P extends StudyProfileLike<unknown>>(
  profiles: readonly P[] | null | undefined,
  rawValue: string,
): P | undefined {
  if (!profiles || rawValue === null || rawValue === undefined || rawValue === '') return undefined;
  return profiles.find(
    (profile) =>
      (!isBlank(profile.shortcutCode) && String(profile.shortcutCode) === rawValue) ||
      profileLabel(profile) === rawValue,
  );
}

export type ExactStudyMatch<T, P> =
  | { kind: 'profile'; profile: P }
  | { kind: 'study'; study: T };

/**
 * Enter en el selector de estudios: primero el perfil (atajo), después el
 * estudio por code exacto. Es el mismo orden que DEVA hoy: un perfil cuyo
 * atajo coincide con un code le gana al estudio.
 */
export function resolveStudyInput<T extends StudyLike, P extends StudyProfileLike<unknown>>(
  rawValue: string,
  studies: readonly T[] | null | undefined,
  profiles?: readonly P[] | null,
): ExactStudyMatch<T, P> | null {
  if (!rawValue) return null;
  const profile = findProfileByShortcut(profiles, rawValue);
  if (profile) return { kind: 'profile', profile };
  const study = findStudyByExactCode(studies, rawValue);
  return study ? { kind: 'study', study } : null;
}
