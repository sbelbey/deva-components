/**
 * Contrato del autocomplete de DEVA (Autocomplete de MUI + pieles de DEVA-107/148).
 * Estas pruebas se escribieron contra lo que DEVA garantiza, no contra la implementación.
 */
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DiagnosisAutocomplete, DoctorAutocomplete, InsuranceAutocomplete, PatientDniAutocomplete } from '../../src/ui';

afterEach(cleanup);

const DOCTORS = [
  { id: 'm1', doctor: '1234 - JUAN GÓMEZ' },
  { id: 'm2', doctor: '5678 - ANA PÉREZ' },
  { id: 'm3', doctor: '9012 - LUIS ROJAS' },
];

function Harness({
  initial = null,
  onChange = vi.fn(),
  doctors = DOCTORS as typeof DOCTORS | undefined,
}: {
  initial?: string | null;
  onChange?: (id: string | null) => void;
  doctors?: typeof DOCTORS;
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <DoctorAutocomplete
      label="Médico"
      doctors={doctors}
      value={value}
      onChange={(id) => {
        setValue(id);
        onChange(id);
      }}
    />
  );
}

const input = () => screen.getByRole('combobox') as HTMLInputElement;
const options = () => within(screen.getByRole('listbox')).getAllByRole('option');
const typeText = (text: string) => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: text } });
};

