import * as react from 'react';
import { ReactNode, ButtonHTMLAttributes, SVGProps, InputHTMLAttributes, Ref, FocusEvent, KeyboardEvent } from 'react';
import { a as SearchOption, B as BiochemistLike, e as DiagnosisLike, D as DoctorLike, I as InsuranceLike, P as PatientLike, g as DniScanResult, c as StudyLike, d as StudyProfileLike, E as ExactStudyMatch, W as WorksheetLike } from './worksheet-jTbuVCv_.cjs';

interface AlertProps {
    tone?: 'error' | 'warn' | 'ok';
    children: ReactNode;
    className?: string;
}
/** Mensaje en bloque. Los errores se anuncian solos a lectores de pantalla (`role="alert"`). */
declare function Alert({ tone, children, className }: AlertProps): react.JSX.Element;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** `solid`: acción principal. `quiet`: acción secundaria sin fondo. */
    variant?: 'solid' | 'quiet';
    /** Muestra el spinner en lugar del texto y bloquea el botón. */
    loading?: boolean;
    /** Texto del spinner para lectores de pantalla. */
    loadingLabel?: string;
    /** Ocupa todo el ancho del contenedor. */
    fullWidth?: boolean;
}
/** Botón de la familia DEVA. Por defecto es `type="button"`: el envío se pide con `type="submit"`. */
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

type ColorMode = 'light' | 'dark';
interface ColorModeSwitchProps {
    mode: ColorMode;
    /** Recibe el modo nuevo. Aplicarlo y guardarlo (navegador, cuenta) es de la app. */
    onChange: (next: ColorMode) => void;
    /** Texto de la etiqueta y del lector de pantalla. */
    label?: string;
    /** Deja la etiqueta sólo para lectores de pantalla (barra azul, pantallas chicas). */
    hideLabel?: boolean;
    disabled?: boolean;
    className?: string;
}
/** Switch sol/luna para alternar entre modo claro y oscuro. */
declare function ColorModeSwitch({ mode, onChange, label, hideLabel, disabled, className, }: ColorModeSwitchProps): react.JSX.Element;

type IconProps = SVGProps<SVGSVGElement>;
declare function EyeIcon({ off, ...props }: IconProps & {
    off?: boolean;
}): react.JSX.Element;
declare function UserIcon(props: IconProps): react.JSX.Element;
declare function LockIcon(props: IconProps): react.JSX.Element;
declare function SearchIcon(props: IconProps): react.JSX.Element;
declare function CloseIcon(props: IconProps): react.JSX.Element;
declare function ChevronRightIcon(props: IconProps): react.JSX.Element;
declare function ChevronDownIcon(props: IconProps): react.JSX.Element;
declare function FilterIcon(props: IconProps): react.JSX.Element;
declare function UploadIcon(props: IconProps): react.JSX.Element;
declare function WarnIcon(props: IconProps): react.JSX.Element;

interface FileDropzoneProps {
    /** Nombre para lectores de pantalla (el del input de archivo). */
    label: string;
    /** Tipo MIME aceptado, por ejemplo `application/pdf`. */
    accept: string;
    /** Extensión aceptada si el sistema no informa el tipo, por ejemplo `.pdf`. */
    extension?: string;
    /** Se llama con el archivo elegido o soltado. */
    onFile: (file: File) => void;
    /** Se llama si lo soltado no es del tipo aceptado. */
    onReject?: (message: string) => void;
    rejectMessage?: string;
    /** Leyendo el archivo: se ve el progreso y no se acepta otro. */
    busy?: boolean;
    title?: string;
    hint?: ReactNode;
    busyTitle?: string;
    className?: string;
}
/**
 * Zona para elegir o arrastrar un archivo. Toda la zona es un botón (clic,
 * Enter o Espacio abren el selector del sistema) y también acepta que se
 * suelte el archivo encima.
 */
declare function FileDropzone({ label, accept, extension, onFile, onReject, rejectMessage, busy, title, hint, busyTitle, className, }: FileDropzoneProps): react.JSX.Element;

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    /** Nombre para lectores de pantalla ("Buscar paciente"). */
    label: string;
    clearLabel?: string;
    /** Clases del contenedor (ancho, margen). */
    wrapperClassName?: string;
}
/** Buscador de las pantallas de lista: lupa, sin etiqueta flotante y con «borrar» cuando hay texto. */
declare const SearchField: react.ForwardRefExoticComponent<SearchFieldProps & react.RefAttributes<HTMLInputElement>>;

interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}
interface SegmentedControlProps<T extends string> {
    /** Nombre del grupo para lectores de pantalla ("Estado"). */
    label: string;
    value: T;
    options: readonly SegmentedOption<T>[];
    onChange: (value: T) => void;
    className?: string;
}
/**
 * Una opción entre pocas, siempre a la vista (en vez de un desplegable). La
 * elegida se levanta sobre el fondo; las demás quedan en gris.
 */
declare function SegmentedControl<T extends string>({ label, value, options, onChange, className, }: SegmentedControlProps<T>): react.JSX.Element;

interface StatusDotProps {
    tone?: 'ok' | 'warn' | 'danger' | 'muted';
    children: ReactNode;
    className?: string;
}
/** Estado en una palabra con un punto de color. El color acompaña al texto, nunca lo reemplaza. */
declare function StatusDot({ tone, children, className }: StatusDotProps): react.JSX.Element;

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** Clases del contenedor (ancho, margen). */
    wrapperClassName?: string;
    showLabel?: string;
    hideLabel?: string;
}
/**
 * Campo de contraseña con el ojo para mostrar u ocultar lo escrito. El botón no
 * envía el formulario, queda fuera del orden de tabulación y su etiqueta dice
 * lo que va a pasar al tocarlo.
 */
declare const PasswordInput: react.ForwardRefExoticComponent<PasswordInputProps & react.RefAttributes<HTMLInputElement>>;

interface SpinnerProps {
    /** Texto para lectores de pantalla ("Ingresando"). */
    label?: string;
    className?: string;
}
/** Indicador de carga circular. Hereda el color del texto (`currentColor`). */
declare function Spinner({ label, className }: SpinnerProps): react.JSX.Element;

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Etiqueta flotante: vive dentro del borde y sube al enfocar o al tener valor. */
    label: string;
    /** Ícono a la izquierda (ya dimensionado, por ejemplo `<UserIcon />`). */
    startIcon?: ReactNode;
    /** Contenido a la derecha, dentro del borde (por ejemplo un botón). */
    endAdornment?: ReactNode;
    /** Texto de ayuda o error debajo del campo. */
    helper?: string;
    /** `warn`: aviso (Bloq Mayús). `error`: el valor no es válido. */
    helperTone?: 'default' | 'warn' | 'error';
    /** Clases del contenedor (ancho, margen). */
    wrapperClassName?: string;
    /**
     * Versión baja (celdas de tabla, filtros): sin etiqueta flotante. La etiqueta
     * queda sólo para lectores de pantalla y el `placeholder` se ve de verdad.
     */
    compact?: boolean;
    /** Cuántos botones de ícono hay en `endAdornment` (da el lugar a la derecha). */
    endSize?: 1 | 2;
}
/**
 * Campo de texto con etiqueta flotante, como los "outlined" de MUI que usa el
 * login de DEVA. Acepta los atributos de un `<input>` y `ref`. Sin `placeholder`
 * en la versión normal: lo reemplaza la etiqueta.
 */
declare const TextField: react.ForwardRefExoticComponent<TextFieldProps & react.RefAttributes<HTMLInputElement>>;

interface TipProps {
    /** Texto de ayuda. Sin `content` se muestran sólo los hijos. */
    content?: ReactNode;
    children: ReactNode;
    className?: string;
}
/**
 * Tooltip con texto de ayuda: aparece al pasar el mouse, al enfocar con teclado
 * y al tocar (en móvil no hay hover). Se cierra al salir, al perder el foco y
 * con Escape.
 */
declare function Tip({ content, children, className }: TipProps): react.JSX.Element;

interface AuthLayoutProps {
    /** Contenido del panel de marca (pantallas anchas): normalmente un `BrandLockup stacked tone="white"`. */
    brand: ReactNode;
    /** Marca chica que reemplaza al panel en pantallas angostas: un `BrandLockup tone="blue"`. */
    mobileBrand?: ReactNode;
    /** Frase bajo la marca en el panel (qué es el producto). */
    tagline?: string;
    /** Texto al pie del panel ("Versión 1.3.13", "Un producto de Certia"). */
    panelFooter?: string;
    /** Esquina superior derecha del formulario: el `ColorModeSwitch` de la app. */
    topRight?: ReactNode;
    title: string;
    subtitle?: string;
    /** Formulario más ancho (por ejemplo, el primer ingreso de DEVA con 10 campos). */
    wide?: boolean;
    children: ReactNode;
}
/**
 * Plantilla de toda pantalla sin sesión (login, primer ingreso, recuperar
 * contraseña): panel de marca con degradado a la izquierda y formulario a la
 * derecha. En pantallas angostas el panel desaparece y queda la marca chica
 * arriba del formulario. La plantilla no sabe de autenticación: cada app le
 * pasa su marca, su selector de modo y el contenido.
 */
