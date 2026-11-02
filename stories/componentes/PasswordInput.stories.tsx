import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordInput } from '../../src/ui';

const meta = {
  title: 'Componentes/PasswordInput',
  component: PasswordInput,
  args: { placeholder: 'Contraseña', 'aria-label': 'Contraseña' },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Campo de contraseña con ojo para mostrar u ocultar lo escrito. El ojo no envía el formulario, queda fuera del orden de Tab, y su etiqueta dice lo que va a pasar al tocarlo ("Mostrar contraseña" / "Ocultar contraseña"). Acepta los atributos de un `<input>` y `ref`.',
      },
    },
  },
} satisfies Meta<typeof PasswordInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vacio: Story = {};
export const ConValor: Story = { args: { defaultValue: 'una-clave-de-prueba' } };
export const Deshabilitado: Story = { args: { disabled: true, defaultValue: 'una-clave-de-prueba' } };

/** Contraseña nueva: el navegador no la autocompleta con una guardada. */
export const ContrasenaNueva: Story = {
  args: { autoComplete: 'new-password', placeholder: 'Nueva contraseña', 'aria-label': 'Nueva contraseña' },
};

/** Etiquetas del ojo en otro idioma. */
export const EtiquetasPropias: Story = { args: { showLabel: 'Show password', hideLabel: 'Hide password' } };
