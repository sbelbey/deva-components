import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Cell,
  DataTable,
  FileDropzone,
  FilterToolbar,
  ListPage,
  SearchField,
  SegmentedControl,
  StatusDot,
} from '../src/ui';

afterEach(cleanup);

describe('SearchField', () => {
  it('avisa el texto escrito y «borrar» lo vacía', () => {
    const onChange = vi.fn();
    render(<SearchField label="Buscar paciente" value="gom" onChange={onChange} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar paciente' }), { target: { value: 'gome' } });
    expect(onChange).toHaveBeenLastCalledWith('gome');
    fireEvent.click(screen.getByRole('button', { name: 'Borrar búsqueda' }));
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('sin texto no ofrece «borrar»', () => {
    render(<SearchField label="Buscar" value="" onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Borrar búsqueda' })).toBeNull();
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'a', label: 'Todos' },
    { value: 'b', label: 'Internados' },
  ] as const;

  it('marca la opción elegida y avisa al elegir otra', () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Estado" value="a" options={options} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Todos' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Internados' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Internados' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('group', { name: 'Estado' })).toBeTruthy();
  });
});

describe('StatusDot', () => {
  it('lleva el estado en texto', () => {
    render(<StatusDot tone="ok">Internado</StatusDot>);
    expect(screen.getByText('Internado')).toBeTruthy();
  });
});

describe('FileDropzone', () => {
  const pdf = () => new File(['x'], 'listado.pdf', { type: 'application/pdf' });

  it('acepta el archivo elegido', () => {
    const onFile = vi.fn();
    render(<FileDropzone label="Listado (PDF)" accept="application/pdf" extension=".pdf" onFile={onFile} />);
    const file = pdf();
    fireEvent.change(screen.getByLabelText('Listado (PDF)'), { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('acepta el archivo soltado y rechaza otro tipo con el mensaje', () => {
    const onFile = vi.fn();
    const onReject = vi.fn();
    render(
      <FileDropzone
        label="Listado (PDF)"
        accept="application/pdf"
        extension=".pdf"
        rejectMessage="Subí el PDF"
        onFile={onFile}
        onReject={onReject}
      />,
    );
    const file = pdf();
    fireEvent.drop(screen.getByText('Arrastrá el archivo acá'), { dataTransfer: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);

    const photo = new File(['x'], 'foto.png', { type: 'image/png' });
    fireEvent.drop(screen.getByText('Arrastrá el archivo acá'), { dataTransfer: { files: [photo] } });
    expect(onReject).toHaveBeenCalledWith('Subí el PDF');
    expect(onFile).toHaveBeenCalledTimes(1);
  });

  it('ocupado no deja elegir otro y muestra el progreso', () => {
    const onFile = vi.fn();
    render(<FileDropzone label="Listado" accept="application/pdf" busy busyTitle="Leyendo…" onFile={onFile} />);
    expect(screen.getByText('Leyendo…')).toBeTruthy();
    fireEvent.drop(screen.getByText('Leyendo…'), { dataTransfer: { files: [pdf()] } });
    expect(onFile).not.toHaveBeenCalled();
  });
});

describe('FilterToolbar', () => {
  it('pliega los filtros secundarios, cuenta los que están en uso y permite limpiarlos', () => {
    const onClear = vi.fn();
    render(
      <FilterToolbar
        search={<span>buscador</span>}
        primaryFilter={<span>estado</span>}
        moreFilters={<span>sector</span>}
        activeMoreFilters={2}
        onClearMoreFilters={onClear}
      />,
    );
    expect(screen.queryByText('sector')).toBeNull();
    const toggle = screen.getByRole('button', { name: 'Filtros (2 en uso)' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggle);
    expect(screen.getByText('sector')).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClear).toHaveBeenCalled();
  });

  it('sin filtros secundarios no muestra el botón', () => {
    render(<FilterToolbar search={<span>buscador</span>} />);
    expect(screen.queryByRole('button', { name: /Filtros/ })).toBeNull();
  });
});

describe('DataTable', () => {
  const columns = [
    { key: 'name', header: 'Paciente', cell: (r: { id: string; name: string }) => <Cell primary={r.name} secondary="DNI 1" /> },
  ];
  const rows = [
    { id: '1', name: 'GOMEZ Ana' },
    { id: '2', name: 'PEREZ Juan' },
  ];

  it('dibuja las filas y abre la elegida con clic o con Enter', () => {
    const onRowClick = vi.fn();
    render(<DataTable label="Pacientes" columns={columns} rows={rows} rowKey={(r) => r.id} onRowClick={onRowClick} />);
    expect(screen.getByRole('table', { name: 'Pacientes' })).toBeTruthy();
    fireEvent.click(screen.getByText('GOMEZ Ana'));
    expect(onRowClick).toHaveBeenLastCalledWith(rows[0]);
    fireEvent.keyDown(screen.getByText('PEREZ Juan').closest('tr')!, { key: 'Enter' });
    expect(onRowClick).toHaveBeenLastCalledWith(rows[1]);
  });

  it('sin filas muestra el estado vacío, salvo que esté cargando', () => {
    const { rerender } = render(
      <DataTable label="Pacientes" columns={columns} rows={[]} rowKey={(r) => r.id} empty={<p>Nada por acá</p>} />,
    );
    expect(screen.getByText('Nada por acá')).toBeTruthy();
    rerender(<DataTable label="Pacientes" columns={columns} rows={[]} rowKey={(r) => r.id} loading empty={<p>Nada por acá</p>} />);
    expect(screen.queryByText('Nada por acá')).toBeNull();
  });
});

describe('ListPage', () => {
  it('pone título, subtítulo, acciones y contenido', () => {
    render(
      <ListPage title="Pacientes" subtitle="Lista del laboratorio" actions={<button type="button">Importar</button>}>
        <p>contenido</p>
      </ListPage>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Pacientes');
    for (const text of ['Lista del laboratorio', 'contenido']) expect(screen.getByText(text)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Importar' })).toBeTruthy();
  });
});
