import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', ui: 'src/ui/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  target: 'es2019',
  external: ['react', 'react/jsx-runtime'],
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
});
