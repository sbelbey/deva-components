import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileDropzone, SearchField, SegmentedControl, StatusDot } from '../../src/ui';

const meta = {
  title: 'Primitivos/Piezas de lista',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Las piezas chicas con las que se arma una lista: `SearchField`, `SegmentedControl`, `StatusDot` y `FileDropzone`. Se probaron primero en la sección Pacientes de DEVA.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Buscador con lupa; aparece «borrar» cuando hay texto. */
export const Buscador: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <SearchField
        label="Buscar paciente"
        placeholder="Buscar por apellido, nombre, DNI o ficha"
        value={value}
        onChange={setValue}
      />
    );
  },
};

const STATES = [
  { value: 'all', label: 'Todos' },
  { value: 'in', label: 'Internados' },
  { value: 'out', label: 'Con alta' },
  { value: 'none', label: 'Sin internación' },
] as const;

/** Una opción entre pocas, siempre a la vista. */
export const Segmentado: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof STATES)[number]['value']>('all');
    return <SegmentedControl label="Estado" value={value} options={STATES} onChange={setValue} />;
  },
};

/** Estado en una palabra; el color acompaña al texto, nunca lo reemplaza. */
export const Estados: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <StatusDot tone="ok">Internado</StatusDot>
      <StatusDot tone="muted">Con alta</StatusDot>
      <StatusDot tone="warn">Fuera del último listado</StatusDot>
      <StatusDot tone="danger">Rechazada</StatusDot>
    </div>
  ),
};

/** Elegir o arrastrar un PDF. Probá soltar una imagen para ver el rechazo. */
export const ZonaDeArchivo: Story = {
  render: () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    return (
      <div className="max-w-lg">
        <FileDropzone
          label="Listado (PDF)"
          accept="application/pdf"
          extension=".pdf"
          title="Arrastrá el PDF acá"
          busyTitle="Leyendo el listado…"
          rejectMessage="Subí el PDF del listado: otros archivos todavía no se leen."
          busy={busy}
          onFile={(file) => {
            setError('');
            setName(file.name);
            setBusy(true);
            setTimeout(() => setBusy(false), 1500);
          }}
          onReject={setError}
        />
        {name && !error && <p className="mt-3 text-sm text-deva-ink-soft">Último archivo: {name}</p>}
        {error && (
          <p role="alert" className="mt-3 rounded-deva bg-deva-danger-bg px-4 py-3 text-sm text-deva-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
};
