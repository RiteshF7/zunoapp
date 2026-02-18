// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════
import { navigate, replaceHash, getRoute } from './navigate.js';
import { _prevPage, setPrevPage } from './state.js';
import { showFeed, getApiBase } from './config.js';
import { skeletonCards, skeletonDetail, loadingSpinner } from '../components/skeleton.js';
import { esc } from '../utils/helpers.js';

import { renderAuth } from '../pages/auth.js';
import { renderHome } from '../pages/home.js';
import { renderHomeDashboard } from '../pages/home-dashboard.js';
import { renderLibrary, renderCollectionsPage, renderLibraryBookmarks } from '../pages/library.js';
import { renderContentDetail } from '../pages/content-detail.js';
import { renderCollectionDetail } from '../pages/collection-detail.js';
import { renderGoals } from '../pages/goals.js';
import { renderGoalDetail } from '../pages/goal-detail.js';
import { renderSearch } from '../pages/search.js';
import { renderKnowledge } from '../pages/knowledge.js';
import { renderProfile } from '../pages/profile.js';
import { renderAdmin } from '../pages/admin.js';
import { renderAbout } from '../pages/about.js';

const _detailPages = ['content-detail', 'collection', 'goal-detail'];
let _navId = 0;
let _routerRunning = false;

function getTransition(page) {
  if (!_prevPage) return 'fade-in';
  if (_detailPages.includes(page) && !_detailPages.includes(_prevPage)) return 'slide-in-right';
  if (_detailPages.includes(_prevPage) && !_detailPages.includes(page)) return 'slide-in-left';
  return 'fade-in';
}

function runRouterCallback(callback) {
  const p = callback();
  return p && typeof p.then === 'function' ? p : Promise.resolve();
}

