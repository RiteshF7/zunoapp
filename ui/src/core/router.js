// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════
import { navigate, getRoute } from './navigate.js';
import { _prevPage, setPrevPage } from './state.js';
import { skeletonCards, skeletonDetail, loadingSpinner } from '../components/skeleton.js';
import { esc } from '../utils/helpers.js';

import { renderAuth } from '../pages/auth.js';
import { renderHome } from '../pages/home.js';
import { renderLibrary } from '../pages/library.js';
import { renderContentDetail } from '../pages/content-detail.js';
import { renderCollectionDetail } from '../pages/collection-detail.js';
import { renderGoals } from '../pages/goals.js';
import { renderGoalDetail } from '../pages/goal-detail.js';
import { renderSearch } from '../pages/search.js';
import { renderKnowledge } from '../pages/knowledge.js';
import { renderProfile } from '../pages/profile.js';
import { renderAdmin } from '../pages/admin.js';

const _detailPages = ['content-detail', 'collection', 'goal-detail'];

function getTransition(page) {
  if (!_prevPage) return 'fade-in';
  if (_detailPages.includes(page) && !_detailPages.includes(_prevPage)) return 'slide-in-right';
  if (_detailPages.includes(_prevPage) && !_detailPages.includes(page)) return 'slide-in-left';
  return 'fade-in';
}

export async function router() {
  const token = localStorage.getItem('zuno_token');
  let { page, id } = getRoute();

  // Empty or invalid page → deterministic redirect
  if (!page) {
    navigate(token ? '#home' : '#auth');
    return;
  }

  // Collection without id → avoid wrong default
  if (page === 'collection' && !id) {
    navigate('#library/collections');
    return;
  }

  // Auth guard (connect-extension allows unauthenticated for content script to read hash)
  if (!token && page !== 'auth' && page !== 'connect-extension') { navigate('#auth'); return; }
  if (token && page === 'auth') { navigate('#home'); return; }

  // Chrome extension connect - show minimal page, content script will grab token
  if (page === 'connect-extension') {
    main.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-center fade-in">
      <p class="text-heading font-semibold mb-2">Connecting extension…</p>
      <p class="text-muted text-sm">Make sure you're logged in. If nothing happens, ensure the Share to Zuno extension is installed.</p>
    </div>`;
    document.getElementById('topnav').classList.add('hidden');
    document.getElementById('bottomnav').classList.add('hidden');
    return;
  }

  // Backward compat redirects
  if (page === 'feed') { navigate('#home'); return; }
  if (page === 'content') { navigate('#library'); return; }
  if (page === 'collections') { navigate('#library'); return; }

  // Show/hide shell
  const isAuth = page === 'auth';
  document.getElementById('topnav').classList.toggle('hidden', isAuth);
  document.getElementById('topnav').classList.toggle('flex', !isAuth);
  document.getElementById('bottomnav').classList.toggle('hidden', isAuth);
  document.getElementById('fab-btn').classList.toggle('hidden', page !== 'library');

  // Update active nav tab
  const tabMap = {
    home: 'home', library: 'library', 'content-detail': 'library', collection: 'library',
    goals: 'goals', 'goal-detail': 'goals', knowledge: 'knowledge', profile: 'profile', admin: 'profile',
  };
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const active = btn.dataset.tab === tabMap[page];
    btn.classList.toggle('text-accent', active);
    btn.classList.toggle('text-muted', !active);
  });

  const main = document.getElementById('page');
  const transition = getTransition(page);
  setPrevPage(page);

  // Show skeleton loading
  const skeletonMap = {
    home: skeletonCards(3),
    library: skeletonCards(3),
    goals: skeletonCards(3),
    'content-detail': skeletonDetail(),
    'goal-detail': skeletonDetail(),
    collection: skeletonDetail(),
    admin: loadingSpinner(),
  };
  main.innerHTML = `<div class="${transition}">${skeletonMap[page] || loadingSpinner()}</div>`;

  try {
    switch (page) {
      case 'auth': renderAuth(main); break;
      case 'home': await renderHome(main); break;
      case 'library':
        await renderLibrary(main, id);
        // Chrome extension share: open save modal if pending share URL
        try {
          const pending = sessionStorage.getItem('zuno_pending_share');
          if (pending) {
            sessionStorage.removeItem('zuno_pending_share');
            if (typeof openSaveContentModal === 'function') openSaveContentModal(pending);
          }
        } catch (_) {}
        break;
      case 'content-detail': await renderContentDetail(main, id); break;
      case 'collection': await renderCollectionDetail(main, id); break;
      case 'goals': await renderGoals(main); break;
      case 'goal-detail': await renderGoalDetail(main, id); break;
      case 'search': await renderSearch(main); break;
      case 'knowledge': await renderKnowledge(main); break;
      case 'profile': await renderProfile(main); break;
      case 'admin': await renderAdmin(main); break;
      default: navigate('#home');
    }
  } catch (err) {
    const errMsg = typeof err?.message === 'string' ? err.message : 'Something went wrong';
    main.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-center fade-in" role="alert" aria-live="assertive">
      <span class="material-icons-round text-5xl text-danger/40 mb-3">error_outline</span>
      <p class="text-heading font-semibold mb-1">Something went wrong</p>
      <p class="text-muted text-sm mb-4">${esc(errMsg)}</p>
      <button type="button" onclick="router()" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Try again</button>
    </div>`;
  }
}

// Expose router globally so pages can call it
window.router = router;
