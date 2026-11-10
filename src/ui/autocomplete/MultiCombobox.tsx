import { useCallback, useEffect, useId, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { SearchOption } from '../../core/types';
import { cx } from '../primitives/cx';
import { ChevronDownIcon, CloseIcon } from '../primitives/icons';
import { useAnchorRect } from '../primitives/useAnchorRect';
import type { ComboboxFieldProps, ComboboxSearch } from './Combobox';
import type { InputChangeReason } from './useComboboxText';

export interface MultiComboboxProps<T> extends ComboboxFieldProps {
  search: ComboboxSearch<T>;
  /** Texto del input (lo maneja `useComboboxText`). */
  text: string;
  onInputChange: (value: string, reason: InputChangeReason) => void;
  /** Ids elegidos. */
  value: readonly string[];
  /** Se llama al elegir o quitar una opción, con todos los ids y objetos que quedan. Nunca mientras se tipea. */
  onChange: (ids: string[], raws: T[]) => void;
  /** No ofrecer las ya elegidas (como `filterSelectedOptions` de MUI). Sin esto, elegir una elegida la quita. */
  hideSelected?: boolean;
  /** Sin foco, muestra sólo esta cantidad de chips y un «+N» con el resto. */
  limitTags?: number;
  /** Muestra la `secondary` de cada opción (por ejemplo «Suspendida»). */
  showSecondary?: boolean;
  /** Teclas sobre el campo (por ejemplo, Enter para agregar por código exacto). */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Enter mientras se está buscando (hay texto): no envía el formulario. Se apaga con un manejo propio del Enter. */
  preventEnterWhileSearching?: boolean;
}

const optionKey = <T,>(option: SearchOption<T>) => (option.kind ? `${option.kind}-${option.id}` : option.id);

/**
 * Base de los autocompletes de varios valores: lo elegido queda como chips con «quitar» dentro del
 * campo y el texto sirve para seguir buscando. Se comporta como el Autocomplete `multiple` de MUI
 * que usa DEVA.
 *
 * - El valor es un array de **ids**; `onChange` avisa ids y objetos de todo lo que queda.
 * - Mientras se tipea no se avisa nada; al elegir se vacía el texto y se cierra la lista.
 * - Retroceso con el texto vacío quita el último; con las flechas izquierda y derecha se recorren los
 *   chips y Retroceso o Suprimir sobre uno lo quita.
 * - `hideSelected` oculta lo elegido de la lista; si no, elegirlo de nuevo lo quita.
 * - `limitTags` resume los chips cuando el campo no tiene el foco.
 */
export function MultiCombobox<T>({
  search,
  text,
  onInputChange,
  value,
  onChange,
  hideSelected = false,
  limitTags,
  showSecondary = false,
  onKeyDown,
  preventEnterWhileSearching = true,
  label,
  disabled = false,
  error = false,
  helperText,
  placeholder,
  size = 'md',
  required,
  name,
  id,
  inputRef,
  autoFocus,
  loading = false,
  noOptionsText = 'Sin resultados',
  loadingText = 'Cargando…',
  listboxMinWidth,
  className,
}: MultiComboboxProps<T>) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const listId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const helperId = `${baseId}-helper`;
  const compact = size === 'sm';

  const innerRef = useRef<HTMLInputElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const chipButtons = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof inputRef === 'function') inputRef(node);
      else if (inputRef) (inputRef as { current: HTMLInputElement | null }).current = node;
    },
    [inputRef],
  );

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  // Memoizado por los ids: si el padre pasa un array nuevo en cada render, no se trata como un valor
  // nuevo (eso vaciaba lo que se estaba tipeando).
  const valueKey = value.join('\u0000');
  const { getOptionById } = search;
  const selected = useMemo(
    () =>
      (valueKey ? valueKey.split('\u0000') : [])
        .map((optionIdValue) => getOptionById(optionIdValue))
        .filter((option): option is SearchOption<T> => Boolean(option)),
    [valueKey, getOptionById],
  );
  const selectedIds = useMemo(() => new Set(selected.map((option) => option.id)), [selected]);

  const options = useMemo(
    () => (hideSelected ? search.options.filter((option) => !selectedIds.has(option.id)) : search.options),
    [hideSelected, search.options, selectedIds],
  );
  const highlightedIndex =
    highlightedKey === null ? -1 : options.findIndex((option) => optionKey(option) === highlightedKey);

  // Si cambian los valores, el texto de búsqueda se vacía ('reset'), como MUI.
  const textRef = useRef(text);
  textRef.current = text;
  const onInputChangeRef = useRef(onInputChange);
  onInputChangeRef.current = onInputChange;
  const previousValueKey = useRef<string | undefined>(undefined);
  useEffect(() => {
    const changed = valueKey !== previousValueKey.current;
    previousValueKey.current = valueKey;
    if (changed && textRef.current !== '') onInputChangeRef.current('', 'reset');
  }, [valueKey]);

  useEffect(() => {
    if (highlightedKey !== null && highlightedIndex === -1) setHighlightedKey(null);
  }, [highlightedKey, highlightedIndex]);

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    document.getElementById(optionId(highlightedIndex))?.scrollIntoView?.({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, highlightedIndex]);

  const handleOpen = () => {
    if (open || disabled) return;
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setHighlightedKey(null);
  };

  const commit = (next: SearchOption<T>[]) => {
    onChange(
      next.map((option) => option.id),
      next.map((option) => option.raw),
    );
  };

  const toggle = (option: SearchOption<T>) => {
    onInputChange('', 'reset');
    handleClose();
    commit(selectedIds.has(option.id) ? selected.filter((item) => item.id !== option.id) : [...selected, option]);
  };

  const removeAt = (index: number) => commit(selected.filter((_, i) => i !== index));

  const focusChip = (index: number) => {
    const option = selected[index];
    if (!option) {
      innerRef.current?.focus();
      return;
    }
    chipButtons.current.get(option.id)?.focus();
  };

  const moveHighlight = (step: number) => {
    if (options.length === 0) return;
    const last = options.length - 1;
    let next: number;
    if (highlightedIndex === -1) next = step > 0 ? 0 : last;
    else next = highlightedIndex + step;
    if (Math.abs(step) === 1) next = (next + options.length) % options.length;
    else next = Math.min(last, Math.max(0, next));
    setHighlightedKey(optionKey(options[next]));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (preventEnterWhileSearching && event.key === 'Enter' && text.trim() !== '') event.preventDefault();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveHighlight(1);
        handleOpen();
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveHighlight(-1);
        handleOpen();
        break;
      case 'PageDown':
        event.preventDefault();
        moveHighlight(5);
        handleOpen();
        break;
      case 'PageUp':
        event.preventDefault();
        moveHighlight(-5);
        handleOpen();
        break;
      case 'Home':
        if (open && highlightedIndex !== -1 && options.length > 0) {
          event.preventDefault();
          setHighlightedKey(optionKey(options[0]));
        }
        break;
      case 'End':
        if (open && highlightedIndex !== -1 && options.length > 0) {
          event.preventDefault();
          setHighlightedKey(optionKey(options[options.length - 1]));
        }
        break;
      case 'Enter':
        if (highlightedIndex !== -1 && open) {
          event.preventDefault();
          toggle(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          handleClose();
        }
        break;
      case 'Backspace':
        if (text === '' && selected.length > 0) removeAt(selected.length - 1);
        break;
      case 'ArrowLeft':
        if (text === '' && selected.length > 0) {
          event.preventDefault();
          focusChip(selected.length - 1);
        }
        break;
      default:
    }
  };

  const handleChipKeyDown = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (index > 0) focusChip(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusChip(index + 1);
        break;
      case 'Backspace':
      case 'Delete':
        event.preventDefault();
        removeAt(index);
        innerRef.current?.focus();
        break;
      default:
    }
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    // Un clic en la barra de scroll de la lista, o pasar a un chip, no es salir del campo.
    if (listRef.current && document.activeElement && listRef.current.contains(document.activeElement)) {
      innerRef.current?.focus();
      return;
    }
    if (anchorRef.current?.contains(event.relatedTarget as Node | null)) return;
    setFocused(false);
    if (text !== '') onInputChange('', 'reset');
    handleClose();
  };

  const handleClear = () => {
    onInputChange('', 'clear');
    if (selected.length > 0) onChange([], []);
    innerRef.current?.focus();
  };

  const showClear = !disabled && (selected.length > 0 || text.length > 0);
  const limited = !focused && limitTags !== undefined && limitTags >= 0 && selected.length > limitTags;
  const visibleChips = limited ? selected.slice(0, limitTags) : selected;
  const hidden = selected.length - visibleChips.length;
  const floated = focused || selected.length > 0 || text !== '';

  const rect = useAnchorRect(open, anchorRef);
  const showPopup = open && !disabled && ((loading && options.length === 0) || options.length > 0 || !loading);
  const below = rect ? window.innerHeight - rect.bottom : 0;
  const above = rect ? rect.top : 0;
  const placeBelow = !rect || below >= 200 || below >= above;
  const listStyle = rect
    ? {
        position: 'fixed' as const,
        left: rect.left,
        width: rect.width,
        minWidth: listboxMinWidth,
        maxWidth: '90vw',
        maxHeight: Math.max(120, Math.min(window.innerHeight * 0.4, (placeBelow ? below : above) - 12)),
        ...(placeBelow ? { top: rect.bottom + 4 } : { bottom: window.innerHeight - rect.top + 4 }),
      }
    : { position: 'fixed' as const, visibility: 'hidden' as const };

  return (
    <div className={cx('group w-full', className)}>
      <div
        ref={anchorRef}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onClick={() => {
          if (!disabled) innerRef.current?.focus();
        }}
        className={cx(
          'relative flex flex-wrap items-center gap-1 rounded-deva border bg-deva-surface py-1.5 pr-[5.25rem] pl-2.5 text-deva-ink transition-[border-color,box-shadow] duration-150',
          compact ? 'min-h-10 text-sm' : 'min-h-14 text-base',
          error
            ? 'border-deva-danger focus-within:shadow-[inset_0_0_0_1px_var(--deva-danger)]'
            : 'border-deva-ink-soft/50 hover:border-deva-ink-soft focus-within:border-deva-action focus-within:shadow-[inset_0_0_0_1px_var(--deva-action)]',
          disabled && 'opacity-60',
        )}
      >
        <label
          htmlFor={baseId}
          className={cx(
            compact
              ? 'sr-only'
              : [
                  'pointer-events-none absolute bg-deva-surface px-1 transition-all duration-150',
                  floated ? 'top-0 left-3 -translate-y-1/2 text-xs' : 'top-1/2 left-3.5 -translate-y-1/2 text-base',
                  floated && focused && !error ? 'text-deva-action' : 'text-deva-ink-soft',
                ].join(' '),
          )}
        >
          {label}
        </label>
        {visibleChips.map((option, index) => (
          <span
            key={optionKey(option)}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-deva-chip-bg py-0.5 pr-1 pl-3 text-sm text-deva-chip-ink"
          >
            <span className="truncate">{option.label}</span>
            {!disabled && (
              <button
                ref={(node) => {
                  if (node) chipButtons.current.set(option.id, node);
                  else chipButtons.current.delete(option.id);
                }}
                type="button"
                tabIndex={-1}
                aria-label={`Quitar ${option.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeAt(index);
                }}
                onKeyDown={handleChipKeyDown(index)}
                className="flex size-5 items-center justify-center rounded-full hover:bg-deva-ink-soft/20"
              >
                <CloseIcon className="size-3.5" />
              </button>
            )}
            {disabled && <span className="pr-2" />}
          </span>
        ))}
        {hidden > 0 && <span className="px-1 text-sm text-deva-ink-soft">+{hidden}</span>}
        <input
          ref={setRefs}
          id={baseId}
          name={name}
          required={required && selected.length === 0}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPopup}
          aria-controls={showPopup ? listId : undefined}
          aria-activedescendant={open && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
          aria-invalid={error || undefined}
          aria-describedby={helperText ? helperId : undefined}
          placeholder={compact || selected.length === 0 ? placeholder : undefined}
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            if (next !== text) onInputChange(next, 'input');
            if (next !== '') handleOpen();
          }}
          onKeyDown={handleKeyDown}
          onMouseDown={() => {
            if (!disabled && (text === '' || !open)) {
              if (open) handleClose();
              else handleOpen();
            }
          }}
          className="min-w-[6rem] flex-1 bg-transparent py-1 outline-none placeholder:text-deva-ink-soft disabled:cursor-not-allowed"
        />
        <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
          {showClear && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Borrar"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
              className="invisible flex size-8 items-center justify-center rounded-full text-deva-ink-soft group-focus-within:visible group-hover:visible hover:bg-deva-surface-2 hover:text-deva-ink"
            >
              <CloseIcon className="size-4" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={open ? 'Cerrar lista' : 'Abrir lista'}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              innerRef.current?.focus();
              if (open) handleClose();
              else handleOpen();
            }}
            className="flex size-8 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink disabled:opacity-50"
          >
            <ChevronDownIcon className={cx('size-4 transition-transform duration-150', open && 'rotate-180')} />
          </button>
        </span>
      </div>
      {helperText && (
        <p id={helperId} className={cx('mt-1 ml-3.5 text-xs', error ? 'text-deva-danger' : 'text-deva-ink-soft')}>
          {helperText}
        </p>
      )}
      {showPopup &&
        createPortal(
          <div
            style={listStyle}
            className="z-[1500] overflow-auto rounded-[10px] border border-deva-line bg-deva-surface py-1 font-deva text-deva-ink shadow-deva-md"
            onMouseDown={(event) => event.preventDefault()}
          >
            {options.length === 0 ? (
              <p role="status" className="px-4 py-3 text-sm text-deva-ink-soft">
                {loading ? loadingText : noOptionsText}
              </p>
            ) : (
              <ul ref={listRef} id={listId} role="listbox" aria-label={label} aria-multiselectable="true">
                {options.map((option, index) => {
                  const isSelected = selectedIds.has(option.id);
                  return (
                    <li
                      key={optionKey(option)}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      onMouseMove={() => setHighlightedKey(optionKey(option))}
                      onClick={() => toggle(option)}
                      className={cx(
                        'cursor-pointer px-4 py-2 text-sm',
                        index === highlightedIndex && 'bg-deva-surface-2',
                        isSelected && 'font-semibold text-deva-action',
                      )}
                    >
                      <span>{option.label}</span>
                      {showSecondary && option.secondary ? (
                        <span className="ml-2 font-normal text-deva-ink-soft">{option.secondary}</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
