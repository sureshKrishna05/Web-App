import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: 'main.js',
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'better-sqlite3',
        'xlsx',
        'pdfkit',
        'number-to-words',
        'electron-squirrel-startup'
      ],
    },
    emptyOutDir: true,
  },
});

