/** Opción normalizada que devuelven todos los hooks. Se compara siempre por `id`. */
export interface SearchOption<T> {
  id: string;
  label: string;
  secondary?: string;
  raw: T;
  /** Para listas mixtas (por ejemplo 'study' | 'profile' en useStudySearch). */
  kind?: string;
}

/** Búsqueda en el servidor. Tiene que respetar `signal` (axios y fetch lo aceptan). */
export type RemoteSearchFn<T> = (query: string, signal: AbortSignal) => Promise<T[]>;

/** Lista ya cargada (como hace DEVA con sus Context). `undefined`/`null` = todavía cargando. */
export interface LocalSource<T> {
  items: readonly T[] | null | undefined;
}

/** Búsqueda en el servidor (como hacen el portal y Nucleus). */
export interface RemoteSource<T> {
  search: RemoteSearchFn<T>;
}

export type SearchSource<T> = LocalSource<T> | RemoteSource<T>;

export function isRemoteSource<T>(source: SearchSource<T>): source is RemoteSource<T> {
  return typeof (source as RemoteSource<T>).search === 'function';
}

/** Lo que devuelve cualquier hook de búsqueda, listo para conectar a la piel. */
export interface SearchResult<T> {
  /** Texto del input. El valor elegido (id) lo maneja la piel, no el hook. */
  inputValue: string;
  setInputValue: (value: string) => void;
  /** Vacía el input (reemplaza el `key={Math.random()}` de las pieles viejas). */
  reset: () => void;
  options: SearchOption<T>[];
  loading: boolean;
  error: unknown;
  /** true cuando se buscó algo y no hubo resultados (para el "Sin resultados"). */
  empty: boolean;
  /** Resuelve un id a su opción (lista local, o todo lo que vino del servidor). */
  getOptionById: (id: string | null | undefined) => SearchOption<T> | undefined;
}

/** Id de una entidad que puede venir como `id` (DTO) o `_id` (Mongo). */
export function entityId(item: unknown): string {
  if (item === null || item === undefined) return '';
  if (typeof item !== 'object') return String(item);
  const record = item as { id?: unknown; _id?: unknown };
  const id = record.id ?? record._id;
  return id === null || id === undefined ? '' : String(id);
}
