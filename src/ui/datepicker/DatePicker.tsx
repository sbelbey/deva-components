import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../primitives/cx';
import { useAnchorRect } from '../primitives/useAnchorRect';
import { Calendar } from './Calendar';
import {
  composeParts,
  emptyParts,
  formatOutput,
  MAX_YEAR,
  MIN_YEAR,
  parseValue,
  partsFromYmd,
  sameDay,
  stepSection,
  today,
  typeDigit,
  ymdKey,
  type Parts,
  type Section,
  type Ymd,
} from './dateUtils';

export interface DatePickerProps {
  label: string;
  /** Fecha: un ISO (como la guarda DEVA) o `YYYY-MM-DD`. Vacío o `null` = sin fecha. */
  value: string | null | undefined;
  /** Se llama con la fecha elegida o escrita completa, y con `''` al vaciar el campo. Nunca con fechas a medias. */
  onChange: (value: string) => void;
  /** `iso`: medianoche local en ISO (como DEVA). `date`: `YYYY-MM-DD`. */
  outputFormat?: 'iso' | 'date';
  /** No deja elegir días futuros en el calendario. */
  disableFuture?: boolean;
  /** No deja elegir días pasados en el calendario (hoy sí). */
  disablePast?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  /** Ícono al principio del campo. */
  startIcon?: ReactNode;
  /** Versión baja (tablas y filtros). */
  compact?: boolean;
  /**
   * Si el campo arranca vacío, se completa con hoy. En DEVA es lo habitual, salvo en fechas donde
   * vacío es un valor real (por ejemplo la fecha de nacimiento de un internado).
   */
  autoDefaultToday?: boolean;
  id?: string;
  name?: string;
  /** Clases del contenedor (ancho, margen). */
  className?: string;
}

const SECTIONS: {
  key: Section;
  placeholder: string;
  name: string;
  min: number;
  max: number;
}[] = [
  { key: 'day', placeholder: 'DD', name: 'Día', min: 1, max: 31 },
  { key: 'month', placeholder: 'MM', name: 'Mes', min: 1, max: 12 },
  {
    key: 'year',
    placeholder: 'AAAA',
    name: 'Año',
    min: MIN_YEAR,
    max: MAX_YEAR,
  },
];

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

/**
 * Selector de fecha `DD-MM-AAAA`, igual al de DEVA: el campo se escribe por partes (día, mes, año)
 * y también se elige en un calendario.
 *
 * - Escribir: al teclear los dígitos se completa la parte y pasa a la siguiente (un día que empieza
 *   con 4 o más es `04`; un `1` espera el segundo dígito). Flechas arriba y abajo suben y bajan la
 *   parte; izquierda y derecha cambian de parte; Retroceso la vacía.
 * - Sólo se avisa con `onChange` cuando la fecha está completa y existe, o cuando se vacía todo el
 *   campo (`''`). Una fecha a medias no se avisa.
 * - `disableFuture` y `disablePast` apagan días en el calendario; escribir una fecha fuera de ese
 *   rango se acepta igual (la valida el formulario).
 */
