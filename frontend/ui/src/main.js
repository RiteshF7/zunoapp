// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

// 1. Import CSS (Vite will bundle these)
import './styles/splash.css';
import './styles/theme.css';
import './styles/base.css';
import './styles/animations.css';

// 2. Import core modules (order matters: theme first, then navigate, then router)
import { initTheme } from './core/theme.js';
import { isCapacitor, getApiBase } from './core/config.js';
import { syncAuthToNativeIfIOS } from './core/ios-share-sync.js';
import './core/navigate.js';   // sets window.navigate
import { router } from './core/router.js';
import { App } from '@capacitor/app';

// 3. Import components (registers window globals)
import './components/toast.js';
import './components/modal.js';
import './components/loading-bar.js';
import { renderAppHeader } from './components/app-header.js';
import { renderBottomNav } from './components/bottom-nav.js';

// 3b. Import share handler (registers window.handleSharedContent for native bridge)
import './core/share-handler.js';

// 4. Import pages (registers window globals for onclick handlers)
import { handleOAuthCallback } from './pages/auth.js';
import './pages/home.js';
import './pages/home-dashboard.js';
import './pages/library.js';
import './pages/content-detail.js';
import './pages/collection-detail.js';
import './pages/goals.js';
import './pages/goal-detail.js';
import './pages/search.js';
import './pages/knowledge.js';
import './pages/profile.js';
import './pages/admin.js';

// 5. Initialize theme immediately (before DOMContentLoaded)
initTheme();

// 5b. Show dev tag + API base in top-left when built with --mode development (debug APK)
if (import.meta.env.MODE === 'development') {
  const el = document.getElementById('dev-indicator');
  const apiBase = getApiBase();
  console.log('[Zuno] DEV build — API base:', apiBase, '| Debug APK uses host (10.0.2.2), release uses prod');
  if (el) {
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
    el.textContent = apiBase ? `DEV ${apiBase.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : 'DEV';
    el.classList.remove('pointer-events-none');
    el.title = `API: ${apiBase || '(not set)'}. Tap to copy.`;
  }
}

// 6. Set up deep link listener for Capacitor OAuth callback (register immediately so we don't miss the event on cold start).
//    When the system browser redirects to com.zuno.app://callback#access_token=...,
//    Android opens the app and fires an appUrlOpen event — listener must already be registered.
if (isCapacitor()) {
  App.addListener('appUrlOpen', async (event) => {
    if (event.url && event.url.includes('access_token')) {
      const handled = await handleOAuthCallback(event.url);
      if (handled) {
        router();
      }
    }
  });
}

// 7. Wire up routing — run when DOM is ready (module may load after DOMContentLoaded, so don't rely on it)
function runWhenReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

window.addEventListener('hashchange', router);

// Splash: ensure we always hide it (Android/native can hang on API or OAuth; max 4s then show app)
const MIN_SPLASH_MS = 2000;
const MAX_SPLASH_MS = 4000;

function scheduleHideSplash() {
  const hide = typeof window.hideSplash === 'function' ? window.hideSplash : (typeof hideSplash === 'function' ? hideSplash : null);
  if (!hide) return;
  // When restoring route after reopen-from-recents, hide splash quickly so we don't show "Loading" again
  const restoring = !!window._restoringRoute;
  const elapsed = (typeof window._splashStart === 'number') ? Date.now() - window._splashStart : 0;
  const wait = restoring ? 0 : Math.max(0, MIN_SPLASH_MS - elapsed);
  setTimeout(hide, wait);
}

// Fallback: always hide splash after MAX_SPLASH_MS so we never get stuck (e.g. slow/failing API in app load)
runWhenReady(() => {
  const fallback = typeof window.hideSplash === 'function' ? window.hideSplash : (typeof hideSplash === 'function' ? hideSplash : null);
  if (fallback) setTimeout(fallback, MAX_SPLASH_MS);
});

runWhenReady(async () => {
  // Mount app header and bottom nav so #topnav and #bottomnav exist before router
  renderAppHeader();
  renderBottomNav();

  // Chrome extension share: capture ?share=url and store for after auth
  const params = new URLSearchParams(window.location.search);
  const shareUrl = params.get('share');
  if (shareUrl) {
    try { sessionStorage.setItem('zuno_pending_share', shareUrl); } catch (_) {}
    const u = new URL(window.location.href);
    u.searchParams.delete('share');
    window.history.replaceState({}, '', u.pathname + u.search + (u.hash || ''));
  }

  try {
    // If Supabase redirected back with tokens in the hash (web flow), handle them first
    await handleOAuthCallback();

    // Restore last route when reopening from recents (full reload): show same screen instead of always #home
    const hash = window.location.hash || '';
    const isDefaultRoute = !hash || hash === '#' || hash === '#home';
    const isOAuthReturn = hash.includes('access_token') || hash.includes('error=');
    let restoredRoute = false;
    if (isDefaultRoute && !isOAuthReturn) {
      try {
        const saved = sessionStorage.getItem('zuno_last_hash');
        if (saved && saved !== '#' && saved !== '#auth') {
          history.replaceState(null, '', window.location.pathname + window.location.search + saved);
          restoredRoute = true;
          window._restoringRoute = true;
        }
      } catch (_) {}
    }

    await router();

    if (restoredRoute) window._restoringRoute = false;

    // iOS Share Extension: sync token + apiBase to App Group so Share to Zuno works
    syncAuthToNativeIfIOS();

    // Lucide: replace data-lucide placeholders with SVG icons (bottom nav)
    if (typeof window.lucide !== 'undefined') {
      window.lucide.createIcons({ nameAttr: 'data-lucide' });
    }
  } finally {
    // Splash: hide after min duration (or immediately if we already passed it); always run so we never get stuck
    scheduleHideSplash();
  }
});
