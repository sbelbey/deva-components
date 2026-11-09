import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import type { SearchOption } from '../../core/types';
import { cx } from '../primitives/cx';
import { ChevronDownIcon, CloseIcon } from '../primitives/icons';
import { TextField } from '../primitives/TextField';
import { useAnchorRect } from '../primitives/useAnchorRect';
import type { InputChangeReason } from './useComboboxText';

/** Lo que el hook de búsqueda le da a la base. */
export interface ComboboxSearch<T> {
  options: SearchOption<T>[];
  getOptionById: (id: string | null | undefined) => SearchOption<T> | undefined;
}

/** Atributos de campo que comparten todos los autocompletes. */
export interface ComboboxFieldProps {
  label: string;
  disabled?: boolean;
  /** Marca el campo con error y muestra `helperText` en rojo. */
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  /** `sm`: versión baja para tablas y filtros (la etiqueta queda sólo para lectores de pantalla). */
  size?: 'md' | 'sm';
  required?: boolean;
  name?: string;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  autoFocus?: boolean;
  /** Ícono al principio del input. */
  startIcon?: ReactNode;
  /** Muestra el texto de carga mientras la lista no llegó. */
  loading?: boolean;
  noOptionsText?: ReactNode;
  loadingText?: ReactNode;
  /** Ancho mínimo (px) del desplegable: en campos angostos evita que las opciones largas se partan palabra por palabra. */
  listboxMinWidth?: number;
  /** Clases del contenedor (ancho, margen). */
  className?: string;
}

export interface ComboboxProps<T> extends ComboboxFieldProps {
  search: ComboboxSearch<T>;
  /** Texto del input (lo maneja `useComboboxText`). */
  text: string;
  onInputChange: (value: string, reason: InputChangeReason) => void;
  /** Id de la opción elegida. */
  value: string | null | undefined;
  /** Se llama sólo al elegir o borrar una opción (id `null`), nunca mientras se tipea. */
  onChange: (id: string | null, raw?: T) => void;
  /** Deja escribir texto libre; el texto se confirma con `onCommitText` (Enter) o desde `onBlur`. */
  freeSolo?: boolean;
  /** freeSolo: si el valor no está entre las opciones, se muestra tal cual (por ejemplo un DNI nuevo). */
  showUnknownValue?: boolean;
  /** freeSolo: Enter con texto que no es una opción. */
  onCommitText?: (text: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Muestra la `secondary` de cada opción (por ejemplo "Suspendida" o el nombre del paciente). */
  showSecondary?: boolean;
  inputMode?: 'numeric' | 'text' | 'search';
  /** Teclas sobre el campo (por ejemplo, elegir por código exacto). */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Algo más al final del input, antes de los botones (un spinner). */
  endAdornment?: ReactNode;
  /** Texto del input con la opción ya elegida, si tiene que ser distinto de la etiqueta de la lista. */
  getInputLabel?: (option: SearchOption<T>) => string;
  /**
   * Enter mientras se está buscando (texto que no es la etiqueta del elegido):
   * no envía el formulario. Los autocompletes con su propio manejo del Enter
   * (estudio, planilla) lo apagan.
   */
  preventEnterWhileSearching?: boolean;
}

const optionKey = <T,>(option: SearchOption<T>) => (option.kind ? `${option.kind}-${option.id}` : option.id);

/**
 * Base de todos los autocompletes: un campo con lista desplegable que se
 * comporta como el Autocomplete de MUI que usa DEVA.
 *
 * - El valor es el **id** de la opción; se compara por id, nunca por etiqueta.
 * - Mientras se tipea no se llama a `onChange`: el id cambia sólo al elegir o
 *   al borrar todo el texto.
 * - Sin `freeSolo` no se guarda nunca el texto tipeado: al salir del campo
 *   vuelve la etiqueta de lo elegido.
 * - Teclado: flechas, Inicio/Fin, RePág/AvPág, Enter elige la opción resaltada,
 *   Escape cierra (sin cerrar el diálogo de afuera).
 */
export function Combobox<T>({
  search,
  text,
  onInputChange,
  value,
  onChange,
  freeSolo = false,
  showUnknownValue = false,
  onCommitText,
  onBlur,
  showSecondary = false,
  inputMode,
  onKeyDown,
  endAdornment,
  getInputLabel,
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
  startIcon,
  loading = false,
  noOptionsText = 'Sin resultados',
  loadingText = 'Cargando…',
  listboxMinWidth,
  className,
}: ComboboxProps<T>) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const listId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const innerRef = useRef<HTMLInputElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const firstFocus = useRef(true);

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

  const { options } = search;
  const valueId = value === null || value === undefined || value === '' ? null : String(value);
  const selected = valueId ? search.getOptionById(valueId) : undefined;
  const inputLabel = useCallback(
    (option: SearchOption<T>) => (getInputLabel ? getInputLabel(option) : option.label),
    [getInputLabel],
  );
  const selectedText = selected ? inputLabel(selected) : freeSolo && showUnknownValue && valueId ? valueId : '';

