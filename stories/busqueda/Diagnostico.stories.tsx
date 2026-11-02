import type { Meta, StoryObj } from '@storybook/react-vite';
import { useDiagnosisSearch } from '../../src';
import { SearchBox } from '../_demo/SearchBox';
import { diagnoses } from '../_demo/mock-data';

const meta = {
  title: 'Búsqueda/Diagnóstico',
  parameters: { docs: { description: { component: 'Busca diagnósticos por código (CIE-10) y nombre.' } } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const search = useDiagnosisSearch({ source: { items: diagnoses } });
  return <SearchBox search={search} label="Diagnóstico" placeholder='Probá "e11" o "anemia"' />;
}

export const ListaCargada: Story = { render: () => <Demo /> };
