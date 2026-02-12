// ═══════════════════════════════════════════════════════════════════════════
// AUTH PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { setUserProfile } from '../core/state.js';
import { toast } from '../components/toast.js';
import {
  SUPABASE_URL, SUPABASE_ANON_KEY,
  getOAuthRedirectUrl, isCapacitor,
} from '../core/config.js';
import { syncAuthToNativeIfIOS } from '../core/ios-share-sync.js';

export function renderAuth(el) {
  el.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[80vh] fade-in">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/15 mb-5">
            <span class="material-icons-round text-4xl text-accent">auto_awesome</span>
          </div>
          <h1 class="text-2xl font-bold text-heading">Welcome to Zuno</h1>
          <p class="text-muted text-sm mt-2">Your AI-powered content companion</p>
        </div>
        <div class="space-y-4">

          <!-- Google Sign-In Button -->
          <button id="google-btn" onclick="doGoogleLogin()" class="w-full flex items-center justify-center gap-3 bg-white dark:bg-surface border border-border hover:bg-slate-50 dark:hover:bg-surface-hover font-semibold py-3.5 rounded-xl transition-all active:scale-[0.97] text-slate-700 dark:text-slate-200 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 48 48" class="flex-shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div id="auth-error" class="hidden text-danger text-sm text-center bg-danger/10 rounded-xl px-4 py-2.5"></div>

          <p class="text-muted text-xs text-center leading-relaxed mt-4">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>`;
}

// ─── Google OAuth ────────────────────────────────────────────────────────────

async function doGoogleLogin() {
  const redirectTo = getOAuthRedirectUrl();
  const authUrl =
    `${SUPABASE_URL}/auth/v1/authorize` +
    `?provider=google` +
    `&redirect_to=${encodeURIComponent(redirectTo)}`;

  if (isCapacitor()) {
    // On native: open in system browser (Chrome Custom Tab) to avoid
    // Google's "disallowed_useragent" error in embedded WebViews.
    // After auth, Supabase redirects to com.zuno.app://callback#access_token=...
    // which Android catches via the intent filter and reopens the app.
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: authUrl, windowName: '_system' });
    } catch {
      // Fallback: open in system browser directly
      window.open(authUrl, '_system');
    }
  } else {
    // On web: navigate directly (redirect comes back to same origin)
    window.location.href = authUrl;
  }
}

/**
 * Handle an OAuth callback from a URL containing tokens.
 * Works for both:
 *   - Web: tokens in window.location.hash (#access_token=...&refresh_token=...)
 *   - Capacitor deep link: tokens in the deep link URL fragment
 *
 * @param {string} [url] - Optional full URL to parse (for deep links).
 *                         If omitted, uses window.location.hash.
 * Returns true if a callback was detected and handled, false otherwise.
 */
export async function handleOAuthCallback(url) {
  // Extract the fragment (hash) portion
  let fragment;
  if (url) {
    const hashIdx = url.indexOf('#');
    fragment = hashIdx >= 0 ? url.substring(hashIdx + 1) : '';
  } else {
    const hash = window.location.hash;
    fragment = hash ? hash.substring(1) : '';
  }

  if (!fragment || !fragment.includes('access_token=')) return false;

  // Parse the fragment params
  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken) return false;

  // Store tokens
  localStorage.setItem('zuno_token', accessToken);
  if (refreshToken) localStorage.setItem('zuno_refresh_token', refreshToken);

  // Close the system browser if it was opened by @capacitor/browser
  if (isCapacitor()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.close();
    } catch { /* ignore */ }
  }

  // Clear the hash fragment; restore intended route if we had one (e.g. 401 on collection)
  let targetHash = '#home';
  try {
    const intended = sessionStorage.getItem('zuno_intended_route');
    if (intended && intended.startsWith('#')) {
      targetHash = intended;
      sessionStorage.removeItem('zuno_intended_route');
    }
  } catch (_) {}
  history.replaceState(null, '', window.location.pathname + targetHash);

  // Validate the token by fetching the profile
  const res = await api('GET', '/api/profile');
  if (res.ok) {
    setUserProfile(res.data);
    syncAuthToNativeIfIOS(); // iOS Share Extension: sync token to App Group
    toast('Signed in as ' + (res.data.display_name || res.data.email || 'user'));
    return true;
  }

  // Token didn't work — clean up
  localStorage.removeItem('zuno_token');
  localStorage.removeItem('zuno_refresh_token');
  history.replaceState(null, '', window.location.pathname + '#auth');
  toast('Sign-in failed. Please try again.', 'error');
  return false;
}

/**
 * Refresh the access token using the stored refresh token.
 * Returns true if refresh was successful.
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('zuno_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('zuno_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('zuno_refresh_token', data.refresh_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export function doLogout() {
  localStorage.removeItem('zuno_token');
  localStorage.removeItem('zuno_refresh_token');
  setUserProfile(null);
  navigate('#auth');
  toast('Signed out');
}

// Expose globally for onclick handlers
window.doLogout = doLogout;
window.doGoogleLogin = doGoogleLogin;
