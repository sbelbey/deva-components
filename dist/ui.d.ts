import * as react from 'react';
import { ReactNode, InputHTMLAttributes } from 'react';

interface BrandLockupProps {
    /** Nombre del producto que va después del logo ("Pedidos", "Nexus"…). */
    product: string;
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

export { BrandLockup, type BrandLockupProps, type ColorMode, ColorModeSwitch, type ColorModeSwitchProps, PasswordInput, type PasswordInputProps, Tip, type TipProps };
