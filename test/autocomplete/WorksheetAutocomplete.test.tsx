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
import { WorksheetAutocomplete, type WorksheetAutocompleteProps } from '../../src/ui';

const WORKSHEETS = [
  { id: 'w1', code: 101, name: 'QUÍMICA' },
  { id: 'w2', code: 102, name: 'HEMATOLOGÍA' },
  // Mismo code y nombre que w1 (copia): otra opción.
  { id: 'w3', code: 101, name: 'QUÍMICA' },
  // Nombre con " - ": antes se partía la etiqueta por " - ".
  { id: 'w4', code: 7, name: 'ORINA - SEDIMENTO' },
];

const mockCreateDailyWorkSheet = vi.fn();
const mockDeleteWorkSheet = vi.fn();
const mockGetError = vi.fn();
function type(text: string, input = screen.getByRole('combobox')) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  return input as HTMLInputElement;
}

function chipLabels() {
  return Array.from(document.querySelectorAll('.MuiChip-label')).map(
    (chip) => chip.textContent,
  );
}

function optionLabels() {
  return within(screen.getByRole('listbox'))
    .queryAllByRole('option')
    .map((option) => option.textContent);
}

describe('WorksheetAutocomplete (DEVA-107)', () => {
  it('busca por code y nombre, sin acentos', () => {
    render(
      <WorksheetAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Planilla"
        worksheets={WORKSHEETS}
      />,
    );
    type('hemato');
    expect(optionLabels()).toEqual(['102 - HEMATOLOGÍA']);
    type('sedimento orina');
    expect(optionLabels()).toEqual(['7 - ORINA - SEDIMENTO']);
  });

  it('con etiquetas repetidas devuelve el id y la planilla elegida', () => {
    const onChange = vi.fn();
    render(
      <WorksheetAutocomplete
        value={null}
        onChange={onChange}
        label="Planilla"
        worksheets={WORKSHEETS}
      />,
    );
    type('101');
    fireEvent.click(screen.getAllByText('101 - QUÍMICA')[1]);
    expect(onChange).toHaveBeenCalledWith('w3', WORKSHEETS[2]);
  });

  it('no llama a onChange mientras se tipea ni guarda el texto', () => {
    const onChange = vi.fn();
    render(
      <WorksheetAutocomplete
        value="w2"
        onChange={onChange}
        label="Planilla"
        worksheets={WORKSHEETS}
      />,
    );
    const input = type('nada');
    expect(screen.getByText('Sin planillas')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('102 - HEMATOLOGÍA');
  });

  it('clearOnSelect vacía el input después de elegir', () => {
    const onChange = vi.fn();
    render(
      <WorksheetAutocomplete
        clearOnSelect
        value={null}
        onChange={onChange}
        label="Planilla"
        worksheets={WORKSHEETS}
      />,
    );
    const input = type('hemato');
    fireEvent.click(screen.getByText('102 - HEMATOLOGÍA'));
    expect(onChange).toHaveBeenCalledWith('w2', WORKSHEETS[1]);
    expect(input.value).toBe('');
  });

  it('onEnter recibe el texto tipeado y no envía el formulario', () => {
    const onEnter = vi.fn((text: string, tools: any) => tools.findByCode(text));
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <WorksheetAutocomplete
          clearOnSelect
          value={null}
          onChange={vi.fn()}
          onEnter={onEnter}
          label="Planilla"
          worksheets={WORKSHEETS}
        />
      </form>,
    );
    const input = type('102');
    const notPrevented = fireEvent.keyDown(input, { key: 'Enter' });
    expect(notPrevented).toBe(false);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEnter.mock.calls[0][0]).toBe('102');
    expect(onEnter.mock.results[0].value).toBe(WORKSHEETS[1]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('Enter con una opción resaltada la elige MUI y no llama además a onEnter', () => {
    const onChange = vi.fn();
    const onEnter = vi.fn();
    render(
      <WorksheetAutocomplete
        clearOnSelect
        value={null}
        onChange={onChange}
        onEnter={onEnter}
        label="Planilla"
        worksheets={WORKSHEETS}
      />,
    );
    const input = type('hemato');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('w2', WORKSHEETS[1]);
    expect(onEnter).not.toHaveBeenCalled();
  });

});

afterEach(cleanup);
