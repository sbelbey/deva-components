import { useCallback, useMemo, useState } from 'react';
import { useSearch } from '../core/useSearch';
import { andFilters, type EntitySearchOptions } from '../core/entity';
import { isRemoteSource, type SearchOption, type SearchResult } from '../core/types';
import {
  findStudyByExactCode,
  isCompoundSubItem,
  profileToOption,
  resolveStudyInput,
  studySearchText,
  studyToOption,
  type ExactStudyMatch,
  type StudyLike,
  type StudyProfileLike,
} from './study';

export type StudySearchOptions<T extends StudyLike, P extends StudyProfileLike<unknown>> =
  EntitySearchOptions<T> & {
    /** Incluir los sub-ítems sintéticos de compuestos (sólo para gestión del catálogo). false por defecto. */
    includeSubItems?: boolean;
    /** Perfiles / atajos (lista local). Se muestran antes que los estudios. */
    profiles?: readonly P[] | null;
    profileToOption?: (profile: P) => SearchOption<P>;
  };

export type StudySearchResult<T, P> = SearchResult<T | P> & {
  /** Enter: estudio por code exacto ("475" o "475 - ..."), entre los estudios visibles para el hook. */
  findByExactCode: (rawValue: string) => T | undefined;
  /** Enter con perfiles: primero el atajo del perfil, después el code exacto. */
  resolveExact: (rawValue: string) => ExactStudyMatch<T, P> | null;
};

/**
 * Buscador de estudios: code, nombre, abreviatura y atajo de perfil.
 * Excluye los sub-ítems de compuestos salvo `includeSubItems`.
 */
export function useStudySearch<
  T extends StudyLike = StudyLike,
  P extends StudyProfileLike<unknown> = StudyProfileLike,
>(config: StudySearchOptions<T, P>): StudySearchResult<T, P> {
  const {
    includeSubItems = false,
    profiles,
    profileToOption: mapProfile,
    toOption,
    filter,
    deps = [],
    inputValue: controlledInput,
    onInputValueChange,
    initialInputValue,
    ...rest
  } = config;

  const [ownInput, setOwnInput] = useState(initialInputValue ?? '');
  const controlled = controlledInput !== undefined;
  const inputValue = controlled ? (controlledInput as string) : ownInput;
  const handleInput = useCallback(
    (value: string) => {
      if (!controlled) setOwnInput(value);
      onInputValueChange?.(value);
    },
    [controlled, onInputValueChange],
  );

  const ownFilter = includeSubItems ? undefined : (study: T) => !isCompoundSubItem(study);
  const combinedFilter = andFilters<T>(ownFilter, filter);

  const studies = useSearch<T>({
    ...rest,
    toOption: toOption ?? studyToOption,
    searchText: rest.searchText ?? studySearchText,
    filter: combinedFilter,
    deps: [includeSubItems, ...deps],
    inputValue,
    onInputValueChange: handleInput,
  });

  const profileSearch = useSearch<P>({
    source: { items: profiles ?? undefined },
    toOption: mapProfile ?? profileToOption,
    searchText: (profile) => [profile.shortcutCode, profile.name],
    excludeIds: rest.excludeIds,
    minChars: isRemoteSource(rest.source) ? rest.minChars ?? 1 : rest.minChars,
    showAllWhenEmpty: isRemoteSource(rest.source) ? false : rest.showAllWhenEmpty,
    suspend: rest.suspend,
    inputValue,
    onInputValueChange: handleInput,
  });

  const studyOptions = studies.options;
  const options = useMemo<SearchOption<T | P>[]>(
    () => [...(profileSearch.options as SearchOption<T | P>[]), ...(studyOptions as SearchOption<T | P>[])],
    [profileSearch.options, studyOptions],
  );

  const items = isRemoteSource(rest.source) ? undefined : rest.source.items;
  const visibleStudies = useMemo<readonly T[]>(() => {
    if (!items) return studyOptions.map((option) => option.raw);
    return combinedFilter ? items.filter(combinedFilter) : items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, includeSubItems, studyOptions, ...deps]);

  const findByExactCode = useCallback(
    (rawValue: string) => findStudyByExactCode(visibleStudies, rawValue),
    [visibleStudies],
  );
  const resolveExact = useCallback(
    (rawValue: string) => resolveStudyInput<T, P>(rawValue, visibleStudies, profiles),
    [visibleStudies, profiles],
  );

  const getOptionById = useCallback(
    (id: string | null | undefined) =>
      (studies.getOptionById(id) as SearchOption<T | P> | undefined) ??
      (profileSearch.getOptionById(id) as SearchOption<T | P> | undefined),
    [studies.getOptionById, profileSearch.getOptionById],
  );

  return {
    inputValue,
    setInputValue: studies.setInputValue,
    reset: studies.reset,
    options,
    loading: studies.loading,
    error: studies.error,
    empty: studies.empty && profileSearch.options.length === 0,
    getOptionById,
    findByExactCode,
    resolveExact,
  };
}
