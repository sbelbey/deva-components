import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tip } from '../../src/ui';

const meta = {
  title: 'Primitivos/Tip',
  component: Tip,
  args: { content: 'Glóbulos blancos por microlitro de sangre.', children: 'Leucocitos' },
  decorators: [
    (Story) => (
      <div className="pt-16 text-sm text-deva-ink">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Texto subrayado con una ayuda que aparece al pasar el mouse, al enfocar con el teclado (Tab) y al tocar en el celular. Se cierra al salir, al perder el foco y con Escape. Sin `content` muestra sólo el texto.',
      },
    },
  },
} satisfies Meta<typeof Tip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basico: Story = {};

/** `whitespace-pre-line`: los saltos de línea del texto se respetan. */
export const TextoLargoConSaltos: Story = {
  args: { content: 'Valor de referencia:\nHombres 4.500 a 11.000\nMujeres 4.500 a 11.000' },
};

/** Sin ayuda no es botón ni tiene tooltip: queda el texto solo. */
export const SinContenido: Story = { args: { content: undefined } };

/** Dentro de una línea de texto. */
export const EnUnaOracion: Story = {
  render: (args) => (
    <p>
      El informe muestra el recuento de <Tip {...args} /> y el resto del hemograma.
    </p>
  ),
  args: { children: 'leucocitos' },
};
