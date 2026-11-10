import { useMemo, type KeyboardEvent } from 'react';
import { entityId, type SearchOption } from '../../core/types';
import type { StudyLike, StudyProfileLike } from '../../study/study';
import { useStudySearch } from '../../study/useStudySearch';
import type { WorksheetLike } from '../../worksheet/worksheet';
import { useWorksheetSearch } from '../../worksheet/useWorksheetSearch';
import type { StudyEnterTools } from './StudyAutocomplete';
import type { InsuranceLike } from '../../insurance/insurance';
import { useInsuranceSearch } from '../../insurance/useInsuranceSearch';
import type { ComboboxFieldProps } from './Combobox';
import { MultiCombobox } from './MultiCombobox';
import { useComboboxText } from './useComboboxText';

export const INSURANCE_MULTI_NO_OPTIONS_TEXT = 'Sin obras sociales';
export const INSURANCE_MULTI_LOADING_TEXT = 'Cargando obras sociales…';

export interface InsuranceMultiAutocompleteProps<T extends InsuranceLike = InsuranceLike> extends ComboboxFieldProps {
  /** Ids elegidos. */
  value: readonly string[];
  /** Ids y objetos de todo lo que queda elegido; nunca mientras se tipea. */
  onChange: (ids: string[], raws: T[]) => void;
  /** Lista de obras sociales. */
  insurances: readonly T[] | null | undefined;
  /** Codes suspendidos hoy: se ofrecen igual, marcadas «Suspendida». */
  suspendedCodes?: readonly number[] | null;
  /** Etiqueta propia (por defecto "code - abreviatura"). */
  getLabel?: (insurance: T) => string;
  /** No ofrecer las ya elegidas. */
  hideSelected?: boolean;
  limitTags?: number;
}

/**
 * Varias obras sociales (misma lógica que `InsuranceMultiAutocomplete` de DEVA): chips con «quitar»,
 * busca por code, abreviatura y nombre, y las suspendidas se ofrecen marcadas.
 */
export function InsuranceMultiAutocomplete<T extends InsuranceLike = InsuranceLike>(
  props: InsuranceMultiAutocompleteProps<T>,
) {
  const { value, onChange, insurances, suspendedCodes, getLabel, hideSelected, limitTags, ...field } = props;
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

  return (
    <MultiCombobox<T>
      {...field}
      search={search}
      text={skin.text}
      onInputChange={skin.onInputChange}
      value={value}
      onChange={onChange}
      hideSelected={hideSelected}
      limitTags={limitTags}
      showSecondary
      loading={field.loading ?? !insurances}
      noOptionsText={field.noOptionsText ?? INSURANCE_MULTI_NO_OPTIONS_TEXT}
      loadingText={field.loadingText ?? INSURANCE_MULTI_LOADING_TEXT}
    />
  );
}

export const STUDY_MULTI_NO_OPTIONS_TEXT = 'Sin resultados';
export const STUDY_MULTI_LOADING_TEXT = 'Cargando estudios…';

type AnyProfile = StudyProfileLike<any>;

export interface StudyMultiAutocompleteProps<T extends StudyLike = StudyLike> extends Omit<
  ComboboxFieldProps,
  'noOptionsText' | 'loadingText'
> {
  /** Ids elegidos. */
  value: readonly string[];
  /** Ids y objetos de todo lo que queda elegido; nunca mientras se tipea. */
  onChange: (ids: string[], raws: T[]) => void;
  /** Lista de estudios (sin sub-ítems de compuestos, salvo `includeSubItems`). */
  studies: readonly T[] | null | undefined;
  /** Incluir los sub-ítems sintéticos de compuestos ("151…"). */
  includeSubItems?: boolean;
  /** Ids que no se ofrecen. */
  excludeIds?: readonly string[];
  /** Exclusión fija extra. */
  filter?: (study: T) => boolean;
  /** Etiqueta propia (por defecto "code - name"). */
  getLabel?: (study: T) => string;
  /** Si `getLabel` depende de algo que cambia, ponelo acá. */
  labelDeps?: readonly unknown[];
  /** No ofrecer los ya elegidos. */
  hideSelected?: boolean;
  limitTags?: number;
  /**
   * Enter en el input. Si se pasa, el Enter no envía el formulario y se llama con el texto tipeado (para
   * agregar por code exacto o por atajo de perfil). Con una opción resaltada con las flechas el Enter la
   * elige y `onEnter` no se llama.
   */
  onEnter?: (text: string, tools: StudyEnterTools<T>) => void;
  noOptionsText?: React.ReactNode;
}

