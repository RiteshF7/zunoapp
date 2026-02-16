// ═══════════════════════════════════════════════════════════════════════════
// APP CONFIGURATION
// Values come from build-time env (VITE_*) so production can use a different
// Supabase project and API URL. See ui/.env.example.
// ═══════════════════════════════════════════════════════════════════════════

// Dev only when VITE_SUPABASE_URL is unset; use a dedicated dev Supabase in .env.development to avoid hitting production.
const _devFallback = {
  url: 'https://orpdwhqgcthwjnbirizx.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycGR3aHFnY3Rod2puYmlyaXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjUxMjAsImV4cCI6MjA4NjMwMTEyMH0.' +
    '4RMhxpB6tTSDEKQfubST_TzPhsvx2Z1HT2juHZDD7qM',
};

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV && _devFallback.url) ||
  '';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV && _devFallback.anonKey) ||
  '';

// Custom URL scheme for deep links (must match AndroidManifest.xml intent-filter)
export const APP_SCHEME = 'com.zuno.app';
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
    const envBase = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE;
    if (envBase) return envBase;
    if (typeof window !== 'undefined' && window.ZUNO_API_BASE) return window.ZUNO_API_BASE;
    // Android emulator dev: backend at 10.0.2.2:8000
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
 * - Capacitor:  com.zuno.app://callback  (deep link, opens system browser → back to app)
 * - Vite dev:   http://localhost:5173/
 * - FastAPI:    http://localhost:8000/app/ or http://localhost:8000/app/#auth
 *
 * All of these must be added to the Supabase Dashboard under
 * Authentication → URL Configuration → Redirect URLs.
 * If Google login works on production but not locally, add your local origin
 * (e.g. http://localhost:5173/ or http://localhost:8000/app/) to that list.
 */
export function getOAuthRedirectUrl() {
  // In Capacitor native app, use the deep link scheme
  if (isCapacitor()) {
    return OAUTH_CALLBACK_URL;
  }
  // For normal web, use the full URL (strip any hash)
  return window.location.origin + window.location.pathname;
}
