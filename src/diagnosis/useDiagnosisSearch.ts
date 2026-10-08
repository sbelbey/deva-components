import { useCallback, useMemo } from 'react';
import { useSearch } from '../core/useSearch';
import type { EntitySearchOptions } from '../core/entity';
import { isRemoteSource, type SearchResult } from '../core/types';
import { diagnosisSearchText, diagnosisToOption, findDiagnosisByCode, type DiagnosisLike } from './diagnosis';

export type DiagnosisSearchOptions<T extends DiagnosisLike> = EntitySearchOptions<T>;

export type DiagnosisSearchResult<T> = SearchResult<T> & {
  /** Diagnóstico por code exacto, ignorando puntos (lista local o resultados del servidor). */
  findByCode: (code: string | null | undefined) => T | undefined;
};

/** Buscador de diagnósticos por code (ignorando puntos) y nombre. */
export function useDiagnosisSearch<T extends DiagnosisLike = DiagnosisLike>(
  options: DiagnosisSearchOptions<T>,
): DiagnosisSearchResult<T> {
  const { toOption, ...rest } = options;
  const result = useSearch<T>({
    searchText: diagnosisSearchText,
    ...rest,
    toOption: toOption ?? diagnosisToOption,
  });
  const items = isRemoteSource(rest.source) ? undefined : rest.source.items;
  const pool = useMemo(
    () => items ?? result.options.map((option) => option.raw),
    [items, result.options],
  );
  const findByCode = useCallback((code: string | null | undefined) => findDiagnosisByCode(pool, code), [pool]);
  return { ...result, findByCode };
}
