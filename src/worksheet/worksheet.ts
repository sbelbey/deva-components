import { buildHaystack, matchesAllTerms, splitTerms } from '../core/normalize';
import { entityId, type SearchOption } from '../core/types';
import { isBlank } from '../core/entity';

/** Forma mínima de una planilla de trabajo (`/work-sheet/all-work-sheets`: `{ id, name, code }`). */
export interface WorksheetLike {
  id?: string;
  _id?: string;
  code?: number | string | null;
  name?: string | null;
}

/** "code - name", como en DEVA. */
export function worksheetLabel(worksheet: WorksheetLike): string {
  const name = isBlank(worksheet.name) ? '' : String(worksheet.name);
  if (!isBlank(worksheet.code)) return name ? `${worksheet.code} - ${name}` : String(worksheet.code);
  return name || entityId(worksheet);
}

export function worksheetSearchText(worksheet: WorksheetLike): unknown[] {
  return [worksheet.code, worksheet.name];
}

/** Code o nombre, multi-término. */
export function matchWorksheet(worksheet: WorksheetLike, query: string): boolean {
  return matchesAllTerms(buildHaystack(...worksheetSearchText(worksheet)), splitTerms(query));
}

/** Planilla por code exacto (para los sitios que guardan el code, como Imprimir planillas). */
export function findWorksheetByCode<T extends WorksheetLike>(
  worksheets: readonly T[] | null | undefined,
  code: number | string | null | undefined,
): T | undefined {
  if (!worksheets || isBlank(code)) return undefined;
  const wanted = Number(code);
  if (!Number.isFinite(wanted)) return undefined;
  return worksheets.find((worksheet) => !isBlank(worksheet.code) && Number(worksheet.code) === wanted);
}

export function worksheetToOption<T extends WorksheetLike>(worksheet: T): SearchOption<T> {
  return { id: entityId(worksheet), label: worksheetLabel(worksheet), raw: worksheet };
}
