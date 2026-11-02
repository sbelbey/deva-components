import { useId, useState, type ReactNode } from 'react';
import { cx } from './cx';

export interface TipProps {
  /** Texto de ayuda. Sin `content` se muestran sólo los hijos. */
  content?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Tooltip con texto de ayuda: aparece al pasar el mouse, al enfocar con teclado
 * y al tocar (en móvil no hay hover). Se cierra al salir, al perder el foco y
 * con Escape.
 */
export function Tip({ content, children, className }: TipProps) {
  const id = useId();
  const [pinned, setPinned] = useState(false);
  if (!content) return <>{children}</>;

  return (
    <span className={cx('group relative inline-flex', className)} onMouseLeave={() => setPinned(false)}>
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={pinned}
        onClick={() => setPinned((value) => !value)}
        onBlur={() => setPinned(false)}
        onKeyDown={(event) => event.key === 'Escape' && setPinned(false)}
        className="cursor-help rounded-sm text-left underline decoration-deva-ink-soft decoration-dotted underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deva-action"
      >
        {children}
      </button>
      <span
        id={id}
        role="tooltip"
        className={cx(
          'pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-max max-w-64 rounded-deva border border-deva-line bg-deva-surface px-3 py-2 text-xs leading-relaxed font-normal whitespace-pre-line text-deva-ink shadow-deva-sm group-focus-within:block group-hover:block',
          pinned ? 'block' : 'hidden',
        )}
      >
        {content}
      </span>
    </span>
  );
}