  const highlightedIndex =
    highlightedKey === null ? -1 : options.findIndex((option) => optionKey(option) === highlightedKey);

  // Cuando cambia el valor, el texto pasa a ser su etiqueta ('reset'). Mientras la
  // persona está escribiendo no se toca; con texto libre sólo si cambió el valor.
  const textRef = useRef(text);
  textRef.current = text;
  const onInputChangeRef = useRef(onInputChange);
  onInputChangeRef.current = onInputChange;
  const valueKey = `${selected ? optionKey(selected) : ''}|${valueId ?? ''}`;
  const previousValueKey = useRef<string | undefined>(undefined);
  useEffect(() => {
    const changed = valueKey !== previousValueKey.current;
    previousValueKey.current = valueKey;
    if (changed && !freeSolo) {
      // Se eligió algo (por clic, teclado o código exacto): la lista ya cumplió su trabajo.
      setOpen(false);
      setHighlightedKey(null);
    }
    if (focused && !changed) return;
    if (freeSolo && !changed) return;
    if (textRef.current !== selectedText) onInputChangeRef.current(selectedText, 'reset');
  }, [valueKey, selectedText, focused, freeSolo]);

  // Si la lista cambia y la opción resaltada ya no está, se suelta.
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
    // Las flechas pueden resaltar una opción en el mismo momento en que abren la lista.
    setHighlightedKey((current) => current ?? (selected ? optionKey(selected) : null));
  };
  const handleClose = () => {
    setOpen(false);
    setHighlightedKey(null);
  };

  const select = (option: SearchOption<T>) => {
    onInputChange(inputLabel(option), 'reset');
    handleClose();
    onChange(option.id, option.raw);
  };

  const moveHighlight = (step: number) => {
    if (options.length === 0) return;
    const last = options.length - 1;
    let next: number;
    if (highlightedIndex === -1) next = step > 0 ? 0 : last;
    else next = highlightedIndex + step;
    // Las flechas dan la vuelta; RePág/AvPág se frenan en los extremos.
    if (Math.abs(step) === 1) next = (next + options.length) % options.length;
    else next = Math.min(last, Math.max(0, next));
    setHighlightedKey(optionKey(options[next]));
  };

  const textIsSelected = Boolean(valueId) && text === selectedText;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (preventEnterWhileSearching && event.key === 'Enter' && text.trim() !== '' && text !== selectedText) {
      event.preventDefault();
    }
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
          select(options[highlightedIndex]);
        } else if (freeSolo && text !== '' && !textIsSelected) {
          onCommitText?.(text);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          handleClose();
        }
        break;
      default:
    }
  };

  const handleChange = (nextText: string) => {
    if (nextText !== text) onInputChange(nextText, 'input');
    if (nextText === '') {
      if (valueId) onChange(null);
    } else {
      handleOpen();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    // Un clic en la barra de scroll de la lista no es salir del campo.
    if (listRef.current && document.activeElement && listRef.current.contains(document.activeElement)) {
      innerRef.current?.focus();
      return;
    }
    setFocused(false);
    firstFocus.current = true;
    if (!freeSolo && text !== selectedText) onInputChange(selectedText, 'reset');
    handleClose();
    onBlur?.(event);
  };

  const handleClear = () => {
    onInputChange('', 'clear');
    if (valueId) onChange(null);
    innerRef.current?.focus();
  };

  const dirty = text.length > 0;
  const showClear = !disabled && dirty;
  const showToggle = !freeSolo;

  const rect = useAnchorRect(open, anchorRef);
  const showPopup =
    open && !disabled && ((loading && options.length === 0) || options.length > 0 || (!freeSolo && !loading));
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
    <div
      ref={anchorRef}
      className={cx('group w-full', className)}
      onClick={() => {
        const input = innerRef.current;
        if (!input || disabled) return;
        input.focus();
        if (firstFocus.current && input.selectionEnd === input.selectionStart) input.select();
        firstFocus.current = false;
      }}
    >
      <TextField
        ref={setRefs}
        id={baseId}
        label={label}
        compact={size === 'sm'}
        placeholder={placeholder}
        startIcon={startIcon}
        helper={helperText}
        helperTone={error ? 'error' : 'default'}
        name={name}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode={inputMode}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPopup}
        aria-controls={showPopup ? listId : undefined}
        aria-activedescendant={open && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseDown={() => {
          if (!disabled && (text === '' || !open)) {
            if (open) handleClose();
            else handleOpen();
          }
        }}
        endSize={showToggle && showClear ? 2 : 1}
        endAdornment={
          <span className="flex items-center">
            {endAdornment}
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
            {showToggle && (
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
            )}
          </span>
        }
      />
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
              <ul ref={listRef} id={listId} role="listbox" aria-label={label}>
                {options.map((option, index) => {
                  const isSelected = Boolean(selected) && optionKey(selected as SearchOption<T>) === optionKey(option);
                  return (
                    <li
                      key={optionKey(option)}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      onMouseMove={() => setHighlightedKey(optionKey(option))}
                      onClick={() => select(option)}
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
