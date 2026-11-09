import { useCallback, useEffect, useRef, useState } from 'react';

/** Por qué cambia el texto del input: lo tipeó la persona, lo puso el componente (al elegir o salir) o lo borró. */
export type InputChangeReason = 'input' | 'reset' | 'clear';

/**
 * Texto del input y texto con el que filtra el hook de búsqueda. Cuando el
 * componente pone la etiqueta del valor elegido (reason 'reset') no se filtra
 * por ella: así al abrir la lista se ven todas las opciones.
 *
 * Es el mismo comportamiento que `useSkinText` de las pieles MUI de DEVA.
 */
export function useComboboxText(options?: {
  /** Texto libre que viene de afuera (freeSolo controlado). */
  freeText?: string;
  /** Se llama sólo cuando la persona tipea o borra (no en 'reset'). */
  onFreeTextChange?: (text: string) => void;
}) {
  const freeText = options?.freeText;
  const [text, setTextState] = useState(freeText ?? '');
  const [filterText, setFilterText] = useState('');
  const onFreeRef = useRef(options?.onFreeTextChange);
  onFreeRef.current = options?.onFreeTextChange;
  // Último texto libre que avisamos hacia afuera: si `freeText` cambia a otra
  // cosa, lo cambió el padre (por ejemplo, la receta importada).
  const emittedRef = useRef(freeText);

  useEffect(() => {
    if (freeText === undefined) return;
    if (freeText === emittedRef.current) return;
    emittedRef.current = freeText;
    setTextState(freeText);
    setFilterText('');
  }, [freeText]);

  /** Para el hook de búsqueda (`onInputValueChange`). */
  const onHookInput = useCallback((value: string) => {
    setTextState(value);
    setFilterText(value);
  }, []);

  const setText = useCallback((value: string, filter = false) => {
    setTextState(value);
    setFilterText(filter ? value : '');
  }, []);

  const onInputChange = useCallback((value: string, reason: InputChangeReason) => {
    setTextState(value);
    const typed = reason === 'input' || reason === 'clear';
    setFilterText(reason === 'input' ? value : '');
    if (typed) {
      emittedRef.current = value;
      onFreeRef.current?.(value);
    }
  }, []);

  return { text, filterText, setText, onHookInput, onInputChange };
}
