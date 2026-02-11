// ═══════════════════════════════════════════════════════════════════════════
// APP CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const SUPABASE_URL = 'https://orpdwhqgcthwjnbirizx.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycGR3aHFnY3Rod2puYmlyaXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjUxMjAsImV4cCI6MjA4NjMwMTEyMH0.' +
  '4RMhxpB6tTSDEKQfubST_TzPhsvx2Z1HT2juHZDD7qM';

/**
 * Build the OAuth redirect URL based on the current environment.
 * - Vite dev:   http://localhost:5173/
 * - FastAPI:    http://localhost:8000/static/index.html
 * - Capacitor:  http://localhost  (WebView with no port)
 *
 * All of these must be added to the Supabase Dashboard under
 * Authentication → URL Configuration → Redirect URLs.
 */
export function getOAuthRedirectUrl() {
  // In Capacitor WebView there's no port → just use origin
  if (window.location.hostname === 'localhost' && !window.location.port) {
    return window.location.origin;
  }
  // For normal web, use the full URL (strip any hash)
  return window.location.origin + window.location.pathname;
}
