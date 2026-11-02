import { useState, type FormEvent, type ReactNode } from 'react';
import { Alert } from '../primitives/Alert';
import { Button } from '../primitives/Button';
import { UserIcon } from '../primitives/icons';
import { TextField } from '../primitives/TextField';
import { PasswordField } from './PasswordField';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginFormProps {
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
export function LoginForm({
  onSubmit,
  error,
  loading,
  usernameLabel = 'Usuario',
  passwordLabel = 'Contraseña',
  submitLabel = 'Iniciar sesión',
  loadingLabel = 'Ingresando',
  requiredMessage = 'Completá usuario y contraseña.',
  forgotPassword,
  passwordHint,
  footer,
}: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setLocalError(requiredMessage);
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit({ username: username.trim(), password });
    } finally {
      setSubmitting(false);
    }
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label={usernameLabel}
        startIcon={<UserIcon />}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
      />
      <div className="flex flex-col gap-2">
        <PasswordField
          label={passwordLabel}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        {forgotPassword && <div className="text-right text-xs">{forgotPassword}</div>}
        {passwordHint && <p className="ml-3.5 text-xs text-deva-ink-soft">{passwordHint}</p>}
      </div>
      {shownError && <Alert>{shownError}</Alert>}
      <Button type="submit" fullWidth loading={loading ?? submitting} loadingLabel={loadingLabel}>
        {submitLabel}
      </Button>
      {footer}
    </form>
  );
}
