import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import './preview.css';

/** Aplica el modo claro/oscuro como lo hacen las apps: data-theme en <html>. */
const withColorMode: Decorator = (Story, context) => {
  const mode = context.globals.colorMode === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);
  return <Story />;
};

const preview: Preview = {
  decorators: [withColorMode],
  globalTypes: {
    colorMode: {
      description: 'Modo claro u oscuro',
      toolbar: {
        title: 'Modo',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Claro' },
          { value: 'dark', title: 'Oscuro' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { colorMode: 'light' },
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    options: { storySort: { order: ['Introducción', 'Componentes', 'Búsqueda'] } },
  },
};

export default preview;
