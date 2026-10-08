import { useCallback, useMemo, useRef } from 'react';
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

  // `isSuspended` se lee por ref: si el consumidor la pasa inline, cambiaría en cada render,
  // invalidaría el cache de opciones y MUI volvería a pisar lo que se está tipeando.
  const isSuspendedRef = useRef(isSuspended);
  isSuspendedRef.current = isSuspended;
  const check = useCallback(
    (item: T) => {
      const fn = isSuspendedRef.current;
      return fn ? fn(item) : isInsuranceSuspended(item, suspendedCodes);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suspendedKey],
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

  // Una opción marcada por opción base, para que `getOptionById` devuelva siempre el mismo
  // objeto: si cambia en cada render, MUI pisa con la etiqueta lo que se está tipeando.
  const cache = useMemo(() => new WeakMap<SearchOption<T>, InsuranceOption<T>>(), [mark]);
  const markCached = useCallback(
    (option: SearchOption<T>) => {
      let marked = cache.get(option);
      if (!marked) {
        marked = mark(option);
        cache.set(option, marked);
      }
      return marked;
    },
    [cache, mark],
  );

  const marked = useMemo(() => result.options.map(markCached), [result.options, markCached]);
  const { getOptionById: baseGet } = result;
  const getOptionById = useCallback(
    (id: string | null | undefined) => {
      const option = baseGet(id);
      return option ? markCached(option) : undefined;
    },
    [baseGet, markCached],
  );

  return { ...result, options: marked, getOptionById };
}
