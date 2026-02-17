import type { CapacitorConfig } from '@capacitor/cli';
import { existsSync } from 'fs';
import { join } from 'path';

// Use dev server (10.0.2.2:5173) when: CAPACITOR_DEV_SERVER=1 OR file mobile/.use-dev-server exists
const useDevServer =
  process.env.CAPACITOR_DEV_SERVER === '1' ||
  process.env.CAPACITOR_DEV_SERVER === 'true' ||
  existsSync(join(__dirname, '.use-dev-server'));

const config: CapacitorConfig = {
  appId: 'com.zuno.app',
  appName: 'Zuno',
  webDir: 'www',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  // When useDevServer: WebView loads from http://10.0.2.2:5173 (emulator → host Vite). Run "npm run dev" in ui/ first.
  // Otherwise: WebView loads bundled www/. Create mobile/.use-dev-server to enable dev server without env var.
  android: {
    allowMixedContent: true,
  },
  ios: {
    allowMixedContent: true,
  },
  server: (() => {
    const base = { androidScheme: 'http' as const, iosScheme: 'http' as const };
    if (useDevServer) {
      // Android emulator: 10.0.2.2 = host machine. Never use localhost — emulator can't reach it.
      const serverUrl = process.env.CAPACITOR_SERVER_URL || 'http://10.0.2.2:5173';
      return { ...base, url: serverUrl, cleartext: true };
    }
    return base;
  })(),
};

export default config;
