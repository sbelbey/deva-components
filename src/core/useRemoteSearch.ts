import { useSearch, type SearchConfig } from './useSearch';
import type { RemoteSearchFn, SearchResult } from './types';

/** Atajo de `useSearch` para búsqueda en el servidor (debounce + descarte de respuestas viejas). */
export function useRemoteSearch<T>(
  config: Omit<SearchConfig<T>, 'source'> & { search: RemoteSearchFn<T> },
): SearchResult<T> {
  const { search, ...rest } = config;
  return useSearch<T>({ ...rest, source: { search } });
}
