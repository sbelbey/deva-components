import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DoctorAutocomplete, WorksheetAutocomplete } from '../../src/ui';

afterEach(cleanup);

const DOCTORS = [
  { id: 'm1', doctor: '1234 - JUAN GÓMEZ' },
  { id: 'm2', doctor: '5678 - ANA PÉREZ' },
  { id: 'm3', doctor: '9012 - LUIS ROJAS' },
];

function Harness({ initial = null, onChange = vi.fn() }: { initial?: string | null; onChange?: (id: string | null) => void }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <DoctorAutocomplete
      label="Médico"
      doctors={DOCTORS}
      value={value}
      onChange={(id) => {
        setValue(id);
        onChange(id);
      }}
    />
  );
}

const input = () => screen.getByRole('combobox') as HTMLInputElement;

describe('Combobox: teclado y cierre', () => {
  it('ArrowDown abre la lista y resalta la primera; Enter la elige y cierra', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')[0]).toHaveClass('bg-deva-surface-2');

    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('m1');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input().value).toBe('1234 - JUAN GÓMEZ');
  });

  it('ArrowUp sin resaltado va a la última, y las flechas dan la vuelta', () => {
    render(<Harness />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowUp' });
    expect(input()).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[2].id);
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(input()).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0].id);
  });

  it('Escape cierra la lista sin borrar lo elegido y no sube al diálogo de afuera', () => {
    const onKeyDown = vi.fn();
    render(
      <div onKeyDown={onKeyDown}>
        <Harness initial="m2" />
      </div>,
    );
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    onKeyDown.mockClear();
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input().value).toBe('5678 - ANA PÉREZ');
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('al abrir con algo elegido resalta esa opción y muestra toda la lista', () => {
    render(<Harness initial="m2" />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('salir del campo con texto a medias vuelve a la etiqueta de lo elegido', () => {
    render(<Harness initial="m2" />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: 'zzz' } });
    expect(input().value).toBe('zzz');
    fireEvent.blur(input());
    expect(input().value).toBe('5678 - ANA PÉREZ');
  });

  it('Tab no elige la opción resaltada', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'Tab' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('el botón «Borrar» vacía el campo y avisa null', () => {
    const onChange = vi.fn();
    render(<Harness initial="m2" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(input().value).toBe('');
  });

  it('con el campo deshabilitado no abre la lista', () => {
    render(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value={null} onChange={vi.fn()} disabled />);
    fireEvent.mouseDown(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('un clic en el campo abre la lista y otro con el campo vacío la cierra (como MUI)', () => {
    render(<Harness />);
    fireEvent.mouseDown(input());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(input());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('el mensaje de «Sin resultados» y el de carga salen donde corresponde', () => {
    const { rerender } = render(<DoctorAutocomplete label="Médico" doctors={[]} value={null} onChange={vi.fn()} />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: 'x' } });
    expect(screen.getByText('Sin médicos')).toBeInTheDocument();
    rerender(<DoctorAutocomplete label="Médico" doctors={undefined} value={null} onChange={vi.fn()} />);
    expect(screen.getByText('Cargando médicos…')).toBeInTheDocument();
  });
});

describe('WorksheetAutocomplete: agregar a una lista (Imprimir planillas)', () => {
  const WORKSHEETS = [
    { id: 'w1', code: 7, name: 'ORINA' },
    { id: 'w2', code: 12, name: 'HEMATOLOGÍA' },
  ];

  it('clearOnSelect deja el campo vacío después de elegir', () => {
    const onChange = vi.fn();
    render(<WorksheetAutocomplete label="Planilla" worksheets={WORKSHEETS} value={null} onChange={onChange} clearOnSelect />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: 'hemato' } });
    fireEvent.click(screen.getByText('12 - HEMATOLOGÍA'));
    expect(onChange).toHaveBeenCalledWith('w2', WORKSHEETS[1]);
    expect(input().value).toBe('');
  });

  it('Enter con un code exacto lo agrega por onEnter y vacía el texto', () => {
    const onChange = vi.fn();
    const onEnter = vi.fn((text: string, tools: { findByCode: (c: string) => unknown; reset: () => void }) => {
      const found = tools.findByCode(text);
      if (found) tools.reset();
    });
    render(<WorksheetAutocomplete label="Planilla" worksheets={WORKSHEETS} value={null} onChange={onChange} onEnter={onEnter} clearOnSelect />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '12' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onEnter).toHaveBeenCalledWith('12', expect.objectContaining({ findByCode: expect.any(Function) }));
    expect(input().value).toBe('');
  });
});
