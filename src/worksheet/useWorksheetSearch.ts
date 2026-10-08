import { useCallback, useMemo } from 'react';
import { useSearch } from '../core/useSearch';
import type { EntitySearchOptions } from '../core/entity';
import { isRemoteSource, type SearchResult } from '../core/types';
import { findWorksheetByCode, worksheetSearchText, worksheetToOption, type WorksheetLike } from './worksheet';

export type WorksheetSearchOptions<T extends WorksheetLike> = EntitySearchOptions<T>;

export type WorksheetSearchResult<T> = SearchResult<T> & {
  /** Planilla por code exacto (lista local o resultados del servidor). */
  findByCode: (code: number | string | null | undefined) => T | undefined;
};

/** Buscador de planillas de trabajo ("code - name"). Compara por id. */
export function useWorksheetSearch<T extends WorksheetLike = WorksheetLike>(
  options: WorksheetSearchOptions<T>,
): WorksheetSearchResult<T> {
  const { toOption, ...rest } = options;
  const result = useSearch<T>({
    searchText: worksheetSearchText,
    ...rest,
    toOption: toOption ?? worksheetToOption,
  });
  const items = isRemoteSource(rest.source) ? undefined : rest.source.items;
  const pool = useMemo(
    () => items ?? result.options.map((option) => option.raw),
    [items, result.options],
  );
  const findByCode = useCallback(
    (code: number | string | null | undefined) => findWorksheetByCode(pool, code),
    [pool],
  );
  return { ...result, findByCode };
}
