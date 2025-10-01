import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // The 'base' option is crucial for Electron apps.
  // It ensures that asset paths are relative in the final build.
  base: './',
  plugins: [react()],
  build: {
    // This specifies the output directory for the Vite build.
    // Electron Builder will look for your app's code here.
    outDir: 'dist',
  },
});