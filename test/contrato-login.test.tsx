/**
 * Contrato del login de la familia DEVA, escrito contra los tres logins reales (DEVA con Formik/MUI,
 * portal de pedidos y Nexus): Bloq Mayús, mostrar/ocultar contraseña, no enviar con campos vacíos,
 * un solo envío mientras carga, usuario sin espacios en los bordes y contraseña tal cual, error de la app.
 */
import '@testing-library/jest-dom/vitest';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AuthLayout, LoginForm, PasswordField } from '../src/ui';

afterEach(cleanup);

const password = () => screen.getByLabelText('Contraseña') as HTMLInputElement;
const username = () => screen.getByLabelText('Usuario') as HTMLInputElement;
const submitButton = (name = 'Iniciar sesión') => screen.getByRole('button', { name });
const fill = (u: string, p: string) => {
  fireEvent.change(username(), { target: { value: u } });
  fireEvent.change(password(), { target: { value: p } });
};

describe('PasswordField', () => {
  it('es de tipo contraseña, tiene candado y el ojo la muestra y la oculta con etiquetas que dicen lo que va a pasar', () => {
    render(<PasswordField label="Contraseña" defaultValue="secreta" />);
    expect(password()).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password()).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(password()).toHaveAttribute('type', 'password');
  });

  it('el ojo queda fuera del Tab y no envía el formulario', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PasswordField label="Contraseña" />
      </form>,
    );
    const eye = screen.getByRole('button', { name: 'Mostrar contraseña' });
    expect(eye).toHaveAttribute('tabindex', '-1');
    fireEvent.click(eye);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('avisa de Bloq Mayús al escribir con las mayúsculas fijadas, también al soltar la tecla, y se va al salir', () => {
    render(<PasswordField label="Contraseña" />);
    fireEvent.keyDown(password(), { key: 'A', modifierCapsLock: true });
    expect(screen.getByText('Bloq Mayús está activado')).toBeInTheDocument();
    fireEvent.keyDown(password(), { key: 'a', modifierCapsLock: false });
    expect(screen.queryByText('Bloq Mayús está activado')).toBeNull();
    fireEvent.keyUp(password(), { key: 'CapsLock', modifierCapsLock: true });
    expect(screen.getByText('Bloq Mayús está activado')).toBeInTheDocument();
    fireEvent.blur(password());
    expect(screen.queryByText('Bloq Mayús está activado')).toBeNull();
  });

  it('el aviso de Bloq Mayús es de aviso (no marca el campo inválido) y se puede traducir', () => {
    render(<PasswordField label="Contraseña" capsLockMessage="Caps Lock is on" />);
    fireEvent.keyDown(password(), { key: 'A', modifierCapsLock: true });
    expect(screen.getByText('Caps Lock is on')).toHaveClass('text-deva-warn');
    expect(password()).not.toHaveAttribute('aria-invalid');
    expect(password()).toHaveAccessibleDescription('Caps Lock is on');
  });

  it('un error del campo manda sobre el aviso de Bloq Mayús', () => {
    render(<PasswordField label="Contraseña" helper="Mínimo 8 caracteres" helperTone="error" />);
    fireEvent.keyDown(password(), { key: 'A', modifierCapsLock: true });
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.queryByText('Bloq Mayús está activado')).toBeNull();
    expect(password()).toHaveAttribute('aria-invalid', 'true');
  });

  it('los manejadores de teclado y de salida que pasa la app se siguen llamando', () => {
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    const onBlur = vi.fn();
    render(<PasswordField label="Contraseña" onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={onBlur} />);
    fireEvent.keyDown(password(), { key: 'a' });
    fireEvent.keyUp(password(), { key: 'a' });
    fireEvent.blur(password());
    expect(onKeyDown).toHaveBeenCalled();
    expect(onKeyUp).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it('deshabilitado bloquea también el ojo; pasa ref; las etiquetas del ojo se traducen', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordField ref={ref} label="Contraseña" disabled showLabel="Show" hideLabel="Hide" />);
    expect(ref.current).toBe(password());
    expect(password()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Show' })).toBeDisabled();
  });

  it('un ícono propio reemplaza al candado', () => {
    const { container } = render(<PasswordField label="Contraseña" startIcon={<span data-testid="mio" />} />);
    expect(screen.getByTestId('mio')).toBeInTheDocument();
    expect(container.querySelector('rect')).toBeNull();
  });
});

