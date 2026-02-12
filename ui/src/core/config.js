// ═══════════════════════════════════════════════════════════════════════════
// APP CONFIGURATION
// Values come from build-time env (VITE_*) so production can use a different
// Supabase project and API URL. See ui/.env.example.
// ═══════════════════════════════════════════════════════════════════════════

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
 * Build the OAuth redirect URL based on the current environment.
 * - Capacitor:  com.zuno.app://callback  (deep link, opens system browser → back to app)
 * - Vite dev:   http://localhost:5173/
 * - FastAPI:    http://localhost:8000/app/ or http://localhost:8000/app/#auth
 *
 * All of these must be added to the Supabase Dashboard under
 * Authentication → URL Configuration → Redirect URLs.
 */
export function getOAuthRedirectUrl() {
  // In Capacitor native app, use the deep link scheme
  if (isCapacitor()) {
    return OAUTH_CALLBACK_URL;
  }
  // For normal web, use the full URL (strip any hash)
  return window.location.origin + window.location.pathname;
}
