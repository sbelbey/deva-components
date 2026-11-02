import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Alert, AuthLayout, Button, LoginForm, PasswordField, TextField } from '../src/ui';

afterEach(cleanup);

describe('Button', () => {
  it('es type="button" por defecto', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button', { name: 'Ok' })).toHaveProperty('type', 'button');
  });

  it('con loading se bloquea y muestra el spinner con su etiqueta', () => {
    render(
      <Button loading loadingLabel="Ingresando">
        Ok
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
    expect(screen.getByRole('img', { name: 'Ingresando' })).toBeTruthy();
    expect(screen.queryByText('Ok')).toBeNull();
  });
});

describe('Alert', () => {
  it('el error se anuncia con role="alert" y el resto con "status"', () => {
    render(
      <>
        <Alert>Falló</Alert>
        <Alert tone="ok">Listo</Alert>
      </>,
    );
    expect(screen.getByRole('alert').textContent).toBe('Falló');
    expect(screen.getByRole('status').textContent).toBe('Listo');
  });
});

describe('TextField', () => {
  it('asocia la etiqueta con el campo', () => {
    render(<TextField label="Usuario" />);
    expect(screen.getByLabelText('Usuario')).toBeTruthy();
  });

  it('con tono error marca el campo inválido y lo vincula con el texto de ayuda', () => {
    render(<TextField label="Usuario" helper="Obligatorio" helperTone="error" />);
    const input = screen.getByLabelText('Usuario');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe('Obligatorio');
  });
});

describe('PasswordField', () => {
  it('el ojo muestra y oculta la contraseña', () => {
    render(<PasswordField label="Contraseña" defaultValue="secreta" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input.getAttribute('type')).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input.getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeTruthy();
  });

  it('avisa de Bloq Mayús al escribir y lo saca al salir del campo', () => {
    render(<PasswordField label="Contraseña" />);
    const input = screen.getByLabelText('Contraseña');
    fireEvent.keyDown(input, { key: 'A', modifierCapsLock: true });
    expect(screen.getByText('Bloq Mayús está activado')).toBeTruthy();
    fireEvent.blur(input);
    expect(screen.queryByText('Bloq Mayús está activado')).toBeNull();
  });
});

describe('LoginForm', () => {
  const fill = (username: string, password: string) => {
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: username } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  };

  it('no envía si falta un dato y avisa', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fill('  ', 'x');
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toBe('Completá usuario y contraseña.');
  });

  it('envía el usuario sin espacios en los bordes y deja la contraseña tal cual', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);
    fill('  maria  ', ' clave ');
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ username: 'maria', password: ' clave ' }));
  });

  it('queda cargando mientras la app resuelve y vuelve después', async () => {
    let finish: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<LoginForm onSubmit={onSubmit} loadingLabel="Ingresando" />);
    fill('maria', 'clave');
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('img', { name: 'Ingresando' })).toBeTruthy();
    finish();
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toHaveProperty('disabled', false);
  });

  it('muestra el error de la app y los textos y enlaces que le pasan', () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        error="Credenciales incorrectas"
        forgotPassword={<a href="#r">¿Olvidaste tu contraseña?</a>}
        passwordHint="Usá la temporal"
        submitLabel="Ingresar"
      />,
    );
    expect(screen.getByRole('alert').textContent).toBe('Credenciales incorrectas');
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeTruthy();
    expect(screen.getByText('Usá la temporal')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeTruthy();
  });
});

describe('AuthLayout', () => {
  it('pone el título, el subtítulo, el contenido y la marca', () => {
    render(
      <AuthLayout
        title="Iniciar sesión"
        subtitle="Con tu cuenta"
        brand={<span>marca grande</span>}
        mobileBrand={<span>marca chica</span>}
        tagline="Qué es esto"
        panelFooter="Versión 1"
        topRight={<span>modo</span>}
      >
        <p>formulario</p>
      </AuthLayout>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Iniciar sesión');
    for (const text of ['Con tu cuenta', 'formulario', 'marca grande', 'marca chica', 'Qué es esto', 'Versión 1', 'modo']) {
      expect(screen.getByText(text)).toBeTruthy();
    }
  });
});
