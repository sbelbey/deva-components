import { useMemo } from 'react';
import { normalizeDiagnosisCode, type DiagnosisLike } from '../../diagnosis/diagnosis';
import { useDiagnosisSearch } from '../../diagnosis/useDiagnosisSearch';
import { findExactCodeMatch } from '../../core/exactCode';
import { createExactCodeKeyDown } from '../../core/exactCodeKeyDown';
import { entityId } from '../../core/types';
import { Combobox, type ComboboxFieldProps } from './Combobox';
import { useComboboxText } from './useComboboxText';

export const DIAGNOSIS_NO_OPTIONS_TEXT = 'Sin diagnósticos';
export const DIAGNOSIS_LOADING_TEXT = 'Cargando diagnósticos…';

export interface DiagnosisAutocompleteProps<T extends DiagnosisLike = DiagnosisLike> extends ComboboxFieldProps {
  /** Id del diagnóstico elegido. */
  value: string | null | undefined;
  /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
  onChange: (id: string | null, raw?: T) => void;
  /** Lista de diagnósticos. */
  diagnoses: readonly T[] | null | undefined;
  /** Deja escribir texto libre (Orden digital). */
  freeSolo?: boolean;
  /** freeSolo: texto que pone el padre (por ejemplo el CIE10 de la receta). */
  freeText?: string;
  /** freeSolo: texto tipeado, en vivo. */
  onFreeTextChange?: (text: string) => void;
  /** Enter o Tab con un código exacto elige ese diagnóstico. */
  selectByExactCode?: boolean;
}

/**
 * Autocomplete de diagnóstico (misma lógica que en DEVA).
 *
 * - El valor es el **id** del diagnóstico; nunca se parte "code - name" por '-'.
 * - Busca por code ignorando los puntos ("a099" encuentra A09.9) y por nombre.
 * - Con `freeSolo` el texto tipeado se avisa con `onFreeTextChange` y `freeText` lo puede
 *   cambiar el padre. Sin `freeSolo` el texto tipeado no se guarda nunca.
 */
export function DiagnosisAutocomplete<T extends DiagnosisLike = DiagnosisLike>(props: DiagnosisAutocompleteProps<T>) {
  const { value, onChange, diagnoses, freeSolo, freeText, onFreeTextChange, selectByExactCode, ...field } = props;
  // Con un diagnóstico elegido manda su etiqueta: el texto que guarda el padre (por
  // ejemplo el code) no la pisa.
  const hasSelected = Boolean(
    value && diagnoses?.some((diagnosis) => entityId(diagnosis as Parameters<typeof entityId>[0]) === value),
  );
  const skin = useComboboxText(
    freeSolo ? { freeText: hasSelected ? undefined : freeText, onFreeTextChange } : undefined,
  );
  const search = useDiagnosisSearch<T>({
    source: { items: diagnoses },
    inputValue: skin.filterText,
    onInputValueChange: skin.onHookInput,
  });

  const exactKeyDown = useMemo(
    () =>
      selectByExactCode
        ? createExactCodeKeyDown<T>({
            findMatch: (text) =>
              findExactCodeMatch(diagnoses, text, {
                getCode: (item) => item.code,
                normalize: normalizeDiagnosisCode,
              }),
            onSelect: (item) => onChange(entityId(item as Parameters<typeof entityId>[0]), item),
          })
        : undefined,
    [selectByExactCode, diagnoses, onChange],
  );

  return (
    <Combobox<T>
      {...field}
      onKeyDown={exactKeyDown}
      search={search}
      text={skin.text}
      onInputChange={skin.onInputChange}
      value={value}
      onChange={onChange}
      freeSolo={freeSolo}
      loading={field.loading ?? !diagnoses}
      noOptionsText={field.noOptionsText ?? DIAGNOSIS_NO_OPTIONS_TEXT}
      loadingText={field.loadingText ?? DIAGNOSIS_LOADING_TEXT}
    />
  );
}
