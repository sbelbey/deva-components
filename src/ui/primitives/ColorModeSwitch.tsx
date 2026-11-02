import { cx } from './cx';

export type ColorMode = 'light' | 'dark';

export interface ColorModeSwitchProps {
  mode: ColorMode;
  /** Recibe el modo nuevo. Aplicarlo y guardarlo (navegador, cuenta) es de la app. */
  onChange: (next: ColorMode) => void;
  /** Texto de la etiqueta y del lector de pantalla. */
  label?: string;
  /** Deja la etiqueta sólo para lectores de pantalla (barra azul, pantallas chicas). */
  hideLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

function Sun() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/** Switch sol/luna para alternar entre modo claro y oscuro. */
export function ColorModeSwitch({
  mode,
  onChange,
  label = 'Modo oscuro',
  hideLabel = false,
  disabled = false,
  className,
}: ColorModeSwitchProps) {
  const dark = mode === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      disabled={disabled}
      title={hideLabel ? (dark ? 'Modo claro' : 'Modo oscuro') : undefined}
      onClick={() => onChange(dark ? 'light' : 'dark')}
      className={cx(
        'inline-flex items-center gap-2 rounded-full text-sm font-medium text-deva-ink-soft transition-colors hover:text-deva-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deva-action disabled:opacity-50',
        className,
      )}
    >
      <span
        className={cx(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-deva-line transition-colors duration-200',
          dark ? 'bg-deva-chip-bg' : 'bg-deva-surface-2',
        )}
      >
        <span
          className={cx(
            'absolute left-0.5 flex size-6 items-center justify-center rounded-full shadow-deva-sm transition-transform duration-200 ease-out motion-reduce:transition-none',
            dark ? 'translate-x-5 bg-deva-action text-deva-on-action' : 'translate-x-0 bg-deva-surface text-deva-warn',
          )}
        >
          {dark ? <Moon /> : <Sun />}
        </span>
      </span>
      <span className={cx(hideLabel && 'sr-only')}>{label}</span>
    </button>
  );
}
