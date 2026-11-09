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
import { DiagnosisAutocomplete } from '../../src/ui';

const DIAGNOSES = [
  { id: 'd1', code: 'A09.9', name: 'DIARREA Y GASTROENTERITIS' },
  { id: 'd2', code: 'E11', name: 'DIABETES TIPO 2' },
  // Mismo code que d1 (copia del laboratorio): otra opción.
  { id: 'd3', code: 'A09.9', name: 'DIARREA COPIA LOCAL' },
  // Code con guion: antes se partía por '-' y no se encontraba.
  { id: 'd4', code: 'Z00-1', name: 'CONTROL DE SALUD' },
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

describe('DiagnosisAutocomplete (DEVA-107)', () => {
  it('busca por code ignorando los puntos y devuelve el id de la opción elegida', () => {
    const onChange = vi.fn();
    render(
      <DiagnosisAutocomplete
        value={null}
        onChange={onChange}
        label="Diagnóstico"
        diagnoses={DIAGNOSES}
      />,
    );
    type('a099');
    expect(optionLabels()).toEqual([
      'A09.9 - DIARREA Y GASTROENTERITIS',
      'A09.9 - DIARREA COPIA LOCAL',
    ]);
    fireEvent.click(screen.getByText('A09.9 - DIARREA COPIA LOCAL'));
    expect(onChange).toHaveBeenCalledWith('d3', DIAGNOSES[2]);
  });

  it('un code con guion se elige por id', () => {
    const onChange = vi.fn();
    render(
      <DiagnosisAutocomplete
        value={null}
        onChange={onChange}
        label="Diagnóstico"
        diagnoses={DIAGNOSES}
      />,
    );
    type('control');
    fireEvent.click(screen.getByText('Z00-1 - CONTROL DE SALUD'));
    expect(onChange).toHaveBeenCalledWith('d4', DIAGNOSES[3]);
  });

  it('mientras se tipea no llama a onChange, y al salir no guarda el texto', () => {
    const onChange = vi.fn();
    render(
      <DiagnosisAutocomplete
        value="d2"
        onChange={onChange}
        label="Diagnóstico"
        diagnoses={DIAGNOSES}
      />,
    );
    const input = type('zzz');
    expect(screen.getByText('Sin diagnósticos')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('E11 - DIABETES TIPO 2');
  });

  it('freeSolo (Orden digital): avisa el texto, toma el del padre y al elegir muestra la etiqueta', () => {
    function Harness() {
      const [code, setCode] = useState('E11');
      const selected = DIAGNOSES.find((d) => d.code === code);
      return (
        <>
          <DiagnosisAutocomplete
            value={selected?.id ?? null}
            onChange={(_id, raw) => setCode(raw?.code ?? '')}
            freeSolo
            freeText={code}
            onFreeTextChange={setCode}
            label="Diagnóstico"
            diagnoses={DIAGNOSES}
          />
          <span data-testid="code">{code}</span>
          <button type="button" onClick={() => setCode('Z99.9')}>
            receta
          </button>
        </>
      );
    }
    render(<Harness />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('E11 - DIABETES TIPO 2');

    // El padre pone un CIE10 que no está en el nomenclador: se ve tal cual.
    fireEvent.click(screen.getByText('receta'));
    expect(input.value).toBe('Z99.9');

    type('diabetes');
    expect(screen.getByTestId('code')).toHaveTextContent('diabetes');
    fireEvent.click(screen.getByText('E11 - DIABETES TIPO 2'));
    expect(screen.getByTestId('code')).toHaveTextContent('E11');
    expect(input.value).toBe('E11 - DIABETES TIPO 2');
  });
});

describe('código exacto (DEVA-148)', () => {
  function renderDx(extra: Record<string, unknown> = {}) {
    const onChange = vi.fn();
    render(
      <DiagnosisAutocomplete
        value={null}
        onChange={onChange}
        label="Diagnóstico"
        diagnoses={DIAGNOSES}
        selectByExactCode
        {...extra}
      />,
    );
    return { onChange };
  }

  it('E11 + Tab elige d2, también en minúsculas', () => {
    const { onChange } = renderDx();
    fireEvent.keyDown(type('E11'), { key: 'Tab' });
    expect(onChange).toHaveBeenCalledWith('d2', DIAGNOSES[1]);
    onChange.mockClear();
    fireEvent.keyDown(type('e11'), { key: 'Tab' });
    expect(onChange).toHaveBeenCalledWith('d2', DIAGNOSES[1]);
  });

  it('a099 con A09.9 repetido (d1/d3) no elige (ambiguo)', () => {
    const { onChange } = renderDx();
    fireEvent.keyDown(type('a099'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Z00-1 (code con guion) + Enter elige d4', () => {
    const { onChange } = renderDx();
    fireEvent.keyDown(type('Z00-1'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('d4', DIAGNOSES[3]);
  });

  it('sin match o sin la prop no elige', () => {
    const { onChange } = renderDx();
    fireEvent.keyDown(type('ZZZ'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sin la prop no elige', () => {
    const { onChange } = renderDx({ selectByExactCode: undefined });
    fireEvent.keyDown(type('E11'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});


afterEach(cleanup);
