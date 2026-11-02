import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField, UserIcon } from '../../src/ui';

const meta = {
  title: 'Primitivos/TextField',
  component: TextField,
  args: { label: 'Usuario' },
  decorators: [
    (Story) => (
      <div className="max-w-sm pt-3">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Campo de texto con etiqueta flotante: la etiqueta vive dentro del borde y sube al enfocar o al escribir. Admite ícono a la izquierda, contenido a la derecha y texto de ayuda con tono (`warn`, `error`). Acepta los atributos de un `<input>` y `ref`. No lleva `placeholder`: lo reemplaza la etiqueta.',
      },
    },
  },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vacio: Story = {};
export const ConValor: Story = { args: { defaultValue: 'laboratorio.casa' } };
export const ConIcono: Story = { args: { startIcon: <UserIcon /> } };
export const ConAyuda: Story = { args: { helper: 'Es el usuario que te dio el laboratorio.' } };
export const ConAviso: Story = { args: { helper: 'Bloq Mayús está activado', helperTone: 'warn', defaultValue: 'ABC' } };
export const ConError: Story = { args: { helper: 'Este campo es obligatorio', helperTone: 'error', defaultValue: 'x' } };
export const Deshabilitado: Story = { args: { disabled: true, defaultValue: 'laboratorio.casa' } };
