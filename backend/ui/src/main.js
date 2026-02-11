// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

// 1. Import CSS (Vite will bundle these)
import './styles/theme.css';
import './styles/base.css';
import './styles/animations.css';

// 2. Import core modules (order matters: theme first, then navigate, then router)
import { initTheme } from './core/theme.js';
import { isCapacitor } from './core/config.js';
import './core/navigate.js';   // sets window.navigate
import { router } from './core/router.js';

// 3. Import components (registers window globals)
import './components/toast.js';
import './components/modal.js';

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

// 5. Initialize theme immediately (before DOMContentLoaded)
initTheme();

// 6. Set up deep link listener for Capacitor OAuth callback.
//    When the system browser redirects to com.zuno.app://callback#access_token=...,
//    Android opens the app and fires an appUrlOpen event.
if (isCapacitor()) {
  import('@capacitor/app').then(({ App }) => {
    App.addListener('appUrlOpen', async (event) => {
      // event.url = "com.zuno.app://callback#access_token=...&refresh_token=..."
      if (event.url && event.url.includes('access_token')) {
        const handled = await handleOAuthCallback(event.url);
        if (handled) {
          router();
        }
      }
    });
  }).catch(() => {
    // @capacitor/app not available — ignore
  });
}

// 7. Wire up routing — but first check for a web OAuth callback
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', async () => {
  // If Supabase redirected back with tokens in the hash (web flow), handle them first
  const handled = await handleOAuthCallback();
  // Then run the router (handleOAuthCallback already set the hash to #home if successful)
  router();
});