/** Varios estudios (misma lógica que `StudyMultiAutocomplete` de DEVA): chips con «quitar» y Enter por code exacto. */
export function StudyMultiAutocomplete<T extends StudyLike = StudyLike>(props: StudyMultiAutocompleteProps<T>) {
  const {
    value,
    onChange,
    studies,
    includeSubItems,
    excludeIds,
    filter,
    getLabel,
    labelDeps,
    hideSelected,
    limitTags,
    onEnter,
    noOptionsText,
    ...field
  } = props;
  const skin = useComboboxText();
  const search = useStudySearch<T, AnyProfile>({
    source: { items: studies },
    includeSubItems,
    excludeIds,
    filter,
    toOption: getLabel
      ? (study: T): SearchOption<T> => ({
          id: entityId(study as Parameters<typeof entityId>[0]),
          label: getLabel(study),
          raw: study,
          kind: 'study',
        })
      : undefined,
    deps: labelDeps,
    inputValue: skin.filterText,
    onInputValueChange: skin.onHookInput,
  });

  const tools: StudyEnterTools<T> = useMemo(
    () => ({
      findByExactCode: search.findByExactCode,
      resolveExact: search.resolveExact,
      reset: search.reset,
    }),
    [search.findByExactCode, search.resolveExact, search.reset],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !onEnter) return;
    event.preventDefault();
    // Con una opción resaltada con las flechas el Enter la elige: no se llama además a onEnter.
    if (event.currentTarget.getAttribute('aria-activedescendant')) return;
    onEnter(skin.text, tools);
  };

  return (
    <MultiCombobox<T>
      {...field}
      search={search as never}
      text={skin.text}
      onInputChange={skin.onInputChange}
      value={value}
      onChange={onChange}
      hideSelected={hideSelected}
      limitTags={limitTags}
      onKeyDown={onEnter ? handleKeyDown : undefined}
      preventEnterWhileSearching={!onEnter}
      loading={field.loading ?? !studies}
      noOptionsText={noOptionsText ?? STUDY_MULTI_NO_OPTIONS_TEXT}
      loadingText={STUDY_MULTI_LOADING_TEXT}
    />
  );
}

export const WORKSHEET_MULTI_NO_OPTIONS_TEXT = 'Sin planillas';
export const WORKSHEET_MULTI_LOADING_TEXT = 'Cargando planillas…';

export interface WorksheetMultiAutocompleteProps<T extends WorksheetLike = WorksheetLike> extends ComboboxFieldProps {
  /** Planillas de trabajo. */
  worksheets: readonly T[] | null | undefined;
  /** Ids elegidos. */
  value: readonly string[];
  /** Ids y objetos de todo lo que queda elegido; nunca mientras se tipea. */
  onChange: (ids: string[], raws: T[]) => void;
}

/**
 * Varias planillas de trabajo "code - name" (misma lógica que `WorksheetMultiAutocomplete` de DEVA):
 * el valor son ids, busca por code y nombre sin acentos y elegir una ya elegida la quita.
 */
export function WorksheetMultiAutocomplete<T extends WorksheetLike = WorksheetLike>(
  props: WorksheetMultiAutocompleteProps<T>,
) {
  const { value, onChange, worksheets, ...field } = props;
  const skin = useComboboxText();
  const search = useWorksheetSearch<T>({
    source: { items: worksheets },
    inputValue: skin.filterText,
    onInputValueChange: skin.onHookInput,
  });
  return (
    <MultiCombobox<T>
      {...field}
      search={search}
      text={skin.text}
      onInputChange={skin.onInputChange}
      value={value}
      onChange={onChange}
      loading={field.loading ?? !worksheets}
      noOptionsText={field.noOptionsText ?? WORKSHEET_MULTI_NO_OPTIONS_TEXT}
      loadingText={field.loadingText ?? WORKSHEET_MULTI_LOADING_TEXT}
    />
  );
}
