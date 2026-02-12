// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY PAGE (Content + Collections)
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { _libraryTab, setLibraryTab } from '../core/state.js';
import { toast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { contentCardHtml } from '../components/ui.js';
import { esc } from '../utils/helpers.js';

export async function renderLibrary(el, subTab) {
  if (subTab === 'saved' || subTab === 'collections') setLibraryTab(subTab);
  const isSaved = _libraryTab === 'saved';

  if (isSaved) {
    await renderLibrarySaved(el);
  } else {
    await renderLibraryCollections(el);
  }
}

async function renderLibrarySaved(el) {
  const res = await api('GET', '/api/content', null, { limit: 50 });
  const items = res.ok ? (Array.isArray(res.data) ? res.data : []) : [];

  el.innerHTML = `
    <div class="fade-in">
      <h1 class="text-xl font-bold text-heading mb-4">Library</h1>

      <!-- Tabs -->
      <div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Library view">
        <button onclick="switchLibraryTab('saved')" role="tab" aria-selected="true" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 bg-accent text-white shadow-sm">Saved</button>
        <button onclick="switchLibraryTab('collections')" role="tab" aria-selected="false" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-muted hover:text-heading">Collections</button>
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
          ${items.map(item => contentCardHtml(item, { showAiStatus: true })).join('')}
        </div>`}
    </div>`;
}

async function renderLibraryCollections(el) {
  const [colRes, catRes] = await Promise.all([
    api('GET', '/api/collections'),
    api('GET', '/api/collections/categories'),
  ]);
  const cols = colRes.ok ? (Array.isArray(colRes.data) ? colRes.data : []) : [];
  const cats = catRes.ok ? (Array.isArray(catRes.data) ? catRes.data : []) : [];

  const themeColors = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    green: 'from-green-500/20 to-green-600/5 border-green-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
    indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
  };

  el.innerHTML = `
    <div class="fade-in">
      <h1 class="text-xl font-bold text-heading mb-4">Library</h1>

      <!-- Tabs -->
      <div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Library view">
        <button onclick="switchLibraryTab('saved')" role="tab" aria-selected="false" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-muted hover:text-heading">Saved</button>
        <button onclick="switchLibraryTab('collections')" role="tab" aria-selected="true" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 bg-accent text-white shadow-sm">Collections</button>
      </div>

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
            const tc = themeColors[c.theme] || themeColors.blue;
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
          <!-- Add Collection Card -->
          <button onclick="openCreateCollectionModal()" class="border-2 border-dashed border-border rounded-2xl h-36 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all duration-200 active:scale-[0.97]" aria-label="Create new collection">
            <span class="material-icons-round text-2xl text-muted">add</span>
            <span class="text-muted text-xs font-medium">New Collection</span>
          </button>
        </div>`}
    </div>`;
}

function switchLibraryTab(tab) {
  setLibraryTab(tab);
  navigate('#library/' + tab);
}

function openSaveContentModal(prefillUrl = '') {
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Save Content</h2>
    <div class="space-y-4">
      <div>
        <label for="m-url" class="text-xs text-muted font-medium mb-1.5 block">URL</label>
        <input id="m-url" type="url" placeholder="Paste a link..." value="${esc(prefillUrl)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" autofocus />
        <p class="text-[11px] text-muted mt-1.5">Title, description, platform &amp; type are auto-detected</p>
      </div>
      <button onclick="doSaveContent()" id="save-content-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Content</button>
    </div>
  `);
}

async function doSaveContent() {
  const url = document.getElementById('m-url').value.trim();
  if (!url) { toast('URL is required', true); return; }
  const btn = document.getElementById('save-content-btn');
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('POST', '/api/content', { url });
  if (res.ok) {
    closeModal();
    toast('Content saved!');
    navigate('#content-detail/' + res.data.id);
  } else {
    toast(res.data?.detail || 'Failed to save', true);
    btn.textContent = 'Save Content';
    btn.disabled = false;
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
window.switchLibraryTab = switchLibraryTab;
window.openSaveContentModal = openSaveContentModal;
window.doSaveContent = doSaveContent;
window.openCreateCollectionModal = openCreateCollectionModal;
window.doCreateCollection = doCreateCollection;
