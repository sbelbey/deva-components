import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../primitives/cx';
import { ChevronDownIcon, ChevronRightIcon } from '../primitives/icons';
import {
  addMonths,
  MAX_YEAR,
  MIN_YEAR,
  MONTH_NAMES,
  monthGrid,
  sameDay,
  today,
  WEEKDAY_INITIALS,
  type Ymd,
} from './dateUtils';

export interface CalendarProps {
  /** Día elegido (si hay). */
  selected: Ymd | null;
  onSelect: (day: Ymd) => void;
  /** Días que no se pueden elegir (por ejemplo el futuro). */
  isDisabled?: (day: Ymd) => boolean;
  /** Escape o clic afuera: lo maneja quien abre el calendario. */
  onEscape?: () => void;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const dayLabel = (day: Ymd) => `${day.d} de ${MONTH_NAMES[day.m - 1]} de ${day.y}`;

const iconButton =
  'flex size-8 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink focus-visible:outline-2 focus-visible:outline-deva-action disabled:opacity-40';

/**
 * Calendario del mes: semanas desde el lunes, días de otros meses atenuados,
 * hoy con borde y el elegido relleno. Con el título se pasa a la lista de años.
 * Teclado: flechas mueven el día (±1 y ±7), RePág/AvPág el mes, Enter elige.
 */
export function Calendar({ selected, onSelect, isDisabled, onEscape }: CalendarProps) {
  const now = today();
  const initial = selected ?? now;
  const [view, setView] = useState({ y: initial.y, m: initial.m });
  const [focusDay, setFocusDay] = useState<Ymd>(initial);
  const [yearView, setYearView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(true);

  const weeks = monthGrid(view.y, view.m);

  // Al abrir y al moverse con el teclado, el foco sigue al día enfocado.
  useEffect(() => {
    if (yearView || !shouldFocus.current) return;
    rootRef.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${focusDay.y}-${focusDay.m}-${focusDay.d}"]`)
      ?.focus();
  }, [focusDay, view, yearView]);

  useEffect(() => {
    if (!yearView) return;
    rootRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView?.({ block: 'center' });
  }, [yearView]);

  const goTo = (day: Ymd) => {
    shouldFocus.current = true;
    setFocusDay(day);
    setView({ y: day.y, m: day.m });
  };

  const move = (days: number, months = 0) => {
    const base = new Date(focusDay.y, focusDay.m - 1 + months, focusDay.d + days);
    // Al saltar de mes sin día equivalente (31 → mes de 30), JS ya lo acomoda.
    goTo({ y: base.getFullYear(), m: base.getMonth() + 1, d: base.getDate() });
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, () => void> = {
      ArrowLeft: () => move(-1),
      ArrowRight: () => move(1),
      ArrowUp: () => move(-7),
      ArrowDown: () => move(7),
      PageUp: () => move(0, -1),
      PageDown: () => move(0, 1),
      Home: () => move(-((new Date(focusDay.y, focusDay.m - 1, focusDay.d).getDay() + 6) % 7)),
      End: () => move(6 - ((new Date(focusDay.y, focusDay.m - 1, focusDay.d).getDay() + 6) % 7)),
    };
    const step = steps[event.key];
    if (step) {
      event.preventDefault();
      step();
    }
  };

  const years: number[] = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) years.push(year);

  return (
    <div
      ref={rootRef}
      className="w-[304px] p-3 font-deva text-deva-ink"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onEscape?.();
        }
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-expanded={yearView}
          onClick={() => setYearView((current) => !current)}
          className="flex h-8 items-center gap-1 rounded-deva px-2 text-sm font-semibold hover:bg-deva-surface-2 focus-visible:outline-2 focus-visible:outline-deva-action"
        >
          {capitalize(MONTH_NAMES[view.m - 1])} {view.y}
          <ChevronDownIcon className={cx('size-4 transition-transform duration-150', yearView && 'rotate-180')} />
        </button>
        {!yearView && (
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => goTo({ ...addMonths(view.y, view.m, -1), d: 1 })}
              className={iconButton}
            >
              <ChevronRightIcon className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => goTo({ ...addMonths(view.y, view.m, 1), d: 1 })}
              className={iconButton}
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        )}
      </div>

      {yearView ? (
        <div role="listbox" aria-label="Año" className="grid max-h-[232px] grid-cols-4 gap-1 overflow-y-auto">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              role="option"
              aria-selected={year === view.y}
              aria-current={year === now.y ? 'true' : undefined}
              onClick={() => {
                setView((current) => ({ ...current, y: year }));
                setFocusDay((current) => ({
                  ...current,
                  y: year,
                  d: 1,
                  m: view.m,
                }));
                setYearView(false);
              }}
              className={cx(
                'h-9 rounded-full text-sm hover:bg-deva-surface-2 focus-visible:outline-2 focus-visible:outline-deva-action',
                year === view.y && 'bg-deva-action font-semibold text-deva-on-action hover:bg-deva-action',
                year === now.y && year !== view.y && 'border border-deva-ink-soft/50',
              )}
            >
              {year}
            </button>
          ))}
        </div>
      ) : (
        <div role="grid" aria-label={`${capitalize(MONTH_NAMES[view.m - 1])} ${view.y}`} onKeyDown={handleGridKeyDown}>
          <div role="row" className="mb-1 grid grid-cols-7">
            {WEEKDAY_INITIALS.map((initial_, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                role="columnheader"
                className="flex size-10 items-center justify-center text-xs font-semibold text-deva-ink-soft"
              >
                {initial_}
              </span>
            ))}
          </div>
          {weeks.map((week) => (
            <div role="row" key={`${week[0].y}-${week[0].m}-${week[0].d}`} className="grid grid-cols-7">
              {week.map((day) => {
                const disabled = Boolean(isDisabled?.(day));
                const isSelected = sameDay(day, selected);
                const isToday = sameDay(day, now);
                const isFocus = sameDay(day, focusDay);
                return (
                  <button
                    key={`${day.y}-${day.m}-${day.d}`}
                    type="button"
                    role="gridcell"
                    data-day={`${day.y}-${day.m}-${day.d}`}
                    aria-label={dayLabel(day)}
                    aria-selected={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    disabled={disabled}
                    tabIndex={isFocus ? 0 : -1}
                    onClick={() => onSelect(day)}
                    className={cx(
                      'mx-auto flex size-10 items-center justify-center rounded-full text-sm focus-visible:outline-2 focus-visible:outline-deva-action',
                      day.outside && !isSelected && 'text-deva-ink-soft/60',
                      !disabled && !isSelected && 'hover:bg-deva-surface-2',
                      isToday && !isSelected && 'border border-deva-ink-soft/50',
                      isSelected && 'bg-deva-action font-semibold text-deva-on-action',
                      disabled && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    {day.d}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
