import type { Meta, StoryObj } from '@storybook/react-vite';
import { useWorksheetSearch } from '../../src';
import { SearchBox } from '../_demo/SearchBox';
import { worksheets } from '../_demo/mock-data';

const meta = {
  title: 'Búsqueda/Planilla',
  parameters: { docs: { description: { component: 'Busca planillas de trabajo por código y nombre.' } } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const search = useWorksheetSearch({ source: { items: worksheets } });
  return <SearchBox search={search} label="Planilla" placeholder="Código o nombre" />;
}

export const ListaCargada: Story = { render: () => <Demo /> };
