import type { Meta, StoryObj } from '@storybook/react-vite';
import { useStudySearch } from '../../src';
import { SearchBox } from '../_demo/SearchBox';
import { profiles, studies } from '../_demo/mock-data';

const meta = {
  title: 'Búsqueda/Estudio',
  parameters: {
    docs: {
      description: {
        component:
          'Busca estudios por código, nombre y abreviatura. Con perfiles, los atajos (por ejemplo "CA") salen primero. Los sub-ítems sintéticos de compuestos (código 151xxxx) no se muestran.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Basico() {
  const search = useStudySearch({ source: { items: studies } });
  return <SearchBox search={search} label="Estudio" placeholder="Código, nombre o abreviatura" />;
}

function ConPerfiles() {
  const search = useStudySearch({ source: { items: studies }, profiles });
  return <SearchBox search={search} label="Estudio o perfil" placeholder='Probá "CA" o "hemo"' />;
}

export const SoloEstudios: Story = { render: () => <Basico /> };
export const ConPerfilesYAtajos: Story = { render: () => <ConPerfiles /> };
