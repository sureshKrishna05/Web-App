import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This is the standard configuration for a Vite-powered Electron Forge project.
export default defineConfig({
  // The 'base' option is crucial for ensuring that asset paths are correct
  // in the final production build.
  base: './', 
  plugins: [react()],
});
