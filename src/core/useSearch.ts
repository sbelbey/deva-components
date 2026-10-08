import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildHaystack, matchesAllTerms, splitTerms } from './normalize';
import {
  isRemoteSource,
  type RemoteSearchFn,
  type SearchOption,
  type SearchResult,
  type SearchSource,
} from './types';

export interface SearchConfig<T> {
  source: SearchSource<T>;
  /** Item → opción. Se toma el de la última render: si depende de algo que cambia, sumalo a `deps`. */
  toOption: (item: T) => SearchOption<T>;
  /** Texto extra donde buscar, además de `label` y `secondary`. */
  searchText?: (item: T) => unknown[];
  /** Exclusión fija (por ejemplo los sub-ítems de compuestos). Se aplica a la lista y al servidor. */
  filter?: (item: T) => boolean;
  /** Ids que no se muestran (por ejemplo los ya elegidos). */
  excludeIds?: readonly string[];
  /** Caracteres mínimos para buscar. Por defecto 0 en local y 1 en servidor. */
  minChars?: number;
  /** Debounce del servidor, en ms (300 por defecto, como el portal). */
  debounceMs?: number;
  /** Máximo de opciones en local (sin límite por defecto). */
  limit?: number;
  /** En local, con el input vacío muestra toda la lista (como el Autocomplete de MUI). true por defecto. */
  showAllWhenEmpty?: boolean;
  /** Transforma lo tipeado antes de mandarlo al servidor. */
  remoteQuery?: (input: string) => string;
  /** Filtra también en el cliente lo que devuelve el servidor (multi-término). */
  refineRemote?: boolean;
  /** No busca mientras esto dé true (por ejemplo, un escaneo de DNI que empieza con '!'). */
  suspend?: (input: string) => boolean;
  /** Items ya conocidos para resolver `getOptionById` en modo servidor (por ejemplo, el valor guardado). */
  knownItems?: readonly T[];
  /** Dependencias que obligan a reconstruir las opciones (además de la lista). */
  deps?: readonly unknown[];
  initialInputValue?: string;
  /** Modo controlado: si se pasa, el hook no guarda el texto. */
  inputValue?: string;
  onInputValueChange?: (value: string) => void;
}

interface Entry<T> {
  option: SearchOption<T>;
  haystack: string;
}

function buildEntry<T>(
  item: T,
  toOption: (item: T) => SearchOption<T>,
  searchText?: (item: T) => unknown[],
): Entry<T> {
  const option = toOption(item);
  const extra = searchText ? searchText(item) : [];
  return {
    option,
    haystack: buildHaystack(option.label, option.secondary, ...extra),
  };
}

const EMPTY: readonly never[] = [];

/**
 * Motor común de búsqueda. Con `{ items }` filtra en memoria; con `{ search }`
 * consulta al servidor con debounce, cancela la consulta anterior y descarta
 * respuestas viejas. Los hooks por entidad (useStudySearch, etc.) lo usan por
 * debajo.
 */
