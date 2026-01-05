import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['electron/main.ts', 'electron/preload.ts'],
  outDir: 'dist',
  format: ['cjs'], // Electron uses CommonJS
  target: 'node18',
  external: ['electron'], // Do not bundle electron itself
  clean: true,
  sourcemap: true,
});
