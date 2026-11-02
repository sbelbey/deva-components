import type { Meta, StoryObj } from '@storybook/react-vite';
import { usePatientSearch } from '../../src';
import { SearchBox } from '../_demo/SearchBox';
import { patients, SAMPLE_DNI_SCAN } from '../_demo/mock-data';

const meta = {
  title: 'Búsqueda/Paciente',
  parameters: {
    docs: {
      description: {
        component:
          'Busca pacientes por DNI. Si lo tipeado empieza con "!" es el lector de DNI: no busca y interpreta los datos del documento (DNI, apellido, nombre, fecha de nacimiento y sexo).',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const search = usePatientSearch({ source: { items: patients } });
  return (
    <div className="space-y-3">
      <SearchBox search={search} label="Paciente" placeholder="DNI, o escaneá el documento" />
      <p className="max-w-md text-xs text-deva-ink-soft">
        Para ver el escaneo pegá esto en el campo: <code className="break-all">{SAMPLE_DNI_SCAN}</code>
      </p>
      <pre className="max-w-md overflow-auto rounded-deva bg-deva-surface-2 p-3 text-xs text-deva-ink">
        {JSON.stringify({ isScan: search.isScan, scan: search.scan }, null, 2)}
      </pre>
    </div>
  );
}

export const PorDniYEscaneo: Story = { render: () => <Demo /> };
