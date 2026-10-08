import { useSearch } from '../core/useSearch';
import type { EntitySearchOptions } from '../core/entity';
import type { SearchResult } from '../core/types';
import { biochemistSearchText, biochemistToOption, type BiochemistLike } from './biochemist';

export type BiochemistSearchOptions<T extends BiochemistLike> = EntitySearchOptions<T>;

/** Buscador de bioquímicos por matrícula, nombre, apellido y DNI. Compara por id, no por etiqueta. */
export function useBiochemistSearch<T extends BiochemistLike = BiochemistLike>(
  options: BiochemistSearchOptions<T>,
): SearchResult<T> {
  const { toOption, ...rest } = options;
  return useSearch<T>({
    searchText: biochemistSearchText,
    ...rest,
    toOption: toOption ?? biochemistToOption,
  });
}
