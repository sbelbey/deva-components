import type { ReactNode } from 'react';

export interface ListPageProps {
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
export function ListPage({ title, subtitle, actions, children }: ListPageProps) {
  return (
    <div className="min-h-full bg-deva-bg px-4 py-4 font-deva text-deva-ink md:px-8 md:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-deva-ink-soft">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}
