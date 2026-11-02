import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorModeSwitch, type ColorMode } from '../../src/ui';

const meta = {
  title: 'Primitivos/ColorModeSwitch',
  component: ColorModeSwitch,
  args: { mode: 'light', onChange: () => {} },
  argTypes: { mode: { control: 'inline-radio', options: ['light', 'dark'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Switch sol/luna. Es controlado: la app le pasa el modo y recibe el nuevo en `onChange`. Aplicarlo (`data-theme` en `<html>`) y guardarlo (navegador, cuenta del usuario) es de cada app.',
      },
    },
  },
} satisfies Meta<typeof ColorModeSwitch>;
export default meta;
type Story = StoryObj<typeof meta>;

function Interactivo({ hideLabel }: { hideLabel?: boolean }) {
  const [mode, setMode] = useState<ColorMode>('light');
  // Como en las apps: el modo se aplica en <html data-theme>.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);
  return <ColorModeSwitch mode={mode} onChange={setMode} hideLabel={hideLabel} />;
}

/** Cambia de verdad el modo de esta página. */
export const Interactivo_: Story = { name: 'Interactivo', render: () => <Interactivo /> };

export const Claro: Story = { args: { mode: 'light' } };
export const Oscuro: Story = { args: { mode: 'dark' } };

/** Etiqueta sólo para lectores de pantalla, con tooltip nativo (barra azul, pantallas chicas). */
export const EtiquetaOculta: Story = { render: () => <Interactivo hideLabel /> };

export const Deshabilitado: Story = { args: { disabled: true } };

/** Etiqueta propia. */
export const EtiquetaPropia: Story = { args: { label: 'Tema oscuro' } };
