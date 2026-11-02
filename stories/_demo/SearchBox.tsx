import { useState } from 'react';
import type { SearchResult } from '../../src';

interface SearchBoxProps<T> {
  /** Lo que devuelve cualquier hook de búsqueda. */
  search: SearchResult<T>;
  placeholder?: string;
  label?: string;
}

/**
 * Piel mínima para mostrar los hooks en el catálogo. No es un componente del
 * paquete: cada app le pone su propia piel (esto se reemplaza por el kit común
 * cuando exista).
 */
export function SearchBox<T>({ search, placeholder = 'Escribí para buscar…', label }: SearchBoxProps<T>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = search.getOptionById(selectedId);

  return (
    <div className="max-w-md space-y-3 font-deva text-deva-ink">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <input
        value={search.inputValue}
        onChange={(event) => search.setInputValue(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-deva border border-deva-line bg-deva-surface px-3 py-2 text-sm outline-none focus:border-deva-action"
      />

      <div className="min-h-6 text-xs text-deva-ink-soft" aria-live="polite">
        {search.loading && 'Buscando…'}
        {!search.loading && search.error ? (
          <span className="text-deva-danger">Error: {String((search.error as Error).message ?? search.error)}</span>
        ) : null}
        {!search.loading && !search.error && search.empty && 'Sin resultados'}
      </div>

      {search.options.length > 0 && (
        <ul className="divide-y divide-deva-line overflow-hidden rounded-deva border border-deva-line bg-deva-surface shadow-deva-sm">
          {search.options.map((option) => (
            <li key={`${option.kind ?? ''}${option.id}`}>
              <button
                type="button"
                onClick={() => setSelectedId(option.id)}
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-deva-surface-2 ${
                  option.id === selectedId ? 'bg-deva-chip-bg text-deva-chip-ink' : ''
                }`}
              >
                <span>{option.label}</span>
                {option.secondary && <span className="text-xs text-deva-ink-soft">{option.secondary}</span>}
                {option.kind && (
                  <span className="rounded-full bg-deva-chip-bg px-2 text-xs text-deva-chip-ink">{option.kind}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm">
        <span className="text-deva-ink-soft">Elegido (se guarda el id): </span>
        <strong>{selected ? `${selected.id} · ${selected.label}` : '—'}</strong>
      </p>
    </div>
  );
}
