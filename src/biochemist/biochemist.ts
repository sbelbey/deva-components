import { buildHaystack, matchesAllTerms, splitTerms } from '../core/normalize';
import { entityId, type SearchOption } from '../core/types';
import { isBlank } from '../core/entity';

/** Forma mínima de un bioquímico (`BiochemistData` de DEVA). */
export interface BiochemistLike {
  id?: string;
  _id?: string;
  name?: string | null;
  lastName?: string | null;
  professionalRegistration?: number | string | null;
  DNI?: number | string | null;
}

/** "matrícula - nombre apellido", como en DEVA. */
export function biochemistLabel(biochemist: BiochemistLike): string {
  const name = [biochemist.name, biochemist.lastName].filter((part) => !isBlank(part)).join(' ');
  if (!isBlank(biochemist.professionalRegistration)) {
    return name ? `${biochemist.professionalRegistration} - ${name}` : String(biochemist.professionalRegistration);
  }
  return name || entityId(biochemist);
}

export function biochemistSearchText(biochemist: BiochemistLike): unknown[] {
  return [biochemist.professionalRegistration, biochemist.name, biochemist.lastName, biochemist.DNI];
}

/** Matrícula, nombre, apellido o DNI, multi-término. */
export function matchBiochemist(biochemist: BiochemistLike, query: string): boolean {
  return matchesAllTerms(buildHaystack(...biochemistSearchText(biochemist)), splitTerms(query));
}

export function biochemistToOption<T extends BiochemistLike>(biochemist: T): SearchOption<T> {
  return { id: entityId(biochemist), label: biochemistLabel(biochemist), raw: biochemist };
}
