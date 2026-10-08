import { useCallback, useMemo } from 'react';
import { useSearch } from '../core/useSearch';
import type { EntitySearchOptions } from '../core/entity';
import type { SearchOption, SearchResult } from '../core/types';
import {
  insuranceSearchText,
  insuranceToOption,
  isInsuranceSuspended,
  type InsuranceLike,
  type InsuranceOption,
} from './insurance';

export type InsuranceSearchOptions<T extends InsuranceLike> = EntitySearchOptions<T> & {
  /** Codes suspendidos hoy (`suspendedInsuranceCodes` del Context de DEVA). */
  suspendedCodes?: readonly number[] | null;
  /** Alternativa a `suspendedCodes` si la suspensión se decide de otra forma. */
  isSuspended?: (insurance: T) => boolean;
  /** Texto de `secondary` para las suspendidas ("Suspendida" por defecto). */
  suspendedText?: string;
};

export type InsuranceSearchResult<T> = Omit<SearchResult<T>, 'options' | 'getOptionById'> & {
  options: InsuranceOption<T>[];
  getOptionById: (id: string | null | undefined) => InsuranceOption<T> | undefined;
};

/** Buscador de obras sociales: code, abreviatura y nombre. Las suspendidas salen marcadas, no se ocultan. */
export function useInsuranceSearch<T extends InsuranceLike = InsuranceLike>(
  options: InsuranceSearchOptions<T>,
): InsuranceSearchResult<T> {
  const { toOption, suspendedCodes, isSuspended, suspendedText = 'Suspendida', deps = [], ...rest } = options;
  const suspendedKey = (suspendedCodes ?? []).join(',');
  const result = useSearch<T>({
    searchText: insuranceSearchText,
    ...rest,
    deps: [suspendedKey, ...deps],
    toOption: toOption ?? insuranceToOption,
  });

  const check = useCallback(
    (item: T) => (isSuspended ? isSuspended(item) : isInsuranceSuspended(item, suspendedCodes)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSuspended, suspendedKey],
  );
  const mark = useCallback(
    (option: SearchOption<T>): InsuranceOption<T> => {
      const suspended = check(option.raw);
      return {
        ...option,
        suspended,
        secondary: suspended ? option.secondary ?? suspendedText : option.secondary,
      };
    },
    [check, suspendedText],
  );

  const marked = useMemo(() => result.options.map(mark), [result.options, mark]);
  const { getOptionById: baseGet } = result;
  const getOptionById = useCallback(
    (id: string | null | undefined) => {
      const option = baseGet(id);
      return option ? mark(option) : undefined;
    },
    [baseGet, mark],
  );

  return { ...result, options: marked, getOptionById };
}
