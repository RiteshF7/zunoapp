import { defineConfig } from 'vite';

export default defineConfig({
  base: '/app/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
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