declare function AuthLayout({ brand, mobileBrand, tagline, panelFooter, topRight, title, subtitle, wide, children, }: AuthLayoutProps): react.JSX.Element;

interface BrandLockupProps {
    /** Nombre del producto que va después del logo ("Pedidos", "Nexus"…). Sin nombre, queda sólo el logo (DEVA de escritorio). */
    product?: string;
    /** 'white' sobre la barra o fondos de color, 'blue' sobre fondos claros. */
    tone: 'white' | 'blue';
    /** Las dos versiones del logo oficial (se importan de `deva-design/assets`). */
    logos: {
        blue: string;
        white: string;
    };
    /** Descriptor debajo del logo, alineado a la derecha (panel grande del login). */
    stacked?: boolean;
    className?: string;
    /** Tamaño del logo, por ejemplo `h-7`. */
    logoClassName?: string;
    /** Tamaño del texto, por ejemplo `text-lg`. */
    textClassName?: string;
}
/**
 * Lockup de la familia DEVA: logo oficial | nombre del producto. Cada producto
 * es un módulo de DEVA, no una marca aparte: se distingue sólo por el nombre.
 */
declare function BrandLockup({ product, tone, logos, stacked, className, logoClassName, textClassName, }: BrandLockupProps): react.JSX.Element;

interface DataTableColumn<T> {
    key: string;
    header: ReactNode;
    /** Qué se dibuja en la celda de cada fila. Las celdas de dos líneas son `<Cell primary secondary />`. */
    cell: (row: T) => ReactNode;
    /** Ancho de la columna (clase de Tailwind, por ejemplo `w-48`). */
    className?: string;
}
interface DataTableProps<T> {
    columns: readonly DataTableColumn<T>[];
    rows: readonly T[];
    rowKey: (row: T) => string;
    /** Si está, la fila es navegable con mouse y con Enter, y muestra la flecha al final. */
    onRowClick?: (row: T) => void;
    /** Qué se ve si no hay filas (mensaje y, si hace falta, «Limpiar filtros»). */
    empty?: ReactNode;
    /** Mientras carga se ve una línea fina arriba, sin mover la tabla. */
    loading?: boolean;
    /** Pie de la tabla (paginado). */
    footer?: ReactNode;
    /** Nombre de la tabla para lectores de pantalla. */
    label: string;
}
/** Celda de dos líneas: lo principal en negrita y el detalle debajo. */
declare function Cell({ primary, secondary }: {
    primary: ReactNode;
    secondary?: ReactNode;
}): react.JSX.Element;
/** Tabla sobre una sola superficie con un borde fino: sin sombra ni cajas anidadas. */
declare function DataTable<T>({ columns, rows, rowKey, onRowClick, empty, loading, footer, label, }: DataTableProps<T>): react.JSX.Element;

interface FilterToolbarProps {
    /** El `SearchField` de la pantalla. */
    search: ReactNode;
    /** La opción principal, siempre a la vista (`SegmentedControl`). */
    primaryFilter?: ReactNode;
    /** Filtros secundarios: quedan plegados detrás del botón «Filtros». */
    moreFilters?: ReactNode;
    /** Cuántos de los filtros plegados están en uso (se ve en el botón). */
    activeMoreFilters?: number;
    onClearMoreFilters?: () => void;
    filtersLabel?: string;
    clearLabel?: string;
}
/**
 * Barra de arriba de una lista: buscador, la opción principal a la vista y,
 * plegados, el resto de los filtros. Los plegados avisan con un número cuántos
 * están en uso, para que no haya un filtro activo que no se vea.
 */
declare function FilterToolbar({ search, primaryFilter, moreFilters, activeMoreFilters, onClearMoreFilters, filtersLabel, clearLabel, }: FilterToolbarProps): react.JSX.Element;

interface ListPageProps {
    title: string;
    subtitle?: string;
    /** Acciones principales de la pantalla (arriba a la derecha). */
    actions?: ReactNode;
    children: ReactNode;
}
/**
 * Marco de las pantallas de lista: sin banner ni caja alrededor. El título va
 * sobre el fondo de la página, ocupa todo el ancho disponible y el contenido
 * se apoya en superficies propias (`FilterToolbar`, `DataTable`).
 */
declare function ListPage({ title, subtitle, actions, children }: ListPageProps): react.JSX.Element;

