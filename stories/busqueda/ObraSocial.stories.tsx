import type { Meta, StoryObj } from '@storybook/react-vite';
import { useInsuranceSearch } from '../../src';
import { SearchBox } from '../_demo/SearchBox';
import { insurances } from '../_demo/mock-data';

const meta = {
  title: 'Búsqueda/Obra social',
  parameters: { docs: { description: { component: 'Busca obras sociales por código, sigla y nombre.' } } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const search = useInsuranceSearch({ source: { items: insurances } });
  return <SearchBox search={search} label="Obra social" placeholder="Código, sigla o nombre" />;
}

export const ListaCargada: Story = { render: () => <Demo /> };
