/**
 * Normalización de texto para buscar: sin acentos, sin puntos, en minúsculas
 * y con los espacios colapsados. "Gómez" → "gomez", "A09.9" → "a099",
 * "G.O.T." → "got".
 */
declare function normalizeText(value: unknown): string;
/** Parte la consulta en términos normalizados ("Gómez  Juan" → ["gomez", "juan"]). */
declare function splitTerms(query: unknown): string[];
/** Arma el texto donde se busca a partir de varios campos (ignora vacíos). */
declare function buildHaystack(...parts: unknown[]): string;
/**
 * true si TODOS los términos aparecen en el texto (AND, en cualquier orden).
 * `haystack` tiene que venir normalizado (ver `buildHaystack`). Sin términos
 * devuelve true.
 */
declare function matchesAllTerms(haystack: string, terms: readonly string[]): boolean;
/** Atajo: ¿la consulta coincide con alguno de los campos? (multi-término AND). */
declare function matchText(query: unknown, ...parts: unknown[]): boolean;
/**
 * El término más largo de la consulta, tal como lo escribió el usuario (sin
 * normalizar). Sirve para mandarle al servidor un solo término cuando el
 * servidor no entiende varios, y filtrar el resto en el cliente.
 */
declare function longestTerm(query: string): string;

/** Opción normalizada que devuelven todos los hooks. Se compara siempre por `id`. */
interface SearchOption<T> {
    id: string;
    label: string;
    secondary?: string;
    raw: T;
    /** Para listas mixtas (por ejemplo 'study' | 'profile' en useStudySearch). */
    kind?: string;
}
/** Búsqueda en el servidor. Tiene que respetar `signal` (axios y fetch lo aceptan). */
type RemoteSearchFn<T> = (query: string, signal: AbortSignal) => Promise<T[]>;
/** Lista ya cargada (como hace DEVA con sus Context). `undefined`/`null` = todavía cargando. */
interface LocalSource<T> {
    items: readonly T[] | null | undefined;
}
/** Búsqueda en el servidor (como hacen el portal y Nucleus). */
interface RemoteSource<T> {
    search: RemoteSearchFn<T>;
}
type SearchSource<T> = LocalSource<T> | RemoteSource<T>;
declare function isRemoteSource<T>(source: SearchSource<T>): source is RemoteSource<T>;
/** Lo que devuelve cualquier hook de búsqueda, listo para conectar a la piel. */
interface SearchResult<T> {
    /** Texto del input. El valor elegido (id) lo maneja la piel, no el hook. */
    inputValue: string;
    setInputValue: (value: string) => void;
    /** Vacía el input (reemplaza el `key={Math.random()}` de las pieles viejas). */
    reset: () => void;
    options: SearchOption<T>[];
    loading: boolean;
    error: unknown;
    /** true cuando se buscó algo y no hubo resultados (para el "Sin resultados"). */
    empty: boolean;
    /** Resuelve un id a su opción (lista local, o todo lo que vino del servidor). */
    getOptionById: (id: string | null | undefined) => SearchOption<T> | undefined;
}
/** Id de una entidad que puede venir como `id` (DTO) o `_id` (Mongo). */
declare function entityId(item: unknown): string;

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

/**
 * Forma mínima de un estudio. Acepta el `Analises` de DEVA
 * (`{ id, code: number, name, abbreviation, ... }`) y el `WardStudyOption`
 * del portal (`{ id, name?, code? }`), y también documentos con `_id`.
 */
interface StudyLike {
    id?: string;
    _id?: string;
    code?: number | string | null;
    name?: string | null;
    abbreviation?: string | null;
}
/** Perfil / atajo de DEVA (`analysis-profiles`): se elige por `shortcutCode`. */
interface StudyProfileLike<S = StudyLike> {
    id?: string;
    _id?: string;
    name?: string | null;
    shortcutCode?: string | number | null;
    studies?: S[];
}
/**
 * Regex real de DEVA (`compositeAnalysis.dao.ts`, getAllAnalyses) sobre el
 * code como texto: prefijo "151" y al menos 6 dígitos. Cubre las familias
 * 1515xxx/1516xxx/1517xxx y los hijos de 6 dígitos del EAB
 * (151515/151525/151535), y deja afuera el 151 real (Ceruloplasmina).
 */
