import * as react from 'react';
import { ReactNode, ButtonHTMLAttributes, SVGProps, InputHTMLAttributes } from 'react';

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

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
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
}
/**
 * Campo de texto con etiqueta flotante, como los "outlined" de MUI que usa el
 * login de DEVA. Acepta los atributos de un `<input>` y `ref`.
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

export { Alert, type AlertProps, AuthLayout, type AuthLayoutProps, BrandLockup, type BrandLockupProps, Button, type ButtonProps, Cell, ChevronDownIcon, ChevronRightIcon, CloseIcon, type ColorMode, ColorModeSwitch, type ColorModeSwitchProps, DataTable, type DataTableColumn, type DataTableProps, EyeIcon, FileDropzone, type FileDropzoneProps, FilterIcon, FilterToolbar, type FilterToolbarProps, ListPage, type ListPageProps, LockIcon, type LoginCredentials, LoginForm, type LoginFormProps, PasswordField, type PasswordFieldProps, PasswordInput, type PasswordInputProps, SearchField, type SearchFieldProps, SearchIcon, SegmentedControl, type SegmentedControlProps, type SegmentedOption, Spinner, type SpinnerProps, StatusDot, type StatusDotProps, TextField, type TextFieldProps, Tip, type TipProps, UploadIcon, UserIcon, WarnIcon };
