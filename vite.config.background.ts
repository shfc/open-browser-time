import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({

  build: {
    emptyOutDir: false,


    rollupOptions: {
      input: {
        background: resolve('src/background.ts')
      },
      output: {
        format: 'iife',
        entryFileNames: 'background.js'
      }
    }
  }
});