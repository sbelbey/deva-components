import type { ReactNode } from 'react';
import { cx } from '../primitives/cx';
import { ChevronRightIcon } from '../primitives/icons';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Qué se dibuja en la celda de cada fila. Las celdas de dos líneas son `<Cell primary secondary />`. */
  cell: (row: T) => ReactNode;
  /** Ancho de la columna (clase de Tailwind, por ejemplo `w-48`). */
  className?: string;
}

export interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  /** Si está, la fila es navegable con mouse y con Enter, y muestra la flecha al final. */
  onRowClick?: (row: T) => void;
  /** Qué se ve si no hay filas (mensaje y, si hace falta, «Limpiar filtros»). */
  empty?: ReactNode;
  /** Mientras carga se ve una línea fina arriba, sin mover la tabla. */
  loading?: boolean;
  /** Pie de la tabla (paginado). */
  footer?: ReactNode;
  /** Nombre de la tabla para lectores de pantalla. */
  label: string;
}

/** Celda de dos líneas: lo principal en negrita y el detalle debajo. */
export function Cell({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <>
      <div className="text-sm font-semibold text-deva-ink">{primary}</div>
      {secondary && <div className="text-xs text-deva-ink-soft">{secondary}</div>}
    </>
  );
}

/** Tabla sobre una sola superficie con un borde fino: sin sombra ni cajas anidadas. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  loading = false,
  footer,
  label,
}: DataTableProps<T>) {
  const span = columns.length + (onRowClick ? 1 : 0);
  return (
    <div className="relative overflow-hidden rounded-xl border border-deva-line bg-deva-surface">
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        {loading && <div className="h-full w-1/3 animate-pulse bg-deva-action" />}
      </div>
      <div className="overflow-x-auto">
        <table aria-label={label} className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-deva-line">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cx('px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-deva-ink-soft', column.className)}
                >
                  {column.header}
                </th>
              ))}
              {onRowClick && <th aria-hidden className="w-12" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter') onRowClick(row);
                      }
                    : undefined
                }
                className={cx(
                  'border-b border-deva-line last:border-b-0',
                  onRowClick &&
                    'cursor-pointer hover:bg-deva-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-deva-action',
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cx('px-4 py-3 align-top', column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
                {onRowClick && (
                  <td className="pr-3 text-deva-ink-soft/60">
                    <ChevronRightIcon className="size-4" />
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={span} className="px-4 py-12 text-center">
                  {empty ?? <p className="text-base font-semibold text-deva-ink">No hay resultados</p>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer && <div className="border-t border-deva-line px-4 py-2.5 text-sm text-deva-ink-soft">{footer}</div>}
    </div>
  );
}
