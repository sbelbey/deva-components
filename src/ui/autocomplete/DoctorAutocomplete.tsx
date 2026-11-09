import { useMemo } from 'react';
import { findExactCodeMatch } from '../../core/exactCode';
import { createExactCodeKeyDown } from '../../core/exactCodeKeyDown';
import { entityId } from '../../core/types';
import type { DoctorLike } from '../../doctor/doctor';
import { useDoctorSearch } from '../../doctor/useDoctorSearch';
import { Combobox, type ComboboxFieldProps } from './Combobox';
import { useComboboxText } from './useComboboxText';

export const DOCTOR_NO_OPTIONS_TEXT = 'Sin médicos';
export const DOCTOR_LOADING_TEXT = 'Cargando médicos…';

export interface DoctorAutocompleteProps<T extends DoctorLike = DoctorLike> extends ComboboxFieldProps {
  /** Id del médico elegido. */
  value: string | null | undefined;
  /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
  onChange: (id: string | null, raw?: T) => void;
  /** Lista de médicos. */
  doctors: readonly T[] | null | undefined;
  /** Enter o Tab con una matrícula exacta elige ese médico. */
  selectByExactCode?: boolean;
}

const doctorCode = (doctor: DoctorLike) =>
  doctor.professionalRegistration ?? /^\s*(\d+)\s*-/.exec(doctor.doctor ?? '')?.[1];

/**
 * Autocomplete de médico (misma lógica que en DEVA).
 *
 * - El valor es el **id** del médico. Dos médicos con la misma etiqueta son dos opciones.
 * - Busca por apellido, nombre y matrícula, con varios términos en cualquier orden
 *   ("gomez juan" encuentra "1234 - Juan Gómez").
 * - Mientras se tipea `value` no cambia y el texto tipeado no se guarda nunca.
 */
export function DoctorAutocomplete<T extends DoctorLike = DoctorLike>(props: DoctorAutocompleteProps<T>) {
  const { value, onChange, doctors, selectByExactCode, ...field } = props;
  const skin = useComboboxText();
  const search = useDoctorSearch<T>({
    source: { items: doctors },
    inputValue: skin.filterText,
    onInputValueChange: skin.onHookInput,
  });

  const exactKeyDown = useMemo(
    () =>
      selectByExactCode
        ? createExactCodeKeyDown<T>({
            findMatch: (text) => findExactCodeMatch(doctors, text, { getCode: doctorCode }),
            onSelect: (item) => onChange(entityId(item as Parameters<typeof entityId>[0]), item),
          })
        : undefined,
    [selectByExactCode, doctors, onChange],
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
      loading={field.loading ?? !doctors}
      noOptionsText={field.noOptionsText ?? DOCTOR_NO_OPTIONS_TEXT}
      loadingText={field.loadingText ?? DOCTOR_LOADING_TEXT}
    />
  );
}
