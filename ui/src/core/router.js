// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════
import { navigate, replaceHash, getRoute } from './navigate.js';
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
let _navId = 0;

function getTransition(page) {
  if (!_prevPage) return 'fade-in';
  if (_detailPages.includes(page) && !_detailPages.includes(_prevPage)) return 'slide-in-right';
  if (_detailPages.includes(_prevPage) && !_detailPages.includes(page)) return 'slide-in-left';
  return 'fade-in';
}

function runWithViewTransition(callback) {
  if (typeof document.startViewTransition === 'function') {
    return document.startViewTransition(callback);
  }
  const p = callback();
  return p && typeof p.then === 'function' ? p.then(() => {}) : Promise.resolve();
}

export async function router() {
  const myNavId = ++_navId;
  const token = localStorage.getItem('zuno_token');
  let { page, id } = getRoute();

  // Empty or invalid page → redirect without firing hashchange
  if (!page) {
    replaceHash(token ? '#home' : '#auth');
    queueMicrotask(() => router());
    return;
  }

  // Collection without id
  if (page === 'collection' && !id) {
    replaceHash('#library/collections');
    queueMicrotask(() => router());
    return;
  }

  // Auth guard
  if (!token && page !== 'auth' && page !== 'connect-extension') {
    replaceHash('#auth');
    queueMicrotask(() => router());
    return;
  }
  if (token && page === 'auth') {
    replaceHash('#home');
    queueMicrotask(() => router());
    return;
  }

  const main = document.getElementById('page');
  if (!main) return;

  // Chrome extension connect (fix: use main after it's defined)
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
  if (page === 'feed') { replaceHash('#home'); queueMicrotask(() => router()); return; }
  if (page === 'content') { replaceHash('#library'); queueMicrotask(() => router()); return; }
  if (page === 'collections') { replaceHash('#library'); queueMicrotask(() => router()); return; }

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

  const transition = getTransition(page);
  setPrevPage(page);

  const skeletonMap = {
    home: skeletonCards(3),
    library: skeletonCards(3),
    goals: skeletonCards(3),
    'content-detail': skeletonDetail(),
    'goal-detail': skeletonDetail(),
    collection: skeletonDetail(),
    admin: loadingSpinner(),
  };

  await runWithViewTransition(async () => {
    if (myNavId !== _navId) return;
    main.innerHTML = `<div class="${transition}">${skeletonMap[page] || loadingSpinner()}</div>`;

    try {
      switch (page) {
        case 'auth': renderAuth(main); break;
        case 'home': await renderHome(main); if (myNavId !== _navId) return; break;
        case 'library':
          await renderLibrary(main, id);
          if (myNavId !== _navId) return;
          try {
            const pending = sessionStorage.getItem('zuno_pending_share');
            if (pending) {
              sessionStorage.removeItem('zuno_pending_share');
              if (typeof openSaveContentModal === 'function') openSaveContentModal(pending);
            }
          } catch (_) {}
          break;
        case 'content-detail': await renderContentDetail(main, id); if (myNavId !== _navId) return; break;
        case 'collection': await renderCollectionDetail(main, id); if (myNavId !== _navId) return; break;
        case 'goals': await renderGoals(main); if (myNavId !== _navId) return; break;
        case 'goal-detail': await renderGoalDetail(main, id); if (myNavId !== _navId) return; break;
        case 'search': await renderSearch(main); if (myNavId !== _navId) return; break;
        case 'knowledge': await renderKnowledge(main); if (myNavId !== _navId) return; break;
        case 'profile': await renderProfile(main); if (myNavId !== _navId) return; break;
        case 'admin': await renderAdmin(main); if (myNavId !== _navId) return; break;
        default:
          replaceHash('#home');
          queueMicrotask(() => router());
          return;
      }
    } catch (err) {
      if (myNavId !== _navId) return;
      const errMsg = typeof err?.message === 'string' ? err.message : 'Something went wrong';
      main.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-center fade-in" role="alert" aria-live="assertive">
        <span class="material-icons-round text-5xl text-danger/40 mb-3">error_outline</span>
        <p class="text-heading font-semibold mb-1">Something went wrong</p>
        <p class="text-muted text-sm mb-4">${esc(errMsg)}</p>
        <button type="button" onclick="router()" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Try again</button>
      </div>`;
    }
  });
}

// Expose router globally so pages can call it
window.router = router;
