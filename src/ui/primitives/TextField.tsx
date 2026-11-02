import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
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

const helperColors = { default: 'text-deva-ink-soft', warn: 'text-deva-warn', error: 'text-deva-danger' } as const;

/**
 * Campo de texto con etiqueta flotante, como los "outlined" de MUI que usa el
 * login de DEVA. Acepta los atributos de un `<input>` y `ref`.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, startIcon, endAdornment, helper, helperTone = 'default', wrapperClassName, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const invalid = helperTone === 'error';

  return (
    <div className={wrapperClassName}>
      <div className="relative">
        {startIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-deva-ink-soft">
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          aria-invalid={invalid || undefined}
          aria-describedby={helper ? helperId : undefined}
          className={cx(
            'peer h-14 w-full rounded-deva border bg-deva-surface text-base text-deva-ink transition-[border-color,box-shadow] duration-150 focus:outline-none disabled:opacity-60',
            startIcon ? 'pl-11' : 'pl-3.5',
            endAdornment ? 'pr-12' : 'pr-3.5',
            invalid
              ? 'border-deva-danger focus:shadow-[inset_0_0_0_1px_var(--deva-danger)]'
              : 'border-deva-ink-soft/50 hover:border-deva-ink-soft focus:border-deva-action focus:shadow-[inset_0_0_0_1px_var(--deva-action)]',
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cx(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 bg-deva-surface px-1 text-base text-deva-ink-soft transition-all duration-150',
            startIcon ? 'left-11' : 'left-3.5',
            'peer-focus:top-0 peer-focus:left-3 peer-focus:text-xs peer-focus:text-deva-action',
            'peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs',
          )}
        >
          {label}
        </label>
        {endAdornment && <span className="absolute top-1/2 right-2 -translate-y-1/2">{endAdornment}</span>}
      </div>
      {helper && (
        <p id={helperId} className={cx('mt-1 ml-3.5 text-xs', helperColors[helperTone])}>
          {helper}
        </p>
      )}
    </div>
  );
});
