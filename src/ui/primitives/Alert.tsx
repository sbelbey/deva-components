import type { ReactNode } from 'react';
import { cx } from './cx';

export interface AlertProps {
  tone?: 'error' | 'warn' | 'ok';
  children: ReactNode;
  className?: string;
}

const tones = {
  error: 'bg-deva-danger-bg text-deva-danger',
  warn: 'bg-deva-warn-bg text-deva-warn',
  ok: 'bg-deva-ok-bg text-deva-ok',
} as const;

/** Mensaje en bloque. Los errores se anuncian solos a lectores de pantalla (`role="alert"`). */
export function Alert({ tone = 'error', children, className }: AlertProps) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={cx('rounded-deva px-4 py-3 text-sm', tones[tone], className)}>
      {children}
    </p>
  );
}
