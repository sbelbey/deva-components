import type { Meta, StoryObj } from '@storybook/react-vite';
import { useBiochemistSearch } from '../../src';
import { SearchBox } from '../_demo/SearchBox';
import { biochemists } from '../_demo/mock-data';

const meta = {
  title: 'Búsqueda/Bioquímico',
  parameters: { docs: { description: { component: 'Busca bioquímicos por apellido, nombre, matrícula y DNI.' } } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const search = useBiochemistSearch({ source: { items: biochemists } });
  return <SearchBox search={search} label="Bioquímico" placeholder="Apellido, matrícula o DNI" />;
}

export const ListaCargada: Story = { render: () => <Demo /> };
