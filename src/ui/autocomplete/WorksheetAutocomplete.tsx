import type { KeyboardEvent } from 'react';
import type { WorksheetLike } from '../../worksheet/worksheet';
import { useWorksheetSearch } from '../../worksheet/useWorksheetSearch';
import { Combobox, type ComboboxFieldProps } from './Combobox';
import { useComboboxText } from './useComboboxText';

export const WORKSHEET_NO_OPTIONS_TEXT = 'Sin planillas';
export const WORKSHEET_LOADING_TEXT = 'Cargando planillas…';

/** Herramientas para el Enter (code exacto). */
export interface WorksheetEnterTools<T extends WorksheetLike> {
  /** Planilla por code exacto ("12"). */
  findByCode: (code: number | string | null | undefined) => T | undefined;
  /** Vacía el texto del input. */
  reset: () => void;
}

export interface WorksheetAutocompleteProps<T extends WorksheetLike = WorksheetLike> extends ComboboxFieldProps {
  /** Planillas de trabajo. */
  worksheets: readonly T[] | null | undefined;
  /** Id de la planilla elegida (`null` con `clearOnSelect`). */
  value: string | null | undefined;
  /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
  onChange: (id: string | null, raw?: T) => void;
  /** Vacía el input después de elegir (selector para agregar a una lista, como Imprimir planillas). */
  clearOnSelect?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /**
   * Enter en el input sin una opción resaltada, con el texto tipeado (por ejemplo "12" o lo que
   * manda un lector), para agregar por code exacto. Si se pasa, el Enter no envía el formulario.
   * Con una opción resaltada con las flechas el Enter la elige y `onEnter` no se llama.
   */
  onEnter?: (text: string, tools: WorksheetEnterTools<T>) => void;
  endAdornment?: React.ReactNode;
}

/**
 * Autocomplete de planilla de trabajo "code - name" (misma lógica que en DEVA).
 *
 * - El valor es el **id**. Los sitios que mandan o guardan el code lo toman de la planilla
 *   elegida (`raw.code`), nunca partiendo la etiqueta por " - ".
 * - Busca por code y nombre, con varios términos y sin acentos.
 */
export function WorksheetAutocomplete<T extends WorksheetLike = WorksheetLike>(props: WorksheetAutocompleteProps<T>) {
  const { value, onChange, worksheets, clearOnSelect, onEnter, onKeyDown, ...field } = props;
  const skin = useComboboxText();
  const search = useWorksheetSearch<T>({
    source: { items: worksheets },
    inputValue: skin.filterText,
    onInputValueChange: skin.onHookInput,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (!onEnter || event.key !== 'Enter') return;
    event.preventDefault();
    // Con una opción resaltada con las flechas el Enter la elige (onChange): no se llama además
    // a onEnter, que la agregaría dos veces.
    if (event.currentTarget.getAttribute('aria-activedescendant')) return;
    onEnter(skin.text, {
      findByCode: search.findByCode,
      reset: () => skin.setText(''),
    });
  };

  const handleChange = (id: string | null, raw?: T) => {
    onChange(id, raw);
    if (clearOnSelect && id) skin.setText('');
  };

  return (
    <Combobox<T>
      {...field}
      search={search}
      text={skin.text}
      onInputChange={skin.onInputChange}
      onKeyDown={onKeyDown || onEnter ? handleKeyDown : undefined}
      value={clearOnSelect ? null : value}
      onChange={handleChange}
      loading={field.loading ?? !worksheets}
      noOptionsText={field.noOptionsText ?? WORKSHEET_NO_OPTIONS_TEXT}
      loadingText={field.loadingText ?? WORKSHEET_LOADING_TEXT}
    />
  );
}
