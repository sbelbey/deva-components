import type { SearchConfig } from './useSearch';
import type { SearchOption, SearchSource } from './types';

/** Opciones comunes de los hooks por entidad. `toOption` es opcional: cada entidad trae el suyo. */
export type EntitySearchOptions<T> = Omit<SearchConfig<T>, 'source' | 'toOption'> & {
  source: SearchSource<T>;
  toOption?: (item: T) => SearchOption<T>;
};

/** Combina el filtro propio de la entidad con el del consumidor. */
export function andFilters<T>(
  ...filters: Array<((item: T) => boolean) | undefined>
): ((item: T) => boolean) | undefined {
  const active = filters.filter(Boolean) as Array<(item: T) => boolean>;
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0];
  return (item: T) => active.every((filter) => filter(item));
}

export function isBlank(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}