interface LoginCredentials {
    username: string;
    password: string;
}
interface LoginFormProps {
    /** Se llama con usuario (sin espacios en los bordes) y contraseña. Si devuelve una promesa, el botón queda cargando hasta que termine. */
    onSubmit: (credentials: LoginCredentials) => void | Promise<void>;
    /** Error de la app (credenciales incorrectas, sin conexión…). */
    error?: string | null;
    /** Forzar el estado de carga desde afuera (si la app maneja su propio `loading`). */
    loading?: boolean;
    usernameLabel?: string;
    passwordLabel?: string;
    submitLabel?: string;
    loadingLabel?: string;
    /** Mensaje cuando falta usuario o contraseña; el formulario no llama a `onSubmit`. */
    requiredMessage?: string;
    /** Enlace "¿Olvidaste tu contraseña?" de la app (un `<Link>` del router, por ejemplo), alineado a la derecha. */
    forgotPassword?: ReactNode;
    /** Texto de ayuda bajo la contraseña. */
    passwordHint?: ReactNode;
    /** Contenido debajo del botón (ayuda, enlaces). */
    footer?: ReactNode;
}
/**
 * Formulario de ingreso de la familia DEVA: usuario, contraseña (con ojo y aviso
 * de Bloq Mayús), error y botón con carga. Pensado para ir dentro de
 * `AuthLayout`. No sabe de redes ni sesiones: la app resuelve `onSubmit`.
 */
declare function LoginForm({ onSubmit, error, loading, usernameLabel, passwordLabel, submitLabel, loadingLabel, requiredMessage, forgotPassword, passwordHint, footer, }: LoginFormProps): react.JSX.Element;

interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'endAdornment'> {
    showLabel?: string;
    hideLabel?: string;
    /** Aviso cuando el teclado tiene Bloq Mayús activado. */
    capsLockMessage?: string;
}
/**
 * Contraseña con etiqueta flotante: candado, ojo para mostrar u ocultar y aviso
 * de Bloq Mayús. Se arma con `TextField`; para formularios densos, sin etiqueta
 * flotante, está el primitivo `PasswordInput`.
 */
declare const PasswordField: react.ForwardRefExoticComponent<PasswordFieldProps & react.RefAttributes<HTMLInputElement>>;

/** Por qué cambia el texto del input: lo tipeó la persona, lo puso el componente (al elegir o salir) o lo borró. */
type InputChangeReason = 'input' | 'reset' | 'clear';
/**
 * Texto del input y texto con el que filtra el hook de búsqueda. Cuando el
 * componente pone la etiqueta del valor elegido (reason 'reset') no se filtra
 * por ella: así al abrir la lista se ven todas las opciones.
 *
 * Es el mismo comportamiento que `useSkinText` de las pieles MUI de DEVA.
 */
declare function useComboboxText(options?: {
    /** Texto libre que viene de afuera (freeSolo controlado). */
    freeText?: string;
    /** Se llama sólo cuando la persona tipea o borra (no en 'reset'). */
    onFreeTextChange?: (text: string) => void;
}): {
    text: string;
    filterText: string;
    setText: (value: string, filter?: boolean) => void;
    onHookInput: (value: string) => void;
    onInputChange: (value: string, reason: InputChangeReason) => void;
};

