// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY PAGE (Content + Collections)
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { showFeed } from '../core/config.js';
import { _libraryTab, setLibraryTab, getProcessingIds, addProcessingId, removeProcessingId } from '../core/state.js';
import { toast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { contentCardHtml } from '../components/ui.js';
import { esc } from '../utils/helpers.js';
import { showApiError } from '../utils/api-error.js';

let _processingPollInterval = null;

function stopProcessingPoll() {
  if (_processingPollInterval) {
    clearInterval(_processingPollInterval);
    _processingPollInterval = null;
  }
}

/**
 * Poll for content that was "Processing with AI"; when any have ai_processed=true, clear state and refresh list.
 */
async function pollProcessingContent(el) {
  const hash = window.location.hash || '#home';
  const onLibrary = hash === '#home' || hash.startsWith('#home/saved');
  if (getProcessingIds().size === 0 || !onLibrary) {
    stopProcessingPoll();
    return;
  }
  const res = await api('GET', '/api/content', null, { limit: 50 });
  if (!res.ok) return;
  const raw = res.data;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  let updated = false;
  items.forEach((item) => {
    if (getProcessingIds().has(item.id) && item.ai_processed) {
      removeProcessingId(item.id);
      updated = true;
    }
  });
  if (updated && onLibrary) await renderLibrarySaved(el);
}

/**
 * Renders the library page (saved content, collections, or bookmarks). Fetches content list, collections + categories, or bookmarked feed items.
 * @param {HTMLElement} el - Container element
 * @param {string} [subTab] - 'saved', 'collections', or 'bookmarks'
 */
export async function renderLibrary(el, subTab) {
  if (subTab === 'saved' || subTab === 'bookmarks') setLibraryTab(subTab);
  const isSaved = _libraryTab === 'saved';
  const isBookmarks = _libraryTab === 'bookmarks';

  if (isSaved) {
    await renderLibrarySaved(el);
  } else {
    await renderLibraryBookmarks(el);
  }
}

function libraryTabsHtml(activeTab) {
  const t = (name, tab) => {
    const isActive = activeTab === tab;
    return `<button onclick="switchLibraryTab('${tab}')" role="tab" aria-selected="${isActive}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-heading'}">${name}</button>`;
  };
  return `<div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Library view">
    ${t('Saved', 'saved')}
    ${t('Bookmarks', 'bookmarks')}
  </div>`;
}

async function renderLibrarySaved(el) {
  const res = await api('GET', '/api/content', null, { limit: 50 });
  if (!res.ok) showApiError(res);
  const raw = res.ok ? res.data : null;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  items.forEach(item => { if (item.ai_processed) removeProcessingId(item.id); });

  el.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h1 class="text-xl font-bold text-heading">Library</h1>
        <button type="button" onclick="refreshLibrary()" id="library-refresh-btn" class="p-2 rounded-xl text-muted hover:text-heading hover:bg-surface-hover transition-colors active:scale-95" aria-label="Refresh list" title="Refresh list">
          <span class="material-icons-round text-xl">refresh</span>
        </button>
      </div>

      ${items.length === 0 ? `
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">bookmark_border</span>
          </div>
          <p class="text-heading font-semibold mb-1">No saved content yet</p>
          <p class="text-muted text-sm mb-4">Tap the + button to save your first item</p>
        </div>` : `
        <div class="space-y-3" id="content-list">
          ${items.map(item => contentCardHtml(item, { showAiStatus: true, processingIds: getProcessingIds() })).join('')}
        </div>`}
    </div>`;
  if (getProcessingIds().size > 0) {
    stopProcessingPoll();
    _processingPollInterval = setInterval(() => pollProcessingContent(el), 4500);
  }
}

/**
 * @param {HTMLElement} el
 * @param {{ standalone?: boolean, backHash?: string, backLabel?: string }} [options] - If standalone, show back link and "Bookmarks" title only (e.g. from profile).
 */
async function renderLibraryBookmarks(el, options = {}) {
  const { standalone = false, backHash = '', backLabel = '' } = options;
  const res = await api('GET', '/api/feed/bookmarks/items');
  if (!res.ok) showApiError(res);
  const items = res.ok ? (Array.isArray(res.data) ? res.data : []) : [];

  const backLinkHtml = standalone && backHash && backLabel
    ? `<a href="${backHash}" onclick="navigate('${backHash}');return false" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-heading mb-4">← ${esc(backLabel)}</a>`
    : '';

  el.innerHTML = `
    <div class="fade-in">
      ${backLinkHtml}
      <div class="flex items-center justify-between gap-3 mb-4">
        <h1 class="text-xl font-bold text-heading">${standalone ? 'Bookmarks' : 'Library'}</h1>
        <button type="button" onclick="refreshLibrary()" id="library-refresh-btn" class="p-2 rounded-xl text-muted hover:text-heading hover:bg-surface-hover transition-colors active:scale-95" aria-label="Refresh list" title="Refresh list">
          <span class="material-icons-round text-xl">refresh</span>
        </button>
      </div>
      ${!standalone ? libraryTabsHtml('bookmarks') : ''}

      ${items.length === 0 ? `
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">bookmark</span>
          </div>
          <p class="text-heading font-semibold mb-1">No bookmarks yet</p>
          <p class="text-muted text-sm mb-4">${showFeed() ? 'Bookmark items from Feed (My Feed or Suggested) to see them here' : 'When the Feed is enabled, you can bookmark items there to see them here.'}</p>
          ${showFeed() ? `<button onclick="navigate('#feed')" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Go to Feed</button>` : ''}
        </div>` : `
        <div class="space-y-3" id="bookmarks-list">
          ${items.map(item => contentCardHtml(item, { showBookmark: true, isBookmarked: true })).join('')}
        </div>`}
    </div>`;
}

const _collectionThemeColors = {
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  green: 'from-green-500/20 to-green-600/5 border-green-500/20',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
  indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
};

function collectionsContentHtml(cols, cats) {
  return `
    ${cats.length > 0 ? `
      <div class="mb-5">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">AI Categories</h2>
        <div class="flex flex-wrap gap-1.5">
          ${cats.map(c => `<span class="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-body">${esc(typeof c === 'string' ? c : c.name || c.category || '')}</span>`).join('')}
        </div>
      </div>` : ''}

    ${cols.length === 0 ? `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
          <span class="material-icons-round text-4xl text-accent/60">folder_open</span>
        </div>
        <p class="text-heading font-semibold mb-1">No collections yet</p>
        <p class="text-muted text-sm mb-4">Create your first collection to organize content</p>
        <button onclick="openCreateCollectionModal()" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Create Collection</button>
      </div>` : `
      <div class="grid grid-cols-2 gap-3">
        ${cols.map(c => {
          const tc = _collectionThemeColors[c.theme] || _collectionThemeColors.blue;
          return `
          <article onclick="navigate('#collection/${c.id}')" class="bg-gradient-to-br ${tc} border rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-36 flex flex-col justify-between">
            <span class="material-icons-round text-2xl text-heading/80">${esc(c.icon || 'folder')}</span>
            <div>
              <h3 class="text-heading font-semibold text-sm leading-snug line-clamp-1">${esc(c.title)}</h3>
              <p class="text-muted text-xs mt-0.5">${c.item_count} item${c.item_count !== 1 ? 's' : ''}</p>
              ${c.is_shared ? '<span class="text-[10px] text-accent font-medium">Shared</span>' : ''}
            </div>
          </article>`;
        }).join('')}
        <button onclick="openCreateCollectionModal()" class="border-2 border-dashed border-border rounded-2xl h-36 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all duration-200 active:scale-[0.97]" aria-label="Create new collection">
          <span class="material-icons-round text-2xl text-muted">add</span>
          <span class="text-muted text-xs font-medium">New Collection</span>
        </button>
      </div>`}
  `;
}

/**
 * Renders the standalone Collections page (list of collections + categories).
 * Used by route #collections.
 */
/** Renders the bookmarks list; use options.standalone for profile/bookmarks view. */
export { renderLibraryBookmarks };

export async function renderCollectionsPage(el) {
  const [colRes, catRes] = await Promise.all([
    api('GET', '/api/collections'),
    api('GET', '/api/collections/categories'),
  ]);
  if (!colRes.ok) showApiError(colRes);
  if (!catRes.ok) showApiError(catRes);
  const cols = colRes.ok ? (Array.isArray(colRes.data) ? colRes.data : []) : [];
  const cats = catRes.ok ? (Array.isArray(catRes.data) ? catRes.data : []) : [];

  el.innerHTML = `
    <div class="fade-in">
      <h1 class="text-xl font-bold text-heading mb-4">Collections</h1>
      ${collectionsContentHtml(cols, cats)}
    </div>`;
}

async function refreshLibrary() {
  const pageEl = document.getElementById('page');
  if (!pageEl) return;
  const hash = (window.location.hash || '').replace(/^#/, '');
  const [page, id] = hash.split('/');
  const btn = document.getElementById('library-refresh-btn');
  if (btn) {
    btn.disabled = true;
    const icon = btn.querySelector('.material-icons-round');
    if (icon) icon.classList.add('animate-spin');
  }
  if (page === 'profile' && id === 'bookmarks') {
    await renderLibraryBookmarks(pageEl, { standalone: true, backHash: '#profile', backLabel: 'Profile' });
  } else {
    await renderLibrary(pageEl, _libraryTab);
  }
  if (btn) {
    btn.disabled = false;
    const icon = btn.querySelector('.material-icons-round');
    if (icon) icon.classList.remove('animate-spin');
  }
}

function switchLibraryTab(tab) {
  setLibraryTab(tab);
  navigate(tab === 'saved' ? '#home' : `#home/${tab}`);
}

function getSaveContentFormHtml(prefillUrl = '') {
  return `
    <h2 class="text-lg font-bold text-heading mb-4">Add content</h2>
    <div class="space-y-4">
      <div>
        <label for="m-url" class="text-xs text-muted font-medium mb-1.5 block">URL</label>
        <input id="m-url" type="url" inputmode="url" autocomplete="url" placeholder="Paste a link..." value="${esc(prefillUrl)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" autofocus />
        <p class="text-[11px] text-muted mt-1.5">Title, description, platform and type are auto-detected</p>
      </div>
      <button onclick="doSaveContent()" id="save-content-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97] min-h-[44px]">Save Content</button>
    </div>
  `;
}

function getSaveContentProgressHtml() {
  return `
    <div class="flex flex-col items-center justify-center py-6 gap-4" role="status" aria-busy="true">
      <span class="material-icons-round text-3xl text-accent/80">link</span>
      <p class="text-sm font-medium text-heading">Saving link…</p>
      <div class="progress-bar-inline w-full" style="max-width: 280px;">
        <span class="progress-bar-inline-inner block h-full rounded"></span>
      </div>
    </div>
  `;
}

function openSaveContentModal(prefillUrl = '') {
  openModal(getSaveContentFormHtml(prefillUrl));
}

async function refreshSavedListOnly(newItemId = null) {
  const hash = (window.location.hash || '').replace('#', '');
  const onLibrarySaved = (hash === 'home' || hash === 'home/saved') && _libraryTab === 'saved';
  if (!onLibrarySaved) return;

  const res = await api('GET', '/api/content', null, { limit: 50 });
  if (!res.ok) return;
  const raw = res.data;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);

  items.forEach(item => {
    if (item.ai_processed) removeProcessingId(item.id);
  });

  const listEl = document.getElementById('content-list');
  if (listEl) {
    const processingIds = getProcessingIds();
    listEl.innerHTML = items.map(item => {
      const isNew = newItemId && (item.id === newItemId || (item.content_id || item.id) === newItemId);
      const cardHtml = contentCardHtml(item, { showAiStatus: true, processingIds });
      return isNew ? cardHtml.replace('<article class="', '<article class="new-item-highlight ') : cardHtml;
    }).join('');

    if (newItemId) {
      const card = listEl.querySelector('.new-item-highlight');
      if (card) setTimeout(() => card.classList.remove('new-item-highlight'), 1500);
    }
  } else {
    const main = document.getElementById('page');
    if (main) await renderLibrarySaved(main);
  }
}

async function doSaveContent() {
  const urlInput = document.getElementById('m-url');
  const url = urlInput ? urlInput.value.trim() : '';
  if (!url) {
    toast('URL is required', true);
    return;
  }

  const modalContent = document.getElementById('modal-content');
  if (modalContent) modalContent.innerHTML = getSaveContentProgressHtml();

  try {
    const res = await api('POST', '/api/content', { url });
    if (res.ok) {
      const contentId = res.data?.id;
      if (contentId) {
        addProcessingId(contentId);
        api('POST', '/api/ai/process-content', { content_id: contentId }).catch(() => {
          removeProcessingId(contentId);
          toast('AI processing failed for this item', true);
        });
      }
      closeModal();
      toast('Link saved');
      await refreshSavedListOnly(contentId);
    } else {
      if (modalContent) modalContent.innerHTML = getSaveContentFormHtml(url);
      toast(res.data?.detail || "Couldn't save link. Check the URL and try again.", true);
    }
  } catch (_) {
    if (modalContent) modalContent.innerHTML = getSaveContentFormHtml(url);
    toast("Couldn't save link. Check the URL and try again.", true);
  }
}

function openCreateCollectionModal() {
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">New Collection</h2>
    <div class="space-y-4">
      <div>
        <label for="c-title" class="text-xs text-muted font-medium mb-1.5 block">Title *</label>
        <input id="c-title" placeholder="Collection name" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="c-desc" class="text-xs text-muted font-medium mb-1.5 block">Description</label>
        <textarea id="c-desc" rows="2" placeholder="Optional description" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="c-icon" class="text-xs text-muted font-medium mb-1.5 block">Icon</label>
          <input id="c-icon" value="folder" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
        </div>
        <div>
          <label for="c-theme" class="text-xs text-muted font-medium mb-1.5 block">Theme</label>
          <select id="c-theme" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent">
            <option value="blue">Blue</option><option value="green">Green</option><option value="purple">Purple</option>
            <option value="amber">Amber</option><option value="rose">Rose</option><option value="indigo">Indigo</option>
          </select>
        </div>
      </div>
      <button onclick="doCreateCollection()" id="create-col-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Create Collection</button>
    </div>
  `);
}

async function doCreateCollection() {
  const title = document.getElementById('c-title').value.trim();
  if (!title) { toast('Title is required', true); return; }
  const btn = document.getElementById('create-col-btn');
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>';
  btn.disabled = true;
  const body = {
    title,
    description: document.getElementById('c-desc').value.trim() || null,
    icon: document.getElementById('c-icon').value.trim() || 'folder',
    theme: document.getElementById('c-theme').value,
  };
  const res = await api('POST', '/api/collections', body);
  if (res.ok) {
    closeModal();
    toast('Collection created!');
    navigate('#collection/' + res.data.id);
  } else {
    toast(res.data?.detail || 'Failed to create', true);
    btn.textContent = 'Create Collection';
    btn.disabled = false;
  }
}

// Expose globally for onclick handlers
window.refreshLibrary = refreshLibrary;
window.switchLibraryTab = switchLibraryTab;
window.openSaveContentModal = openSaveContentModal;
window.doSaveContent = doSaveContent;
window.openCreateCollectionModal = openCreateCollectionModal;
window.doCreateCollection = doCreateCollection;
