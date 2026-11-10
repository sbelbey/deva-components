/**
 * WorksheetMultiAutocomplete: contrato de DEVA (WorksheetMultiAutocomplete de DEVA-107). Escritas antes de implementar.
 */
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { WorksheetMultiAutocomplete } from '../../src/ui';

afterEach(cleanup);

const WORKSHEETS = [
  { id: 'w1', code: 101, name: 'QUÍMICA' },
  { id: 'w2', code: 102, name: 'HEMATOLOGÍA' },
  // Mismo code y nombre que w1 (copia): otra opción.
  { id: 'w3', code: 101, name: 'QUÍMICA' },
  // Nombre con " - ": antes se partía la etiqueta por " - ".
  { id: 'w4', code: 7, name: 'ORINA - SEDIMENTO' },
];

function Harness({ initial = [], onChange }: { initial?: string[]; onChange?: (ids: string[]) => void }) {
  const [ids, setIds] = useState<string[]>(initial);
  return (
    <>
      <WorksheetMultiAutocomplete
        label="Planillas"
        worksheets={WORKSHEETS}
        value={ids}
        onChange={(next) => {
          setIds(next);
          onChange?.(next);
        }}
      />
      <span data-testid="ids">{ids.join(',')}</span>
    </>
  );
}

const input = () => screen.getByRole('combobox') as HTMLInputElement;
const options = () => within(screen.getByRole('listbox')).getAllByRole('option');
const optionTexts = () => options().map((o) => o.textContent);
const typeText = (text: string) => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: text } });
};

describe('WorksheetMultiAutocomplete (DEVA-107)', () => {
  it('múltiple: devuelve ids y planillas (prueba de DEVA)', () => {
    const onChange = vi.fn();
    render(<WorksheetMultiAutocomplete value={['w1']} onChange={onChange} label="Planillas" worksheets={WORKSHEETS} />);
    typeText('7');
    fireEvent.click(screen.getByText('7 - ORINA - SEDIMENTO'));
    expect(onChange).toHaveBeenCalledWith(['w1', 'w4'], [WORKSHEETS[0], WORKSHEETS[3]]);
  });

  it('una planilla con el mismo code y nombre es otra opción: se elige por id', () => {
    render(<Harness />);
    typeText('quimica');
    expect(optionTexts()).toEqual(['101 - QUÍMICA', '101 - QUÍMICA']);
    fireEvent.click(options()[1]);
    expect(screen.getByTestId('ids')).toHaveTextContent('w3');
  });

  it('busca por code y nombre, con varios términos y sin acentos', () => {
    render(<Harness />);
    typeText('hemato');
    expect(optionTexts()).toEqual(['102 - HEMATOLOGÍA']);
    typeText('orina sedim');
    expect(optionTexts()).toEqual(['7 - ORINA - SEDIMENTO']);
  });

  it('un chip por planilla elegida, con la etiqueta «code - name» aunque el nombre tenga « - »', () => {
    render(<Harness initial={['w4', 'w2']} />);
    expect(screen.getByText('7 - ORINA - SEDIMENTO')).toBeInTheDocument();
    expect(screen.getByText('102 - HEMATOLOGÍA')).toBeInTheDocument();
  });

  it('quitar un chip avisa los que quedan, y Retroceso con el texto vacío quita el último', () => {
    const onChange = vi.fn();
    render(<Harness initial={['w1', 'w2', 'w4']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar 102 - HEMATOLOGÍA' }));
    expect(onChange).toHaveBeenLastCalledWith(['w1', 'w4']);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'Backspace' });
    expect(onChange).toHaveBeenLastCalledWith(['w1']);
  });

  it('elegir una planilla ya elegida la quita', () => {
    render(<Harness initial={['w2']} />);
    typeText('hemato');
    fireEvent.click(options()[0]);
    expect(screen.getByTestId('ids')).toHaveTextContent('');
  });

  it('Enter con texto de búsqueda no envía el formulario; con una opción resaltada la agrega', () => {
    render(<Harness />);
    typeText('zz');
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
    typeText('hemato');
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(screen.getByTestId('ids')).toHaveTextContent('w2');
  });

  it('sin resultados y cargando muestran sus textos', () => {
    const { rerender } = render(<WorksheetMultiAutocomplete label="P" worksheets={[]} value={[]} onChange={vi.fn()} />);
    typeText('x');
    expect(screen.getByText('Sin planillas')).toBeInTheDocument();
    rerender(<WorksheetMultiAutocomplete label="P" worksheets={undefined} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('Cargando planillas…')).toBeInTheDocument();
  });

  it('deshabilitado: no deja escribir ni quitar chips', () => {
    render(<WorksheetMultiAutocomplete label="P" worksheets={WORKSHEETS} value={['w1']} onChange={vi.fn()} disabled />);
    expect(input()).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Quitar / })).toBeNull();
  });
});