declare const COMPOUND_SUBITEM_CODE_REGEX: RegExp;
/** true si el code es de un sub-ítem sintético de un compuesto (no se puede pedir suelto). */
declare function isCompoundSubItemCode(code: unknown): boolean;
/** true si el estudio es un sub-ítem sintético (ver `isCompoundSubItemCode`). */
declare function isCompoundSubItem(study: Pick<StudyLike, 'code'> | null | undefined): boolean;
/** Etiqueta "code - name", como en DEVA. Sin code: el nombre (y si no, el id). */
declare function studyLabel(study: StudyLike): string;
/** Texto donde se busca un estudio: code, nombre y abreviatura. */
declare function studySearchText(study: StudyLike): unknown[];
/** ¿El estudio coincide con la consulta? Code, nombre o abreviatura, multi-término. */
declare function matchStudy(study: StudyLike, query: string): boolean;
declare function studyToOption<T extends StudyLike>(study: T): SearchOption<T>;
/**
 * Lo que hace Enter en el selector de estudios de DEVA (findStudyByCode):
 * acepta "475" o "475 - lo que sea" y busca por code exacto. Si el code se
 * repite devuelve el primero, así que conviene pasarle la lista ya sin
 * sub-ítems.
 */
declare function findStudyByExactCode<T extends StudyLike>(studies: readonly T[] | null | undefined, rawValue: string): T | undefined;
/** Etiqueta del perfil, como en DEVA: "shortcutCode - name". */
declare function profileLabel(profile: StudyProfileLike<unknown>): string;
/** ¿El perfil coincide con la consulta? (atajo o nombre, multi-término). */
declare function matchProfile(profile: StudyProfileLike<unknown>, query: string): boolean;
declare function profileToOption<P extends StudyProfileLike<unknown>>(profile: P): SearchOption<P>;
/**
 * Perfil por atajo exacto, como en DEVA: el texto es el `shortcutCode` o la
 * etiqueta completa "shortcutCode - name".
 */
declare function findProfileByShortcut<P extends StudyProfileLike<unknown>>(profiles: readonly P[] | null | undefined, rawValue: string): P | undefined;
type ExactStudyMatch<T, P> = {
    kind: 'profile';
    profile: P;
} | {
    kind: 'study';
    study: T;
};
/**
 * Enter en el selector de estudios: primero el perfil (atajo), después el
 * estudio por code exacto. Es el mismo orden que DEVA hoy: un perfil cuyo
 * atajo coincide con un code le gana al estudio.
 */
declare function resolveStudyInput<T extends StudyLike, P extends StudyProfileLike<unknown>>(rawValue: string, studies: readonly T[] | null | undefined, profiles?: readonly P[] | null): ExactStudyMatch<T, P> | null;

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

/**
 * Forma mínima de un médico. Acepta el Doctor de DEVA
 * (`{ id, name, lastName, professionalRegistration }`), lo que expone
 * `useDoctor()` en DEVA (`{ id, doctor: 'matrícula - nombre apellido' }`) y el
 * `WardDoctorOption` del portal.
 */
interface DoctorLike {
    id?: string;
    _id?: string;
    name?: string | null;
    lastName?: string | null;
    professionalRegistration?: number | string | null;
    /** Etiqueta ya armada por el Context de DEVA. */
    doctor?: string | null;
}
/** Etiqueta de DEVA: "matrícula - nombre apellido". Si ya viene armada (`doctor`), la usa. */
declare function doctorLabel(doctor: DoctorLike): string;
/** Etiqueta del portal: "Apellido, Nombre · MP matrícula" ("Sin nombre" si no hay nombre). */
declare function doctorLabelLastNameFirst(doctor: DoctorLike): string;
/** Texto donde se busca: apellido, nombre, matrícula (y la etiqueta armada de DEVA). */
declare function doctorSearchText(doctor: DoctorLike): unknown[];
/** Multi-término: "Gomez Juan", "Juan Gómez" o "1234 gomez" encuentran al mismo médico. */
declare function matchDoctor(doctor: DoctorLike, query: string): boolean;
declare function doctorToOption<T extends DoctorLike>(doctor: T): SearchOption<T>;
/**
 * Lo que se le manda al servidor cuando el servidor busca un solo término
 * (el portal: regex sobre name o lastName): el término más largo. El resto se
 * filtra en el cliente.
 */
