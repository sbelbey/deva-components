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
import { InsuranceAutocomplete, type InsuranceAutocompleteProps } from '../../src/ui';

// Forma de useInsurance(): etiqueta ya armada "code - abreviatura".
const INSURANCES = [
  { id: 'os1', insurance: '24 - OSDE', name: 'OSDE BINARIO', code: 24 },
  {
    id: 'os2',
    insurance: '1 - INSSSEP',
    name: 'INSTITUTO DE SEGUROS',
    code: 1,
  },
  // Misma etiqueta que os1 (copia local): tiene que seguir siendo otra opción.
  { id: 'os3', insurance: '24 - OSDE', name: 'OSDE COPIA', code: 24 },
  { id: 'os4', insurance: '167 - AVALIAN', name: 'AVALIAN', code: 167 },
];

function type(text: string) {
  const input = screen.getByRole('combobox');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  return input as HTMLInputElement;
}

function optionTexts() {
  return within(screen.getByRole('listbox'))
    .queryAllByRole('option')
    .map((option) => option.textContent);
}

describe('InsuranceAutocomplete (DEVA-107)', () => {
  it('busca por code, abreviatura o nombre y devuelve el id', () => {
    const onChange = vi.fn();
    render(
      <InsuranceAutocomplete
        value={null}
        onChange={onChange}
        label="Obra Social"
        insurances={INSURANCES}
      />,
    );
    type('instituto');
    expect(optionTexts()).toEqual(['1 - INSSSEP']);
    type('avalian');
    fireEvent.click(screen.getByText('167 - AVALIAN'));
    expect(onChange).toHaveBeenCalledWith('os4', INSURANCES[3]);
  });

  it('con etiquetas repetidas compara por id, no por etiqueta', () => {
    const onChange = vi.fn();
    render(
      <InsuranceAutocomplete
        value={null}
        onChange={onChange}
        label="Obra Social"
        insurances={INSURANCES}
      />,
    );
    type('copia');
    fireEvent.click(screen.getByText('24 - OSDE'));
    expect(onChange).toHaveBeenCalledWith('os3', INSURANCES[2]);
  });

  it('mientras se tipea no llama a onChange y sin coincidencias avisa en español', () => {
    const onChange = vi.fn();
    render(
      <InsuranceAutocomplete
        value="os2"
        onChange={onChange}
        label="Obra Social"
        insurances={INSURANCES}
      />,
    );
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe(
      '1 - INSSSEP',
    );
    type('zzz');
    expect(screen.getByText('Sin obras sociales')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('al salir sin elegir no guarda el texto tipeado: vuelve a la etiqueta del valor', () => {
    const onChange = vi.fn();
    render(
      <InsuranceAutocomplete
        value="os2"
        onChange={onChange}
        label="Obra Social"
        insurances={INSURANCES}
      />,
    );
    const input = type('osd');
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('1 - INSSSEP');
  });

  it('marca las suspendidas pero las deja elegir', () => {
    const onChange = vi.fn();
    render(
      <InsuranceAutocomplete
        value={null}
        onChange={onChange}
        label="Obra Social"
        insurances={INSURANCES}
        suspendedCodes={[167]}
      />,
    );
    type('167');
    expect(optionTexts()).toEqual(['167 - AVALIANSuspendida']);
    fireEvent.click(screen.getByText('167 - AVALIAN'));
    expect(onChange).toHaveBeenCalledWith('os4', INSURANCES[3]);
  });

  it('mientras la lista no llegó muestra el texto de carga', () => {
    render(
      <InsuranceAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Obra Social"
        insurances={undefined}
      />,
    );
    type('os');
    expect(screen.getByText('Cargando obras sociales…')).toBeInTheDocument();
  });
});

describe('código exacto (DEVA-148)', () => {
  function renderIns(extra: Record<string, unknown> = {}) {
    const onChange = vi.fn();
    const submit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={submit}>
        <InsuranceAutocomplete
          value={null}
          onChange={onChange}
          label="Obra Social"
          insurances={INSURANCES}
          selectByExactCode
          {...extra}
        />
      </form>,
    );
    return { onChange, submit };
  }

  it('Enter con código exacto elige esa obra social y no envía el form', () => {
    const { onChange, submit } = renderIns();
    const input = type('1');
    const notPrevented = fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('os2', INSURANCES[1]);
    expect(notPrevented).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });

  it('Tab con código exacto elige', () => {
    const { onChange } = renderIns();
    const input = type('167');
    const notPrevented = fireEvent.keyDown(input, { key: 'Tab' });
    expect(onChange).toHaveBeenCalledWith('os4', INSURANCES[3]);
    expect(notPrevented).toBe(true);
  });

  it('código repetido (24: os1 y os3) no elige nada', () => {
    const { onChange } = renderIns();
    fireEvent.keyDown(type('24'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sin coincidencia exacta (16) no elige', () => {
    const { onChange } = renderIns();
    fireEvent.keyDown(type('16'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sin la prop, Enter con código no elige', () => {
    const { onChange } = renderIns({ selectByExactCode: undefined });
    fireEvent.keyDown(type('1'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});


afterEach(cleanup);