export function useSearch<T>(config: SearchConfig<T>): SearchResult<T> {
  const remote = isRemoteSource(config.source);
  const items = remote ? undefined : (config.source as { items: readonly T[] | null | undefined }).items;
  const searchFn = remote ? (config.source as { search: RemoteSearchFn<T> }).search : undefined;

  // Funciones del consumidor en refs: así no hace falta memoizarlas.
  const toOptionRef = useRef(config.toOption);
  const searchTextRef = useRef(config.searchText);
  const filterRef = useRef(config.filter);
  const searchFnRef = useRef(searchFn);
  const remoteQueryRef = useRef(config.remoteQuery);
  const suspendRef = useRef(config.suspend);
  toOptionRef.current = config.toOption;
  searchTextRef.current = config.searchText;
  filterRef.current = config.filter;
  searchFnRef.current = searchFn;
  remoteQueryRef.current = config.remoteQuery;
  suspendRef.current = config.suspend;

  // --- texto del input (propio o controlado) ---
  const [ownInput, setOwnInput] = useState(config.initialInputValue ?? '');
  const controlled = config.inputValue !== undefined;
  const inputValue = controlled ? (config.inputValue as string) : ownInput;
  const onChangeRef = useRef(config.onInputValueChange);
  onChangeRef.current = config.onInputValueChange;
  const setInputValue = useCallback(
    (value: string) => {
      const next = value ?? '';
      if (!controlled) setOwnInput(next);
      onChangeRef.current?.(next);
    },
    [controlled],
  );
  const reset = useCallback(() => setInputValue(''), [setInputValue]);

  const query = inputValue.trim();
  const terms = useMemo(() => splitTerms(query), [query]);
  const suspended = Boolean(config.suspend?.(inputValue));
  const minChars = config.minChars ?? (remote ? 1 : 0);
  const qualifies = !suspended && query.length > 0 && query.length >= minChars;
  const excludeKey = (config.excludeIds ?? EMPTY).join('\u0000');
  const excluded = useMemo(
    () => new Set(excludeKey ? excludeKey.split('\u0000') : []),
    [excludeKey],
  );
  const deps = config.deps ?? EMPTY;

  // --- local: opciones precalculadas (sólo se rehacen si cambia la lista o deps) ---
  const localEntries = useMemo<Entry<T>[]>(() => {
    if (remote || !items) return [];
    const filter = filterRef.current;
    const result: Entry<T>[] = [];
    for (const item of items) {
      if (filter && !filter(item)) continue;
      result.push(buildEntry(item, toOptionRef.current, searchTextRef.current));
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote, items, ...deps]);

  const localById = useMemo(() => {
    const map = new Map<string, SearchOption<T>>();
    for (const entry of localEntries) {
      if (!map.has(entry.option.id)) map.set(entry.option.id, entry.option);
    }
    return map;
  }, [localEntries]);

  const showAllWhenEmpty = config.showAllWhenEmpty ?? true;
  const limit = config.limit;
  const localOptions = useMemo<SearchOption<T>[]>(() => {
    if (remote) return [];
    if (suspended) return [];
    if (!query) {
      if (!showAllWhenEmpty) return [];
    } else if (query.length < minChars) {
      return [];
    }
    const result: SearchOption<T>[] = [];
    for (const entry of localEntries) {
      if (excluded.has(entry.option.id)) continue;
      if (!matchesAllTerms(entry.haystack, terms)) continue;
      result.push(entry.option);
      if (limit !== undefined && result.length >= limit) break;
    }
    return result;
  }, [remote, suspended, query, showAllWhenEmpty, minChars, localEntries, excluded, terms, limit]);

  // --- servidor ---
  const [remoteEntries, setRemoteEntries] = useState<Entry<T>[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<unknown>(null);
  const [answeredQuery, setAnsweredQuery] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const seenRef = useRef(new Map<string, SearchOption<T>>());
  const debounceMs = config.debounceMs ?? 300;

  useEffect(() => {
    if (!remote) return undefined;
    // Cualquier cambio invalida la consulta en curso.
    const requestId = ++requestIdRef.current;
    controllerRef.current?.abort();
    controllerRef.current = null;

    if (!qualifies) {
      setRemoteEntries([]);
      setRemoteLoading(false);
      setRemoteError(null);
      setAnsweredQuery(null);
      return undefined;
    }

    setRemoteLoading(true);
    const timer = setTimeout(() => {
      const fn = searchFnRef.current;
      if (!fn) return;
      const controller = new AbortController();
      controllerRef.current = controller;
      const sent = remoteQueryRef.current ? remoteQueryRef.current(query) : query;
      let promise: Promise<T[]>;
      try {
        promise = Promise.resolve(fn(sent, controller.signal));
      } catch (error) {
        promise = Promise.reject(error);
      }
      promise.then(
        (found) => {
          if (requestIdRef.current !== requestId) return;
          const filter = filterRef.current;
          const entries: Entry<T>[] = [];
          for (const item of Array.isArray(found) ? found : []) {
            if (filter && !filter(item)) continue;
            const entry = buildEntry(item, toOptionRef.current, searchTextRef.current);
            seenRef.current.set(entry.option.id, entry.option);
            entries.push(entry);
          }
          setRemoteEntries(entries);
          setRemoteError(null);
          setAnsweredQuery(query);
          setRemoteLoading(false);
        },
        (error) => {
          if (requestIdRef.current !== requestId) return;
          setRemoteEntries([]);
          setRemoteError(error ?? new Error('Error de búsqueda'));
          setAnsweredQuery(query);
          setRemoteLoading(false);
        },
      );
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote, qualifies, query, debounceMs, ...deps]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    },
    [],
  );

  const refine = Boolean(config.refineRemote);
  const remoteOptions = useMemo<SearchOption<T>[]>(() => {
    if (!remote) return [];
    const result: SearchOption<T>[] = [];
    for (const entry of remoteEntries) {
      if (excluded.has(entry.option.id)) continue;
      if (refine && !matchesAllTerms(entry.haystack, terms)) continue;
      result.push(entry.option);
    }
    return result;
  }, [remote, remoteEntries, excluded, refine, terms]);

  // knownItems para resolver el valor guardado sin haber buscado.
  const knownItems = config.knownItems;
  const knownById = useMemo(() => {
    const map = new Map<string, SearchOption<T>>();
    if (!knownItems) return map;
    for (const item of knownItems) {
      const option = toOptionRef.current(item);
      if (!map.has(option.id)) map.set(option.id, option);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownItems, ...deps]);

  const getOptionById = useCallback(
    (id: string | null | undefined) => {
      if (id === null || id === undefined || id === '') return undefined;
      const key = String(id);
      return localById.get(key) ?? seenRef.current.get(key) ?? knownById.get(key);
    },
    [localById, knownById],
  );

  const options = remote ? remoteOptions : localOptions;
  const loading = remote ? remoteLoading : false;
  const error = remote ? remoteError : null;
  const answered = remote ? answeredQuery === query : true;
  const empty = qualifies && answered && !loading && !error && options.length === 0;

  return { inputValue, setInputValue, reset, options, loading, error, empty, getOptionById };
}
