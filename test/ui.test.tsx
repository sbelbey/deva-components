import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrandLockup, ColorModeSwitch, PasswordInput, Tip } from '../src/ui';

afterEach(cleanup);

describe('BrandLockup', () => {
  const logos = { blue: 'azul.png', white: 'blanco.png' };

  it('usa el logo según el tono y muestra el nombre del producto', () => {
    const { rerender } = render(<BrandLockup product="Pedidos" tone="blue" logos={logos} />);
    expect(screen.getByAltText('DEVA').getAttribute('src')).toBe('azul.png');
    expect(screen.getByText('Pedidos')).toBeTruthy();
    rerender(<BrandLockup product="Nexus" tone="white" logos={logos} />);
    expect(screen.getByAltText('DEVA').getAttribute('src')).toBe('blanco.png');
    expect(screen.getByText('Nexus')).toBeTruthy();
  });

  it('en modo apilado no dibuja el separador', () => {
    const { container, rerender } = render(<BrandLockup product="Pedidos" tone="blue" logos={logos} />);
    expect(container.querySelector('[aria-hidden]')).not.toBeNull();
    rerender(<BrandLockup product="Pedidos" tone="blue" logos={logos} stacked />);
    expect(container.querySelector('[aria-hidden]')).toBeNull();
  });

  it('acepta className para layout', () => {
    const { container } = render(<BrandLockup product="Pedidos" tone="blue" logos={logos} className="mx-auto" />);
    expect((container.firstChild as HTMLElement).className).toContain('mx-auto');
  });
});

describe('ColorModeSwitch', () => {
  it('refleja el modo en aria-checked y pide el contrario al tocarlo', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ColorModeSwitch mode="light" onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Modo oscuro' });
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith('dark');

    rerender(<ColorModeSwitch mode="dark" onChange={onChange} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith('light');
  });

  it('con hideLabel la etiqueta queda sólo para lectores de pantalla', () => {
    render(<ColorModeSwitch mode="light" onChange={() => {}} hideLabel />);
    expect(screen.getByText('Modo oscuro').className).toContain('sr-only');
  });

  it('deshabilitado no dispara onChange', () => {
    const onChange = vi.fn();
    render(<ColorModeSwitch mode="light" onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Tip', () => {
  it('sin contenido muestra sólo los hijos', () => {
    render(<Tip>Sólo texto</Tip>);
    expect(screen.getByText('Sólo texto')).toBeTruthy();
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('el botón apunta al tooltip con aria-describedby', () => {
    render(<Tip content="Ayuda">Término</Tip>);
    const button = screen.getByRole('button', { name: 'Término' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
    expect(tooltip.textContent).toBe('Ayuda');
  });

  it('tocar lo abre y Escape lo cierra', () => {
    render(<Tip content="Ayuda">Término</Tip>);
    const button = screen.getByRole('button');
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(tooltip.className).toContain('hidden');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(tooltip.className).not.toContain('hidden');
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('se cierra al perder el foco y al salir con el mouse', () => {
    const { container } = render(<Tip content="Ayuda">Término</Tip>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.blur(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    fireEvent.mouseLeave(container.firstChild as HTMLElement);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('PasswordInput', () => {
  it('arranca oculto y el ojo alterna mostrar/ocultar sin enviar el formulario', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const { container } = render(
      <form onSubmit={onSubmit}>
        <PasswordInput defaultValue="secreta" aria-label="Contraseña" />
      </form>,
    );
    const input = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(input.type).toBe('password');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input.type).toBe('text');
    expect(input.value).toBe('secreta');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input.type).toBe('password');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector('button')?.tabIndex).toBe(-1);
  });

  it('pasa ref y atributos al input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} name="clave" autoComplete="new-password" placeholder="Nueva" />);
    expect(ref.current?.name).toBe('clave');
    expect(ref.current?.autocomplete).toBe('new-password');
    expect(ref.current?.placeholder).toBe('Nueva');
  });

  it('deshabilitado también deshabilita el ojo; las etiquetas se pueden traducir', () => {
    render(<PasswordInput disabled showLabel="Show" hideLabel="Hide" />);
    expect((screen.getByRole('button', { name: 'Show' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