export function DatePicker({
  label,
  value,
  onChange,
  outputFormat = 'iso',
  disableFuture = false,
  disablePast = false,
  disabled = false,
  error = false,
  helperText,
  startIcon,
  compact = false,
  autoDefaultToday = false,
  id,
  name,
  className,
}: DatePickerProps) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const [parts, setParts] = useState<Parts>(() => {
    const initial = parseValue(value);
    return initial ? partsFromYmd(initial) : emptyParts();
  });
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const buffer = useRef('');
  const sectionRefs = useRef<Record<Section, HTMLSpanElement | null>>({
    day: null,
    month: null,
    year: null,
  });
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const emit = (day: Ymd | null, allEmpty: boolean) => {
    if (day) {
      if (!sameDay(day, parseValue(value))) onChange(formatOutput(day, outputFormat));
    } else if (allEmpty && value) {
      onChange('');
    }
  };

  const applyParts = (next: Parts) => {
    setParts(next);
    emit(composeParts(next), !next.day && !next.month && !next.year);
  };

  // Con una fecha por defecto (hoy) cuando el campo arranca vacío.
  useEffect(() => {
    if (!value && autoDefaultToday) onChange(formatOutput(today(), outputFormat));
    // Sólo al montar, como el DatePicker de DEVA.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el padre cambia la fecha, el campo la muestra. Una fecha a medias que escribe la persona
  // no se pisa cuando el padre sigue en vacío.
  useEffect(() => {
    const incoming = parseValue(value);
    const current = composeParts(parts);
    if (sameDay(incoming, current)) return;
    if (incoming) setParts(partsFromYmd(incoming));
    else if (!value && current) setParts(emptyParts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const focusSection = (section: Section) => {
    sectionRefs.current[section]?.focus();
  };

  const handleKeyDown = (section: Section) => (event: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled || event.ctrlKey || event.metaKey || event.altKey) return;
    const order: Section[] = ['day', 'month', 'year'];
    const index = order.indexOf(section);
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const result = typeDigit(parts, section, buffer.current, event.key);
      buffer.current = result.buffer;
      applyParts(result.parts);
      if (result.advance && index < 2) focusSection(order[index + 1]);
      return;
    }
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        buffer.current = '';
        applyParts(stepSection(parts, section, event.key === 'ArrowUp' ? 1 : -1, today()));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (index > 0) focusSection(order[index - 1]);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (index < 2) focusSection(order[index + 1]);
        break;
      case 'Backspace':
      case 'Delete':
        event.preventDefault();
        buffer.current = '';
        applyParts({ ...parts, [section]: '' });
        break;
      default:
        // Cualquier otra tecla de texto se ignora; Tab y compañía siguen su camino.
        if (event.key.length === 1) event.preventDefault();
    }
  };

  const isDayDisabled = (day: Ymd) => {
    const now = today();
    if (disableFuture && ymdKey(day) > ymdKey(now)) return true;
    if (disablePast && ymdKey(day) < ymdKey(now)) return true;
    return false;
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  };

  // Clic afuera cierra el calendario.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const rect = useAnchorRect(open, anchorRef);
  const below = rect ? window.innerHeight - rect.bottom : 0;
  const placeBelow = !rect || below >= 340 || below >= rect.top;
  const popoverStyle = rect
    ? {
        position: 'fixed' as const,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 304 - 8)),
        ...(placeBelow ? { top: rect.bottom + 4 } : { bottom: window.innerHeight - rect.top + 4 }),
      }
    : { position: 'fixed' as const, visibility: 'hidden' as const };

  const composed = composeParts(parts);
  const hasValue = Boolean(parts.day || parts.month || parts.year);
  const floated = focused || hasValue;
  const helperId = `${baseId}-helper`;

  return (
    <div className={className}>
      <div
        ref={anchorRef}
        role="group"
        aria-label={label}
        aria-describedby={helperText ? helperId : undefined}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocused(false);
            buffer.current = '';
          }
        }}
        className={cx(
          'relative flex items-center rounded-deva border bg-deva-surface text-deva-ink transition-[border-color,box-shadow] duration-150',
          compact ? 'h-10 text-sm' : 'h-14 text-base',
          startIcon ? 'pl-11' : 'pl-3.5',
          'pr-12',
          error
            ? 'border-deva-danger focus-within:shadow-[inset_0_0_0_1px_var(--deva-danger)]'
            : 'border-deva-ink-soft/50 hover:border-deva-ink-soft focus-within:border-deva-action focus-within:shadow-[inset_0_0_0_1px_var(--deva-action)]',
          disabled && 'opacity-60',
        )}
      >
        {startIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-deva-ink-soft">
            {startIcon}
          </span>
        )}
        {!compact && (
          <span
            aria-hidden
            className={cx(
              'pointer-events-none absolute bg-deva-surface px-1 transition-all duration-150',
              floated
                ? 'top-0 left-3 -translate-y-1/2 text-xs'
                : cx('top-1/2 -translate-y-1/2 text-base', startIcon ? 'left-11' : 'left-3.5'),
              floated && focused && !error ? 'text-deva-action' : 'text-deva-ink-soft',
            )}
          >
            {label}
          </span>
        )}
        <div
          className={cx('flex items-center gap-0.5', !floated && !compact && 'opacity-0')}
          onMouseDown={(event) => {
            // Un clic en el espacio libre del campo enfoca el día.
            if (event.target === event.currentTarget && !disabled) {
              event.preventDefault();
              focusSection('day');
            }
          }}
        >
          {SECTIONS.map((section, index) => (
            <span key={section.key} className="flex items-center">
              {index > 0 && (
                <span aria-hidden className="text-deva-ink-soft">
                  -
                </span>
              )}
              <span
                ref={(node) => {
                  sectionRefs.current[section.key] = node;
                }}
                role="spinbutton"
                tabIndex={disabled ? -1 : 0}
                aria-label={`${section.name}, ${label}`}
                aria-valuemin={section.min}
                aria-valuemax={section.max}
                aria-valuenow={parts[section.key] ? Number(parts[section.key]) : undefined}
                aria-valuetext={parts[section.key] || 'Vacío'}
                aria-disabled={disabled || undefined}
                onKeyDown={handleKeyDown(section.key)}
                onFocus={() => {
                  buffer.current = '';
                }}
                className={cx(
                  'rounded-sm px-0.5 outline-none tabular-nums focus:bg-deva-action focus:text-deva-on-action',
                  !parts[section.key] && 'text-deva-ink-soft',
                )}
              >
                {parts[section.key] || section.placeholder}
              </span>
            </span>
          ))}
        </div>
        <input type="hidden" name={name} value={composed ? formatOutput(composed, outputFormat) : ''} />
        <button
          ref={toggleRef}
          type="button"
          disabled={disabled}
          aria-label="Elegir fecha"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink focus-visible:outline-2 focus-visible:outline-deva-action disabled:opacity-50"
        >
          <CalendarIcon />
        </button>
      </div>
      {helperText && (
        <p id={helperId} className={cx('mt-1 ml-3.5 text-xs', error ? 'text-deva-danger' : 'text-deva-ink-soft')}>
          {helperText}
        </p>
      )}
      {open &&
        !disabled &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Calendario"
            style={popoverStyle}
            className="z-[1500] rounded-xl border border-deva-line bg-deva-surface shadow-deva-md"
          >
            <Calendar
              selected={composed ?? parseValue(value)}
              isDisabled={isDayDisabled}
              onEscape={() => close(true)}
              onSelect={(day) => {
                const next = partsFromYmd(day);
                setParts(next);
                emit(day, false);
                close(true);
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
