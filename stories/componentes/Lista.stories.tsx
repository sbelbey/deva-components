import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Cell,
  DataTable,
  FilterToolbar,
  ListPage,
  SearchField,
  SegmentedControl,
  StatusDot,
  TextField,
  WarnIcon,
  type DataTableColumn,
} from '../../src/ui';

/** Datos inventados; ninguno corresponde a una persona real. */
interface Row {
  id: string;
  name: string;
  dni: number;
  file: number;
  insurance: string;
  room?: string;
  sector?: string;
  admission?: number;
  since?: string;
  until?: string;
  notInList?: boolean;
}

const ROWS: Row[] = [
  { id: '1', name: 'ACOSTA MARÍA BELÉN', dni: 32418765, file: 990002, insurance: 'INSSSEP', room: '101', sector: '1P PRIMER PISO', admission: 296793, since: '12/10/2026' },
  { id: '2', name: 'ACOSTA MARIELA', dni: 38107431, file: 990028, insurance: 'OSDE' },
  { id: '3', name: 'AGUIRRE VALENTINA MICAELA', dni: 48203771, file: 990016, insurance: 'UNNE', room: '102A', sector: '1P PRIMER PISO', admission: 296531, since: '20/10/2026', until: '27/10/2026' },
  { id: '4', name: 'ÁLVAREZ MARÍA', dni: 90000370, file: 40155031, insurance: 'INSSSEP', room: '108B', sector: '2P SEGUNDO PISO', admission: 296439, since: '18/10/2026', notInList: true },
  { id: '5', name: 'AYALA BRENDA YAMILA', dni: 42887615, file: 990023, insurance: 'PARTICULAR' },
  { id: '6', name: 'BENÍTEZ CARLOS RUBÉN', dni: 12604871, file: 990009, insurance: 'CALENO', room: '113A', sector: '2P SEGUNDO PISO', admission: 296830, since: '25/10/2026' },
];

type Status = 'all' | 'in' | 'out' | 'none';
const STATUS = [
  { value: 'all', label: 'Todos' },
  { value: 'in', label: 'Internados' },
  { value: 'out', label: 'Con alta' },
  { value: 'none', label: 'Sin internación' },
] as const;

const COLUMNS: DataTableColumn<Row>[] = [
  { key: 'patient', header: 'Paciente', cell: (r) => <Cell primary={r.name} secondary={`DNI ${r.dni} · Ficha ${r.file}`} /> },
  { key: 'insurance', header: 'Obra social', cell: (r) => <span className="text-sm text-deva-ink">{r.insurance}</span> },
  { key: 'where', header: 'Ubicación', cell: (r) => (r.room ? <Cell primary={r.room} secondary={r.sector} /> : <span className="text-deva-ink-soft/60">—</span>) },
  {
    key: 'status',
    header: 'Internación',
    cell: (r) =>
      r.room ? (
        <>
          <StatusDot tone={r.until ? 'muted' : 'ok'}>{r.until ? 'Con alta' : 'Internado'}</StatusDot>
          <div className="text-xs text-deva-ink-soft">
            N.º {r.admission} · {r.since}
            {r.until && ` → ${r.until}`}
          </div>
          {r.notInList && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-deva-warn">
              <WarnIcon className="size-3.5" /> No figura en el último listado
            </div>
          )}
        </>
      ) : null,
  },
];

function Demo({ empty = false }: { empty?: boolean }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [sector, setSector] = useState('');
  const rows = useMemo(() => {
    if (empty) return [];
    return ROWS.filter((r) => {
      const text = `${r.name} ${r.dni} ${r.file}`.toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;
      if (status === 'in' && !(r.room && !r.until)) return false;
      if (status === 'out' && !r.until) return false;
      if (status === 'none' && r.room) return false;
      if (sector && !(r.sector ?? '').toLowerCase().includes(sector.toLowerCase())) return false;
      return true;
    });
  }, [empty, search, status, sector]);
  const clearAll = () => {
    setSearch('');
    setStatus('all');
    setSector('');
  };
  const hasFilters = Boolean(search) || status !== 'all' || Boolean(sector);

  return (
    <ListPage
      title="Pacientes"
      subtitle="Lista de pacientes e internaciones del laboratorio"
      actions={<Button>Importar internados</Button>}
    >
      <FilterToolbar
        search={<SearchField label="Buscar paciente" placeholder="Buscar por apellido, nombre, DNI o ficha" value={search} onChange={setSearch} />}
        primaryFilter={<SegmentedControl label="Estado" value={status} options={STATUS} onChange={setStatus} />}
        activeMoreFilters={sector ? 1 : 0}
        onClearMoreFilters={() => setSector('')}
        moreFilters={<TextField label="Sector" value={sector} onChange={(e) => setSector(e.target.value)} wrapperClassName="w-52" />}
      />
      <DataTable
        label="Pacientes"
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={() => undefined}
        footer={`1–${rows.length} de ${rows.length}`}
        empty={
          <>
            <p className="text-base font-semibold text-deva-ink">No hay pacientes con esos filtros</p>
            {hasFilters && (
              <button type="button" onClick={clearAll} className="mt-2 text-sm font-medium text-deva-action hover:underline">
                Limpiar filtros
              </button>
            )}
          </>
        }
      />
    </ListPage>
  );
}

const meta = {
  title: 'Componentes/Lista (plantilla)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Plantilla de las pantallas de lista de la familia DEVA, probada primero en Pacientes de DEVA. `ListPage` pone el título sin banner y a todo el ancho; `FilterToolbar` deja a la vista el buscador y el estado y pliega el resto de los filtros detrás de «Filtros» (con el número de los que están en uso); `DataTable` es una sola superficie con celdas de dos líneas, filas navegables con Enter y una línea de carga que no mueve la tabla. La historia filtra de verdad: probá buscar, cambiar el estado y abrir «Filtros».',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Pacientes: Story = { render: () => <Demo /> };
export const SinResultados: Story = { render: () => <Demo empty /> };
