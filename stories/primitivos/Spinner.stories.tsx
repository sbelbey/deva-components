import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '../../src/ui';

const meta = {
  title: 'Primitivos/Spinner',
  component: Spinner,
  args: { label: 'Cargando' },
  parameters: {
    docs: {
      description: {
        component:
          'Indicador de carga circular. Hereda el color del texto que lo rodea y lleva una etiqueta para lectores de pantalla.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basico: Story = {};

/** Más grande y en el color de la marca. */
export const Grande: Story = { args: { className: 'size-10 text-deva-action' } };