declare const doctorRemoteQuery: typeof longestTerm;

type DoctorSearchOptions<T extends DoctorLike> = EntitySearchOptions<T>;
/**
 * Buscador de médicos por apellido, nombre y matrícula, con varios términos.
 * En modo servidor manda el término más largo y filtra el resto en el cliente
 * (se puede cambiar con `remoteQuery` / `refineRemote`).
 */
declare function useDoctorSearch<T extends DoctorLike = DoctorLike>(options: DoctorSearchOptions<T>): SearchResult<T>;

/** Forma mínima de un diagnóstico (DEVA `{ id, code, name }`, portal `WardDiagnosisOption`). */
interface DiagnosisLike {
    id?: string;
    _id?: string;
    code?: string | null;
    name?: string | null;
}
/** "code - name" (si falta uno, el otro; si faltan los dos, el id). */
declare function diagnosisLabel(diagnosis: DiagnosisLike): string;
/**
 * Clave para comparar codes de diagnóstico (CIE10): sin acentos, en
 * mayúsculas y sólo letras y números. "a09.9" y "A099" dan "A099". Es la
 * misma normalización que usa Orden digital en DEVA.
 */
declare function normalizeDiagnosisCode(code: string | null | undefined): string;
declare function diagnosisSearchText(diagnosis: DiagnosisLike): unknown[];
/** Code ignorando los puntos ("A099" encuentra "A09.9") y nombre, multi-término. */
declare function matchDiagnosis(diagnosis: DiagnosisLike, query: string): boolean;
/** Diagnóstico por code exacto, ignorando puntos y mayúsculas. */
declare function findDiagnosisByCode<T extends DiagnosisLike>(diagnoses: readonly T[] | null | undefined, code: string | null | undefined): T | undefined;
declare function diagnosisToOption<T extends DiagnosisLike>(diagnosis: T): SearchOption<T>;

type DiagnosisSearchOptions<T extends DiagnosisLike> = EntitySearchOptions<T>;
type DiagnosisSearchResult<T> = SearchResult<T> & {
    /** Diagnóstico por code exacto, ignorando puntos (lista local o resultados del servidor). */
    findByCode: (code: string | null | undefined) => T | undefined;
};
/** Buscador de diagnósticos por code (ignorando puntos) y nombre. */
declare function useDiagnosisSearch<T extends DiagnosisLike = DiagnosisLike>(options: DiagnosisSearchOptions<T>): DiagnosisSearchResult<T>;

/**
 * Forma mínima de una obra social. Acepta lo que devuelve
 * `/insurances/all-codes-names` (`{ id, code, abbreviation, name }`) y lo que
 * expone `useInsurance()` en DEVA (`{ id, insurance: 'code - abreviatura', code, name }`).
 */
interface InsuranceLike {
    id?: string;
    _id?: string;
    code?: number | string | null;
    abbreviation?: string | null;
    name?: string | null;
    /** Etiqueta ya armada por el Context de DEVA. */
    insurance?: string | null;
}
type InsuranceOption<T> = SearchOption<T> & {
    /** Suspendida hoy en el laboratorio: sigue siendo elegible (la orden pasa a particular). */
    suspended: boolean;
};
/** "code - abreviatura", como en Nueva orden. Si ya viene armada (`insurance`), la usa. */
declare function insuranceLabel(insurance: InsuranceLike): string;
declare function insuranceSearchText(insurance: InsuranceLike): unknown[];
/** Code, abreviatura o nombre, multi-término. */
declare function matchInsurance(insurance: InsuranceLike, query: string): boolean;
/** Igual que `isInsuranceSuspended` del Context de DEVA: compara el code numérico. */
declare function isInsuranceSuspended(insurance: Pick<InsuranceLike, 'code'> | null | undefined, suspendedCodes: readonly number[] | null | undefined): boolean;
declare function insuranceToOption<T extends InsuranceLike>(insurance: T): SearchOption<T>;

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