describe('LoginForm', () => {
  it('pide usuario y contraseña con los autocompletar del navegador correctos y enfoca el usuario', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(username()).toHaveAttribute('autocomplete', 'username');
    expect(password()).toHaveAttribute('autocomplete', 'current-password');
    expect(username()).toHaveAttribute('spellcheck', 'false');
    expect(username()).toHaveAttribute('autocapitalize', 'none');
    expect(document.activeElement).toBe(username());
    expect(submitButton()).toHaveAttribute('type', 'submit');
  });

  it.each([
    ['sin usuario', '', 'clave'],
    ['usuario en blanco', '   ', 'clave'],
    ['sin contraseña', 'maria', ''],
  ])('%s: no envía y avisa con una alerta', (_name, u, p) => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fill(u, p);
    fireEvent.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Completá usuario y contraseña.');
  });

  it('una contraseña de espacios es una contraseña: se envía tal cual', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);
    fill('maria', '   ');
    fireEvent.click(submitButton());
    await act(async () => {});
    expect(onSubmit).toHaveBeenCalledWith({ username: 'maria', password: '   ' });
  });

  it('Enter dentro de la contraseña envía el formulario (como el submit de los tres logins)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<LoginForm onSubmit={onSubmit} />);
    fill('maria', 'clave');
    fireEvent.submit(container.querySelector('form')!);
    await act(async () => {});
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('mientras el envío está en curso no se puede enviar de nuevo (Enter, doble clic): un solo envío', async () => {
    let finish: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { container } = render(<LoginForm onSubmit={onSubmit} />);
    fill('maria', 'clave');
    const form = container.querySelector('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => finish());
  });

  it('después de un envío (por ejemplo credenciales incorrectas) se puede volver a intentar', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<LoginForm onSubmit={onSubmit} />);
    const form = container.querySelector('form')!;
    fill('maria', 'clave');
    await act(async () => {
      fireEvent.submit(form);
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('mientras carga el botón queda ocupado y bloqueado, y vuelve a andar cuando termina', async () => {
    let finish: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<LoginForm onSubmit={onSubmit} loadingLabel="Ingresando" />);
    fill('maria', 'clave');
    fireEvent.click(submitButton());
    const busy = await screen.findByRole('button', { name: 'Ingresando' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    await act(async () => finish());
    expect(submitButton()).toBeEnabled();
  });

  it('si la app maneja su propio loading, manda sobre el estado interno', () => {
    render(<LoginForm onSubmit={vi.fn()} loading />);
    expect(screen.getByRole('img', { name: 'Ingresando' }).closest('button')).toBeDisabled();
  });

  it('corregir lo que faltaba y volver a enviar limpia el aviso local', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.click(submitButton());
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fill('maria', 'clave');
    fireEvent.click(submitButton());
    await act(async () => {});
    expect(screen.queryByRole('alert')).toBeNull();
    expect(onSubmit).toHaveBeenCalled();
  });

  it('muestra el error de la app (credenciales incorrectas) y el aviso local lo reemplaza si falta un dato', () => {
    const { rerender } = render(<LoginForm onSubmit={vi.fn()} error="Usuario o contraseña incorrectos." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
    fireEvent.click(submitButton());
    expect(screen.getByRole('alert')).toHaveTextContent('Completá usuario y contraseña.');
    rerender(<LoginForm onSubmit={vi.fn()} error={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Completá usuario y contraseña.');
  });

  it('sin error no hay alerta', () => {
    render(<LoginForm onSubmit={vi.fn()} error={null} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('textos propios: etiquetas, botón y mensaje de campos vacíos', () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        usernameLabel="Email o usuario"
        passwordLabel="Clave"
        submitLabel="Ingresar"
        requiredMessage="Faltan datos"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getByLabelText('Email o usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Clave')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Faltan datos');
  });

  it('el enlace de olvidé mi contraseña, la ayuda y el pie van donde se pide', () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        forgotPassword={<a href="#r">¿Olvidaste tu contraseña?</a>}
        passwordHint="Si es tu primer ingreso, usá la temporal"
        footer={<p>pie</p>}
      />,
    );
    expect(screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toBeInTheDocument();
    expect(screen.getByText('Si es tu primer ingreso, usá la temporal')).toBeInTheDocument();
    expect(screen.getByText('pie')).toBeInTheDocument();
  });

  it('el aviso de Bloq Mayús funciona dentro del formulario de ingreso', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    fireEvent.keyDown(password(), { key: 'A', modifierCapsLock: true });
    expect(screen.getByText('Bloq Mayús está activado')).toBeInTheDocument();
  });

  it('la contraseña no se muestra en claro hasta que se pide', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(password()).toHaveAttribute('type', 'password');
  });
});

describe('AuthLayout', () => {
  const base = { brand: <span>marca</span>, title: 'Iniciar sesión' };

  it('el título es el único h1 y el subtítulo sólo está si se pasa', () => {
    const { rerender } = render(
      <AuthLayout {...base}>
        <p>x</p>
      </AuthLayout>,
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText('sub')).toBeNull();
    // Sin subtítulo no queda un párrafo vacío bajo el título.
    expect(screen.getByRole('heading', { level: 1 }).nextElementSibling?.tagName).toBe('DIV');
    rerender(
      <AuthLayout {...base} subtitle="sub">
        <p>x</p>
      </AuthLayout>,
    );
    expect(screen.getByText('sub')).toBeInTheDocument();
  });

  it('en pantalla angosta el panel de marca se esconde y queda la marca chica; sin marca chica no hay lugar vacío', () => {
    const { container, rerender } = render(
      <AuthLayout {...base} mobileBrand={<span>chica</span>}>
        <p>x</p>
      </AuthLayout>,
    );
    expect(container.querySelector('aside')).toHaveClass('hidden');
    expect(container.querySelector('aside')).toHaveClass('md:flex');
    expect(screen.getByText('chica').parentElement).toHaveClass('md:hidden');
    rerender(
      <AuthLayout {...base}>
        <p>x</p>
      </AuthLayout>,
    );
    expect(screen.queryByText('chica')).toBeNull();
    expect(container.querySelector('main [class~="md:hidden"]')).toBeNull();
  });

  it('el formulario ancho (primer ingreso) amplía el ancho; el normal es de 400', () => {
    const { container, rerender } = render(
      <AuthLayout {...base}>
        <p>x</p>
      </AuthLayout>,
    );
    expect(container.querySelector('main > div:last-child')).toHaveClass('max-w-[400px]');
    rerender(
      <AuthLayout {...base} wide>
        <p>x</p>
      </AuthLayout>,
    );
    expect(container.querySelector('main > div:last-child')).toHaveClass('max-w-[640px]');
  });

  it('la frase, el pie del panel y la esquina (selector de modo) sólo aparecen si se pasan', () => {
    const { rerender } = render(
      <AuthLayout {...base}>
        <p>x</p>
      </AuthLayout>,
    );
    expect(screen.queryByText('Qué es')).toBeNull();
    expect(document.querySelector('aside p')).toBeNull();
    expect(document.querySelector('aside .bottom-8')).toBeNull();
    expect(screen.queryByText('Versión 1')).toBeNull();
    expect(screen.queryByText('modo')).toBeNull();
    rerender(
      <AuthLayout {...base} tagline="Qué es" panelFooter="Versión 1" topRight={<span>modo</span>}>
        <p>x</p>
      </AuthLayout>,
    );
    expect(screen.getByText('Qué es')).toBeInTheDocument();
    expect(screen.getByText('Versión 1')).toBeInTheDocument();
    expect(screen.getByText('modo')).toBeInTheDocument();
  });

  it('el degradado de marca está en el panel y en modo oscuro se atenúa', () => {
    const { container } = render(
      <AuthLayout {...base}>
        <p>x</p>
      </AuthLayout>,
    );
    expect((container.querySelector('aside') as HTMLElement).style.backgroundImage).toContain('linear-gradient');
    expect(container.querySelector('aside [aria-hidden]')).toHaveClass('[[data-theme=dark]_&]:block');
  });
});
