import { S as SearchSource, a as SearchOption, b as SearchResult, R as RemoteSearchFn, c as StudyLike, d as StudyProfileLike, E as ExactStudyMatch, D as DoctorLike, e as DiagnosisLike, I as InsuranceLike, f as InsuranceOption, P as PatientLike, g as DniScanResult, B as BiochemistLike, W as WorksheetLike } from './worksheet-jTbuVCv_.js';
export { C as COMPOUND_SUBITEM_CODE_REGEX, L as LocalSource, h as PatientFromDni, i as RemoteSource, j as biochemistLabel, k as biochemistSearchText, l as biochemistToOption, m as buildHaystack, n as diagnosisLabel, o as diagnosisSearchText, p as diagnosisToOption, q as doctorLabel, r as doctorLabelLastNameFirst, s as doctorRemoteQuery, t as doctorSearchText, u as doctorToOption, v as entityId, w as findDiagnosisByCode, x as findProfileByShortcut, y as findStudyByExactCode, z as findWorksheetByCode, A as insuranceLabel, F as insuranceSearchText, G as insuranceToOption, H as isCompoundSubItem, J as isCompoundSubItemCode, K as isDniScan, M as isInsuranceSuspended, N as isRemoteSource, O as longestTerm, Q as matchBiochemist, T as matchDiagnosis, U as matchDoctor, V as matchInsurance, X as matchPatient, Y as matchProfile, Z as matchStudy, _ as matchText, $ as matchWorksheet, a0 as matchesAllTerms, a1 as normalizeDiagnosisCode, a2 as normalizeText, a3 as parseDniData, a4 as parseDniDate, a5 as parseDniScan, a6 as patientDni, a7 as patientFullName, a8 as patientId, a9 as patientLabel, aa as patientSearchText, ab as patientToOption, ac as profileLabel, ad as profileToOption, ae as resolveStudyInput, af as splitTerms, ag as studyLabel, ah as studySearchText, ai as studyToOption, aj as worksheetLabel, ak as worksheetSearchText, al as worksheetToOption } from './worksheet-jTbuVCv_.js';
import react__default from 'react';

interface SearchConfig<T> {
    source: SearchSource<T>;
    /** Item → opción. Se toma el de la última render: si depende de algo que cambia, sumalo a `deps`. */
    toOption: (item: T) => SearchOption<T>;
    /** Texto extra donde buscar, además de `label` y `secondary`. */
    searchText?: (item: T) => unknown[];
    /** Exclusión fija (por ejemplo los sub-ítems de compuestos). Se aplica a la lista y al servidor. */
    filter?: (item: T) => boolean;
    /** Ids que no se muestran (por ejemplo los ya elegidos). */
    excludeIds?: readonly string[];
    /** Caracteres mínimos para buscar. Por defecto 0 en local y 1 en servidor. */
    minChars?: number;
    /** Debounce del servidor, en ms (300 por defecto, como el portal). */
    debounceMs?: number;
    /** Máximo de opciones en local (sin límite por defecto). */
    limit?: number;
    /** En local, con el input vacío muestra toda la lista (como el Autocomplete de MUI). true por defecto. */
    showAllWhenEmpty?: boolean;
    /** Transforma lo tipeado antes de mandarlo al servidor. */
    remoteQuery?: (input: string) => string;
    /** Filtra también en el cliente lo que devuelve el servidor (multi-término). */
    refineRemote?: boolean;
    /** No busca mientras esto dé true (por ejemplo, un escaneo de DNI que empieza con '!'). */
    suspend?: (input: string) => boolean;
    /** Items ya conocidos para resolver `getOptionById` en modo servidor (por ejemplo, el valor guardado). */
    knownItems?: readonly T[];
    /** Dependencias que obligan a reconstruir las opciones (además de la lista). */
    deps?: readonly unknown[];
    initialInputValue?: string;
    /** Modo controlado: si se pasa, el hook no guarda el texto. */
    inputValue?: string;
    onInputValueChange?: (value: string) => void;
}
/**
 * Motor común de búsqueda. Con `{ items }` filtra en memoria; con `{ search }`
 * consulta al servidor con debounce, cancela la consulta anterior y descarta
 * respuestas viejas. Los hooks por entidad (useStudySearch, etc.) lo usan por
 * debajo.
 */