/**
 * Paciente: un DNI suelto (lo que da `usePatientsDNI()` en DEVA, string o
 * number) o un objeto (`Patient` de DEVA con `_id` y `DNI`, o el
 * `PatientDniMatch` del portal con `patientId`).
 */
type PatientLike = string | number | {
    id?: string;
    _id?: string;
    patientId?: string;
    DNI?: number | string | null;
    dni?: number | string | null;
    name?: string | null;
    lastName?: string | null;
};
/** DNI del paciente como texto ('' si no tiene). */
declare function patientDni(patient: PatientLike): string;
/** Id del paciente: `id`/`_id`/`patientId`; para un DNI suelto, el DNI. */
declare function patientId(patient: PatientLike): string;
/** "Apellido, Nombre" (vacío si no hay). */
declare function patientFullName(patient: PatientLike): string;
/** La etiqueta es el DNI, como en DEVA. El nombre va en `secondary`. */
declare function patientLabel(patient: PatientLike): string;
declare function patientSearchText(patient: PatientLike): unknown[];
/** DNI (contiene, como el filtro de MUI) y, si hay, apellido y nombre. */
declare function matchPatient(patient: PatientLike, query: string): boolean;
declare function patientToOption<T extends PatientLike>(patient: T): SearchOption<T>;

/**
 * Escaneo del DNI argentino con lector de código de barras. Copia de la
 * lógica real de DEVA (`renderer/utils/dniParser.utils.ts` parseDniData y
 * `pages/newOrder/libs/handleScanChanges.ts`), sin date-fns: la fecha se
 * interpreta igual que `parse(fecha, 'dd/MM/yyyy', new Date())`.
 */
interface PatientFromDni {
    dni: number;
    lastName: string;
    name: string;
    gender: string;
    dateOfBirth: string | null;
    rawString: string;
}
/** Resultado de `parseDniScan`: el DNI, y los datos del paciente si el formato se reconoció. */
interface DniScanResult {
    dni: number;
    patient: PatientFromDni | null;
}
/** "DD/MM/YYYY" → ISO (medianoche local), o null. Equivale a date-fns parse 'dd/MM/yyyy'. */
declare function parseDniDate(dateStr: string | null | undefined): string | null;
/** true si lo tipeado es un escaneo: empieza con '!' (así viene configurado el lector). */
declare function isDniScan(value: string | null | undefined): boolean;
/** Igual a parseDniData de DEVA: DNI nuevo (PDF417) o viejo, separados por '@'. */
declare function parseDniData(rawData: string): PatientFromDni | null;
/**
 * Lo que hace DEVA en el blur cuando el DNI empieza con '!'
 * (handleChangeScan): si el formato se reconoce devuelve el DNI y los datos;
 * si no, se queda con los dígitos cuando son 7 u 8; si no, null.
 */
declare function parseDniScan(rawData: string): DniScanResult | null;

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

/** Forma mínima de un bioquímico (`BiochemistData` de DEVA). */
interface BiochemistLike {
    id?: string;
    _id?: string;
    name?: string | null;
    lastName?: string | null;
    professionalRegistration?: number | string | null;
    DNI?: number | string | null;
}
/** "matrícula - nombre apellido", como en DEVA. */
declare function biochemistLabel(biochemist: BiochemistLike): string;
declare function biochemistSearchText(biochemist: BiochemistLike): unknown[];
/** Matrícula, nombre, apellido o DNI, multi-término. */
declare function matchBiochemist(biochemist: BiochemistLike, query: string): boolean;
declare function biochemistToOption<T extends BiochemistLike>(biochemist: T): SearchOption<T>;

