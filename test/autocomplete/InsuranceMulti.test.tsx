/**
 * Autocomplete múltiple (MultiCombobox) probado vía InsuranceMultiAutocomplete.
 * Contrato: EntityMultiAutocomplete de DEVA (Autocomplete `multiple` de MUI): valor = array de ids,
 * chips con «quitar», hideSelected, limitTags, Backspace, guardia de Enter. Escritas antes de implementar.
 */
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { InsuranceMultiAutocomplete } from '../../src/ui';

afterEach(cleanup);

const ITEMS = [
  { id: 'o1', code: 1, abbreviation: 'INSSSEP', name: 'Instituto' },
  { id: 'o2', code: 2, abbreviation: 'MEDICUS', name: 'Medicus' },
  { id: 'o3', code: 3, abbreviation: 'OSDE', name: 'Osde' },
  { id: 'o4', code: 4, abbreviation: 'SANCOR', name: 'Sancor' },
];

type Props = Partial<React.ComponentProps<typeof InsuranceMultiAutocomplete>>;

function Harness({
  initial = [],
  onChange,
  ...props
}: { initial?: string[]; onChange?: (ids: string[]) => void } & Props) {
  const [ids, setIds] = useState<string[]>(initial);
  return (
    <>
      <InsuranceMultiAutocomplete
        label="Obras sociales"
        insurances={ITEMS}
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
const optionTexts = () => options().map((o) => o.textContent);
const removeButtons = () => screen.queryAllByRole('button', { name: /^Quitar / });
const typeText = (text: string) => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: text } });
};

describe('valor y chips', () => {
  it('con estado local devuelve ids y usa la etiqueta propia (prueba de DEVA-107)', () => {
    const items = [
      { id: '2', code: '2', name: 'PARTICULAR' },
      { id: '1', code: '1', name: 'INSSSEP' },
    ];
    render(
      <Harness
        insurances={items}
        getLabel={(item) => item.name as string}
        initial={['2']}
        hideSelected
        label="Obras sociales"
      />,
    );
    expect(screen.getByText('PARTICULAR')).toBeInTheDocument();
    typeText('ins');
    expect(optionTexts()).toEqual(['INSSSEP']);
    fireEvent.click(screen.getByText('INSSSEP'));
    expect(screen.getByTestId('ids')).toHaveTextContent('2,1');
  });

  it('muestra un chip por cada id elegido, con su etiqueta, y el campo de texto vacío', () => {
    render(<Harness initial={['o2', 'o4']} />);
    expect(screen.getByText('2 - MEDICUS')).toBeInTheDocument();
    expect(screen.getByText('4 - SANCOR')).toBeInTheDocument();
    expect(removeButtons()).toHaveLength(2);
    expect(input().value).toBe('');
  });

  it('un id que no está en la lista no genera chip', () => {
    render(<Harness initial={['o2', 'no-existe']} />);
    expect(removeButtons()).toHaveLength(1);
  });

  it('elegir una opción agrega su id al final y avisa ids y objetos', () => {
    const onChange = vi.fn();
    render(<InsuranceMultiAutocomplete label="OS" insurances={ITEMS} value={['o1']} onChange={onChange} />);
    fireEvent.mouseDown(input());
    fireEvent.click(options()[2]);
    expect(onChange).toHaveBeenCalledWith(['o1', 'o3'], [ITEMS[0], ITEMS[2]]);
  });

  it('después de elegir, el texto se vacía y la lista se cierra', () => {
    render(<Harness />);
    typeText('sanc');
    fireEvent.click(options()[0]);
    expect(input().value).toBe('');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByTestId('ids')).toHaveTextContent('o4');
  });

  it('mientras se tipea no se avisa nada', () => {
    const onChange = vi.fn();
    render(<Harness initial={['o1']} onChange={onChange} />);
    typeText('me');
    typeText('med');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('si el padre pasa un array nuevo con los mismos ids mientras se tipea, el texto no se pierde (memoización)', () => {
    const { rerender } = render(
      <InsuranceMultiAutocomplete label="OS" insurances={ITEMS} value={['o1']} onChange={vi.fn()} />,
    );
    typeText('med');
    rerender(<InsuranceMultiAutocomplete label="OS" insurances={ITEMS} value={['o1']} onChange={vi.fn()} />);
    rerender(<InsuranceMultiAutocomplete label="OS" insurances={ITEMS} value={['o1']} onChange={vi.fn()} />);
    expect(input().value).toBe('med');
  });
});

describe('hideSelected', () => {
  it('con hideSelected no ofrece los ya elegidos', () => {
    render(<Harness initial={['o1', 'o2']} hideSelected />);
    fireEvent.mouseDown(input());
    expect(optionTexts()).toEqual(['3 - OSDE', '4 - SANCOR']);
  });

  it('sin hideSelected los elegidos se ofrecen marcados y elegirlos de nuevo los quita (como MUI)', () => {
    render(<Harness initial={['o1', 'o2']} />);
    fireEvent.mouseDown(input());
    expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['true', 'true', 'false', 'false']);
    fireEvent.click(options()[0]);
    expect(screen.getByTestId('ids')).toHaveTextContent('o2');
  });
});