/** Lo que el hook de búsqueda le da a la base. */
interface ComboboxSearch<T> {
    options: SearchOption<T>[];
    getOptionById: (id: string | null | undefined) => SearchOption<T> | undefined;
}
/** Atributos de campo que comparten todos los autocompletes. */
interface ComboboxFieldProps {
    label: string;
    disabled?: boolean;
    /** Marca el campo con error y muestra `helperText` en rojo. */
    error?: boolean;
    helperText?: string;
    placeholder?: string;
    /** `sm`: versión baja para tablas y filtros (la etiqueta queda sólo para lectores de pantalla). */
    size?: 'md' | 'sm';
    required?: boolean;
    name?: string;
    id?: string;
    inputRef?: Ref<HTMLInputElement>;
    autoFocus?: boolean;
    /** Ícono al principio del input. */
    startIcon?: ReactNode;
    /** Muestra el texto de carga mientras la lista no llegó. */
    loading?: boolean;
    noOptionsText?: ReactNode;
    loadingText?: ReactNode;
    /** Ancho mínimo (px) del desplegable: en campos angostos evita que las opciones largas se partan palabra por palabra. */
    listboxMinWidth?: number;
    /** Clases del contenedor (ancho, margen). */
    className?: string;
}
interface ComboboxProps<T> extends ComboboxFieldProps {
    search: ComboboxSearch<T>;
    /** Texto del input (lo maneja `useComboboxText`). */
    text: string;
    onInputChange: (value: string, reason: InputChangeReason) => void;
    /** Id de la opción elegida. */
    value: string | null | undefined;
    /** Se llama sólo al elegir o borrar una opción (id `null`), nunca mientras se tipea. */
    onChange: (id: string | null, raw?: T) => void;
    /** Deja escribir texto libre; el texto se confirma con `onCommitText` (Enter) o desde `onBlur`. */
    freeSolo?: boolean;
    /** freeSolo: si el valor no está entre las opciones, se muestra tal cual (por ejemplo un DNI nuevo). */
    showUnknownValue?: boolean;
    /** freeSolo: Enter con texto que no es una opción. */
    onCommitText?: (text: string) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    /** Muestra la `secondary` de cada opción (por ejemplo "Suspendida" o el nombre del paciente). */
    showSecondary?: boolean;
    inputMode?: 'numeric' | 'text' | 'search';
    /** Teclas sobre el campo (por ejemplo, elegir por código exacto). */
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    /** Algo más al final del input, antes de los botones (un spinner). */
    endAdornment?: ReactNode;
    /** Texto del input con la opción ya elegida, si tiene que ser distinto de la etiqueta de la lista. */
    getInputLabel?: (option: SearchOption<T>) => string;
    /**
     * Enter mientras se está buscando (texto que no es la etiqueta del elegido):
     * no envía el formulario. Los autocompletes con su propio manejo del Enter
     * (estudio, planilla) lo apagan.
     */
    preventEnterWhileSearching?: boolean;
}
/**
 * Base de todos los autocompletes: un campo con lista desplegable que se
 * comporta como el Autocomplete de MUI que usa DEVA.
 *
 * - El valor es el **id** de la opción; se compara por id, nunca por etiqueta.
 * - Mientras se tipea no se llama a `onChange`: el id cambia sólo al elegir o
 *   al borrar todo el texto.
 * - Sin `freeSolo` no se guarda nunca el texto tipeado: al salir del campo
 *   vuelve la etiqueta de lo elegido.
 * - Teclado: flechas, Inicio/Fin, RePág/AvPág, Enter elige la opción resaltada,
 *   Escape cierra (sin cerrar el diálogo de afuera).
 */
declare function Combobox<T>({ search, text, onInputChange, value, onChange, freeSolo, showUnknownValue, onCommitText, onBlur, showSecondary, inputMode, onKeyDown, endAdornment, getInputLabel, preventEnterWhileSearching, label, disabled, error, helperText, placeholder, size, required, name, id, inputRef, autoFocus, startIcon, loading, noOptionsText, loadingText, listboxMinWidth, className, }: ComboboxProps<T>): react.JSX.Element;

interface BiochemistAutocompleteProps<T extends BiochemistLike = BiochemistLike> extends ComboboxFieldProps {
    /** Id del bioquímico elegido. */
    value: string | null | undefined;
    /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
    onChange: (id: string | null, raw?: T) => void;
    /** Bioquímicos del laboratorio. */
    biochemists: readonly T[] | null | undefined;
}
/**
 * Autocomplete de bioquímico (misma lógica que en DEVA).
 *
 * - El valor es el **id**. Dos bioquímicos con la misma etiqueta "matrícula - nombre apellido"
 *   son dos opciones.
 * - Busca por matrícula, nombre, apellido y DNI, con varios términos.
 * - Mientras se tipea `value` no cambia y el texto tipeado no se guarda nunca.
 */
declare function BiochemistAutocomplete<T extends BiochemistLike = BiochemistLike>(props: BiochemistAutocompleteProps<T>): react.JSX.Element;

interface DiagnosisAutocompleteProps<T extends DiagnosisLike = DiagnosisLike> extends ComboboxFieldProps {
    /** Id del diagnóstico elegido. */
    value: string | null | undefined;
    /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
    onChange: (id: string | null, raw?: T) => void;
    /** Lista de diagnósticos. */
    diagnoses: readonly T[] | null | undefined;
    /** Deja escribir texto libre (Orden digital). */
    freeSolo?: boolean;
    /** freeSolo: texto que pone el padre (por ejemplo el CIE10 de la receta). */
    freeText?: string;
    /** freeSolo: texto tipeado, en vivo. */
    onFreeTextChange?: (text: string) => void;
    /** Enter o Tab con un código exacto elige ese diagnóstico. */
    selectByExactCode?: boolean;
}
/**
 * Autocomplete de diagnóstico (misma lógica que en DEVA).
 *
 * - El valor es el **id** del diagnóstico; nunca se parte "code - name" por '-'.
 * - Busca por code ignorando los puntos ("a099" encuentra A09.9) y por nombre.
 * - Con `freeSolo` el texto tipeado se avisa con `onFreeTextChange` y `freeText` lo puede
 *   cambiar el padre. Sin `freeSolo` el texto tipeado no se guarda nunca.
 */
