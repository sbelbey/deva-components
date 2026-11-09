/**
 * Contrato del DatePicker de DEVA (campo de fecha de MUI x-date-pickers + DatePickerField).
 * Escritas contra lo que DEVA garantiza, no contra la implementación.
 */
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DatePicker } from '../../src/ui';

afterEach(cleanup);

const section = (name: 'Día' | 'Mes' | 'Año') => screen.getByRole('spinbutton', { name: new RegExp(`^${name}`) });
const press = (key: string) => fireEvent.keyDown(document.activeElement as HTMLElement, { key });
const typeKeys = (text: string) => [...text].forEach(press);
const openCalendar = () => fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
const cell = (label: string) => screen.getByRole('gridcell', { name: label });

describe('escribir por partes', () => {
  it('mes: un 1 espera el segundo dígito; del 2 al 9 completa y pasa al año', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Mes').focus();
    press('1');
    expect(section('Mes')).toHaveTextContent('01');
    expect(document.activeElement).toBe(section('Mes'));
    press('2');
    expect(section('Mes')).toHaveTextContent('12');
    expect(document.activeElement).toBe(section('Año'));

    section('Mes').focus();
    press('7');
    expect(section('Mes')).toHaveTextContent('07');
    expect(document.activeElement).toBe(section('Año'));
  });

  it('mes: 1 y 3 no forman un mes (13): arranca de nuevo con el 3', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Mes').focus();
    typeKeys('13');
    expect(section('Mes')).toHaveTextContent('03');
  });

  it('día: 3 y 2 no forman un día (32): arranca de nuevo con el 2', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Día').focus();
    typeKeys('32');
    expect(section('Día')).toHaveTextContent('02');
  });

  it('año: cuatro dígitos; con el año a medias todavía no se avisa nada', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={onChange} outputFormat="date" />);
    section('Año').focus();
    typeKeys('19');
    expect(section('Año')).toHaveTextContent('0019');
    typeKeys('99');
    expect(section('Año')).toHaveTextContent('1999');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('1999-11-09');
  });

  it('un año quinto dígito arranca de nuevo', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Año').focus();
    typeKeys('20267');
    expect(section('Año')).toHaveTextContent('0007');
  });

  it('Suprimir vacía la parte igual que Retroceso', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    section('Mes').focus();
    press('Delete');
    expect(section('Mes')).toHaveTextContent('MM');
  });

  it('al entrar a una parte de nuevo se empieza el número desde cero', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Día').focus();
    press('1');
    section('Mes').focus();
    section('Día').focus();
    press('2');
    expect(section('Día')).toHaveTextContent('02');
  });

  it('una tecla de texto cualquiera no escribe nada y los atajos del navegador quedan libres', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Día').focus();
    expect(fireEvent.keyDown(section('Día'), { key: 'x' })).toBe(false);
    expect(fireEvent.keyDown(section('Día'), { key: 'c', ctrlKey: true })).toBe(true);
    expect(fireEvent.keyDown(section('Día'), { key: 'Tab' })).toBe(true);
    expect(section('Día')).toHaveTextContent('DD');
  });
});

describe('flechas sobre una parte', () => {
  it('arriba sobre una parte vacía arranca en la de hoy', () => {
    const now = new Date();
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} />);
    section('Día').focus();
    press('ArrowUp');
    expect(section('Día')).toHaveTextContent(String(now.getDate()).padStart(2, '0'));
  });

  it('el día da la vuelta dentro del mes que tiene el campo (febrero de 2028 tiene 29)', () => {
    render(<DatePicker label="Fecha" value="2028-02-29" onChange={vi.fn()} />);
    section('Día').focus();
    press('ArrowUp');
    expect(section('Día')).toHaveTextContent('01');
    press('ArrowDown');
    expect(section('Día')).toHaveTextContent('29');
  });

  it('cambiar el mes a uno donde el día no existe (31 de octubre → septiembre) no avisa una fecha inválida', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-10-31" onChange={onChange} outputFormat="date" />);
    section('Mes').focus();
    press('ArrowDown');
    expect(section('Mes')).toHaveTextContent('09');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('el año no pasa de 2099 ni baja de 1900', () => {
    const { unmount } = render(<DatePicker label="Fecha" value="2099-01-01" onChange={vi.fn()} />);
    section('Año').focus();
    press('ArrowUp');
    expect(section('Año')).toHaveTextContent('2099');
    unmount();
    render(<DatePicker label="Fecha" value="1900-01-01" onChange={vi.fn()} />);
    section('Año').focus();
    press('ArrowDown');
    expect(section('Año')).toHaveTextContent('1900');
  });

  it('izquierda en la primera parte y derecha en la última no se salen del campo', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    section('Día').focus();
    press('ArrowLeft');
    expect(document.activeElement).toBe(section('Día'));
    section('Año').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(section('Año'));
  });
});

