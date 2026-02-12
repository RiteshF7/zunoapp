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

// 3b. Import share handler (registers window.handleSharedContent for native bridge)
import './core/share-handler.js';

// 4. Import pages (registers window globals for onclick handlers)
import { handleOAuthCallback } from './pages/auth.js';
import './pages/home.js';
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

runWhenReady(async () => {
  // Chrome extension share: capture ?share=url and store for after auth
  const params = new URLSearchParams(window.location.search);
  const shareUrl = params.get('share');
  if (shareUrl) {
    try { sessionStorage.setItem('zuno_pending_share', shareUrl); } catch (_) {}
    const u = new URL(window.location.href);
    u.searchParams.delete('share');
    window.history.replaceState({}, '', u.pathname + u.search + (u.hash || ''));
  }

  // If Supabase redirected back with tokens in the hash (web flow), handle them first
  await handleOAuthCallback();
  await router();

  // iOS Share Extension: sync token + apiBase to App Group so Share to Zuno works
  syncAuthToNativeIfIOS();

  // Splash: only place that controls duration — change this value to change splash time (ms)
  const MIN_SPLASH_MS = 2000;
  if (typeof hideSplash === 'function') {
    const elapsed = (typeof window._splashStart === 'number') ? Date.now() - window._splashStart : 0;
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(hideSplash, wait);
  }
});