declare function useSearch<T>(config: SearchConfig<T>): SearchResult<T>;

/**
 * Normalización por defecto de un código: sin espacios, en minúsculas y, si
 * es numérico, sin ceros a la izquierda ("01" y "1" son lo mismo).
 */
declare function defaultNormalizeCode(code: string): string;
interface ExactCodeMatchOptions<T> {
    getCode: (item: T) => string | number | null | undefined;
    normalize?: (code: string) => string;
    getId?: (item: T) => string;
}
/**
 * DEVA-148: ítem cuyo código coincide EXACTO con el texto escrito.
 *
 * - Compara el texto completo (no prefijo).
 * - Si dos ítems distintos (por id) tienen el mismo código es ambiguo y no
 *   devuelve nada: el usuario elige de la lista.
 */
declare function findExactCodeMatch<T>(items: readonly T[] | null | undefined, rawText: string | null | undefined, options: ExactCodeMatchOptions<T>): T | undefined;

/**
 * DEVA-148: onKeyDown que elige por código exacto con Enter o Tab.
 *
 * - Enter selecciona y frena el evento (no se envía el formulario).
 * - Tab selecciona y deja seguir el evento: el foco pasa al campo siguiente.
 * - Shift+Tab, otras teclas, composición IME y una opción resaltada con las
 *   flechas (`aria-activedescendant`, la elige MUI) se ignoran.
 * - Sin coincidencia no hace nada: el campo se comporta como siempre.
 */
declare function createExactCodeKeyDown<T>(args: {
    findMatch: (text: string) => T | undefined;
    onSelect: (item: T) => void;
}): (event: react__default.KeyboardEvent<HTMLElement>) => void;

/** Atajo de `useSearch` para una lista ya cargada. */
declare function useLocalSearch<T>(config: Omit<SearchConfig<T>, 'source'> & {
    items: readonly T[] | null | undefined;
}): SearchResult<T>;

/** Atajo de `useSearch` para búsqueda en el servidor (debounce + descarte de respuestas viejas). */
declare function useRemoteSearch<T>(config: Omit<SearchConfig<T>, 'source'> & {
    search: RemoteSearchFn<T>;
}): SearchResult<T>;

/** Opciones comunes de los hooks por entidad. `toOption` es opcional: cada entidad trae el suyo. */
type EntitySearchOptions<T> = Omit<SearchConfig<T>, 'source' | 'toOption'> & {
    source: SearchSource<T>;
    toOption?: (item: T) => SearchOption<T>;
};

type StudySearchOptions<T extends StudyLike, P extends StudyProfileLike<unknown>> = EntitySearchOptions<T> & {
    /** Incluir los sub-ítems sintéticos de compuestos (sólo para gestión del catálogo). false por defecto. */
    includeSubItems?: boolean;
    /** Perfiles / atajos (lista local). Se muestran antes que los estudios. */
    profiles?: readonly P[] | null;
    profileToOption?: (profile: P) => SearchOption<P>;
};
type StudySearchResult<T, P> = SearchResult<T | P> & {
    /** Enter: estudio por code exacto ("475" o "475 - ..."), entre los estudios visibles para el hook. */
    findByExactCode: (rawValue: string) => T | undefined;
    /** Enter con perfiles: primero el atajo del perfil, después el code exacto. */
    resolveExact: (rawValue: string) => ExactStudyMatch<T, P> | null;
};
/**
 * Buscador de estudios: code, nombre, abreviatura y atajo de perfil.
 * Excluye los sub-ítems de compuestos salvo `includeSubItems`.
 */
declare function useStudySearch<T extends StudyLike = StudyLike, P extends StudyProfileLike<unknown> = StudyProfileLike>(config: StudySearchOptions<T, P>): StudySearchResult<T, P>;

type DoctorSearchOptions<T extends DoctorLike> = EntitySearchOptions<T>;
/**
 * Buscador de médicos por apellido, nombre y matrícula, con varios términos.
 * En modo servidor manda el término más largo y filtra el resto en el cliente
 * (se puede cambiar con `remoteQuery` / `refineRemote`).
 */
declare function useDoctorSearch<T extends DoctorLike = DoctorLike>(options: DoctorSearchOptions<T>): SearchResult<T>;

