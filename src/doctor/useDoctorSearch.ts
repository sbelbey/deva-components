import { useSearch } from '../core/useSearch';
import type { EntitySearchOptions } from '../core/entity';
import type { SearchResult } from '../core/types';
import { doctorRemoteQuery, doctorSearchText, doctorToOption, type DoctorLike } from './doctor';

export type DoctorSearchOptions<T extends DoctorLike> = EntitySearchOptions<T>;

/**
 * Buscador de médicos por apellido, nombre y matrícula, con varios términos.
 * En modo servidor manda el término más largo y filtra el resto en el cliente
 * (se puede cambiar con `remoteQuery` / `refineRemote`).
 */
export function useDoctorSearch<T extends DoctorLike = DoctorLike>(
  options: DoctorSearchOptions<T>,
): SearchResult<T> {
  const { toOption, ...rest } = options;
  return useSearch<T>({
    remoteQuery: doctorRemoteQuery,
    refineRemote: true,
    searchText: doctorSearchText,
    ...rest,
    toOption: toOption ?? doctorToOption,
  });
}
