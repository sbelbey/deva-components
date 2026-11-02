import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from './cx';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `solid`: acción principal. `quiet`: acción secundaria sin fondo. */
  variant?: 'solid' | 'quiet';
  /** Muestra el spinner en lugar del texto y bloquea el botón. */
  loading?: boolean;
  /** Texto del spinner para lectores de pantalla. */
  loadingLabel?: string;
  /** Ocupa todo el ancho del contenedor. */
  fullWidth?: boolean;
}

const variants = {
  solid: 'bg-deva-action font-bold text-deva-on-action hover:brightness-110',
  quiet: 'font-semibold text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink',
} as const;

/** Botón de la familia DEVA. Por defecto es `type="button"`: el envío se pide con `type="submit"`. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    loading = false,
    loadingLabel = 'Cargando',
    fullWidth = false,
    disabled,
    className,
    type = 'button',
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex h-12 items-center justify-center rounded-deva px-5 text-base transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-deva-brand disabled:opacity-60',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner label={loadingLabel} /> : children}
    </button>
  );
});
