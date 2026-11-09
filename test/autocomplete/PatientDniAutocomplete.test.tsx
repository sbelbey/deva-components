import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { PatientDniAutocomplete } from '../../src/ui';

const DNIS = ['30111222', '30111333', '28999000'];
const SCAN_NEW = '!00123456789@GOMEZ@JUAN@M@40555666@A@01/02/1990@15/03/2015';

function type(text: string) {
  const input = screen.getByRole('combobox');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  return input as HTMLInputElement;
}

function optionLabels() {
  return within(screen.getByRole('listbox'))
    .queryAllByRole('option')
    .map((option) => option.textContent);
}

describe('PatientDniAutocomplete (DEVA-107)', () => {
  it('busca por DNI y al elegir devuelve el DNI', () => {
    const onChange = vi.fn();
    render(
      <PatientDniAutocomplete
        value=""
        onChange={onChange}
        label="DNI"
        patients={DNIS}
      />,
    );
    type('30111');
    expect(optionLabels()).toEqual(['30111222', '30111333']);
    fireEvent.click(screen.getByText('30111333'));
    expect(onChange).toHaveBeenCalledWith('30111333', '30111333');
  });

  it('mientras se tipea no llama a onChange; al salir confirma el DNI nuevo', () => {
    const onChange = vi.fn();
    render(
      <PatientDniAutocomplete
        value=""
        onChange={onChange}
        label="DNI"
        patients={DNIS}
      />,
    );
    const input = type('41222333');
    expect(onChange).not.toHaveBeenCalled();
    // freeSolo: sin coincidencias no se abre la lista (es un paciente nuevo).
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('41222333', undefined);
  });

  it("el escaneo con '!' no busca y al salir llama a onScan con los datos", () => {
    const onChange = vi.fn();
    const onScan = vi.fn();
    render(
      <PatientDniAutocomplete
        value=""
        onChange={onChange}
        onScan={onScan}
        label="DNI"
        patients={['40555666']}
      />,
    );
    const input = type(SCAN_NEW);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(onScan).toHaveBeenCalledTimes(1);
    const [scan, raw] = onScan.mock.calls[0];
    expect(raw).toBe(SCAN_NEW);
    expect(scan.dni).toBe(40555666);
    expect(scan.patient).toMatchObject({
      lastName: 'GOMEZ',
      name: 'JUAN',
      gender: 'MALE',
    });
    expect(input.value).toBe('40555666');
  });

  it("Enter al final de un escaneo '!' lo resuelve con onScan, nunca como DNI", () => {
    const onChange = vi.fn();
    const onScan = vi.fn();
    render(
      <PatientDniAutocomplete
        value=""
        onChange={onChange}
        onScan={onScan}
        label="DNI"
        patients={DNIS}
      />,
    );
    const input = type(SCAN_NEW);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(onScan).toHaveBeenCalledTimes(1);
    expect(onScan.mock.calls[0][0].dni).toBe(40555666);
    expect(input.value).toBe('40555666');
    // Al salir no se repite el escaneo ni se avisa el DNI.
    fireEvent.blur(input);
    expect(onScan).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Enter sobre un escaneo que no se reconoce no guarda el texto crudo', () => {
    const onChange = vi.fn();
    const onScan = vi.fn();
    render(
      <PatientDniAutocomplete
        value=""
        onChange={onChange}
        onScan={onScan}
        label="DNI"
        patients={DNIS}
      />,
    );
    const input = type('!basura');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(onScan).toHaveBeenCalledTimes(1);
    expect(onScan).toHaveBeenCalledWith(null, '!basura');
  });

  it('escaneo basura + salir del campo: avisa y borra el texto crudo', () => {
    const onChange = vi.fn();
    const onTextChange = vi.fn();
    render(
      <PatientDniAutocomplete
        value=""
        onChange={onChange}
        onScan={vi.fn()}
        onTextChange={onTextChange}
        label="DNI"
        patients={DNIS}
      />,
    );
    const input = type('!basura');
    fireEvent.blur(input);
    expect(input.value).toBe('');
    expect(screen.getByText('No se pudo leer el DNI escaneado')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onTextChange).toHaveBeenLastCalledWith('');
    expect(onChange).not.toHaveBeenCalled();

    // Al volver a tipear, el aviso se va.
    type('301');
    expect(
      screen.queryByText('No se pudo leer el DNI escaneado'),
    ).not.toBeInTheDocument();
  });

  it('escaneo basura con Enter y un DNI ya cargado: vuelve el DNI que estaba', () => {
    render(
      <PatientDniAutocomplete
        value="30111222"
        onChange={vi.fn()}
        onScan={vi.fn()}
        label="DNI"
        patients={DNIS}
      />,
    );
    const input = type('!basura');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('30111222');
    expect(screen.getByText('No se pudo leer el DNI escaneado')).toBeInTheDocument();
  });

  it('borrar todo limpia el valor', () => {
    const onChange = vi.fn();
    render(
      <PatientDniAutocomplete
        value="30111222"
        onChange={onChange}
        label="DNI"
        patients={DNIS}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('30111222');
    type('');
    expect(onChange).toHaveBeenCalledWith(null, undefined);
  });

  it('con estado local y sin lista funciona como input libre', () => {
    function Harness() {
      const [dni, setDni] = useState<string | null>('12345678');
      return (
        <>
          <PatientDniAutocomplete
            value={dni}
            onChange={(next) => setDni(next)}
            label="DNI"
            patients={undefined}
          />
          <span data-testid="value">{dni ?? 'null'}</span>
        </>
      );
    }
    render(<Harness />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('12345678');
    type('87654321');
    expect(screen.getByTestId('value')).toHaveTextContent('12345678');
    fireEvent.blur(input);
    expect(screen.getByTestId('value')).toHaveTextContent('87654321');
  });
});


afterEach(cleanup);
