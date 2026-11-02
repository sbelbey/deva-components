import { cx } from './cx';

export interface SpinnerProps {
  /** Texto para lectores de pantalla ("Ingresando"). */
  label?: string;
  className?: string;
}

/** Indicador de carga circular. Hereda el color del texto (`currentColor`). */
export function Spinner({ label = 'Cargando', className }: SpinnerProps) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 24 24" fill="none" className={cx('size-5 animate-spin', className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
