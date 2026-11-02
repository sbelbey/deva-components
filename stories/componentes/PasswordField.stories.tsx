import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordField } from '../../src/ui';

const meta = {
  title: 'Componentes/PasswordField',
  component: PasswordField,
  args: { label: 'Contraseña' },
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
          'Contraseña con etiqueta flotante. Se arma con `TextField` y suma el candado, el ojo para mostrar u ocultar y el aviso de Bloq Mayús (aparece al escribir con las mayúsculas fijadas y se va al salir del campo). Para formularios densos sin etiqueta flotante, está el primitivo `PasswordInput`.',
      },
    },
  },
} satisfies Meta<typeof PasswordField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vacio: Story = {};
export const ConValor: Story = { args: { defaultValue: 'una-clave-de-prueba' } };
export const ConError: Story = { args: { defaultValue: 'abc', helper: 'Mínimo 8 caracteres', helperTone: 'error' } };
export const Deshabilitado: Story = { args: { disabled: true, defaultValue: 'una-clave-de-prueba' } };
