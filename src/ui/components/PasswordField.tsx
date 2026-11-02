import { forwardRef, useState, type KeyboardEvent } from 'react';
import { EyeIcon, LockIcon } from '../primitives/icons';
import { TextField, type TextFieldProps } from '../primitives/TextField';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'endAdornment'> {
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
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  {
    showLabel = 'Mostrar contraseña',
    hideLabel = 'Ocultar contraseña',
    capsLockMessage = 'Bloq Mayús está activado',
    helper,
    helperTone,
    startIcon = <LockIcon />,
    onKeyDown,
    onKeyUp,
    onBlur,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const detect = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState('CapsLock'));
  // Un error del campo manda sobre el aviso de Bloq Mayús.
  const showCaps = capsLock && !(helper && helperTone === 'error');

  return (
    <TextField
      ref={ref}
      type={visible ? 'text' : 'password'}
      startIcon={startIcon}
      helper={showCaps ? capsLockMessage : helper}
      helperTone={showCaps ? 'warn' : helperTone}
      onKeyDown={(event) => {
        detect(event);
        onKeyDown?.(event);
      }}
      onKeyUp={(event) => {
        detect(event);
        onKeyUp?.(event);
      }}
      onBlur={(event) => {
        setCapsLock(false);
        onBlur?.(event);
      }}
      endAdornment={
        <button
          type="button"
          tabIndex={-1}
          disabled={props.disabled}
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="flex size-9 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 disabled:opacity-50"
        >
          <EyeIcon off={visible} />
        </button>
      }
      {...props}
    />
  );
});
