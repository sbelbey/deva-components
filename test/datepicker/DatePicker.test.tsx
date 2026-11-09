import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DatePicker } from '../../src/ui';

afterEach(cleanup);

const section = (name: 'Día' | 'Mes' | 'Año') => screen.getByRole('spinbutton', { name: new RegExp(`^${name}`) });

function type(text: string) {
  for (const key of text) {
    const target = document.activeElement as HTMLElement;
    fireEvent.keyDown(target, { key });
  }
}

function Harness({ initial = '', ...props }: { initial?: string } & Partial<React.ComponentProps<typeof DatePicker>>) {
  const [value, setValue] = useState(initial);
  return <DatePicker label="Fecha de retiro" value={value} onChange={setValue} outputFormat="date" {...props} />;
}

describe('DatePicker: escribir la fecha', () => {
  it('escribir DDMMAAAA completa las tres partes, pasa de una a otra y avisa la fecha entera', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} outputFormat="date" />);
    section('Día').focus();
    type('09');
    expect(document.activeElement).toBe(section('Mes'));
    type('11');
    expect(document.activeElement).toBe(section('Año'));
    type('2026');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('2026-11-09');
    expect(section('Día')).toHaveTextContent('09');
    expect(section('Mes')).toHaveTextContent('11');
    expect(section('Año')).toHaveTextContent('2026');
  });

  it('una fecha a medias no se avisa', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} />);
    section('Día').focus();
    type('09');
    type('11');
    type('20');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('una fecha que no existe (31/04) no se avisa', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} />);
    section('Día').focus();
    type('31042026');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('avisa un ISO de medianoche local por defecto, como DEVA', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} />);
    section('Día').focus();
    type('09112026');
    const sent = new Date(onChange.mock.calls[0][0]);
    expect([sent.getFullYear(), sent.getMonth() + 1, sent.getDate(), sent.getHours()]).toEqual([2026, 11, 9, 0]);
  });

  it('las flechas arriba y abajo cambian la parte enfocada y avisan', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={onChange} outputFormat="date" />);
    section('Día').focus();
    fireEvent.keyDown(section('Día'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith('2026-11-10');
    fireEvent.keyDown(section('Mes'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('2026-10-10');
  });

  it('las flechas izquierda y derecha cambian de parte', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    section('Día').focus();
    fireEvent.keyDown(section('Día'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(section('Mes'));
    fireEvent.keyDown(section('Mes'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(section('Día'));
  });

  it('Retroceso vacía la parte y, al vaciar las tres, avisa «»', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={onChange} outputFormat="date" />);
    fireEvent.keyDown(section('Día'), { key: 'Backspace' });
    expect(section('Día')).toHaveTextContent('DD');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(section('Mes'), { key: 'Backspace' });
    fireEvent.keyDown(section('Año'), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('ignora las letras', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Día').focus();
    fireEvent.keyDown(section('Día'), { key: 'a' });
    expect(section('Día')).toHaveTextContent('DD');
  });
});

describe('DatePicker: valor de afuera', () => {
  it('muestra una fecha ISO por sus partes UTC (la medianoche local de Argentina cae en el mismo día)', () => {
    render(<DatePicker label="Fecha" value="2026-11-09T03:00:00.000Z" onChange={vi.fn()} />);
    expect(section('Día')).toHaveTextContent('09');
    expect(section('Mes')).toHaveTextContent('11');
    expect(section('Año')).toHaveTextContent('2026');
  });

  it('si el padre cambia la fecha, el campo la sigue; si la borra, se vacía', () => {
    const { rerender } = render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    rerender(<DatePicker label="Fecha" value="2027-01-31" onChange={vi.fn()} />);
    expect(section('Día')).toHaveTextContent('31');
    expect(section('Año')).toHaveTextContent('2027');
    rerender(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    expect(section('Día')).toHaveTextContent('DD');
  });

  it('autoDefaultToday completa con hoy cuando arranca vacío, y sólo entonces', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} outputFormat="date" autoDefaultToday />);
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(onChange).toHaveBeenCalledWith(expected);

    onChange.mockClear();
    render(<DatePicker label="Otra" value="2026-11-09" onChange={onChange} autoDefaultToday />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sin autoDefaultToday el campo vacío queda vacío', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DatePicker: calendario', () => {
  it('se abre con el botón, muestra el mes de la fecha y elegir un día lo avisa y cierra', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={onChange} outputFormat="date" />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    const dialog = screen.getByRole('dialog', { name: 'Calendario' });
    expect(within(dialog).getByRole('button', { name: /Noviembre 2026/ })).toBeInTheDocument();
    expect(within(dialog).getByRole('gridcell', { name: '9 de noviembre de 2026' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(within(dialog).getByRole('gridcell', { name: '20 de noviembre de 2026' }));
    expect(onChange).toHaveBeenCalledWith('2026-11-20');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(section('Día')).toHaveTextContent('20');
  });

  it('la semana empieza en lunes', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D']);
    // 1/11/2026 es domingo: la primera semana empieza el lunes 26/10.
    expect(screen.getByRole('gridcell', { name: '26 de octubre de 2026' })).toBeInTheDocument();
  });

  it('navega entre meses y años', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByRole('button', { name: /Diciembre 2026/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByRole('button', { name: /Octubre 2026/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Octubre 2026/ }));
    fireEvent.click(screen.getByRole('option', { name: '2024' }));
    expect(screen.getByRole('button', { name: /Octubre 2024/ })).toBeInTheDocument();
  });

  it('disableFuture y disablePast apagan los días que no se pueden elegir', () => {
    const now = new Date();
    const label = (offset: number) => {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return `${day.getDate()} de ${months[day.getMonth()]} de ${day.getFullYear()}`;
    };
    const { unmount } = render(<DatePicker label="Fecha" value="" onChange={vi.fn()} disableFuture />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    expect(screen.getByRole('gridcell', { name: label(0) })).toBeEnabled();
    expect(screen.getByRole('gridcell', { name: label(1) })).toBeDisabled();
    unmount();

    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} disablePast />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    expect(screen.getByRole('gridcell', { name: label(0) })).toBeEnabled();
    expect(screen.getByRole('gridcell', { name: label(-1) })).toBeDisabled();
  });

  it('escribir una fecha fuera de rango se acepta igual (la valida el formulario)', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} outputFormat="date" disableFuture />);
    section('Día').focus();
    type('01012099');
    expect(onChange).toHaveBeenCalledWith('2099-01-01');
  });

  it('Escape cierra el calendario y devuelve el foco al botón', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Elegir fecha' });
    fireEvent.click(button);
    fireEvent.keyDown(screen.getByRole('gridcell', { name: '9 de noviembre de 2026' }), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('las flechas mueven el día enfocado y cambian de mes si hace falta', () => {
    render(<DatePicker label="Fecha" value="2026-11-30" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: /Diciembre 2026/ })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: '1 de diciembre de 2026' })).toHaveAttribute('tabindex', '0');
  });
});

describe('DatePicker: estados', () => {
  it('deshabilitado no deja escribir ni abrir el calendario', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} disabled />);
    expect(screen.getByRole('button', { name: 'Elegir fecha' })).toBeDisabled();
    fireEvent.keyDown(section('Día'), { key: '5' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('muestra el texto de ayuda y el error', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} error helperText="La fecha es obligatoria" />);
    expect(screen.getByText('La fecha es obligatoria')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Fecha' })).toHaveAccessibleDescription('La fecha es obligatoria');
  });

  it('con estado local: escribir y elegir en el calendario se pisan sin pelearse', () => {
    render(<Harness initial="2026-11-09" />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    fireEvent.click(screen.getByRole('gridcell', { name: '15 de noviembre de 2026' }));
    expect(section('Día')).toHaveTextContent('15');
    section('Día').focus();
    fireEvent.keyDown(section('Día'), { key: 'ArrowUp' });
    expect(section('Día')).toHaveTextContent('16');
  });
});
