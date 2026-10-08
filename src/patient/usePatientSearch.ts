import { useMemo } from 'react';
import { useSearch } from '../core/useSearch';
import type { EntitySearchOptions } from '../core/entity';
import type { SearchResult } from '../core/types';
import { isDniScan, parseDniScan, type DniScanResult } from './dniScan';
import { patientSearchText, patientToOption, type PatientLike } from './patient';

export type PatientSearchOptions<T extends PatientLike> = EntitySearchOptions<T>;

export type PatientSearchResult<T> = SearchResult<T> & {
  /** true mientras lo tipeado empieza con '!' (escaneo del lector): no se busca. */
  isScan: boolean;
  /** El escaneo interpretado (DNI y datos), o null si no es un escaneo o no se reconoce. */
  scan: DniScanResult | null;
};

/**
 * Buscador de pacientes por DNI. Entiende el escaneo del DNI que empieza con
 * '!': mientras dura no busca, y `scan` da el resultado (en DEVA se aplica en
 * el blur).
 */
export function usePatientSearch<T extends PatientLike = PatientLike>(
  options: PatientSearchOptions<T>,
): PatientSearchResult<T> {
  const { toOption, suspend, ...rest } = options;
  const result = useSearch<T>({
    searchText: patientSearchText,
    ...rest,
    suspend: (input) => isDniScan(input) || Boolean(suspend?.(input)),
    toOption: toOption ?? patientToOption,
  });
  const isScan = isDniScan(result.inputValue);
  const scan = useMemo(
    () => (isScan ? parseDniScan(result.inputValue) : null),
    [isScan, result.inputValue],
  );
  return { ...result, isScan, scan };
}
