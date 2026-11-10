import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InsuranceMultiAutocomplete, StudyMultiAutocomplete, WorksheetMultiAutocomplete } from '../../src/ui';
import { insurances, studies, worksheets } from '../_demo/mock-data';

const meta = {
  title: 'Primitivos/Autocompletes múltiples',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Autocompletes de varios valores, con la lógica de DEVA. Lo elegido queda como chips con «quitar» dentro del campo y el texto sirve para seguir buscando. El valor es un array de **ids**; `onChange` avisa ids y objetos de todo lo que queda, y nunca mientras se tipea. Retroceso con el texto vacío quita el último chip; con las flechas izquierda y derecha se recorren los chips y Retroceso o Suprimir sobre uno lo quita. `hideSelected` oculta de la lista lo ya elegido (si no, elegirlo de nuevo lo quita) y `limitTags` resume los chips cuando el campo no tiene el foco. Los datos son inventados.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md pt-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Readout({ ids }: { ids: string[] }) {
  return (
    <pre className="mt-3 overflow-auto rounded-deva bg-deva-surface-2 p-3 text-xs text-deva-ink">{`ids: ${ids.length ? ids.join(', ') : '—'}`}</pre>
  );
}

/** Las suspendidas se ofrecen marcadas. Con `hideSelected` no se vuelven a ofrecer las elegidas. */
export const ObrasSociales: Story = {
  render: () => {
    const [ids, setIds] = useState<string[]>(['o1']);
    return (
      <>
        <InsuranceMultiAutocomplete
          label="Obras sociales"
          insurances={insurances}
          suspendedCodes={[205]}
          value={ids}
          onChange={setIds}
          hideSelected
        />
        <Readout ids={ids} />
      </>
    );
  },
};

/** Con `limitTags={1}` el campo sin foco resume los chips en un «+N». */
export const LimiteDeChips: Story = {
  render: () => {
    const [ids, setIds] = useState<string[]>(['o1', 'o2', 'o3']);
    return (
      <>
        <InsuranceMultiAutocomplete
          label="Obras sociales"
          insurances={insurances}
          value={ids}
          onChange={setIds}
          limitTags={1}
        />
        <Readout ids={ids} />
      </>
    );
  },
};

/** Enter con un code exacto («475») agrega ese estudio; con una opción resaltada con las flechas, Enter la elige. */
export const Estudios: Story = {
  render: () => {
    const [ids, setIds] = useState<string[]>([]);
    return (
      <>
        <StudyMultiAutocomplete
          label="Estudios"
          studies={studies}
          value={ids}
          onChange={setIds}
          onEnter={(text, tools) => {
            const found = tools.findByExactCode(text);
            if (!found) return;
            const id = String(found.id);
            setIds((current) => (current.includes(id) ? current : [...current, id]));
            tools.reset();
          }}
        />
        <Readout ids={ids} />
      </>
    );
  },
};

export const Planillas: Story = {
  render: () => {
    const [ids, setIds] = useState<string[]>([]);
    return (
      <>
        <WorksheetMultiAutocomplete
          label="Planillas de trabajo"
          worksheets={worksheets}
          value={ids}
          onChange={setIds}
        />
        <Readout ids={ids} />
      </>
    );
  },
};

/** Con error, deshabilitado y cargando la lista. */
export const Estados: Story = {
  render: () => (
    <div className="space-y-5">
      <InsuranceMultiAutocomplete
        label="Con error"
        insurances={insurances}
        value={[]}
        onChange={() => undefined}
        error
        helperText="Elegí al menos una"
      />
      <InsuranceMultiAutocomplete
        label="Deshabilitado"
        insurances={insurances}
        value={['o1', 'o2']}
        onChange={() => undefined}
        disabled
      />
      <InsuranceMultiAutocomplete
        label="Cargando la lista"
        insurances={undefined}
        value={[]}
        onChange={() => undefined}
      />
    </div>
  ),
};