export async function router() {
  // Prevent concurrent runs (e.g. app resume + hashchange) which cause duplicate API calls and stuck loading
  if (_routerRunning) return;
  _routerRunning = true;
  const myNavId = ++_navId;
  const token = localStorage.getItem('zuno_token');
  let { page, id } = getRoute();

  // Empty or invalid page → redirect without firing hashchange
  if (!page) {
    _routerRunning = false;
    replaceHash(token ? '#home' : '#auth');
    queueMicrotask(() => router());
    return;
  }

  // Collection list (no id) → collections page
  if (page === 'collection' && !id) {
    _routerRunning = false;
    replaceHash('#collections');
    queueMicrotask(() => router());
    return;
  }

  // Auth guard (allow #about without auth so login screen can open it to check URLs)
  if (!token && page !== 'auth' && page !== 'connect-extension' && page !== 'about') {
    _routerRunning = false;
    replaceHash('#auth');
    queueMicrotask(() => router());
    return;
  }
  if (token && page === 'auth') {
    _routerRunning = false;
    replaceHash('#home');
    queueMicrotask(() => router());
    return;
  }

  const main = document.getElementById('page');
  if (!main) {
    _routerRunning = false;
    return;
  }

  // Chrome extension connect (fix: use main after it's defined)
  if (page === 'connect-extension') {
    _routerRunning = false;
    // Expose env-aware API base so content script can send it to the extension (dev vs prod)
    try {
      window.ZUNO_API_BASE = getApiBase();
    } catch (_) {
      window.ZUNO_API_BASE = window.location?.origin || '';
    }
    main.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-center fade-in">
      <p class="text-heading font-semibold mb-2">Connecting extension…</p>
      <p class="text-muted-foreground text-sm">Make sure you're logged in. If nothing happens, ensure the Share to Zuno extension is installed.</p>
    </div>`;
    document.getElementById('topnav').classList.add('hidden');
    document.getElementById('bottomnav').classList.add('hidden');
    return;
  }

  // Feed disabled: redirect #feed to Home (Library Saved)
  if (page === 'feed' && !showFeed()) {
    _routerRunning = false;
    replaceHash('#home');
    queueMicrotask(() => router());
    return;
  }
  // Backward compat: library routes → home, collections, or profile/bookmarks
  if (page === 'library') {
    _routerRunning = false;
    const sub = id === 'collections' ? 'collections' : id === 'bookmarks' ? 'bookmarks' : 'saved';
    if (sub === 'collections') {
      replaceHash('#collections');
    } else if (sub === 'bookmarks') {
      replaceHash('#profile/bookmarks');
    } else {
      replaceHash('#home');
    }
    queueMicrotask(() => router());
    return;
  }
  if (page === 'content') {
    _routerRunning = false;
    replaceHash('#home');
    queueMicrotask(() => router());
    return;
  }
  // #home/collections → dedicated collections page
  if (page === 'home' && id === 'collections') {
    _routerRunning = false;
    replaceHash('#collections');
    queueMicrotask(() => router());
    return;
  }
  // Bookmarks live in profile only: redirect #home/bookmarks → #profile/bookmarks
  if (page === 'home' && id === 'bookmarks') {
    _routerRunning = false;
    replaceHash('#profile/bookmarks');
    queueMicrotask(() => router());
    return;
  }

  // Show/hide shell (hide on auth screen and on about when not logged in)
  const isAuth = page === 'auth' || (page === 'about' && !token);
  document.getElementById('topnav').classList.toggle('hidden', isAuth);
  document.getElementById('topnav').classList.toggle('flex', !isAuth);
  document.getElementById('bottomnav').classList.toggle('hidden', isAuth);

  // Show/hide Feed nav tab based on config
  const navFeed = document.getElementById('nav-feed');
  if (navFeed) navFeed.classList.toggle('hidden', !showFeed());

  // Update active nav tab
  const tabMap = {
    home: 'home', feed: 'feed', collections: 'home', 'content-detail': 'home', collection: 'home',
    goals: 'goals', 'goal-detail': 'goals', knowledge: 'knowledge', profile: 'profile', admin: 'profile', about: 'profile',
  };
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const active = btn.dataset.tab === tabMap[page];
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });

  const transition = getTransition(page);
  setPrevPage(page);

  // Persist route so reopening from recents (full reload) can restore the same screen
  try {
    const h = window.location.hash || '#home';
    if (h && h !== '#auth') sessionStorage.setItem('zuno_last_hash', h);
  } catch (_) {}

  const skeletonMap = {
    home: skeletonCards(3),
    feed: skeletonCards(3),
    collections: skeletonCards(3),
    goals: skeletonCards(3),
    'content-detail': skeletonDetail(),
    'goal-detail': skeletonDetail(),
    collection: skeletonDetail(),
    admin: loadingSpinner(),
  };

  try {
    await runRouterCallback(async () => {
      if (myNavId !== _navId) return;
      main.innerHTML = `<div class="${transition}">${skeletonMap[page] || loadingSpinner()}</div>`;

      try {
        switch (page) {
        case 'auth': renderAuth(main); break;
        case 'home':
          if (id === 'saved') {
            await renderLibrary(main, 'saved');
          } else {
            await renderHomeDashboard(main);
          }
          if (myNavId !== _navId) return;
          try {
            const pending = sessionStorage.getItem('zuno_pending_share');
            if (pending) {
              sessionStorage.removeItem('zuno_pending_share');
              if (typeof openSaveContentModal === 'function') openSaveContentModal(pending);
            }
          } catch (_) {}
          break;
        case 'feed':
          if (showFeed()) {
            await renderHome(main);
            if (myNavId !== _navId) return;
          }
          break;
        case 'collections':
          await renderCollectionsPage(main);
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
        case 'profile':
          if (id === 'bookmarks') {
            await renderLibraryBookmarks(main, { standalone: true, backHash: '#profile', backLabel: 'Profile' });
          } else {
            await renderProfile(main);
          }
          if (myNavId !== _navId) return;
          break;
        case 'admin': await renderAdmin(main); if (myNavId !== _navId) return; break;
        case 'about': await renderAbout(main); if (myNavId !== _navId) return; break;
        default:
          _routerRunning = false;
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
          <p class="text-muted-foreground text-sm mb-4">${esc(errMsg)}</p>
          <button type="button" onclick="router()" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Try again</button>
        </div>`;
      }
    });
  } catch (_) {}
  _routerRunning = false;
}

// Expose router globally so pages can call it
window.router = router;
