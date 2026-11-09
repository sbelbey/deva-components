import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker, UserIcon } from '../../src/ui';

const meta = {
  title: 'Primitivos/Selector de fecha',
  component: DatePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Selector de fecha `DD-MM-AAAA`, igual al de DEVA. Se **escribe por partes** (día, mes, año): al teclear los dígitos se completa la parte y pasa a la siguiente; las flechas arriba y abajo suben y bajan la parte; izquierda y derecha cambian de parte; Retroceso la vacía. También se **elige en un calendario** (semana desde el lunes). Sólo avisa con `onChange` cuando la fecha está completa y existe, o `""` al vaciar todo: una fecha a medias no se avisa. Por defecto avisa la medianoche local en ISO, como DEVA; con `outputFormat="date"` avisa `AAAA-MM-DD`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo(props: Partial<React.ComponentProps<typeof DatePicker>>) {
  const [value, setValue] = useState('');
  return (
    <>
      <DatePicker label="Fecha de retiro" value={value} onChange={setValue} {...props} />
      <pre className="mt-3 overflow-auto rounded-deva bg-deva-surface-2 p-3 text-xs text-deva-ink">{`valor: ${value || '—'}`}</pre>
    </>
  );
}

/** Probá escribir 09112026 sin tocar nada más, o usar las flechas sobre cada parte. */
export const Basico: Story = { args: { label: '', value: '', onChange: () => undefined }, render: () => <Demo outputFormat="date" /> };

/** Arranca con la fecha de hoy si está vacío, como la fecha de retiro de una orden. */
export const HoyPorDefecto: Story = { args: { label: '', value: '', onChange: () => undefined }, render: () => <Demo autoDefaultToday outputFormat="date" /> };

/** Los días futuros no se pueden elegir en el calendario (escribirlos sí se acepta: lo valida el formulario). */
export const SinFuturo: Story = { args: { label: '', value: '', onChange: () => undefined }, render: () => <Demo disableFuture label="Fecha de nacimiento" outputFormat="date" /> };

export const SinPasado: Story = { args: { label: '', value: '', onChange: () => undefined }, render: () => <Demo disablePast label="Fecha de entrega" outputFormat="date" /> };

export const ConIcono: Story = { args: { label: '', value: '', onChange: () => undefined }, render: () => <Demo startIcon={<UserIcon />} label="Fecha de nacimiento" outputFormat="date" /> };

export const ConError: Story = {
  args: { label: '', value: '', onChange: () => undefined },
  render: () => <Demo error helperText="La fecha es obligatoria" outputFormat="date" />,
};

export const Deshabilitado: Story = { args: { label: '', value: '', onChange: () => undefined }, render: () => <Demo disabled outputFormat="date" /> };

/** La versión baja, para tablas y filtros. */
export const VersionBaja: Story = { args: { label: '', value: '', onChange: () => undefined }, render: () => <Demo compact label="Internado desde" outputFormat="date" /> };
