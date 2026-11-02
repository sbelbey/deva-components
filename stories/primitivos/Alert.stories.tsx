import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '../../src/ui';

const meta = {
  title: 'Primitivos/Alert',
  component: Alert,
  args: { children: 'Usuario o contraseña incorrectos.' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Mensaje en bloque con tono `error`, `warn` u `ok`. Los errores llevan `role="alert"`, así que un lector de pantalla los anuncia solo al aparecer.',
      },
    },
  },
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {};
export const Aviso: Story = { args: { tone: 'warn', children: 'La sesión está por vencer.' } };
export const Correcto: Story = { args: { tone: 'ok', children: 'Te enviamos un mail para restablecer la contraseña.' } };
