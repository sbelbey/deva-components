import { buildHaystack, matchesAllTerms, splitTerms } from '../core/normalize';
import { entityId, type SearchOption } from '../core/types';
import { isBlank } from '../core/entity';

/**
 * Forma mínima de una obra social. Acepta lo que devuelve
 * `/insurances/all-codes-names` (`{ id, code, abbreviation, name }`) y lo que
 * expone `useInsurance()` en DEVA (`{ id, insurance: 'code - abreviatura', code, name }`).
 */
export interface InsuranceLike {
  id?: string;
  _id?: string;
  code?: number | string | null;
  abbreviation?: string | null;
  name?: string | null;
  /** Etiqueta ya armada por el Context de DEVA. */
  insurance?: string | null;
}

export type InsuranceOption<T> = SearchOption<T> & {
  /** Suspendida hoy en el laboratorio: sigue siendo elegible (la orden pasa a particular). */
  suspended: boolean;
};

/** "code - abreviatura", como en Nueva orden. Si ya viene armada (`insurance`), la usa. */
export function insuranceLabel(insurance: InsuranceLike): string {
  if (!isBlank(insurance.insurance)) return String(insurance.insurance);
  const short = !isBlank(insurance.abbreviation) ? insurance.abbreviation : insurance.name;
  if (!isBlank(insurance.code)) return isBlank(short) ? String(insurance.code) : `${insurance.code} - ${short}`;
  return isBlank(short) ? entityId(insurance) : String(short);
}

export function insuranceSearchText(insurance: InsuranceLike): unknown[] {
  return [insurance.code, insurance.abbreviation, insurance.name, insurance.insurance];
}

/** Code, abreviatura o nombre, multi-término. */
export function matchInsurance(insurance: InsuranceLike, query: string): boolean {
  return matchesAllTerms(buildHaystack(...insuranceSearchText(insurance)), splitTerms(query));
}

/** Igual que `isInsuranceSuspended` del Context de DEVA: compara el code numérico. */
export function isInsuranceSuspended(
  insurance: Pick<InsuranceLike, 'code'> | null | undefined,
  suspendedCodes: readonly number[] | null | undefined,
): boolean {
  if (!insurance || !suspendedCodes || suspendedCodes.length === 0) return false;
  if (isBlank(insurance.code)) return false;
  const code = Number(insurance.code);
  return Number.isFinite(code) && suspendedCodes.includes(code);
}

export function insuranceToOption<T extends InsuranceLike>(insurance: T): SearchOption<T> {
  return { id: entityId(insurance), label: insuranceLabel(insurance), raw: insurance };
}