describe('quitar', () => {
  it('el botón de cada chip lo quita y avisa los que quedan', () => {
    const onChange = vi.fn();
    render(<Harness initial={['o1', 'o2', 'o3']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar 2 - MEDICUS' }));
    expect(onChange).toHaveBeenCalledWith(['o1', 'o3']);
    expect(removeButtons()).toHaveLength(2);
  });

  it('Retroceso con el texto vacío quita el último chip', () => {
    const onChange = vi.fn();
    render(<Harness initial={['o1', 'o2']} onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['o1']);
  });

  it('Retroceso con texto escrito no quita nada (borra el texto)', () => {
    const onChange = vi.fn();
    render(<Harness initial={['o1', 'o2']} onChange={onChange} />);
    typeText('x');
    fireEvent.keyDown(input(), { key: 'Backspace' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Retroceso sin chips no hace nada', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'Backspace' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('el botón «Borrar» vacía todos los valores', () => {
    const onChange = vi.fn();
    render(<Harness initial={['o1', 'o2']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.getByTestId('ids')).toHaveTextContent('');
  });

  it('sin valores ni texto no ofrece «Borrar»', () => {
    render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Borrar' })).toBeNull();
  });

  it('ArrowLeft con el texto vacío enfoca el último chip; Retroceso sobre el chip lo quita; ArrowRight vuelve al texto', () => {
    const onChange = vi.fn();
    render(<Harness initial={['o1', 'o2']} onChange={onChange} />);
    input().focus();
    fireEvent.keyDown(input(), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Quitar 2 - MEDICUS' }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Quitar 1 - INSSSEP' }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(input());
    fireEvent.keyDown(input(), { key: 'ArrowLeft' });
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Backspace' });
    expect(onChange).toHaveBeenLastCalledWith(['o1']);
  });
});

describe('limitTags', () => {
  const FOUR = ['o1', 'o2', 'o3', 'o4'];

  it('sin foco muestra sólo los primeros y un «+N» con el resto', () => {
    render(<Harness initial={FOUR} limitTags={2} />);
    expect(removeButtons()).toHaveLength(2);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('con foco muestra todos', () => {
    render(<Harness initial={FOUR} limitTags={2} />);
    fireEvent.focus(input());
    expect(removeButtons()).toHaveLength(4);
    expect(screen.queryByText('+2')).toBeNull();
  });

  it('con menos valores que el límite no muestra el «+N»', () => {
    render(<Harness initial={['o1']} limitTags={2} />);
    expect(screen.queryByText(/^\+/)).toBeNull();
  });
});

describe('teclado', () => {
  it('ArrowDown abre, resalta y Enter agrega la opción sin enviar el formulario', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(input()).toHaveAttribute('aria-activedescendant', options()[0].id);
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
    expect(onChange).toHaveBeenCalledWith(['o1']);
  });

  it('Enter con texto de búsqueda (sin resaltar) no envía el formulario (prueba de DEVA: «múltiple»)', () => {
    render(<Harness />);
    typeText('zzz');
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
  });

  it('Enter con el texto vacío sí deja enviar el formulario', () => {
    render(<Harness initial={['o1']} />);
    fireEvent.focus(input());
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(true);
  });

  it('Escape cierra la lista sin subir al diálogo; con la lista cerrada deja pasar la tecla', () => {
    const onKeyDown = vi.fn();
    render(
      <div onKeyDown={onKeyDown}>
        <Harness />
      </div>,
    );
    fireEvent.mouseDown(input());
    onKeyDown.mockClear();
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onKeyDown).not.toHaveBeenCalled();
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('salir del campo vacía el texto a medias y cierra la lista', () => {
    render(<Harness initial={['o1']} />);
    typeText('med');
    fireEvent.blur(input());
    expect(input().value).toBe('');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('lista y accesibilidad', () => {
  it('busca por code, abreviatura o nombre', () => {
    render(<Harness />);
    typeText('osde');
    expect(optionTexts()).toEqual(['3 - OSDE']);
    typeText('4');
    expect(optionTexts()).toEqual(['4 - SANCOR']);
  });

  it('marca las suspendidas pero las deja elegir', () => {
    render(<Harness suspendedCodes={[2]} />);
    fireEvent.mouseDown(input());
    expect(optionTexts()[1]).toBe('2 - MEDICUSSuspendida');
    fireEvent.click(options()[1]);
    expect(screen.getByTestId('ids')).toHaveTextContent('o2');
  });

  it('la lista es multiselección y la etiqueta nombra al campo y a la lista', () => {
    render(<Harness />);
    expect(screen.getByRole('combobox', { name: 'Obras sociales' })).toBeInTheDocument();
    fireEvent.mouseDown(input());
    expect(screen.getByRole('listbox', { name: 'Obras sociales' })).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('sin resultados y cargando muestran sus textos', () => {
    const { rerender } = render(
      <InsuranceMultiAutocomplete label="OS" insurances={[]} value={[]} onChange={vi.fn()} />,
    );
    typeText('x');
    expect(screen.getByText('Sin obras sociales')).toBeInTheDocument();
    rerender(<InsuranceMultiAutocomplete label="OS" insurances={undefined} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('Cargando obras sociales…')).toBeInTheDocument();
  });

  it('con error el campo queda inválido y vinculado a su texto', () => {
    render(<Harness error helperText="Elegí al menos una" />);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Elegí al menos una');
  });
});

describe('deshabilitado', () => {
  it('no deja escribir, abrir ni quitar chips', () => {
    const onChange = vi.fn();
    render(<Harness initial={['o1']} disabled onChange={onChange} />);
    expect(input()).toBeDisabled();
    fireEvent.mouseDown(input());
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(removeButtons()).toHaveLength(0);
    expect(screen.getByText('1 - INSSSEP')).toBeInTheDocument();
  });
});

describe('huecos que mostró la verificación por mutación', () => {
  it('si el padre cambia los valores mientras hay texto escrito, el texto se vacía (MUI reinicia el input)', () => {
    const { rerender } = render(
      <InsuranceMultiAutocomplete label="OS" insurances={ITEMS} value={['o1']} onChange={vi.fn()} />,
    );
    typeText('med');
    expect(input().value).toBe('med');
    rerender(<InsuranceMultiAutocomplete label="OS" insurances={ITEMS} value={['o1', 'o2']} onChange={vi.fn()} />);
    expect(input().value).toBe('');
  });

  it('al elegir una opción el texto se vacía aunque el padre no actualice el valor', () => {
    render(<InsuranceMultiAutocomplete label="OS" insurances={ITEMS} value={['o1']} onChange={vi.fn()} />);
    typeText('sanc');
    fireEvent.click(options()[0]);
    expect(input().value).toBe('');
  });

  it('pasar el foco del texto a un chip no cuenta como salir del campo: no se resume ni se pierde el chip', () => {
    render(<Harness initial={['o1', 'o2', 'o3']} limitTags={1} />);
    act(() => input().focus());
    expect(removeButtons()).toHaveLength(3);
    fireEvent.keyDown(input(), { key: 'ArrowLeft' });
    expect(removeButtons()).toHaveLength(3);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Quitar 3 - OSDE' }));
  });

  it('un blur del texto que va hacia un chip (relatedTarget) no resume los chips, aunque el foco todavía no haya llegado', () => {
    render(<Harness initial={['o1', 'o2', 'o3']} limitTags={1} />);
    act(() => input().focus());
    const chip = screen.getByRole('button', { name: 'Quitar 3 - OSDE' });
    fireEvent.blur(input(), { relatedTarget: chip });
    expect(removeButtons()).toHaveLength(3);
    fireEvent.blur(input(), { relatedTarget: document.body });
    expect(removeButtons()).toHaveLength(1);
  });

  it('deshabilitado: las flechas tampoco abren la lista', () => {
    render(<Harness disabled />);
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
