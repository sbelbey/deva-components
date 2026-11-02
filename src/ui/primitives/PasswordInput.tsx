import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cx } from './cx';
import { EyeIcon } from './icons';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
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
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, wrapperClassName, showLabel = 'Mostrar contraseña', hideLabel = 'Ocultar contraseña', disabled, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={cx('relative', wrapperClassName)}>
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={cx(
          'w-full rounded-deva border border-deva-line bg-deva-surface py-2 pr-10 pl-3 text-sm text-deva-ink outline-none placeholder:text-deva-ink-soft focus:border-deva-action disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        disabled={disabled}
        tabIndex={-1}
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-deva text-deva-ink-soft hover:text-deva-ink disabled:opacity-50"
      >
        <EyeIcon off={visible} className="size-4" />
      </button>
    </div>
  );
});
