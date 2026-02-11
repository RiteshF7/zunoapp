import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zuno.app',
  appName: 'Zuno',
  webDir: 'www',
  // During development the WebView loads local files from www/.
  // API calls use the API_BASE defined in index.html which defaults
  // to http://10.0.2.2:8000 (Android emulator → host localhost).
  //
  // For production, either:
  //   1. Set server.url below to your deployed backend, OR
  //   2. Inject window.ZUNO_API_BASE via server.androidScheme / initialScripts.
  //
  // server: {
  //   url: 'https://api.zuno.app',
  //   cleartext: true,
  // },
  android: {
    // Allow cleartext HTTP for local development (10.0.2.2)
    allowMixedContent: true,
  },
};

export default config;
