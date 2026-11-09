import { useMemo, type KeyboardEvent } from 'react';
import { entityId, type SearchOption } from '../../core/types';
import type { ExactStudyMatch, StudyLike, StudyProfileLike } from '../../study/study';
import { useStudySearch } from '../../study/useStudySearch';
import { Combobox, type ComboboxFieldProps } from './Combobox';
import { useComboboxText } from './useComboboxText';

export const STUDY_NO_OPTIONS_TEXT = 'Sin resultados';
export const STUDY_LOADING_TEXT = 'Cargando estudios…';

type AnyProfile = StudyProfileLike<any>;

/** Herramientas para el Enter (code exacto / atajo de perfil). */
export interface StudyEnterTools<T extends StudyLike> {
  /** Estudio por code exacto ("475" o "475 - ..."). */
  findByExactCode: (rawValue: string) => T | undefined;
  /** Primero el atajo de perfil y después el code exacto. */
  resolveExact: (rawValue: string) => ExactStudyMatch<T, AnyProfile> | null;
  /** Vacía el texto del input. */
  reset: () => void;
}

export interface StudyAutocompleteProps<T extends StudyLike = StudyLike> extends Omit<
  ComboboxFieldProps,
  'noOptionsText' | 'loadingText'
> {
  /** Id del estudio elegido. */
  value: string | null | undefined;
  /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
  onChange: (id: string | null, raw?: T) => void;
  /** Lista de estudios (sin sub-ítems de compuestos, salvo `includeSubItems`). */
  studies: readonly T[] | null | undefined;
  /** Incluir los sub-ítems sintéticos de compuestos ("151…"): gestión del catálogo, gráficos, equipos. */
  includeSubItems?: boolean;
  /** Ids que no se ofrecen (por ejemplo, los ya agregados). */
  excludeIds?: readonly string[];
  /** Exclusión fija extra. */
  filter?: (study: T) => boolean;
  /** Etiqueta propia de la lista (por defecto "code - name"). */
  getLabel?: (study: T) => string;
  /** Si `getLabel` depende de algo que cambia, ponelo acá. */
  labelDeps?: readonly unknown[];
  /** Perfiles / atajos: se muestran antes que los estudios. */
  profiles?: readonly AnyProfile[] | null;
  /** Se llama al elegir un perfil (en vez de `onChange`). */
  onProfileSelect?: (profile: AnyProfile) => void;
  /** Deja escribir texto libre (no se guarda: sólo cuentan las opciones). */
  freeSolo?: boolean;
  /** Selector para «agregar»: después de elegir vacía el input (el padre guarda el valor en otra lista). */
  clearOnSelect?: boolean;
  /** Texto del input con el estudio ya elegido, si tiene que ser distinto de la etiqueta de la lista. */
  selectedLabel?: (study: T) => string;
  /**
   * Enter en el input. Si se pasa, el Enter no envía el formulario y se llama con el texto tipeado
   * (para agregar por code exacto o por atajo de perfil). Con una opción resaltada con las flechas
   * el Enter la elige y `onEnter` no se llama.
   */
  onEnter?: (text: string, tools: StudyEnterTools<T>) => void;
  noOptionsText?: React.ReactNode;
}

/**
 * Autocomplete de estudio (misma lógica que en DEVA).
 *
 * - El valor es el **id** del estudio: nunca se compara por etiqueta ni por code, así que dos
 *   estudios con el mismo code son dos opciones.
 * - Mientras se tipea `value` no cambia: el id sólo cambia al elegir una opción.
 * - Busca por code, nombre, abreviatura y atajo de perfil.
 */
export function StudyAutocomplete<T extends StudyLike = StudyLike>(props: StudyAutocompleteProps<T>) {
  const {
    value,
    onChange,
    studies,
    includeSubItems,
    excludeIds,
    filter,
    getLabel,
    labelDeps,
    profiles,
    onProfileSelect,
    clearOnSelect,
    selectedLabel,
    onEnter,
    noOptionsText,
    ...field
  } = props;
  const skin = useComboboxText();
  const search = useStudySearch<T, AnyProfile>({
    source: { items: studies },
    includeSubItems,
    profiles,
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

  type Option = SearchOption<T | AnyProfile>;

  const handleChange = (id: string | null, raw?: T | AnyProfile) => {
    // Estudios y perfiles pueden compartir id: se distinguen por el objeto elegido.
    const option = id ? (search.options as Option[]).find((o) => o.id === id && o.raw === raw) : undefined;
    if (option && option.kind === 'profile') {
      onProfileSelect?.(option.raw as AnyProfile);
      search.reset();
      return;
    }
    onChange(id, raw as T | undefined);
    if (clearOnSelect) search.reset();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !onEnter) return;
    event.preventDefault();
    if (event.currentTarget.getAttribute('aria-activedescendant')) return;
    onEnter(skin.text, tools);
  };

  return (
    <Combobox<T | AnyProfile>
      {...field}
      search={search as never}
      text={skin.text}
      onInputChange={skin.onInputChange}
      value={clearOnSelect ? null : value}
      onChange={handleChange}
      onKeyDown={onEnter ? handleKeyDown : undefined}
      preventEnterWhileSearching={!onEnter}
      getInputLabel={
        selectedLabel
          ? (option) => (option.kind === 'study' ? selectedLabel(option.raw as T) : option.label)
          : undefined
      }
      loading={field.loading ?? !studies}
      noOptionsText={noOptionsText ?? STUDY_NO_OPTIONS_TEXT}
      loadingText={STUDY_LOADING_TEXT}
    />
  );
}