describe('valor y texto', () => {
  it('borrar todo el texto con algo elegido avisa null (MUI llama a onChange(null))', () => {
    const onChange = vi.fn();
    render(<Harness initial="m2" onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('tipear sin llegar a borrar todo nunca avisa', () => {
    const onChange = vi.fn();
    render(<Harness initial="m2" onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '5678 - ANA PÉRE' } });
    fireEvent.change(input(), { target: { value: 'xyz' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('al volver a abrir con algo elegido se ven todas las opciones, no sólo la elegida', () => {
    render(<Harness initial="m2" />);
    fireEvent.mouseDown(input());
    expect(options()).toHaveLength(3);
  });

  it('elegir por clic deja la etiqueta en el campo y cierra la lista; al reabrir se ve todo', () => {
    render(<Harness />);
    typeText('ana');
    fireEvent.click(options()[0]);
    expect(input().value).toBe('5678 - ANA PÉREZ');
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.blur(input());
    fireEvent.mouseDown(input());
    expect(options()).toHaveLength(3);
  });

  it('si el padre cambia el valor, el campo muestra la etiqueta nueva', () => {
    const { rerender } = render(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value="m1" onChange={vi.fn()} />);
    expect(input().value).toBe('1234 - JUAN GÓMEZ');
    rerender(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value="m3" onChange={vi.fn()} />);
    expect(input().value).toBe('9012 - LUIS ROJAS');
    rerender(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value={null} onChange={vi.fn()} />);
    expect(input().value).toBe('');
  });

  it('si la lista llega después, el valor que ya estaba muestra su etiqueta', () => {
    const { rerender } = render(<DoctorAutocomplete label="Médico" doctors={undefined} value="m2" onChange={vi.fn()} />);
    expect(input().value).toBe('');
    rerender(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value="m2" onChange={vi.fn()} />);
    expect(input().value).toBe('5678 - ANA PÉREZ');
  });

  it('un valor que no está en la lista deja el campo vacío (no muestra el id)', () => {
    render(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value="no-existe" onChange={vi.fn()} />);
    expect(input().value).toBe('');
  });
});

describe('teclado', () => {
  it('Inicio y Fin saltan a la primera y a la última opción cuando hay una resaltada', () => {
    render(<Harness />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'End' });
    expect(input()).toHaveAttribute('aria-activedescendant', options()[2].id);
    fireEvent.keyDown(input(), { key: 'Home' });
    expect(input()).toHaveAttribute('aria-activedescendant', options()[0].id);
  });

  it('Inicio y Fin no se comen la tecla cuando no hay nada resaltado (mueven el cursor del texto)', () => {
    render(<Harness />);
    typeText('a');
    expect(fireEvent.keyDown(input(), { key: 'Home' })).toBe(true);
    expect(fireEvent.keyDown(input(), { key: 'End' })).toBe(true);
  });

  it('AvPág y RePág saltan de a cinco y se frenan en los extremos', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `x${i}`, doctor: `${1000 + i} - MÉDICO ${i}` }));
    render(<DoctorAutocomplete label="Médico" doctors={many} value={null} onChange={vi.fn()} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'PageDown' });
    expect(input()).toHaveAttribute('aria-activedescendant', options()[5].id);
    fireEvent.keyDown(input(), { key: 'PageDown' });
    fireEvent.keyDown(input(), { key: 'PageDown' });
    expect(input()).toHaveAttribute('aria-activedescendant', options()[11].id);
    fireEvent.keyDown(input(), { key: 'PageUp' });
    expect(input()).toHaveAttribute('aria-activedescendant', options()[6].id);
  });

  it('Enter con una opción resaltada la elige y no envía el formulario', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    const notPrevented = fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('m1');
    expect(notPrevented).toBe(false);
  });

  it('Enter mientras se busca (texto que no es la etiqueta) no envía el formulario aunque no haya nada resaltado', () => {
    render(<Harness />);
    typeText('zzz');
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
  });

  it('Enter con el campo vacío o con la etiqueta ya elegida SÍ deja enviar el formulario', () => {
    const { unmount } = render(<Harness />);
    fireEvent.focus(input());
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(true);
    unmount();

    render(<Harness initial="m2" />);
    fireEvent.focus(input());
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(true);
  });

  it('Escape con la lista cerrada deja pasar la tecla (para que cierre el diálogo de afuera)', () => {
    const onKeyDown = vi.fn();
    render(
      <div onKeyDown={onKeyDown}>
        <Harness />
      </div>,
    );
    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('las flechas no se quedan colgadas si no hay opciones', () => {
    render(<Harness doctors={[]} />);
    typeText('zzz');
    expect(() => {
      fireEvent.keyDown(input(), { key: 'ArrowDown' });
      fireEvent.keyDown(input(), { key: 'ArrowUp' });
    }).not.toThrow();
    expect(screen.getByText('Sin médicos')).toBeInTheDocument();
  });
});

describe('mouse y foco', () => {
  it('pasar el mouse resalta la opción y el clic la elige', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.mouseDown(input());
    fireEvent.mouseMove(options()[1]);
    expect(input()).toHaveAttribute('aria-activedescendant', options()[1].id);
    fireEvent.click(options()[1]);
    expect(onChange).toHaveBeenCalledWith('m2');
  });

  it('el botón de la flecha abre y cierra la lista', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir lista' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar lista' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('salir del campo cierra la lista', () => {
    render(<Harness />);
    fireEvent.mouseDown(input());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.blur(input());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('el primer clic en el campo selecciona el texto (MUI selectOnFocus)', () => {
    render(<Harness initial="m2" />);
    const select = vi.spyOn(input(), 'select');
    fireEvent.click(input());
    expect(select).toHaveBeenCalled();
  });
});

describe('accesibilidad', () => {
  it('el campo es un combobox con la lista cerrada, y avisa cuando se abre', () => {
    render(<Harness />);
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveAttribute('autocomplete', 'off');
    fireEvent.mouseDown(input());
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(input().getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
  });

  it('la etiqueta nombra al campo y a la lista', () => {
    render(<Harness />);
    expect(screen.getByRole('combobox', { name: 'Médico' })).toBeInTheDocument();
    fireEvent.mouseDown(input());
    expect(screen.getByRole('listbox', { name: 'Médico' })).toBeInTheDocument();
  });

  it('la opción elegida se marca con aria-selected', () => {
    render(<Harness initial="m3" />);
    fireEvent.mouseDown(input());
    expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
  });

  it('con error el campo queda inválido y vinculado a su texto', () => {
    render(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value={null} onChange={vi.fn()} error helperText="Elegí un médico" />);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Elegí un médico');
  });
});

describe('texto libre (freeSolo): DNI', () => {
  const DNIS = [{ id: '30111222', DNI: 30111222, name: 'Carla', lastName: 'Rojas' }];

  it('un DNI que no está en la lista no abre un cartel de «sin resultados»', () => {
    render(<PatientDniAutocomplete label="DNI" patients={DNIS} value={null} onChange={vi.fn()} />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '99999999' } });
    expect(screen.queryByText(/Sin /)).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('no ofrece el botón de la flecha (es texto libre)', () => {
    render(<PatientDniAutocomplete label="DNI" patients={DNIS} value={null} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Abrir lista' })).toBeNull();
  });

  it('Enter con un DNI tipeado lo confirma una sola vez aunque después se salga del campo', () => {
    const onChange = vi.fn();
    render(<PatientDniAutocomplete label="DNI" patients={DNIS} value={null} onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '41222333' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    fireEvent.blur(input());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('41222333', undefined);
  });

  it('con un DNI ya cargado, salir del campo sin tocarlo no avisa nada', () => {
    const onChange = vi.fn();
    render(<PatientDniAutocomplete label="DNI" patients={DNIS} value="30111222" onChange={onChange} />);
    fireEvent.focus(input());
    fireEvent.blur(input());
    expect(onChange).not.toHaveBeenCalled();
    expect(input().value).toBe('30111222');
  });
});

describe('código exacto (DEVA-148)', () => {
  it('Enter con un código exacto elige y no envía el formulario; con uno inexistente, sólo no envía mientras se busca', () => {
    const onChange = vi.fn();
    render(<DoctorAutocomplete label="Médico" doctors={DOCTORS} value={null} onChange={onChange} selectByExactCode />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '9012' } });
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
    expect(onChange).toHaveBeenCalledWith('m3', DOCTORS[2]);
  });

  it('la lista se cierra y el campo queda con la etiqueta cuando se elige por código exacto', () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>(null);
      return <DoctorAutocomplete label="Médico" doctors={DOCTORS} value={value} onChange={setValue} selectByExactCode />;
    }
    render(<Controlled />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '5678' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(input().value).toBe('5678 - ANA PÉREZ');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('con un código exacto de obra social y Tab elige y deja seguir el foco', () => {
    const insurances = [{ id: 'os1', code: 1, abbreviation: 'INSSSEP', name: 'Instituto' }];
    const onChange = vi.fn();
    render(<InsuranceAutocomplete label="Obra social" insurances={insurances} value={null} onChange={onChange} selectByExactCode />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: '1' } });
    expect(fireEvent.keyDown(input(), { key: 'Tab' })).toBe(true);
    expect(onChange).toHaveBeenCalledWith('os1', insurances[0]);
  });

  it('un diagnóstico se elige por código sin importar los puntos y las mayúsculas', () => {
    const diagnoses = [{ id: 'd1', code: 'A09.9', name: 'Gastroenteritis' }];
    const onChange = vi.fn();
    render(<DiagnosisAutocomplete label="Diagnóstico" diagnoses={diagnoses} value={null} onChange={onChange} selectByExactCode />);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: 'a099' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('d1', diagnoses[0]);
  });
});
