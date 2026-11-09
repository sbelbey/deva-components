import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { DoctorAutocomplete } from '../../src/ui';

// Forma de useDoctor(): etiqueta ya armada "matrícula - nombre apellido".
const DOCTORS = [
  { id: 'm1', doctor: '1234 - JUAN GÓMEZ' },
  { id: 'm2', doctor: '5678 - ANA PÉREZ' },
  // Misma etiqueta que m1: antes se tomaba siempre el primero.
  { id: 'm3', doctor: '1234 - JUAN GÓMEZ' },
];

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

describe('DoctorAutocomplete (DEVA-107)', () => {
  it('busca con varios términos en cualquier orden y sin acentos', () => {
    render(
      <DoctorAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Doctor/a"
        doctors={DOCTORS}
      />,
    );
    type('perez ana');
    expect(optionLabels()).toEqual(['5678 - ANA PÉREZ']);
    type('5678');
    expect(optionLabels()).toEqual(['5678 - ANA PÉREZ']);
  });

  it('con etiquetas repetidas devuelve el id de la opción elegida', () => {
    const onChange = vi.fn();
    render(
      <DoctorAutocomplete
        value={null}
        onChange={onChange}
        label="Doctor/a"
        doctors={DOCTORS}
      />,
    );
    type('gomez');
    fireEvent.click(screen.getAllByText('1234 - JUAN GÓMEZ')[1]);
    expect(onChange).toHaveBeenCalledWith('m3', DOCTORS[2]);
  });

  it('no guarda el texto tipeado ni llama a onChange mientras se tipea', () => {
    const onChange = vi.fn();
    render(
      <DoctorAutocomplete
        value="m2"
        onChange={onChange}
        label="Doctor/a"
        doctors={DOCTORS}
      />,
    );
    const input = type('dr. inventado');
    expect(screen.getByText('Sin médicos')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('5678 - ANA PÉREZ');
  });
});

describe('código exacto (DEVA-148)', () => {
  function renderDr(doctors: any[] = DOCTORS) {
    const onChange = vi.fn();
    render(
      <DoctorAutocomplete
        value={null}
        onChange={onChange}
        label="Doctor/a"
        doctors={doctors}
        selectByExactCode
      />,
    );
    return { onChange };
  }

  it('5678 + Enter elige m2 (matrícula del prefijo de la etiqueta)', () => {
    const { onChange } = renderDr();
    const notPrevented = fireEvent.keyDown(type('5678'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('m2', DOCTORS[1]);
    expect(notPrevented).toBe(false);
  });

  it('con professionalRegistration en el objeto se usa ese', () => {
    const extra = { id: 'm9', doctor: 'x', professionalRegistration: 9999 };
    const { onChange } = renderDr([...DOCTORS, extra]);
    fireEvent.keyDown(type('9999'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('m9', extra);
  });

  it('1234 (m1 y m3 repetidos) no elige', () => {
    const { onChange } = renderDr();
    fireEvent.keyDown(type('1234'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('gomez + Enter (nombre) no elige', () => {
    const { onChange } = renderDr();
    fireEvent.keyDown(type('gomez'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Tab con matrícula elige', () => {
    const { onChange } = renderDr();
    fireEvent.keyDown(type('5678'), { key: 'Tab' });
    expect(onChange).toHaveBeenCalledWith('m2', DOCTORS[1]);
  });
});


afterEach(cleanup);
