import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { isDniScan, parseDniScan, type DniScanResult } from '../../patient/dniScan';
import type { PatientLike } from '../../patient/patient';
import { usePatientSearch } from '../../patient/usePatientSearch';
import { Combobox, type ComboboxFieldProps } from './Combobox';
import { useComboboxText } from './useComboboxText';

export const DNI_SCAN_ERROR_TEXT = 'No se pudo leer el DNI escaneado';
export const PATIENT_LOADING_TEXT = 'Cargando pacientes…';

export interface PatientDniAutocompleteProps<T extends PatientLike = PatientLike> extends ComboboxFieldProps {
  /** DNI elegido (texto o número). */
  value: string | number | null | undefined;
  /** DNI como texto (`null` al borrar), sólo al elegir o confirmar. */
  onChange: (dni: string | null, raw?: T) => void;
  /** Lista de pacientes o DNIs. Sin lista, es un input libre. */
  patients: readonly T[] | null | undefined;
  /** Escaneo con '!' al salir del campo o con Enter. */
  onScan?: (scan: DniScanResult | null, rawText: string) => void;
  /** Texto tipeado, en vivo (para pantallas que lo usan como filtro mientras se escribe). */
  onTextChange?: (text: string) => void;
  /** Se llama al salir del campo, después de confirmar el DNI. */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

/**
 * Autocomplete de DNI del paciente (misma lógica que en DEVA).
 *
 * - El valor es el DNI. `onChange` lo recibe como texto: cada pantalla lo guarda como quiera.
 * - Es texto libre (`freeSolo`): un DNI que no está en la lista es un paciente nuevo. El DNI
 *   tipeado se confirma al salir del campo o con Enter, no mientras se tipea; borrar todo lo
 *   limpia enseguida.
 * - Escaneo del DNI: lo que empieza con '!' es el lector de código de barras. Mientras dura no
 *   se busca y al salir del campo o con Enter se llama a `onScan` con el DNI y los datos leídos
 *   (o `null` si no se reconoce). El texto crudo del escaneo nunca llega a `onChange`.
 * - Escaneo que no se reconoce: se borra el texto crudo (vuelve el DNI que ya estaba, si había)
 *   y el campo avisa «No se pudo leer el DNI escaneado» hasta que se vuelva a tipear.
 */
export function PatientDniAutocomplete<T extends PatientLike = PatientLike>(props: PatientDniAutocompleteProps<T>) {
  const { value, onChange, patients, onScan, onTextChange, onBlur, ...field } = props;
  const { text, filterText, setText, onHookInput, onInputChange } = useComboboxText({ onFreeTextChange: onTextChange });

  const search = usePatientSearch<T>({
    source: { items: patients },
    showAllWhenEmpty: false,
    inputValue: filterText,
    onInputValueChange: onHookInput,
  });

  const currentDni = value === null || value === undefined ? '' : String(value).trim();

  // Lo último que se avisó: Enter + blur, o elegir + blur, no repiten el aviso.
  const lastSentRef = useRef<string | null>(null);
  useEffect(() => {
    lastSentRef.current = null;
  }, [currentDni]);

  const emit = (dni: string | null, raw?: T) => {
    lastSentRef.current = dni;
    onChange(dni, raw);
  };

  // Último escaneo resuelto: Enter + blur no llaman dos veces a onScan.
  const lastScanRef = useRef<string | null>(null);
  // El último escaneo no se pudo leer (aviso en el campo).
  const [scanFailed, setScanFailed] = useState(false);

  const resolveScan = (typed: string) => {
    if (typed === lastScanRef.current) return;
    lastScanRef.current = typed;
    const scan = parseDniScan(typed);
    if (scan) {
      const dni = String(scan.dni);
      setText(dni);
      // El DNI lo carga onScan: al salir no se vuelve a avisar.
      lastSentRef.current = dni;
    } else {
      // No queda el texto crudo a la vista: vuelve lo que había.
      setText(currentDni);
      onTextChange?.(currentDni);
      setScanFailed(true);
    }
    onScan?.(scan, typed);
  };

  // Enter (el lector suele mandarlo al final) o salir del campo. Un escaneo '!…' nunca se
  // avisa como DNI: se resuelve con onScan.
  const commit = (typed: string) => {
    if (isDniScan(typed)) {
      resolveScan(typed);
      return;
    }
    const dni = typed.trim();
    if (!dni) return;
    if (dni === currentDni || dni === lastSentRef.current) return;
    emit(dni, search.getOptionById(dni)?.raw);
  };

  const handleInputChange: typeof onInputChange = (next, reason) => {
    // Un escaneo nuevo (aunque sea el mismo DNI) se vuelve a resolver.
    if (reason === 'input' || reason === 'clear') {
      lastScanRef.current = null;
      setScanFailed(false);
    }
    onInputChange(next, reason);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    commit(event.target.value ?? text);
    onBlur?.(event);
  };

  return (
    <Combobox<T>
      {...field}
      search={search}
      text={text}
      // Borrar todo limpia el valor enseguida.
      onInputChange={handleInputChange}
      value={currentDni}
      onChange={emit}
      freeSolo
      showUnknownValue
      showSecondary
      onCommitText={commit}
      onBlur={handleBlur}
      inputMode="numeric"
      loadingText={field.loadingText ?? PATIENT_LOADING_TEXT}
      error={scanFailed || field.error}
      helperText={scanFailed ? DNI_SCAN_ERROR_TEXT : field.helperText}
    />
  );
}
