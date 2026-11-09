import { useMemo } from 'react';
import { findExactCodeMatch } from '../../core/exactCode';
import { createExactCodeKeyDown } from '../../core/exactCodeKeyDown';
import { entityId, type SearchOption } from '../../core/types';
import type { InsuranceLike } from '../../insurance/insurance';
import { useInsuranceSearch } from '../../insurance/useInsuranceSearch';
import { Combobox, type ComboboxFieldProps } from './Combobox';
import { useComboboxText } from './useComboboxText';

export const INSURANCE_NO_OPTIONS_TEXT = 'Sin obras sociales';
export const INSURANCE_LOADING_TEXT = 'Cargando obras sociales…';

export interface InsuranceAutocompleteProps<T extends InsuranceLike = InsuranceLike> extends ComboboxFieldProps {
  /** Id de la obra social elegida. */
  value: string | null | undefined;
  /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
  onChange: (id: string | null, raw?: T) => void;
  /** Lista de obras sociales. */
  insurances: readonly T[] | null | undefined;
  /** Codes suspendidos hoy en el laboratorio: se ofrecen igual, marcadas «Suspendida». */
  suspendedCodes?: readonly number[] | null;
  /** Etiqueta propia (por defecto "code - abreviatura"). */
  getLabel?: (insurance: T) => string;
  /** Enter o Tab con un código exacto elige esa obra social. */
  selectByExactCode?: boolean;
}

const insuranceCode = (insurance: InsuranceLike) => insurance.code ?? /^\s*(\d+)/.exec(insurance.insurance ?? '')?.[1];

/**
 * Autocomplete de obra social (misma lógica que en DEVA).
 *
 * - El valor es el **id**; se compara por id, nunca por la etiqueta "code - abreviatura".
 * - Mientras se tipea `value` no cambia.
 * - Busca por code, abreviatura y nombre. Las suspendidas se ofrecen igual, marcadas
 *   «Suspendida» (la orden pasa a particular).
 * - Escribir el número y Enter (o Tab) elige la coincidencia exacta.
 */
export function InsuranceAutocomplete<T extends InsuranceLike = InsuranceLike>(props: InsuranceAutocompleteProps<T>) {
  const { value, onChange, insurances, suspendedCodes, getLabel, selectByExactCode, ...field } = props;
  const skin = useComboboxText();
  const search = useInsuranceSearch<T>({
    source: { items: insurances },
    suspendedCodes,
    toOption: getLabel
      ? (insurance: T): SearchOption<T> => ({
          id: entityId(insurance as Parameters<typeof entityId>[0]),
          label: getLabel(insurance),
          raw: insurance,
        })
      : undefined,
    inputValue: skin.filterText,
    onInputValueChange: skin.onHookInput,
  });

  const exactKeyDown = useMemo(
    () =>
      selectByExactCode
        ? createExactCodeKeyDown<T>({
            findMatch: (text) => findExactCodeMatch(insurances, text, { getCode: insuranceCode }),
            onSelect: (item) => onChange(entityId(item as Parameters<typeof entityId>[0]), item),
          })
        : undefined,
    [selectByExactCode, insurances, onChange],
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
      showSecondary
      loading={field.loading ?? !insurances}
      noOptionsText={field.noOptionsText ?? INSURANCE_NO_OPTIONS_TEXT}
      loadingText={field.loadingText ?? INSURANCE_LOADING_TEXT}
    />
  );
}