describe('qué se avisa hacia afuera', () => {
  it('la misma fecha en otro formato (ISO vs AAAA-MM-DD) no se vuelve a avisar', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09T03:00:00.000Z" onChange={onChange} />);
    section('Día').focus();
    press('ArrowUp');
    press('ArrowDown');
    // Volvió a la fecha original: el padre ya la tenía.
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('vaciar sólo una parte no avisa, y escribirla de nuevo avisa la fecha otra vez', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={onChange} outputFormat="date" />);
    section('Día').focus();
    press('Backspace');
    expect(onChange).not.toHaveBeenCalled();
    typeKeys('15');
    expect(onChange).toHaveBeenCalledWith('2026-11-15');
  });

  it('el campo escondido lleva la fecha completa para los formularios y vacío si está a medias', () => {
    const { container } = render(<DatePicker label="Fecha" name="retiro" value="2026-11-09" onChange={vi.fn()} outputFormat="date" />);
    const hidden = container.querySelector('input[name="retiro"]') as HTMLInputElement;
    expect(hidden.value).toBe('2026-11-09');
    section('Día').focus();
    press('Backspace');
    expect(hidden.value).toBe('');
  });

  it('un ISO se lee por sus partes UTC, no por las locales (DEVA usa dayjs.utc): 01:00Z es el día 9 aunque acá sea el 8', () => {
    render(<DatePicker label="Fecha" value="2026-11-09T01:00:00.000Z" onChange={vi.fn()} />);
    expect(section('Día')).toHaveTextContent('09');
  });

  it('un valor inválido de afuera deja el campo vacío sin romper', () => {
    render(<DatePicker label="Fecha" value="esto no es una fecha" onChange={vi.fn()} />);
    expect(section('Día')).toHaveTextContent('DD');
  });

  it('autoDefaultToday con formato ISO avisa la medianoche local de hoy', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="" onChange={onChange} autoDefaultToday />);
    const sent = new Date(onChange.mock.calls[0][0]);
    const now = new Date();
    expect([sent.getFullYear(), sent.getMonth(), sent.getDate(), sent.getHours(), sent.getMinutes()]).toEqual([
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
    ]);
  });
});

describe('deshabilitado', () => {
  it('las teclas no escriben nada en el campo', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} disabled />);
    fireEvent.keyDown(section('Día'), { key: '5' });
    fireEvent.keyDown(section('Mes'), { key: 'ArrowUp' });
    expect(section('Día')).toHaveTextContent('DD');
    expect(section('Mes')).toHaveTextContent('MM');
  });

  it('si se deshabilita con el calendario abierto, el calendario se cierra', () => {
    const { rerender } = render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    openCalendar();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} disabled />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('calendario', () => {
  it('un día apagado no se puede elegir ni con clic', () => {
    const onChange = vi.fn();
    const now = new Date();
    render(<DatePicker label="Fecha" value="" onChange={onChange} disableFuture />);
    openCalendar();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const label = `${tomorrow.getDate()} de ${months[tomorrow.getMonth()]} de ${tomorrow.getFullYear()}`;
    fireEvent.click(cell(label));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('un clic afuera cierra el calendario; un clic adentro no', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    openCalendar();
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('elegir el día que ya estaba no vuelve a avisar, pero cierra', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={onChange} outputFormat="date" />);
    openCalendar();
    fireEvent.click(cell('9 de noviembre de 2026'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('el calendario abre en el mes de la fecha del campo, aunque el día esté a medias', () => {
    render(<DatePicker label="Fecha" value="2027-03-15" onChange={vi.fn()} />);
    openCalendar();
    expect(screen.getByRole('button', { name: /Marzo 2027/ })).toBeInTheDocument();
  });

  it('RePág y AvPág cambian de mes, Inicio y Fin van al lunes y al domingo de la semana', () => {
    render(<DatePicker label="Fecha" value="2026-11-11" onChange={vi.fn()} />);
    openCalendar();
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'Home' });
    expect(cell('9 de noviembre de 2026')).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(grid, { key: 'End' });
    expect(cell('15 de noviembre de 2026')).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(grid, { key: 'PageDown' });
    expect(screen.getByRole('button', { name: /Diciembre 2026/ })).toBeInTheDocument();
    fireEvent.keyDown(grid, { key: 'PageUp' });
    fireEvent.keyDown(grid, { key: 'PageUp' });
    expect(screen.getByRole('button', { name: /Octubre 2026/ })).toBeInTheDocument();
  });

  it('las flechas arriba y abajo saltan de a una semana', () => {
    render(<DatePicker label="Fecha" value="2026-11-11" onChange={vi.fn()} />);
    openCalendar();
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(cell('18 de noviembre de 2026')).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    expect(cell('4 de noviembre de 2026')).toHaveAttribute('tabindex', '0');
  });

  it('el año se elige de una lista que va de 1900 a 2099 y conserva el mes', () => {
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={vi.fn()} />);
    openCalendar();
    fireEvent.click(screen.getByRole('button', { name: /Noviembre 2026/ }));
    const list = screen.getByRole('listbox', { name: 'Año' });
    const years = within(list).getAllByRole('option');
    expect(years[0]).toHaveTextContent('1900');
    expect(years[years.length - 1]).toHaveTextContent('2099');
    expect(within(list).getByRole('option', { name: '2026' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(within(list).getByRole('option', { name: '1990' }));
    expect(screen.getByRole('button', { name: /Noviembre 1990/ })).toBeInTheDocument();
  });

  it('hoy se distingue en el calendario y los días de otros meses se pueden elegir', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Fecha" value="2026-11-09" onChange={onChange} outputFormat="date" />);
    openCalendar();
    fireEvent.click(cell('26 de octubre de 2026'));
    expect(onChange).toHaveBeenCalledWith('2026-10-26');
  });

  it('el calendario no se abre con el campo deshabilitado aunque se fuerce el clic', () => {
    render(<DatePicker label="Fecha" value="" onChange={vi.fn()} disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('con el valor controlado desde afuera, el calendario muestra el día elegido en el campo', () => {
    function Controlled() {
      const [value, setValue] = useState('2026-11-09');
      return (
        <>
          <DatePicker label="Fecha" value={value} onChange={setValue} outputFormat="date" />
          <button type="button" onClick={() => setValue('2027-05-20')}>
            cambiar
          </button>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: 'cambiar' }));
    expect(section('Año')).toHaveTextContent('2027');
    openCalendar();
    expect(cell('20 de mayo de 2027')).toHaveAttribute('aria-selected', 'true');
  });
});