type BiochemistSearchOptions<T extends BiochemistLike> = EntitySearchOptions<T>;
/** Buscador de bioquímicos por matrícula, nombre, apellido y DNI. Compara por id, no por etiqueta. */
declare function useBiochemistSearch<T extends BiochemistLike = BiochemistLike>(options: BiochemistSearchOptions<T>): SearchResult<T>;

/** Forma mínima de una planilla de trabajo (`/work-sheet/all-work-sheets`: `{ id, name, code }`). */
interface WorksheetLike {
    id?: string;
    _id?: string;
    code?: number | string | null;
    name?: string | null;
}
/** "code - name", como en DEVA. */
declare function worksheetLabel(worksheet: WorksheetLike): string;
declare function worksheetSearchText(worksheet: WorksheetLike): unknown[];
/** Code o nombre, multi-término. */
declare function matchWorksheet(worksheet: WorksheetLike, query: string): boolean;
/** Planilla por code exacto (para los sitios que guardan el code, como Imprimir planillas). */
declare function findWorksheetByCode<T extends WorksheetLike>(worksheets: readonly T[] | null | undefined, code: number | string | null | undefined): T | undefined;
declare function worksheetToOption<T extends WorksheetLike>(worksheet: T): SearchOption<T>;

type WorksheetSearchOptions<T extends WorksheetLike> = EntitySearchOptions<T>;
type WorksheetSearchResult<T> = SearchResult<T> & {
    /** Planilla por code exacto (lista local o resultados del servidor). */
    findByCode: (code: number | string | null | undefined) => T | undefined;
};
/** Buscador de planillas de trabajo ("code - name"). Compara por id. */
declare function useWorksheetSearch<T extends WorksheetLike = WorksheetLike>(options: WorksheetSearchOptions<T>): WorksheetSearchResult<T>;

export { type BiochemistLike, type BiochemistSearchOptions, COMPOUND_SUBITEM_CODE_REGEX, type DiagnosisLike, type DiagnosisSearchOptions, type DiagnosisSearchResult, type DniScanResult, type DoctorLike, type DoctorSearchOptions, type EntitySearchOptions, type ExactStudyMatch, type InsuranceLike, type InsuranceOption, type InsuranceSearchOptions, type InsuranceSearchResult, type LocalSource, type PatientFromDni, type PatientLike, type PatientSearchOptions, type PatientSearchResult, type RemoteSearchFn, type RemoteSource, type SearchConfig, type SearchOption, type SearchResult, type SearchSource, type StudyLike, type StudyProfileLike, type StudySearchOptions, type StudySearchResult, type WorksheetLike, type WorksheetSearchOptions, type WorksheetSearchResult, biochemistLabel, biochemistSearchText, biochemistToOption, buildHaystack, diagnosisLabel, diagnosisSearchText, diagnosisToOption, doctorLabel, doctorLabelLastNameFirst, doctorRemoteQuery, doctorSearchText, doctorToOption, entityId, findDiagnosisByCode, findProfileByShortcut, findStudyByExactCode, findWorksheetByCode, insuranceLabel, insuranceSearchText, insuranceToOption, isCompoundSubItem, isCompoundSubItemCode, isDniScan, isInsuranceSuspended, isRemoteSource, longestTerm, matchBiochemist, matchDiagnosis, matchDoctor, matchInsurance, matchPatient, matchProfile, matchStudy, matchText, matchWorksheet, matchesAllTerms, normalizeDiagnosisCode, normalizeText, parseDniData, parseDniDate, parseDniScan, patientDni, patientFullName, patientId, patientLabel, patientSearchText, patientToOption, profileLabel, profileToOption, resolveStudyInput, splitTerms, studyLabel, studySearchText, studyToOption, useBiochemistSearch, useDiagnosisSearch, useDoctorSearch, useInsuranceSearch, useLocalSearch, usePatientSearch, useRemoteSearch, useSearch, useStudySearch, useWorksheetSearch, worksheetLabel, worksheetSearchText, worksheetToOption };