declare function DiagnosisAutocomplete<T extends DiagnosisLike = DiagnosisLike>(props: DiagnosisAutocompleteProps<T>): react.JSX.Element;

interface DoctorAutocompleteProps<T extends DoctorLike = DoctorLike> extends ComboboxFieldProps {
    /** Id del médico elegido. */
    value: string | null | undefined;
    /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
    onChange: (id: string | null, raw?: T) => void;
    /** Lista de médicos. */
    doctors: readonly T[] | null | undefined;
    /** Enter o Tab con una matrícula exacta elige ese médico. */
    selectByExactCode?: boolean;
}
/**
 * Autocomplete de médico (misma lógica que en DEVA).
 *
 * - El valor es el **id** del médico. Dos médicos con la misma etiqueta son dos opciones.
 * - Busca por apellido, nombre y matrícula, con varios términos en cualquier orden
 *   ("gomez juan" encuentra "1234 - Juan Gómez").
 * - Mientras se tipea `value` no cambia y el texto tipeado no se guarda nunca.
 */
declare function DoctorAutocomplete<T extends DoctorLike = DoctorLike>(props: DoctorAutocompleteProps<T>): react.JSX.Element;

interface InsuranceAutocompleteProps<T extends InsuranceLike = InsuranceLike> extends ComboboxFieldProps {
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
/**
 * Autocomplete de obra social (misma lógica que en DEVA).
 *
 * - El valor es el **id**; se compara por id, nunca por la etiqueta "code - abreviatura".
 * - Mientras se tipea `value` no cambia.
 * - Busca por code, abreviatura y nombre. Las suspendidas se ofrecen igual, marcadas
 *   «Suspendida» (la orden pasa a particular).
 * - Escribir el número y Enter (o Tab) elige la coincidencia exacta.
 */
declare function InsuranceAutocomplete<T extends InsuranceLike = InsuranceLike>(props: InsuranceAutocompleteProps<T>): react.JSX.Element;

interface PatientDniAutocompleteProps<T extends PatientLike = PatientLike> extends ComboboxFieldProps {
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
declare function PatientDniAutocomplete<T extends PatientLike = PatientLike>(props: PatientDniAutocompleteProps<T>): react.JSX.Element;

type AnyProfile = StudyProfileLike<any>;
/** Herramientas para el Enter (code exacto / atajo de perfil). */
interface StudyEnterTools<T extends StudyLike> {
    /** Estudio por code exacto ("475" o "475 - ..."). */
    findByExactCode: (rawValue: string) => T | undefined;
    /** Primero el atajo de perfil y después el code exacto. */
    resolveExact: (rawValue: string) => ExactStudyMatch<T, AnyProfile> | null;
    /** Vacía el texto del input. */
    reset: () => void;
}
interface StudyAutocompleteProps<T extends StudyLike = StudyLike> extends Omit<ComboboxFieldProps, 'noOptionsText' | 'loadingText'> {
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
declare function StudyAutocomplete<T extends StudyLike = StudyLike>(props: StudyAutocompleteProps<T>): react.JSX.Element;

/** Herramientas para el Enter (code exacto). */
interface WorksheetEnterTools<T extends WorksheetLike> {
    /** Planilla por code exacto ("12"). */
    findByCode: (code: number | string | null | undefined) => T | undefined;
    /** Vacía el texto del input. */
    reset: () => void;
}
interface WorksheetAutocompleteProps<T extends WorksheetLike = WorksheetLike> extends ComboboxFieldProps {
    /** Planillas de trabajo. */
    worksheets: readonly T[] | null | undefined;
    /** Id de la planilla elegida (`null` con `clearOnSelect`). */
    value: string | null | undefined;
    /** Se llama sólo al elegir (o borrar) una opción, nunca mientras se tipea. */
    onChange: (id: string | null, raw?: T) => void;
    /** Vacía el input después de elegir (selector para agregar a una lista, como Imprimir planillas). */
    clearOnSelect?: boolean;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    /**
     * Enter en el input sin una opción resaltada, con el texto tipeado (por ejemplo "12" o lo que
     * manda un lector), para agregar por code exacto. Si se pasa, el Enter no envía el formulario.
     * Con una opción resaltada con las flechas el Enter la elige y `onEnter` no se llama.
     */
    onEnter?: (text: string, tools: WorksheetEnterTools<T>) => void;
    endAdornment?: React.ReactNode;
}
/**
 * Autocomplete de planilla de trabajo "code - name" (misma lógica que en DEVA).
 *
 * - El valor es el **id**. Los sitios que mandan o guardan el code lo toman de la planilla
 *   elegida (`raw.code`), nunca partiendo la etiqueta por " - ".
 * - Busca por code y nombre, con varios términos y sin acentos.
 */
declare function WorksheetAutocomplete<T extends WorksheetLike = WorksheetLike>(props: WorksheetAutocompleteProps<T>): react.JSX.Element;

interface DatePickerProps {
    label: string;
    /** Fecha: un ISO (como la guarda DEVA) o `YYYY-MM-DD`. Vacío o `null` = sin fecha. */
    value: string | null | undefined;
    /** Se llama con la fecha elegida o escrita completa, y con `''` al vaciar el campo. Nunca con fechas a medias. */
    onChange: (value: string) => void;
    /** `iso`: medianoche local en ISO (como DEVA). `date`: `YYYY-MM-DD`. */
    outputFormat?: 'iso' | 'date';
    /** No deja elegir días futuros en el calendario. */
    disableFuture?: boolean;
    /** No deja elegir días pasados en el calendario (hoy sí). */
    disablePast?: boolean;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    /** Ícono al principio del campo. */
    startIcon?: ReactNode;
    /** Versión baja (tablas y filtros). */
    compact?: boolean;
    /**
     * Si el campo arranca vacío, se completa con hoy. En DEVA es lo habitual, salvo en fechas donde
     * vacío es un valor real (por ejemplo la fecha de nacimiento de un internado).
     */
    autoDefaultToday?: boolean;
    id?: string;
    name?: string;
    /** Clases del contenedor (ancho, margen). */
    className?: string;
}
/**
 * Selector de fecha `DD-MM-AAAA`, igual al de DEVA: el campo se escribe por partes (día, mes, año)
 * y también se elige en un calendario.
 *
 * - Escribir: al teclear los dígitos se completa la parte y pasa a la siguiente (un día que empieza
 *   con 4 o más es `04`; un `1` espera el segundo dígito). Flechas arriba y abajo suben y bajan la
 *   parte; izquierda y derecha cambian de parte; Retroceso la vacía.
 * - Sólo se avisa con `onChange` cuando la fecha está completa y existe, o cuando se vacía todo el
 *   campo (`''`). Una fecha a medias no se avisa.
 * - `disableFuture` y `disablePast` apagan días en el calendario; escribir una fecha fuera de ese
 *   rango se acepta igual (la valida el formulario).
 */
declare function DatePicker({ label, value, onChange, outputFormat, disableFuture, disablePast, disabled, error, helperText, startIcon, compact, autoDefaultToday, id, name, className, }: DatePickerProps): react.JSX.Element;

/** Día calendario sin hora ni huso (mes de 1 a 12). */
interface Ymd {
    y: number;
    m: number;
    d: number;
}

interface CalendarProps {
    /** Día elegido (si hay). */
    selected: Ymd | null;
    onSelect: (day: Ymd) => void;
    /** Días que no se pueden elegir (por ejemplo el futuro). */
    isDisabled?: (day: Ymd) => boolean;
    /** Escape o clic afuera: lo maneja quien abre el calendario. */
    onEscape?: () => void;
}
/**
 * Calendario del mes: semanas desde el lunes, días de otros meses atenuados,
 * hoy con borde y el elegido relleno. Con el título se pasa a la lista de años.
 * Teclado: flechas mueven el día (±1 y ±7), RePág/AvPág el mes, Enter elige.
 */
declare function Calendar({ selected, onSelect, isDisabled, onEscape }: CalendarProps): react.JSX.Element;

interface InsuranceMultiAutocompleteProps<T extends InsuranceLike = InsuranceLike> extends ComboboxFieldProps {
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
declare function InsuranceMultiAutocomplete<T extends InsuranceLike = InsuranceLike>(props: InsuranceMultiAutocompleteProps<T>): react.JSX.Element;
interface StudyMultiAutocompleteProps<T extends StudyLike = StudyLike> extends Omit<ComboboxFieldProps, 'noOptionsText' | 'loadingText'> {
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
declare function StudyMultiAutocomplete<T extends StudyLike = StudyLike>(props: StudyMultiAutocompleteProps<T>): react.JSX.Element;
interface WorksheetMultiAutocompleteProps<T extends WorksheetLike = WorksheetLike> extends ComboboxFieldProps {
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
declare function WorksheetMultiAutocomplete<T extends WorksheetLike = WorksheetLike>(props: WorksheetMultiAutocompleteProps<T>): react.JSX.Element;

interface MultiComboboxProps<T> extends ComboboxFieldProps {
    search: ComboboxSearch<T>;
    /** Texto del input (lo maneja `useComboboxText`). */
    text: string;
    onInputChange: (value: string, reason: InputChangeReason) => void;
    /** Ids elegidos. */
    value: readonly string[];
    /** Se llama al elegir o quitar una opción, con todos los ids y objetos que quedan. Nunca mientras se tipea. */
    onChange: (ids: string[], raws: T[]) => void;
    /** No ofrecer las ya elegidas (como `filterSelectedOptions` de MUI). Sin esto, elegir una elegida la quita. */
    hideSelected?: boolean;
    /** Sin foco, muestra sólo esta cantidad de chips y un «+N» con el resto. */
    limitTags?: number;
    /** Muestra la `secondary` de cada opción (por ejemplo «Suspendida»). */
    showSecondary?: boolean;
    /** Teclas sobre el campo (por ejemplo, Enter para agregar por código exacto). */
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    /** Enter mientras se está buscando (hay texto): no envía el formulario. Se apaga con un manejo propio del Enter. */
    preventEnterWhileSearching?: boolean;
}
/**
 * Base de los autocompletes de varios valores: lo elegido queda como chips con «quitar» dentro del
 * campo y el texto sirve para seguir buscando. Se comporta como el Autocomplete `multiple` de MUI
 * que usa DEVA.
 *
 * - El valor es un array de **ids**; `onChange` avisa ids y objetos de todo lo que queda.
 * - Mientras se tipea no se avisa nada; al elegir se vacía el texto y se cierra la lista.
 * - Retroceso con el texto vacío quita el último; con las flechas izquierda y derecha se recorren los
 *   chips y Retroceso o Suprimir sobre uno lo quita.
 * - `hideSelected` oculta lo elegido de la lista; si no, elegirlo de nuevo lo quita.
 * - `limitTags` resume los chips cuando el campo no tiene el foco.
 */
declare function MultiCombobox<T>({ search, text, onInputChange, value, onChange, hideSelected, limitTags, showSecondary, onKeyDown, preventEnterWhileSearching, label, disabled, error, helperText, placeholder, size, required, name, id, inputRef, autoFocus, loading, noOptionsText, loadingText, listboxMinWidth, className, }: MultiComboboxProps<T>): react.JSX.Element;

export { Alert, type AlertProps, AuthLayout, type AuthLayoutProps, BiochemistAutocomplete, type BiochemistAutocompleteProps, BrandLockup, type BrandLockupProps, Button, type ButtonProps, Calendar, type CalendarProps, Cell, ChevronDownIcon, ChevronRightIcon, CloseIcon, type ColorMode, ColorModeSwitch, type ColorModeSwitchProps, Combobox, type ComboboxFieldProps, type ComboboxProps, type ComboboxSearch, DataTable, type DataTableColumn, type DataTableProps, DatePicker, type DatePickerProps, DiagnosisAutocomplete, type DiagnosisAutocompleteProps, DoctorAutocomplete, type DoctorAutocompleteProps, EyeIcon, FileDropzone, type FileDropzoneProps, FilterIcon, FilterToolbar, type FilterToolbarProps, type InputChangeReason, InsuranceAutocomplete, type InsuranceAutocompleteProps, InsuranceMultiAutocomplete, type InsuranceMultiAutocompleteProps, ListPage, type ListPageProps, LockIcon, type LoginCredentials, LoginForm, type LoginFormProps, MultiCombobox, type MultiComboboxProps, PasswordField, type PasswordFieldProps, PasswordInput, type PasswordInputProps, PatientDniAutocomplete, type PatientDniAutocompleteProps, SearchField, type SearchFieldProps, SearchIcon, SegmentedControl, type SegmentedControlProps, type SegmentedOption, Spinner, type SpinnerProps, StatusDot, type StatusDotProps, StudyAutocomplete, type StudyAutocompleteProps, type StudyEnterTools, StudyMultiAutocomplete, type StudyMultiAutocompleteProps, TextField, type TextFieldProps, Tip, type TipProps, UploadIcon, UserIcon, WarnIcon, WorksheetAutocomplete, type WorksheetAutocompleteProps, type WorksheetEnterTools, WorksheetMultiAutocomplete, type WorksheetMultiAutocompleteProps, useComboboxText };
