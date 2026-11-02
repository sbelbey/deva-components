import { cx } from '../primitives/cx';

export interface BrandLockupProps {
  /** Nombre del producto que va después del logo ("Pedidos", "Nexus"…). Sin nombre, queda sólo el logo (DEVA de escritorio). */
  product?: string;
  /** 'white' sobre la barra o fondos de color, 'blue' sobre fondos claros. */
  tone: 'white' | 'blue';
  /** Las dos versiones del logo oficial (se importan de `deva-design/assets`). */
  logos: { blue: string; white: string };
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
export function BrandLockup({
  product,
  tone,
  logos,
  stacked = false,
  className,
  logoClassName = 'h-7',
  textClassName = 'text-lg',
}: BrandLockupProps) {
  return (
    <span
      className={cx('inline-flex shrink-0', stacked ? 'flex-col items-end gap-3' : 'items-center gap-3', className)}
    >
      <img src={tone === 'white' ? logos.white : logos.blue} alt="DEVA" className={logoClassName} />
      {product && !stacked && <span aria-hidden className="h-6 w-px bg-current opacity-55" />}
      {product && <span className={cx('leading-none font-semibold tracking-[-0.01em]', textClassName)}>{product}</span>}
    </span>
  );
}
