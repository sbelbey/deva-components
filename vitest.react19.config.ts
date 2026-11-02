import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Mismos tests, pero con React 19. React 19 y Testing Library se instalan
 * aparte, en .react19/ (`npm run test:react19` lo hace), para no mezclarlos con
 * el React 18 del paquete: los componentes compartidos tienen que andar en los
 * dos, porque DEVA usa 18 y el portal y Nexus usan 19.
 */
const r19 = (path: string) => fileURLToPath(new URL(`./.react19/node_modules/${path}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^react$/, replacement: r19('react') },
      { find: /^react\/(.*)$/, replacement: r19('react') + '/$1' },
      { find: /^react-dom$/, replacement: r19('react-dom') },
      { find: /^react-dom\/(.*)$/, replacement: r19('react-dom') + '/$1' },
      { find: /^@testing-library\/react$/, replacement: r19('@testing-library/react') },
      { find: /^@testing-library\/dom$/, replacement: r19('@testing-library/dom') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.{ts,tsx}'],
  },
});