type DiagnosisSearchOptions<T extends DiagnosisLike> = EntitySearchOptions<T>;
type DiagnosisSearchResult<T> = SearchResult<T> & {
    /** Diagnóstico por code exacto, ignorando puntos (lista local o resultados del servidor). */
    findByCode: (code: string | null | undefined) => T | undefined;
};
/** Buscador de diagnósticos por code (ignorando puntos) y nombre. */
declare function useDiagnosisSearch<T extends DiagnosisLike = DiagnosisLike>(options: DiagnosisSearchOptions<T>): DiagnosisSearchResult<T>;

type InsuranceSearchOptions<T extends InsuranceLike> = EntitySearchOptions<T> & {
    /** Codes suspendidos hoy (`suspendedInsuranceCodes` del Context de DEVA). */
    suspendedCodes?: readonly number[] | null;
    /** Alternativa a `suspendedCodes` si la suspensión se decide de otra forma. */
    isSuspended?: (insurance: T) => boolean;
    /** Texto de `secondary` para las suspendidas ("Suspendida" por defecto). */
    suspendedText?: string;
};
type InsuranceSearchResult<T> = Omit<SearchResult<T>, 'options' | 'getOptionById'> & {
    options: InsuranceOption<T>[];
    getOptionById: (id: string | null | undefined) => InsuranceOption<T> | undefined;
};
/** Buscador de obras sociales: code, abreviatura y nombre. Las suspendidas salen marcadas, no se ocultan. */
declare function useInsuranceSearch<T extends InsuranceLike = InsuranceLike>(options: InsuranceSearchOptions<T>): InsuranceSearchResult<T>;

type PatientSearchOptions<T extends PatientLike> = EntitySearchOptions<T>;
type PatientSearchResult<T> = SearchResult<T> & {
    /** true mientras lo tipeado empieza con '!' (escaneo del lector): no se busca. */
    isScan: boolean;
    /** El escaneo interpretado (DNI y datos), o null si no es un escaneo o no se reconoce. */
    scan: DniScanResult | null;
};
/**
 * Buscador de pacientes por DNI. Entiende el escaneo del DNI que empieza con
 * '!': mientras dura no busca, y `scan` da el resultado (en DEVA se aplica en
 * el blur).
 */
declare function usePatientSearch<T extends PatientLike = PatientLike>(options: PatientSearchOptions<T>): PatientSearchResult<T>;

type BiochemistSearchOptions<T extends BiochemistLike> = EntitySearchOptions<T>;
/** Buscador de bioquímicos por matrícula, nombre, apellido y DNI. Compara por id, no por etiqueta. */
declare function useBiochemistSearch<T extends BiochemistLike = BiochemistLike>(options: BiochemistSearchOptions<T>): SearchResult<T>;

type WorksheetSearchOptions<T extends WorksheetLike> = EntitySearchOptions<T>;
type WorksheetSearchResult<T> = SearchResult<T> & {
    /** Planilla por code exacto (lista local o resultados del servidor). */
    findByCode: (code: number | string | null | undefined) => T | undefined;
};
/** Buscador de planillas de trabajo ("code - name"). Compara por id. */
declare function useWorksheetSearch<T extends WorksheetLike = WorksheetLike>(options: WorksheetSearchOptions<T>): WorksheetSearchResult<T>;

export { BiochemistLike, type BiochemistSearchOptions, DiagnosisLike, type DiagnosisSearchOptions, type DiagnosisSearchResult, DniScanResult, DoctorLike, type DoctorSearchOptions, type EntitySearchOptions, type ExactCodeMatchOptions, ExactStudyMatch, InsuranceLike, InsuranceOption, type InsuranceSearchOptions, type InsuranceSearchResult, PatientLike, type PatientSearchOptions, type PatientSearchResult, RemoteSearchFn, type SearchConfig, SearchOption, SearchResult, SearchSource, StudyLike, StudyProfileLike, type StudySearchOptions, type StudySearchResult, WorksheetLike, type WorksheetSearchOptions, type WorksheetSearchResult, createExactCodeKeyDown, defaultNormalizeCode, findExactCodeMatch, useBiochemistSearch, useDiagnosisSearch, useDoctorSearch, useInsuranceSearch, useLocalSearch, usePatientSearch, useRemoteSearch, useSearch, useStudySearch, useWorksheetSearch };
