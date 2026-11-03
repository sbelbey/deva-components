import { cx } from './cx';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  /** Nombre del grupo para lectores de pantalla ("Estado"). */
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Una opción entre pocas, siempre a la vista (en vez de un desplegable). La
 * elegida se levanta sobre el fondo; las demás quedan en gris.
 */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx('inline-flex flex-wrap gap-1 rounded-[10px] bg-deva-surface-2 p-1', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              'rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-deva-action',
              selected
                ? 'bg-deva-surface font-semibold text-deva-ink shadow-deva-sm'
                : 'font-medium text-deva-ink-soft hover:text-deva-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
