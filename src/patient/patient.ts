import { buildHaystack, matchesAllTerms, splitTerms } from '../core/normalize';
import { entityId, type SearchOption } from '../core/types';
import { isBlank } from '../core/entity';

/**
 * Paciente: un DNI suelto (lo que da `usePatientsDNI()` en DEVA, string o
 * number) o un objeto (`Patient` de DEVA con `_id` y `DNI`, o el
 * `PatientDniMatch` del portal con `patientId`).
 */
export type PatientLike =
  | string
  | number
  | {
      id?: string;
      _id?: string;
      patientId?: string;
      DNI?: number | string | null;
      dni?: number | string | null;
      name?: string | null;
      lastName?: string | null;
    };

/** DNI del paciente como texto ('' si no tiene). */
export function patientDni(patient: PatientLike): string {
  if (patient === null || patient === undefined) return '';
  if (typeof patient !== 'object') return String(patient);
  const dni = patient.DNI ?? patient.dni;
  return isBlank(dni) ? '' : String(dni);
}

/** Id del paciente: `id`/`_id`/`patientId`; para un DNI suelto, el DNI. */
export function patientId(patient: PatientLike): string {
  if (patient === null || patient === undefined) return '';
  if (typeof patient !== 'object') return String(patient);
  return (
    entityId(patient) ||
    (isBlank(patient.patientId) ? '' : String(patient.patientId)) ||
    patientDni(patient)
  );
}

/** "Apellido, Nombre" (vacío si no hay). */
export function patientFullName(patient: PatientLike): string {
  if (patient === null || typeof patient !== 'object') return '';
  return [patient.lastName, patient.name].filter((part) => !isBlank(part)).join(', ');
}

/** La etiqueta es el DNI, como en DEVA. El nombre va en `secondary`. */
export function patientLabel(patient: PatientLike): string {
  return patientDni(patient) || patientFullName(patient) || patientId(patient);
}

export function patientSearchText(patient: PatientLike): unknown[] {
  if (patient === null || typeof patient !== 'object') return [patient];
  return [patientDni(patient), patient.lastName, patient.name];
}

/** DNI (contiene, como el filtro de MUI) y, si hay, apellido y nombre. */
export function matchPatient(patient: PatientLike, query: string): boolean {
  return matchesAllTerms(buildHaystack(...patientSearchText(patient)), splitTerms(query));
}

export function patientToOption<T extends PatientLike>(patient: T): SearchOption<T> {
  const secondary = patientFullName(patient);
  return {
    id: patientId(patient),
    label: patientLabel(patient),
    ...(secondary ? { secondary } : {}),
    raw: patient,
  };
}
