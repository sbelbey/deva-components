/**
 * StudyMultiAutocomplete: contrato de DEVA (StudyMultiAutocomplete de DEVA-107). Escritas antes de implementar.
 */
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudyMultiAutocomplete } from '../../src/ui';

afterEach(cleanup);

const STUDIES = [
  { id: 'a1', code: 475, name: 'GLUCEMIA', abbreviation: 'GLU' },
  { id: 'a2', code: 475, name: 'GLUCEMIA COPIA LOCAL' },
  { id: 'a3', code: 711, name: 'ORINA COMPLETA' },
  { id: 'a4', code: 1515001, name: 'COLOR' },
  { id: 'a5', code: 151, name: 'CERULOPLASMINA' },
];

type Props = Partial<React.ComponentProps<typeof StudyMultiAutocomplete>>;

function Harness({
  initial = [],
  onChange,
  ...props
}: { initial?: string[]; onChange?: (ids: string[]) => void } & Props) {
  const [ids, setIds] = useState<string[]>(initial);
  return (
    <>
      <StudyMultiAutocomplete
        label="Estudios"
        studies={STUDIES}
        value={ids}
        onChange={(next) => {
          setIds(next);
          onChange?.(next);
        }}
        {...props}
      />
      <span data-testid="ids">{ids.join(',')}</span>
    </>
  );
}

const input = () => screen.getByRole('combobox') as HTMLInputElement;
const options = () => within(screen.getByRole('listbox')).getAllByRole('option');
const optionLabels = () => options().map((o) => o.textContent);
const typeText = (text: string) => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: text } });
};

describe('StudyMultiAutocomplete (DEVA-107)', () => {
  it('devuelve ids y objetos, y con hideSelected no ofrece los ya elegidos (prueba de DEVA)', () => {
    render(<Harness initial={['a1']} hideSelected />);
    typeText('475');
    expect(optionLabels()).toEqual(['475 - GLUCEMIA COPIA LOCAL']);
    fireEvent.click(screen.getByText('475 - GLUCEMIA COPIA LOCAL'));
    expect(screen.getByTestId('ids')).toHaveTextContent('a1,a2');
  });

  it('avisa ids y objetos de todo lo elegido', () => {
    const onChange = vi.fn();
    render(<StudyMultiAutocomplete label="E" studies={STUDIES} value={['a1']} onChange={onChange} />);
    fireEvent.mouseDown(input());
    fireEvent.click(screen.getByText('711 - ORINA COMPLETA'));
    expect(onChange).toHaveBeenCalledWith(['a1', 'a3'], [STUDIES[0], STUDIES[2]]);
  });

  it('muestra un chip «code - name» por cada estudio elegido y se puede quitar', () => {
    const onChange = vi.fn();
    render(<Harness initial={['a1', 'a3']} onChange={onChange} />);
    expect(screen.getByText('475 - GLUCEMIA')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar 711 - ORINA COMPLETA' }));
    expect(onChange).toHaveBeenCalledWith(['a1']);
  });

  it('dos estudios con el mismo code son dos opciones y se elige por id', () => {
    render(<Harness />);
    typeText('475');
    expect(optionLabels()).toEqual(['475 - GLUCEMIA', '475 - GLUCEMIA COPIA LOCAL']);
    fireEvent.click(options()[1]);
    expect(screen.getByTestId('ids')).toHaveTextContent('a2');
  });

  it('busca por code, nombre y abreviatura', () => {
    render(<Harness />);
    typeText('glu');
    expect(optionLabels()).toEqual(['475 - GLUCEMIA', '475 - GLUCEMIA COPIA LOCAL']);
    typeText('orina');
    expect(optionLabels()).toEqual(['711 - ORINA COMPLETA']);
  });

  it('los sub-ítems de compuestos (151…) no se ofrecen salvo includeSubItems', () => {
    const { unmount } = render(<Harness />);
    typeText('color');
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    unmount();
    render(<Harness includeSubItems />);
    typeText('color');
    expect(optionLabels()).toEqual(['1515001 - COLOR']);
  });

  it('excludeIds y filter dejan afuera lo que corresponde', () => {
    render(<Harness excludeIds={['a1']} filter={(study) => study.id !== 'a3'} />);
    fireEvent.mouseDown(input());
    expect(optionLabels()).toEqual(['475 - GLUCEMIA COPIA LOCAL', '151 - CERULOPLASMINA']);
  });

  it('getLabel cambia la etiqueta de las opciones y de los chips', () => {
    render(<Harness initial={['a3']} getLabel={(study) => `#${study.code} ${study.name}`} />);
    expect(screen.getByText('#711 ORINA COMPLETA')).toBeInTheDocument();
    fireEvent.mouseDown(input());
    expect(optionLabels()[0]).toBe('#475 GLUCEMIA');
  });

  it('sin resultados, con texto propio y cargando', () => {
    const { rerender } = render(<StudyMultiAutocomplete label="E" studies={STUDIES} value={[]} onChange={vi.fn()} />);
    typeText('zzz');
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    rerender(
      <StudyMultiAutocomplete
        label="E"
        studies={STUDIES}
        value={[]}
        onChange={vi.fn()}
        noOptionsText="No hay estudios"
      />,
    );
    expect(screen.getByText('No hay estudios')).toBeInTheDocument();
    rerender(<StudyMultiAutocomplete label="E" studies={undefined} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('Cargando estudios…')).toBeInTheDocument();
  });

  it('limitTags resume los chips sin foco', () => {
    render(<Harness initial={['a1', 'a3', 'a5']} limitTags={1} />);
    expect(screen.getAllByRole('button', { name: /^Quitar / })).toHaveLength(1);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});

describe('Enter', () => {
  it('múltiple: Enter con texto tipeado no envía el formulario (prueba de DEVA)', () => {
    render(<Harness />);
    typeText('orina');
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
  });

  it('con onEnter: Enter llama a onEnter con el texto y nunca envía el formulario', () => {
    const onEnter = vi.fn();
    render(<Harness onEnter={onEnter} />);
    typeText('711');
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
    expect(onEnter).toHaveBeenCalledWith(
      '711',
      expect.objectContaining({
        findByExactCode: expect.any(Function),
        resolveExact: expect.any(Function),
        reset: expect.any(Function),
      }),
    );
  });

  it('con onEnter y el texto vacío, Enter tampoco envía el formulario', () => {
    render(<Harness onEnter={vi.fn()} />);
    fireEvent.focus(input());
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
  });

  it('con una opción resaltada con las flechas, Enter la agrega y NO llama a onEnter', () => {
    const onEnter = vi.fn();
    render(<Harness onEnter={onEnter} />);
    typeText('orina');
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(screen.getByTestId('ids')).toHaveTextContent('a3');
    expect(onEnter).not.toHaveBeenCalled();
  });

  it('las herramientas encuentran el estudio por code exacto y reset vacía el texto', () => {
    render(
      <Harness
        onEnter={(text, tools) => {
          const found = tools.findByExactCode(text);
          if (found) {
            tools.reset();
            document.body.setAttribute('data-found', String(found.id));
          }
        }}
      />,
    );
    typeText('711');
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(document.body.getAttribute('data-found')).toBe('a3');
    expect(input().value).toBe('');
    document.body.removeAttribute('data-found');
  });
});

describe('deshabilitado', () => {
  it('no deja escribir ni quitar chips', () => {
    render(<Harness initial={['a1']} disabled />);
    expect(input()).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Quitar / })).toBeNull();
  });
});
