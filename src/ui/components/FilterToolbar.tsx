import { useId, useState, type ReactNode } from 'react';
import { cx } from '../primitives/cx';
import { ChevronDownIcon, FilterIcon } from '../primitives/icons';

export interface FilterToolbarProps {
  /** El `SearchField` de la pantalla. */
  search: ReactNode;
  /** La opción principal, siempre a la vista (`SegmentedControl`). */
  primaryFilter?: ReactNode;
  /** Filtros secundarios: quedan plegados detrás del botón «Filtros». */
  moreFilters?: ReactNode;
  /** Cuántos de los filtros plegados están en uso (se ve en el botón). */
  activeMoreFilters?: number;
  onClearMoreFilters?: () => void;
  filtersLabel?: string;
  clearLabel?: string;
}

/**
 * Barra de arriba de una lista: buscador, la opción principal a la vista y,
 * plegados, el resto de los filtros. Los plegados avisan con un número cuántos
 * están en uso, para que no haya un filtro activo que no se vea.
 */
export function FilterToolbar({
  search,
  primaryFilter,
  moreFilters,
  activeMoreFilters = 0,
  onClearMoreFilters,
  filtersLabel = 'Filtros',
  clearLabel = 'Limpiar filtros',
}: FilterToolbarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {search}
        {primaryFilter}
        {moreFilters && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={activeMoreFilters > 0 ? `${filtersLabel} (${activeMoreFilters} en uso)` : filtersLabel}
            onClick={() => setOpen((current) => !current)}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-deva px-3 text-sm font-medium text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink"
          >
            <span className="relative">
              <FilterIcon className="size-5" />
              {activeMoreFilters > 0 && (
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-deva-action text-[10px] font-bold text-deva-on-action"
                >
                  {activeMoreFilters}
                </span>
              )}
            </span>
            {filtersLabel}
            <ChevronDownIcon className={cx('size-4 transition-transform duration-150', open && 'rotate-180')} />
          </button>
        )}
      </div>
      {moreFilters && open && (
        <div
          id={panelId}
          className="mt-3 flex flex-wrap items-center gap-3 rounded-[10px] border border-deva-line bg-deva-surface p-4"
        >
          {moreFilters}
          {activeMoreFilters > 0 && onClearMoreFilters && (
            <button
              type="button"
              onClick={onClearMoreFilters}
              className="h-9 rounded-deva px-3 text-sm font-medium text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink"
            >
              {clearLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
