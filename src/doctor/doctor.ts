import { buildHaystack, longestTerm, matchesAllTerms, splitTerms } from '../core/normalize';
import { entityId, type SearchOption } from '../core/types';
import { isBlank } from '../core/entity';

/**
 * Forma mínima de un médico. Acepta el Doctor de DEVA
 * (`{ id, name, lastName, professionalRegistration }`), lo que expone
 * `useDoctor()` en DEVA (`{ id, doctor: 'matrícula - nombre apellido' }`) y el
 * `WardDoctorOption` del portal.
 */
export interface DoctorLike {
  id?: string;
  _id?: string;
  name?: string | null;
  lastName?: string | null;
  professionalRegistration?: number | string | null;
  /** Etiqueta ya armada por el Context de DEVA. */
  doctor?: string | null;
}

function fullName(parts: Array<string | null | undefined>, separator: string): string {
  return parts.filter((part) => !isBlank(part)).join(separator);
}

/** Etiqueta de DEVA: "matrícula - nombre apellido". Si ya viene armada (`doctor`), la usa. */
export function doctorLabel(doctor: DoctorLike): string {
  if (!isBlank(doctor.doctor)) return String(doctor.doctor);
  const name = fullName([doctor.name, doctor.lastName], ' ');
  if (!isBlank(doctor.professionalRegistration)) {
    return name ? `${doctor.professionalRegistration} - ${name}` : String(doctor.professionalRegistration);
  }
  return name || entityId(doctor);
}

/** Etiqueta del portal: "Apellido, Nombre · MP matrícula" ("Sin nombre" si no hay nombre). */
export function doctorLabelLastNameFirst(doctor: DoctorLike): string {
  const name = fullName([doctor.lastName, doctor.name], ', ') || 'Sin nombre';
  return isBlank(doctor.professionalRegistration) ? name : `${name} · MP ${doctor.professionalRegistration}`;
}

/** Texto donde se busca: apellido, nombre, matrícula (y la etiqueta armada de DEVA). */
export function doctorSearchText(doctor: DoctorLike): unknown[] {
  return [doctor.lastName, doctor.name, doctor.professionalRegistration, doctor.doctor];
}

/** Multi-término: "Gomez Juan", "Juan Gómez" o "1234 gomez" encuentran al mismo médico. */
export function matchDoctor(doctor: DoctorLike, query: string): boolean {
  return matchesAllTerms(buildHaystack(...doctorSearchText(doctor)), splitTerms(query));
}

export function doctorToOption<T extends DoctorLike>(doctor: T): SearchOption<T> {
  return { id: entityId(doctor), label: doctorLabel(doctor), raw: doctor };
}

/**
 * Lo que se le manda al servidor cuando el servidor busca un solo término
 * (el portal: regex sobre name o lastName): el término más largo. El resto se
 * filtra en el cliente.
 */
export const doctorRemoteQuery = longestTerm;
