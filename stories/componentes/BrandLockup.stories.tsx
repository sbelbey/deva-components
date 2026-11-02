import type { Meta, StoryObj } from '@storybook/react-vite';
import logoBlue from 'deva-design/assets/deva-logo.png';
import logoWhite from 'deva-design/assets/deva-logo-white.png';
import { BrandLockup } from '../../src/ui';

const logos = { blue: logoBlue, white: logoWhite };

const meta = {
  title: 'Componentes/BrandLockup',
  component: BrandLockup,
  args: { product: 'Pedidos', tone: 'blue', logos },
  argTypes: {
    tone: { control: 'inline-radio', options: ['blue', 'white'] },
    logos: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Logo oficial de DEVA, una línea y el nombre del producto ("Pedidos", "Nexus"). Cada producto es un módulo de DEVA: se distingue sólo por el nombre. Los logos se importan de `deva-design/assets`.',
      },
    },
  },
} satisfies Meta<typeof BrandLockup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Sobre fondos claros. */
export const SobreFondoClaro: Story = {};

/** Sobre la barra azul o fondos de color. */
export const SobreBarraAzul: Story = {
  args: { tone: 'white', product: 'Nexus' },
  decorators: [
    (Story) => (
      <div className="rounded-deva bg-deva-bar px-5 py-4 text-deva-on-bar">
        <Story />
      </div>
    ),
  ],
};

/** Panel grande del login: el nombre queda debajo, alineado a la derecha. */
export const Apilado: Story = {
  args: { stacked: true, logoClassName: 'h-12', textClassName: 'text-2xl' },
};

/** Tamaños propios por props. */
export const TamanoGrande: Story = {
  args: { logoClassName: 'h-14', textClassName: 'text-3xl' },
};
