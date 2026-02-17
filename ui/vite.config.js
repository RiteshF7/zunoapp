import { defineConfig } from 'vite';

export default defineConfig({
  base: '/app/',
  build: {
    outDir: '../backend/static/app',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true, // listen on 0.0.0.0 so Android emulator (10.0.2.2:5173) can reach the dev server
    proxy: {
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
});
