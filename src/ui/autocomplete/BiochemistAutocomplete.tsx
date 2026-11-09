import type { BiochemistLike } from '../../biochemist/biochemist';
import { useBiochemistSearch } from '../../biochemist/useBiochemistSearch';
import { Combobox, type ComboboxFieldProps } from './Combobox';
import { useComboboxText } from './useComboboxText';

export const BIOCHEMIST_NO_OPTIONS_TEXT = 'Sin bioquímicos';
export const BIOCHEMIST_LOADING_TEXT = 'Cargando bioquímicos…';

export interface BiochemistAutocompleteProps<T extends BiochemistLike = BiochemistLike> extends ComboboxFieldProps {
  /** Id del bioquímico elegido. */
  value: string | null | undefined;
  /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
  onChange: (id: string | null, raw?: T) => void;
  /** Bioquímicos del laboratorio. */
  biochemists: readonly T[] | null | undefined;
}

/**
 * Autocomplete de bioquímico (misma lógica que en DEVA).
 *
 * - El valor es el **id**. Dos bioquímicos con la misma etiqueta "matrícula - nombre apellido"
 *   son dos opciones.
 * - Busca por matrícula, nombre, apellido y DNI, con varios términos.
 * - Mientras se tipea `value` no cambia y el texto tipeado no se guarda nunca.
 */
export function BiochemistAutocomplete<T extends BiochemistLike = BiochemistLike>(
  props: BiochemistAutocompleteProps<T>,
) {
  const { value, onChange, biochemists, ...field } = props;
  const skin = useComboboxText();
  const search = useBiochemistSearch<T>({
    source: { items: biochemists },
    inputValue: skin.filterText,
    onInputValueChange: skin.onHookInput,
  });

  return (
    <Combobox<T>
      {...field}
      search={search}
      text={skin.text}
      onInputChange={skin.onInputChange}
      value={value}
      onChange={onChange}
      loading={field.loading ?? !biochemists}
      noOptionsText={field.noOptionsText ?? BIOCHEMIST_NO_OPTIONS_TEXT}
      loadingText={field.loadingText ?? BIOCHEMIST_LOADING_TEXT}
    />
  );
}
