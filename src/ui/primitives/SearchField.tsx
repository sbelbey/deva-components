import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from './cx';
import { CloseIcon, SearchIcon } from './icons';

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** Nombre para lectores de pantalla ("Buscar paciente"). */
  label: string;
  clearLabel?: string;
  /** Clases del contenedor (ancho, margen). */
  wrapperClassName?: string;
}

/** Buscador de las pantallas de lista: lupa, sin etiqueta flotante y con «borrar» cuando hay texto. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { value, onChange, label, clearLabel = 'Borrar búsqueda', wrapperClassName, className, ...props },
  ref,
) {
  return (
    <div className={cx('relative w-full max-w-[440px]', wrapperClassName)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-deva-ink-soft" />
      <input
        ref={ref}
        type="text"
        role="searchbox"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cx(
          'h-11 w-full rounded-[10px] border border-deva-line bg-deva-surface pr-10 pl-10 text-sm text-deva-ink transition-[border-color,box-shadow] duration-150 placeholder:text-deva-ink-soft hover:border-deva-ink-soft/60 focus:border-deva-action focus:shadow-[inset_0_0_0_1px_var(--deva-action)] focus:outline-none',
          className,
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
});
