import type { ReactNode } from 'react';
import { cx } from './cx';

export interface StatusDotProps {
  tone?: 'ok' | 'warn' | 'danger' | 'muted';
  children: ReactNode;
  className?: string;
}

const dots = {
  ok: 'bg-deva-ok',
  warn: 'bg-deva-warn',
  danger: 'bg-deva-danger',
  muted: 'bg-deva-ink-soft/50',
} as const;

/** Estado en una palabra con un punto de color. El color acompaña al texto, nunca lo reemplaza. */
export function StatusDot({ tone = 'muted', children, className }: StatusDotProps) {
  return (
    <span className={cx('inline-flex items-center gap-2 text-sm font-medium text-deva-ink', className)}>
      <span aria-hidden className={cx('size-2 shrink-0 rounded-full', dots[tone])} />
      {children}
    </span>
  );
}
