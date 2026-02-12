import { defineConfig } from 'vite';

export default defineConfig({
  base: '/app/',
  build: {
    outDir: '../backend/static/app',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
});
