/**
 * Contrato de la plantilla de lista, escrito contra la pantalla Pacientes de DEVA (listPage + sus pruebas):
 * filtros secundarios plegados con contador, tabla de una superficie con filas navegables por Enter,
 * estado vacío con «Limpiar filtros» y barra de carga que no mueve la tabla.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Cell, DataTable, FilterToolbar, ListPage } from '../src/ui';

afterEach(cleanup);

describe('FilterToolbar', () => {
  const setup = (props: Partial<React.ComponentProps<typeof FilterToolbar>> = {}) =>
    render(
      <FilterToolbar
        search={<span>buscador</span>}
        primaryFilter={<span>estado</span>}
        moreFilters={<span>sector</span>}
        {...props}
      />,
    );

  it('el buscador y la opción principal están siempre a la vista; los demás filtros arrancan plegados', () => {
    setup();
    expect(screen.getByText('buscador')).toBeInTheDocument();
    expect(screen.getByText('estado')).toBeInTheDocument();
    expect(screen.queryByText('sector')).toBeNull();
    expect(screen.getByRole('button', { name: 'Filtros' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('el botón vincula con el panel que abre y cierra (aria-controls) y se cierra con otro clic', () => {
    setup();
    const toggle = screen.getByRole('button', { name: 'Filtros' });
    fireEvent.click(toggle);
    const panel = screen.getByText('sector').parentElement!;
    expect(toggle.getAttribute('aria-controls')).toBe(panel.id);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(screen.queryByText('sector')).toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('con filtros en uso el botón avisa cuántos hay (sin número visible para lectores) y sin ellos no hay número', () => {
    const { rerender } = setup({ activeMoreFilters: 3 });
    const toggle = screen.getByRole('button', { name: 'Filtros (3 en uso)' });
    expect(within(toggle).getByText('3')).toHaveAttribute('aria-hidden', 'true');
    rerender(<FilterToolbar search={<span>b</span>} moreFilters={<span>s</span>} activeMoreFilters={0} />);
    expect(screen.getByRole('button', { name: 'Filtros' })).toBeInTheDocument();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('«Limpiar filtros» sólo aparece con filtros en uso y con el manejador, y no cierra el panel', () => {
    const onClear = vi.fn();
    const { rerender } = setup({ activeMoreFilters: 0, onClearMoreFilters: onClear });
    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).toBeNull();
    rerender(<FilterToolbar search={<span>b</span>} moreFilters={<span>sector</span>} activeMoreFilters={2} />);
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).toBeNull();
    rerender(
      <FilterToolbar
        search={<span>b</span>}
        moreFilters={<span>sector</span>}
        activeMoreFilters={2}
        onClearMoreFilters={onClear}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByText('sector')).toBeInTheDocument();
  });

  it('los botones no envían un formulario que los contenga', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <FilterToolbar
          search={<span>b</span>}
          moreFilters={<span>s</span>}
          activeMoreFilters={1}
          onClearMoreFilters={vi.fn()}
        />
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('los textos del botón se pueden traducir', () => {
    setup({ filtersLabel: 'Filters', clearLabel: 'Clear', activeMoreFilters: 1, onClearMoreFilters: vi.fn() });
    fireEvent.click(screen.getByRole('button', { name: 'Filters (1 en uso)' }));
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('sin filtros secundarios no hay botón ni panel', () => {
    render(<FilterToolbar search={<span>b</span>} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('los filtros del panel siguen a la vista cuando cambian los que están en uso', () => {
    const { rerender } = setup({ activeMoreFilters: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    rerender(<FilterToolbar search={<span>b</span>} moreFilters={<span>sector</span>} activeMoreFilters={0} />);
    expect(screen.getByText('sector')).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  type Row = { id: string; name: string };
  const rows: Row[] = [
    { id: '1', name: 'GOMEZ Ana' },
    { id: '2', name: 'PEREZ Juan' },
  ];
  const columns = [
    {
      key: 'name',
      header: 'Paciente',
      cell: (r: Row) => <Cell primary={r.name} secondary="DNI 1" />,
      className: 'w-64',
    },
    { key: 'extra', header: 'Obra social', cell: () => <span>INSSSEP</span> },
  ];
  const table = (props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) =>
    render(<DataTable<Row> label="Pacientes" columns={columns} rows={rows} rowKey={(r) => r.id} {...props} />);

  it('es una tabla con nombre, los encabezados son de columna y hay una fila por dato', () => {
    table();
    expect(screen.getByRole('table', { name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Paciente', 'Obra social']);
    // Encabezados de columna para lectores de pantalla (scope explícito).
    screen.getAllByRole('columnheader').forEach((h) => expect(h).toHaveAttribute('scope', 'col'));
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('sin onRowClick las filas no son interactivas ni llevan la flecha', () => {
    table();
    const row = screen.getByText('GOMEZ Ana').closest('tr')!;
    expect(row).not.toHaveAttribute('tabindex');
    expect(row).not.toHaveClass('cursor-pointer');
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(row.querySelectorAll('td')).toHaveLength(2);
  });

  it('con onRowClick la fila se abre con clic y con Enter (sólo Enter), se enfoca con Tab y suma la columna de la flecha', () => {
    const onRowClick = vi.fn();
    table({ onRowClick });
    const row = screen.getByText('GOMEZ Ana').closest('tr')!;
    expect(row).toHaveAttribute('tabindex', '0');
    expect(row).toHaveClass('cursor-pointer');
    expect(row.querySelectorAll('td')).toHaveLength(3);
    fireEvent.click(screen.getByText('GOMEZ Ana'));
    expect(onRowClick).toHaveBeenLastCalledWith(rows[0]);
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(row, { key: ' ' });
    fireEvent.keyDown(row, { key: 'a' });
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it('las clases de la columna van en el encabezado y en cada celda', () => {
    table();
    expect(screen.getByRole('columnheader', { name: 'Paciente' })).toHaveClass('w-64');
    expect(screen.getByText('GOMEZ Ana').closest('td')).toHaveClass('w-64');
  });

  it('la celda de dos líneas pone lo principal y el detalle, y sin detalle no deja una línea vacía', () => {
    const { container } = render(
      <>
        <Cell primary="Ana" secondary="DNI 1" />
        <Cell primary="Sola" />
      </>,
    );
    expect(screen.getByText('Ana')).toHaveClass('font-semibold');
    expect(screen.getByText('DNI 1')).toBeInTheDocument();
    expect(container.querySelectorAll('div')).toHaveLength(3);
  });

  it('sin filas muestra el estado vacío (el de la pantalla o uno por defecto) abarcando todas las columnas', () => {
    const { rerender } = table({ rows: [], onRowClick: vi.fn() });
    expect(screen.getByText('No hay resultados')).toBeInTheDocument();
    expect(screen.getByText('No hay resultados').closest('td')).toHaveAttribute('colspan', '3');
    rerender(
      <DataTable<Row>
        label="P"
        columns={columns}
        rows={[]}
        rowKey={(r) => r.id}
        empty={<button type="button">Limpiar filtros</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
    expect(screen.getByText('Limpiar filtros').closest('td')).toHaveAttribute('colspan', '2');
  });

  it('con filas no muestra el estado vacío', () => {
    table({ empty: <p>vacío</p> });
    expect(screen.queryByText('vacío')).toBeNull();
  });

  it('cargando sin filas no dice «no hay resultados»; cargando con filas las sigue mostrando, con la barra de carga', () => {
    const { container, rerender } = table({ rows: [], loading: true });
    expect(screen.queryByText('No hay resultados')).toBeNull();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    rerender(<DataTable<Row> label="P" columns={columns} rows={rows} rowKey={(r) => r.id} loading />);
    expect(screen.getByText('GOMEZ Ana')).toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('sin cargar no hay barra de carga', () => {
    const { container } = table();
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });

  it('el pie (paginado) sólo está si se pasa', () => {
    const { rerender } = table();
    expect(screen.queryByText('1–2 de 2')).toBeNull();
    // Sin pie no queda una franja vacía abajo de la tabla.
    expect(document.querySelector('.border-t')).toBeNull();
    rerender(<DataTable<Row> label="P" columns={columns} rows={rows} rowKey={(r) => r.id} footer="1–2 de 2" />);
    expect(screen.getByText('1–2 de 2')).toBeInTheDocument();
  });

  it('cada fila usa su clave: reordenar las filas no mezcla el contenido', () => {
    const { rerender } = table();
    rerender(<DataTable<Row> label="P" columns={columns} rows={[rows[1], rows[0]]} rowKey={(r) => r.id} />);
    const names = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(names[0]).toContain('PEREZ Juan');
    expect(names[1]).toContain('GOMEZ Ana');
  });
});

describe('ListPage', () => {
  it('el título es el h1, el subtítulo y las acciones sólo están si se pasan', () => {
    const { rerender } = render(
      <ListPage title="Pacientes">
        <p>contenido</p>
      </ListPage>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('contenido')).toBeInTheDocument();
    rerender(
      <ListPage title="Pacientes" subtitle="Lista del laboratorio" actions={<button type="button">Importar</button>}>
        <p>contenido</p>
      </ListPage>,
    );
    expect(screen.getByText('Lista del laboratorio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Importar' })).toBeInTheDocument();
  });

  it('el encabezado va antes que el contenido y no hay banner (ocupa el ancho de la pantalla, sin tope)', () => {
    const { container } = render(
      <ListPage title="Pacientes">
        <p>contenido</p>
      </ListPage>,
    );
    const order = Array.from(container.querySelectorAll('h1, p')).map((el) => el.tagName);
    expect(order).toEqual(['H1', 'P']);
    expect(container.firstChild).not.toHaveClass('max-w-7xl');
    expect(container.querySelector('[class*="max-w-"]')).toBeNull();
  });
});
