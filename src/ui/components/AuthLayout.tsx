import type { ReactNode } from 'react';
import { cx } from '../primitives/cx';

export interface AuthLayoutProps {
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

/** Mismo degradado que el ícono de la app: celeste abajo a la izquierda, azul abajo a la derecha, turquesa arriba a la derecha. */
const BRAND_GRADIENT = [
  'radial-gradient(circle at 100% 0%, rgba(37,177,207,0.95) 0%, rgba(37,177,207,0) 45%)',
  'radial-gradient(circle at 0% 0%, rgba(91,174,238,0.9) 0%, rgba(91,174,238,0) 50%)',
  'linear-gradient(60deg, #71fefe 0%, #56c8ee 35%, #4492de 68%, #3c80d7 100%)',
].join(', ');

/**
 * Plantilla de toda pantalla sin sesión (login, primer ingreso, recuperar
 * contraseña): panel de marca con degradado a la izquierda y formulario a la
 * derecha. En pantallas angostas el panel desaparece y queda la marca chica
 * arriba del formulario. La plantilla no sabe de autenticación: cada app le
 * pasa su marca, su selector de modo y el contenido.
 */
export function AuthLayout({
  brand,
  mobileBrand,
  tagline,
  panelFooter,
  topRight,
  title,
  subtitle,
  wide = false,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-deva-bg font-deva">
      <aside
        className="relative hidden min-w-0 flex-1 items-center justify-center overflow-hidden md:flex"
        style={{ backgroundImage: BRAND_GRADIENT }}
      >
        {/* En modo oscuro el degradado se atenúa para no encandilar. */}
        <div aria-hidden className="absolute inset-0 hidden bg-[rgba(10,20,40,0.35)] [[data-theme=dark]_&]:block" />
        <div className="relative flex flex-col items-center gap-5 px-10 text-center">
          {brand}
          {tagline && <p className="max-w-xs text-sm font-medium text-white/90">{tagline}</p>}
        </div>
        {panelFooter && (
          <span className="absolute inset-x-0 bottom-8 text-center text-xs font-medium text-white/85">{panelFooter}</span>
        )}
      </aside>

      <main className="relative flex w-full shrink-0 items-center justify-center overflow-y-auto px-6 py-16 sm:px-10 md:w-[45%]">
        {topRight && <div className="absolute top-5 right-6">{topRight}</div>}
        <div className={cx('w-full', wide ? 'max-w-[640px]' : 'max-w-[400px]')}>
          {mobileBrand && <div className="mb-8 text-deva-ink-soft md:hidden">{mobileBrand}</div>}
          <h1 className="text-[2rem] font-bold tracking-[-0.02em] text-deva-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-deva-ink-soft">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
