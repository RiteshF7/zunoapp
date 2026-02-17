// ═══════════════════════════════════════════════════════════════════════════
// APP CONFIGURATION
// Values come from build-time env (VITE_*) so production can use a different
// Supabase project and API URL. See ui/.env.example.
// ═══════════════════════════════════════════════════════════════════════════

// Dev fallback only when VITE_SUPABASE_URL is unset (e.g. dev server without .env.development).
// Use dev Supabase (rvp) so we never accidentally hit prod (izx). Prefer .env.development via resolve-env.
const _devFallback = {
  url: 'https://fbutixoxslmjumpzlrvp.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidXRpeG94c2xtanVtcHpscnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzAxMzgsImV4cCI6MjA4NjU0NjEzOH0.' +
    '2EyQggdd7qB1rmJ9xw55FGj0UGc7Y9I5E8Bs0jyXoLE',
};

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV && _devFallback.url) ||
  '';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV && _devFallback.anonKey) ||
  '';

// Custom URL scheme for deep links (must match Android applicationId: dev = com.zuno.app.dev, prod = com.zuno.app)
// Set by resolve-env: VITE_APP_SCHEME in ui/.env. In Capacitor dev build, default to .dev so OAuth never redirects to localhost.
export const APP_SCHEME =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_SCHEME) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development' && typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() ? 'com.zuno.app.dev' : null) ||
  'com.zuno.app';
export const OAUTH_CALLBACK_URL = `${APP_SCHEME}://callback`;

/**
 * Detect if we're running inside a Capacitor native shell.
 * Capacitor sets window.Capacitor when running in a native context.
 */
export function isCapacitor() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

/**
 * API base URL — single source of truth for the backend base (used by api.js and iOS Share Extension sync).
 * In Capacitor, origin is http://localhost (not the backend), so we use VITE_API_BASE or emulator host.
 */
export function getApiBase() {
  const host = typeof window !== 'undefined' && window.location?.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  // Native app (Capacitor): origin is always http://localhost — use env API base or emulator backend.
  if (isCapacitor()) {
    // Dev build on Android: ALWAYS use 10.0.2.2:8000 so emulator hits host backend (fixes "no local logs")
    const isDev = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development';
    const isAndroid = typeof window?.Capacitor?.getPlatform === 'function' && window.Capacitor.getPlatform() === 'android';
    if (isDev && isAndroid) return 'http://10.0.2.2:8000';
    let envBase = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE;
    // Android emulator: localhost points to the device; 10.0.2.2 is the host machine.
    if (envBase && envBase.includes('localhost') && isAndroid) {
      envBase = envBase.replace(/localhost/g, '10.0.2.2');
    }
    if (envBase) return envBase;
    if (typeof window !== 'undefined' && window.ZUNO_API_BASE) return window.ZUNO_API_BASE;
    if (host === 'localhost') return 'http://10.0.2.2:8000';
    return '';
  }

  // Browser: local dev use same origin; otherwise use env or origin.
  if (isLocal && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    (typeof window !== 'undefined' && window.ZUNO_API_BASE) ||
    (typeof window !== 'undefined' && window.location?.origin) ||
    ''
  );
}

/**
 * Whether the Feed section (My Feed / Suggested) is visible in the app.
 * When false, Home shows Library Saved and there is no Feed nav or route.
 * Set VITE_SHOW_FEED=true in .env to enable the feed (e.g. for dev or when feed is ready).
 */
export function showFeed() {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOW_FEED === 'true') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOW_FEED === true) ||
    false
  );
}

/**
 * Build the OAuth redirect URL based on the current environment.
 * - Capacitor dev:  com.zuno.app.dev://callback  (debug APK)
 * - Capacitor prod: com.zuno.app://callback     (release APK)
 * - Vite dev:       http://localhost:5173/
 * - FastAPI:        http://localhost:8000/app/ or http://localhost:8000/app/#auth
 *
 * Add all of these to the Supabase Dashboard under
 * Authentication → URL Configuration → Redirect URLs (both com.zuno.app.dev://callback and com.zuno.app://callback for native).
 */
export function getOAuthRedirectUrl() {
  // In Capacitor native app, always use the deep link (APP_SCHEME://callback) — never window.location (emulator can't open localhost:5173).
  if (isCapacitor()) {
    return OAUTH_CALLBACK_URL;
  }
  // For normal web, use the full URL (strip any hash)
  return window.location.origin + window.location.pathname;
}
