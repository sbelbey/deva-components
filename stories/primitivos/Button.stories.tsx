import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../src/ui';

const meta = {
  title: 'Primitivos/Button',
  component: Button,
  args: { children: 'Iniciar sesión' },
  parameters: {
    docs: {
      description: {
        component:
          'Botón de la familia DEVA. `solid` es la acción principal; `quiet` es una acción secundaria sin fondo. Con `loading` muestra el spinner y se bloquea. Por defecto es `type="button"`: para enviar un formulario hay que pedir `type="submit"`.',
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};
export const Secundario: Story = { args: { variant: 'quiet', children: 'Volver a ingresar' } };
export const Cargando: Story = { args: { loading: true, loadingLabel: 'Ingresando' } };
export const Deshabilitado: Story = { args: { disabled: true } };

/** Ocupa todo el ancho del contenedor, como en los formularios de ingreso. */
export const AnchoCompleto: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};
