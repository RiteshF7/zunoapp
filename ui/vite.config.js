import { defineConfig } from 'vite';

export default defineConfig({
  base: '/static/',
  build: {
    outDir: '../backend/static',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/static': 'http://localhost:8000',
    },
  },
});
