/**
 * Contrato de cada autocomplete tipado en DEVA (pieles de DEVA-107): escaneo de DNI, «agregar a una
 * lista» con Enter (estudio y planilla) y texto libre. Escritas contra lo que DEVA garantiza.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DiagnosisAutocomplete, PatientDniAutocomplete, StudyAutocomplete, WorksheetAutocomplete } from '../../src/ui';

afterEach(cleanup);

const input = () => screen.getByRole('combobox') as HTMLInputElement;
const typeText = (text: string) => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: text } });
};

describe('DNI: escaneo y lista vacía', () => {
  const SCAN = '!00123456789@ROJAS@CARLA@F@30111222@A@12/09/1988@01/03/2020';
  const PATIENTS = [{ id: '30111222', DNI: 30111222, name: 'Carla', lastName: 'Rojas' }];

  it('un escaneo con Enter y después al salir del campo se resuelve una sola vez', () => {
    const onScan = vi.fn();
    const onChange = vi.fn();
    render(<PatientDniAutocomplete label="DNI" patients={PATIENTS} value={null} onChange={onChange} onScan={onScan} />);
    typeText(SCAN);
    fireEvent.keyDown(input(), { key: 'Enter' });
    fireEvent.blur(input());
    expect(onScan).toHaveBeenCalledTimes(1);
    expect(onScan.mock.calls[0][0]).toMatchObject({ dni: 30111222 });
    // El texto crudo del escaneo nunca llega a onChange.
    expect(onChange).not.toHaveBeenCalled();
    expect(input().value).toBe('30111222');
  });

  it('si el lector manda Enter y se sale del campo en el mismo instante (antes de repintar), el escaneo se resuelve una sola vez', () => {
    const onScan = vi.fn();
    render(<PatientDniAutocomplete label="DNI" patients={PATIENTS} value={null} onChange={vi.fn()} onScan={onScan} />);
    typeText(SCAN);
    act(() => {
      fireEvent.keyDown(input(), { key: 'Enter' });
      fireEvent.blur(input());
    });
    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('el mismo escaneo pegado de nuevo después de tipear algo se vuelve a resolver', () => {
    const onScan = vi.fn();
    render(<PatientDniAutocomplete label="DNI" patients={PATIENTS} value={null} onChange={vi.fn()} onScan={onScan} />);
    typeText(SCAN);
    fireEvent.blur(input());
    fireEvent.change(input(), { target: { value: '1' } });
    fireEvent.change(input(), { target: { value: SCAN } });
    fireEvent.blur(input());
    expect(onScan).toHaveBeenCalledTimes(2);
  });

  it('con el campo vacío no se ofrece toda la lista de pacientes: sólo aparecen al tipear', () => {
    render(<PatientDniAutocomplete label="DNI" patients={PATIENTS} value={null} onChange={vi.fn()} />);
    fireEvent.focus(input());
    fireEvent.mouseDown(input());
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.change(input(), { target: { value: '3011' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('Estudio: agregar a una lista con Enter', () => {
  const STUDIES = [
    { id: 's1', code: 475, name: 'Hemograma completo', abbreviation: 'HEMO' },
    { id: 's2', code: 660, name: 'Glucemia', abbreviation: 'GLU' },
  ];

  it('con una opción resaltada con las flechas, Enter la elige y NO llama a onEnter (se agregaría dos veces)', () => {
    const onChange = vi.fn();
    const onEnter = vi.fn();
    render(<StudyAutocomplete label="Estudio" studies={STUDIES} value={null} onChange={onChange} onEnter={onEnter} clearOnSelect />);
    typeText('glu');
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('s2', STUDIES[1]);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it('sin nada resaltado, Enter llama a onEnter con el texto y nunca envía el formulario', () => {
    const onEnter = vi.fn();
    render(<StudyAutocomplete label="Estudio" studies={STUDIES} value={null} onChange={vi.fn()} onEnter={onEnter} clearOnSelect />);
    typeText('475');
    const notPrevented = fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onEnter).toHaveBeenCalledWith('475', expect.objectContaining({ findByExactCode: expect.any(Function), reset: expect.any(Function) }));
    expect(notPrevented).toBe(false);
  });

  it('las herramientas del Enter encuentran el estudio por code exacto y vacían el texto', () => {
    const found: unknown[] = [];
    render(
      <StudyAutocomplete
        label="Estudio"
        studies={STUDIES}
        value={null}
        onChange={vi.fn()}
        clearOnSelect
        onEnter={(text, tools) => {
          found.push(tools.findByExactCode(text));
          tools.reset();
        }}
      />,
    );
    typeText('475');
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(found).toEqual([STUDIES[0]]);
    expect(input().value).toBe('');
  });

  it('el texto del campo con el estudio elegido puede ser distinto de la etiqueta de la lista (selectedLabel)', () => {
    render(
      <StudyAutocomplete
        label="Estudio"
        studies={STUDIES}
        value="s1"
        onChange={vi.fn()}
        selectedLabel={(study) => `${study.code} · ${study.name}`}
      />,
    );
    expect(input().value).toBe('475 · Hemograma completo');
    fireEvent.mouseDown(input());
    expect(screen.getByText('475 - Hemograma completo')).toBeInTheDocument();
  });

  it('sin onEnter, Enter con texto de búsqueda tampoco envía el formulario', () => {
    render(<StudyAutocomplete label="Estudio" studies={STUDIES} value={null} onChange={vi.fn()} />);
    typeText('gluc');
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
  });
});

describe('Planilla: agregar a una lista con Enter', () => {
  const WORKSHEETS = [
    { id: 'w1', code: 7, name: 'ORINA' },
    { id: 'w2', code: 12, name: 'HEMATOLOGÍA' },
  ];

  it('con onEnter el Enter nunca envía el formulario', () => {
    render(<WorksheetAutocomplete label="Planilla" worksheets={WORKSHEETS} value={null} onChange={vi.fn()} onEnter={vi.fn()} clearOnSelect />);
    typeText('12');
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
  });

  it('con onEnter, Enter con el campo vacío tampoco envía el formulario', () => {
    render(<WorksheetAutocomplete label="Planilla" worksheets={WORKSHEETS} value={null} onChange={vi.fn()} onEnter={vi.fn()} clearOnSelect />);
    fireEvent.focus(input());
    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false);
  });

  it('con clearOnSelect el campo sigue vacío aunque el padre pase un valor', () => {
    render(<WorksheetAutocomplete label="Planilla" worksheets={WORKSHEETS} value="w1" onChange={vi.fn()} clearOnSelect />);
    expect(input().value).toBe('');
  });

  it('sin clearOnSelect el campo muestra la planilla elegida', () => {
    render(<WorksheetAutocomplete label="Planilla" worksheets={WORKSHEETS} value="w1" onChange={vi.fn()} />);
    expect(input().value).toBe('7 - ORINA');
  });
});

describe('Diagnóstico con texto libre (Orden digital)', () => {
  const DIAGNOSES = [{ id: 'd1', code: 'E11', name: 'Diabetes tipo 2' }];

  it('avisa el texto en vivo y también cuando se borra con el botón «Borrar»', () => {
    const onFreeTextChange = vi.fn();
    render(
      <DiagnosisAutocomplete label="Diagnóstico" diagnoses={DIAGNOSES} value={null} onChange={vi.fn()} freeSolo onFreeTextChange={onFreeTextChange} />,
    );
    typeText('e1');
    expect(onFreeTextChange).toHaveBeenLastCalledWith('e1');
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(onFreeTextChange).toHaveBeenLastCalledWith('');
  });

  it('elegir una opción no se cuenta como tipeado: no avisa el texto de la etiqueta', () => {
    const onFreeTextChange = vi.fn();
    render(
      <DiagnosisAutocomplete label="Diagnóstico" diagnoses={DIAGNOSES} value={null} onChange={vi.fn()} freeSolo onFreeTextChange={onFreeTextChange} />,
    );
    typeText('e11');
    onFreeTextChange.mockClear();
    fireEvent.click(screen.getByRole('option'));
    expect(onFreeTextChange).not.toHaveBeenCalled();
  });
});
