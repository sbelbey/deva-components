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
import { StudyAutocomplete, type StudyAutocompleteProps } from '../../src/ui';
import type { StudyLike } from '../../src';

type Analises = StudyLike & Record<string, unknown>;

function study(
  id: string,
  code: number,
  name: string,
  abbreviation = '',
): Analises {
  return { id, code, name, abbreviation, biochemistUnit: 1, delayTime: 0 };
}

const STUDIES: Analises[] = [
  study('a1', 475, 'GLUCEMIA', 'GLU'),
  study('a2', 475, 'GLUCEMIA COPIA LOCAL'),
  study('a3', 711, 'ORINA COMPLETA'),
  study('a4', 1515001, 'COLOR'),
  study('a5', 151, 'CERULOPLASMINA'),
];

function type(text: string) {
  const input = screen.getByRole('combobox');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  return input;
}

function optionLabels() {
  return within(screen.getByRole('listbox'))
    .queryAllByRole('option')
    .map((option) => option.textContent);
}

describe('StudyAutocomplete (DEVA-107)', () => {
  it('no ofrece sub-ítems de compuestos salvo con includeSubItems, y sí el 151 real', () => {
    const { unmount } = render(
      <StudyAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Estudio"
        studies={STUDIES}
      />,
    );
    type('151');
    expect(optionLabels()).toEqual(['151 - CERULOPLASMINA']);
    type('color');
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    unmount();

    render(
      <StudyAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Estudio"
        studies={STUDIES}
        includeSubItems
      />,
    );
    type('color');
    expect(optionLabels()).toEqual(['1515001 - COLOR']);
  });

  it('con codes repetidos devuelve el id de la opción elegida, no el primero con ese code', () => {
    const onChange = vi.fn();
    render(
      <StudyAutocomplete
        value={null}
        onChange={onChange}
        label="Estudio"
        studies={STUDIES}
      />,
    );
    type('475');
    fireEvent.click(screen.getByText('475 - GLUCEMIA COPIA LOCAL'));
    expect(onChange).toHaveBeenCalledWith('a2', STUDIES[1]);
  });

  it('busca por abreviatura y sin acentos, y avisa en español si no hay resultados', () => {
    render(
      <StudyAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Estudio"
        studies={STUDIES}
      />,
    );
    type('glu');
    expect(optionLabels()).toContain('475 - GLUCEMIA');
    type('zzz');
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('mientras se tipea no llama a onChange (el valor en Formik no queda undefined)', () => {
    const onChange = vi.fn();
    render(
      <StudyAutocomplete
        value="a3"
        onChange={onChange}
        label="Estudio"
        studies={STUDIES}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('711 - ORINA COMPLETA');
    type('gluc');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('funciona con estado local: muestra la etiqueta del id elegido', () => {
    function Harness() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <>
          <StudyAutocomplete
            value={value}
            onChange={(id) => setValue(id)}
            label="Estudio"
            studies={STUDIES}
          />
          <span data-testid="value">{value ?? 'null'}</span>
        </>
      );
    }
    render(<Harness />);
    type('orina');
    fireEvent.click(screen.getByText('711 - ORINA COMPLETA'));
    expect(screen.getByTestId('value')).toHaveTextContent('a3');
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe(
      '711 - ORINA COMPLETA',
    );
  });

  it('clearOnSelect vacía el input después de elegir', () => {
    const onChange = vi.fn();
    render(
      <StudyAutocomplete
        value={null}
        onChange={onChange}
        label="Agregar"
        studies={STUDIES}
        clearOnSelect
      />,
    );
    type('orina');
    fireEvent.click(screen.getByText('711 - ORINA COMPLETA'));
    expect(onChange).toHaveBeenCalledWith('a3', STUDIES[2]);
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
  });

  it('Enter resuelve por code exacto y por atajo de perfil', () => {
    const onEnter = vi.fn((text: string, tools: any) =>
      tools.resolveExact(text),
    );
    const profiles = [
      { _id: 'p1', name: 'RUTINA', shortcutCode: 'RUT', studies: [STUDIES[0]] },
    ];
    render(
      <StudyAutocomplete
        value={null}
        onChange={vi.fn()}
        label="Estudio"
        studies={STUDIES}
        profiles={profiles}
        onEnter={onEnter}
      />,
    );
    const input = type('711');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEnter.mock.results[0].value).toEqual({
      kind: 'study',
      study: STUDIES[2],
    });
    type('RUT');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEnter.mock.results[1].value).toEqual({
      kind: 'profile',
      profile: profiles[0],
    });
  });

  it('al elegir un perfil llama a onProfileSelect y no a onChange', () => {
    const onChange = vi.fn();
    const onProfileSelect = vi.fn();
    const profiles = [
      { _id: 'p1', name: 'RUTINA', shortcutCode: 'RUT', studies: [] },
    ];
    render(
      <StudyAutocomplete
        value={null}
        onChange={onChange}
        onProfileSelect={onProfileSelect}
        label="Estudio"
        studies={STUDIES}
        profiles={profiles}
      />,
    );
    type('rutina');
    fireEvent.click(screen.getByText('RUT - RUTINA'));
    expect(onProfileSelect).toHaveBeenCalledWith(profiles[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('getLabel cambia la etiqueta sin dejar de resolver por id', () => {
    const onChange = vi.fn();
    render(
      <StudyAutocomplete
        value={null}
        onChange={onChange}
        label="Estudio"
        studies={STUDIES}
        includeSubItems
        getLabel={(s) => `${s.code} - ${s.name} (sub-ítem de ORINA)`}
      />,
    );
    type('color');
    fireEvent.click(screen.getByText('1515001 - COLOR (sub-ítem de ORINA)'));
    expect(onChange).toHaveBeenCalledWith('a4', STUDIES[3]);
  });
});

/** Enter como en el navegador: sin preventDefault, el form se envía solo. */
function pressEnterInForm(input: HTMLElement) {
  const notPrevented = fireEvent.keyDown(input, { key: 'Enter' });
  if (notPrevented) (input as HTMLInputElement).form?.requestSubmit();
}

describe('StudyAutocomplete dentro de un <form> (Enter)', () => {
  it('freeSolo sin onEnter: Enter con texto tipeado no envía el formulario', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <StudyAutocomplete
          freeSolo
          clearOnSelect
          value={null}
          onChange={vi.fn()}
          label="Estudio"
          studies={STUDIES}
        />
        <button type="submit">Guardar</button>
      </form>,
    );
    const input = type('47');
    pressEnterInForm(input);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('con un estudio elegido y sin buscar, Enter sigue enviando el formulario', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <StudyAutocomplete
          value="a3"
          onChange={vi.fn()}
          label="Estudio"
          studies={STUDIES}
        />
        <button type="submit">Guardar</button>
      </form>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('711 - ORINA COMPLETA');
    pressEnterInForm(input);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('StudyAutocomplete con selectedLabel (Editar análisis)', () => {
  it('la lista muestra el sufijo y el input, ya elegido, sólo "code - name"', () => {
    function Harness() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <StudyAutocomplete
          value={value}
          onChange={(id) => setValue(id)}
          label="Buscar"
          studies={STUDIES}
          includeSubItems
          getLabel={(s) =>
            s.id === 'a4'
              ? `${s.code} - ${s.name} (sub-ítem de ORINA COMPLETA)`
              : `${s.code} - ${s.name}`
          }
          selectedLabel={(s) => `${s.code} - ${s.name}`}
        />
      );
    }
    render(<Harness />);
    const input = type('color');
    expect(optionLabels()).toEqual([
      '1515001 - COLOR (sub-ítem de ORINA COMPLETA)',
    ]);
    fireEvent.click(
      screen.getByText('1515001 - COLOR (sub-ítem de ORINA COMPLETA)'),
    );
    expect((input as HTMLInputElement).value).toBe('1515001 - COLOR');
    fireEvent.blur(input);
    expect((input as HTMLInputElement).value).toBe('1515001 - COLOR');
  });
});

afterEach(cleanup);
