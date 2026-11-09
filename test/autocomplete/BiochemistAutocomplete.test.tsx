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
import { BiochemistAutocomplete } from '../../src/ui';

const mockBulkSetAssignments = vi.fn();
const BIOCHEMISTS: any[] = [
  {
    id: 'b1',
    professionalRegistration: 1234,
    name: 'ANA',
    lastName: 'PÉREZ',
    DNI: 30111222,
  },
  {
    id: 'b2',
    professionalRegistration: 5678,
    name: 'LUIS',
    lastName: 'GÓMEZ',
    DNI: 28999888,
  },
  // Misma etiqueta que b1: antes colisionaban (se tomaba uno por etiqueta).
  {
    id: 'b3',
    professionalRegistration: 1234,
    name: 'ANA',
    lastName: 'PÉREZ',
    DNI: 31000000,
  },
];

function type(text: string, input = screen.getByRole('combobox')) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  return input as HTMLInputElement;
}

function optionLabels() {
  return within(screen.getByRole('listbox'))
    .queryAllByRole('option')
    .map((option) => option.textContent);
}

describe('BiochemistAutocomplete (DEVA-107)', () => {
  it('busca por matrícula, nombre, apellido y DNI, en cualquier orden', () => {
    render(
      <BiochemistAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Bioquímico"
        biochemists={BIOCHEMISTS}
      />,
    );
    type('gomez luis');
    expect(optionLabels()).toEqual(['5678 - LUIS GÓMEZ']);
    type('28999888');
    expect(optionLabels()).toEqual(['5678 - LUIS GÓMEZ']);
  });

  it('con etiquetas repetidas devuelve el id de la opción elegida', () => {
    const onChange = vi.fn();
    render(
      <BiochemistAutocomplete
        value={null}
        onChange={onChange}
        label="Bioquímico"
        biochemists={BIOCHEMISTS}
      />,
    );
    type('perez');
    fireEvent.click(screen.getAllByText('1234 - ANA PÉREZ')[1]);
    expect(onChange).toHaveBeenCalledWith('b3', BIOCHEMISTS[2]);
  });

  it('no llama a onChange mientras se tipea ni guarda el texto', () => {
    const onChange = vi.fn();
    render(
      <BiochemistAutocomplete
        value="b2"
        onChange={onChange}
        label="Bioquímico"
        biochemists={BIOCHEMISTS}
      />,
    );
    const input = type('nadie');
    expect(screen.getByText('Sin bioquímicos')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('5678 - LUIS GÓMEZ');
  });

  it('dentro de un <form>: Enter mientras se busca no envía; sin buscar, sí', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <BiochemistAutocomplete
          value="b2"
          onChange={vi.fn()}
          label="Bioquímico"
          biochemists={BIOCHEMISTS}
        />
        <button type="submit">Guardar</button>
      </form>,
    );
    // Enter como en el navegador: sin preventDefault, el form se envía solo.
    const pressEnter = (el: HTMLInputElement) => {
      if (fireEvent.keyDown(el, { key: 'Enter' })) el.form?.requestSubmit();
    };
    const input = screen.getByRole('combobox') as HTMLInputElement;
    pressEnter(input);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    type('gom', input);
    pressEnter(input);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

afterEach(cleanup);
