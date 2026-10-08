import { useSearch, type SearchConfig } from './useSearch';
import type { SearchResult } from './types';

/** Atajo de `useSearch` para una lista ya cargada. */
export function useLocalSearch<T>(
  config: Omit<SearchConfig<T>, 'source'> & { items: readonly T[] | null | undefined },
): SearchResult<T> {
  const { items, ...rest } = config;
  return useSearch<T>({ ...rest, source: { items } });
}
