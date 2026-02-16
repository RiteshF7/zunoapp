// ═══════════════════════════════════════════════════════════════════════════
// CONTENT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { _contentDetailTab, setContentDetailTab, hasProcessingId, addProcessingId, removeProcessingId } from '../core/state.js';
import { toast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { customConfirm } from '../components/confirm.js';
import { badge, platformIcon } from '../components/ui.js';
import { esc, truncate } from '../utils/helpers.js';

export async function renderContentDetail(el, id) {
  if (!id) { navigate('#home'); return; }
  const [res, tagRes] = await Promise.all([
    api('GET', `/api/content/${id}`),
    api('GET', `/api/content/${id}/tags`),
  ]);
  if (!res.ok) { el.innerHTML = `<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Content not found</p></div>`; return; }
  const c = res.data;
  if (c.ai_processed) removeProcessingId(c.id);
  const tags = tagRes.ok && tagRes.data.content_tags ? tagRes.data.content_tags.map(t => t.tags || t) : [];
  const isProcessing = hasProcessingId(c.id);

  const tabClass = (t) => _contentDetailTab === t
    ? 'bg-primary text-primary-foreground shadow-sm'
    : 'text-muted-foreground hover:text-heading';

  el.innerHTML = `
    <div class="slide-in-right">
      <!-- Sticky Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('#home')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to library">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${esc(c.title || 'Untitled')}</h1>
        <button onclick="openContentActions('${c.id}')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="More actions">
          <span class="material-icons-round text-xl text-muted-foreground">more_vert</span>
        </button>
      </div>

      <!-- Hero Image -->
      ${c.thumbnail_url ? `<img src="${esc(c.thumbnail_url)}" alt="" class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm" onerror="this.style.display='none'" />` : ''}

      <!-- Title & URL -->
      <div class="mb-4">
        <h2 class="text-xl font-bold text-heading leading-snug">${esc(c.title || 'Untitled')}</h2>
        <a href="${esc(c.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all mt-1 inline-block">${esc(truncate(c.url, 60))}</a>
      </div>

      <!-- Badges -->
      <div class="flex items-center gap-2 flex-wrap mb-5">
        ${badge(c.platform, 'gray')}
        ${badge(c.content_type, 'purple')}
        ${badge(c.ai_category, 'emerald')}
        ${c.ai_processed
          ? '<span class="text-success text-xs flex items-center gap-0.5"><span class="material-icons-round text-sm">check_circle</span>AI Processed</span>'
          : isProcessing
            ? '<span class="text-accent/80 text-xs flex items-center gap-1.5" role="status" aria-busy="true"><span class="progress-bar-inline w-16 h-1"><span class="progress-bar-inline-inner block h-full rounded"></span></span><span class="material-icons-round text-sm">auto_awesome</span> Processing with AI</span>'
            : '<span class="text-muted-foreground text-xs">Not AI processed</span>'}
      </div>

      <!-- Content Tabs -->
      <div class="flex bg-card rounded-xl p-1 gap-1 mb-4 shadow-sm" role="tablist">
        <button onclick="switchContentTab('summary','${c.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${tabClass('summary')}">Summary</button>
        <button onclick="switchContentTab('tags','${c.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${tabClass('tags')}">Tags</button>
        <button onclick="switchContentTab('info','${c.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${tabClass('info')}">Info</button>
      </div>

      <div id="content-tab-body" class="mb-6">
        ${renderContentTabBody(c, tags)}
      </div>

      <!-- Primary Action -->
      ${!c.ai_processed && !isProcessing ? `
        <button onclick="processWithAI('${c.id}')" id="ai-btn" class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97] mb-3 shadow-sm min-h-[44px]">
          <span class="material-icons-round text-lg">auto_awesome</span> Process with AI
        </button>` : ''}

      <button onclick="openAddToCollectionModal('${c.id}')" class="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover border border-border text-heading font-semibold py-3 rounded-xl transition-colors active:scale-[0.97] shadow-sm">
        <span class="material-icons-round text-lg">folder</span> Add to Collection
      </button>
    </div>`;

  if (isProcessing) {
    if (window._contentDetailPoll) clearInterval(window._contentDetailPoll);
    const contentId = c.id;
    window._contentDetailPoll = setInterval(async () => {
      if ((window.location.hash || '').indexOf('content-detail/' + contentId) === -1) {
        if (window._contentDetailPoll) clearInterval(window._contentDetailPoll);
        window._contentDetailPoll = null;
        return;
      }
      const r = await api('GET', `/api/content/${contentId}`);
      if (r.ok && r.data.ai_processed) {
        if (window._contentDetailPoll) clearInterval(window._contentDetailPoll);
        window._contentDetailPoll = null;
        removeProcessingId(contentId);
        setContentDetailTab('summary');
        await renderContentDetail(el, contentId);
      }
    }, 4000);
  } else if (window._contentDetailPoll) {
    clearInterval(window._contentDetailPoll);
    window._contentDetailPoll = null;
  }
}

function renderContentTabBody(c, tags) {
  if (_contentDetailTab === 'summary') {
    return c.ai_summary
      ? `<div class="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Summary</h3>
          </div>
          <p class="text-body text-sm leading-relaxed">${esc(c.ai_summary)}</p>
        </div>`
      : `<div class="text-center py-8"><p class="text-muted-foreground text-sm">No AI summary available yet</p>${!c.ai_processed ? '<p class="text-muted-foreground text-xs mt-1">Process with AI to generate a summary</p>' : ''}</div>`;
  }
  if (_contentDetailTab === 'tags') {
    return tags.length > 0
      ? `<div class="flex flex-wrap gap-2">${tags.map(t => `<button onclick="navigate('#search');setTimeout(()=>{document.getElementById('search-input').value='${esc(t.name||t.slug||'')}';setSearchType('tag');doSearch()},100)" class="px-3 py-1.5 rounded-xl bg-surface border border-border text-sm text-body hover:border-accent hover:text-accent transition-colors">${esc(t.name || t.slug || '')}</button>`).join('')}</div>`
      : '<div class="text-center py-8"><p class="text-muted-foreground text-sm">No tags yet</p></div>';
  }
  // info tab
  return `
    <div class="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
      ${c.description ? `<div><label class="text-xs text-muted-foreground font-medium block mb-1">Description</label><p class="text-body text-sm">${esc(c.description)}</p></div>` : ''}
      <div><label class="text-xs text-muted-foreground font-medium block mb-1">URL</label><a href="${esc(c.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all">${esc(c.url)}</a></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-muted-foreground font-medium block mb-1">Platform</label><p class="text-body text-sm flex items-center gap-1"><span class="material-icons-round text-base">${platformIcon(c.platform)}</span>${esc(c.platform || 'Unknown')}</p></div>
        <div><label class="text-xs text-muted-foreground font-medium block mb-1">Type</label><p class="text-body text-sm">${esc(c.content_type || 'Unknown')}</p></div>
      </div>
      <div><label class="text-xs text-muted-foreground font-medium block mb-1">Status</label><p class="text-sm ${c.ai_processed ? 'text-success' : 'text-muted-foreground'}">${c.ai_processed ? 'AI Processed' : 'Not processed'}</p></div>
    </div>`;
}

function switchContentTab(tab, contentId) {
  setContentDetailTab(tab);
  renderContentDetail(document.getElementById('page'), contentId);
}

function openContentActions(contentId) {
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Actions</h2>
    <div class="space-y-2">
      <button onclick="closeModal();openEditContentModal('${contentId}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted-foreground">edit</span>
        <span class="text-heading text-sm font-medium">Edit Content</span>
      </button>
      <button onclick="closeModal();openAddToCollectionModal('${contentId}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted-foreground">folder</span>
        <span class="text-heading text-sm font-medium">Add to Collection</span>
      </button>
      <button onclick="closeModal();deleteContent('${contentId}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-danger/10 transition-colors text-left">
        <span class="material-icons-round text-xl text-danger">delete</span>
        <span class="text-danger text-sm font-medium">Delete</span>
      </button>
    </div>
  `);
}

async function processWithAI(contentId) {
  addProcessingId(contentId);
  await renderContentDetail(document.getElementById('page'), contentId);
  if (typeof showProgress === 'function') showProgress();
  try {
    const res = await api('POST', '/api/ai/process-content', { content_id: contentId });
    if (res.ok) {
      if (res.status === 202) {
        toast('AI processing started — refresh the list in a moment');
      } else {
        removeProcessingId(contentId);
        toast('AI processing complete!');
        setContentDetailTab('summary');
        await renderContentDetail(document.getElementById('page'), contentId);
      }
    } else {
      removeProcessingId(contentId);
      toast(res.data?.detail || 'AI processing failed', true);
      await renderContentDetail(document.getElementById('page'), contentId);
    }
  } catch (_) {
    removeProcessingId(contentId);
    toast('AI processing failed', true);
    await renderContentDetail(document.getElementById('page'), contentId);
  } finally {
    if (typeof hideProgress === 'function') hideProgress();
  }
}

async function openAddToCollectionModal(contentId) {
  const res = await api('GET', '/api/collections');
  const cols = res.ok ? (Array.isArray(res.data) ? res.data : []) : [];
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Add to Collection</h2>
    ${cols.length === 0 ? '<p class="text-muted-foreground text-sm">No collections yet. Create one first.</p>' : `
      <div class="space-y-2">
        ${cols.map(c => `
          <button onclick="addToCollection('${c.id}','${contentId}')" class="w-full text-left bg-bg hover:bg-surface-hover border border-border rounded-xl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <span class="material-icons-round text-xl text-accent">${esc(c.icon || 'folder')}</span>
              <div><p class="text-heading text-sm font-medium">${esc(c.title)}</p><p class="text-muted-foreground text-xs">${c.item_count} items</p></div>
            </div>
          </button>`).join('')}
      </div>`}
  `);
}

async function addToCollection(collectionId, contentId) {
  const res = await api('POST', `/api/collections/${collectionId}/items`, { content_id: contentId });
  if (res.ok) { closeModal(); toast('Added to collection!'); }
  else toast(res.data?.detail || 'Failed to add', true);
}

async function openEditContentModal(contentId) {
  const res = await api('GET', `/api/content/${contentId}`);
  if (!res.ok) return;
  const c = res.data;
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Content</h2>
    <div class="space-y-4">
      <div>
        <label for="e-title" class="text-xs text-muted-foreground font-medium mb-1.5 block">Title</label>
        <input id="e-title" value="${esc(c.title || '')}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="e-desc" class="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
        <textarea id="e-desc" rows="3" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${esc(c.description || '')}</textarea>
      </div>
      <div>
        <label for="e-url" class="text-xs text-muted-foreground font-medium mb-1.5 block">URL</label>
        <input id="e-url" value="${esc(c.url || '')}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <button onclick="doEditContent('${contentId}')" id="edit-btn" class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `);
}

async function doEditContent(contentId) {
  const btn = document.getElementById('edit-btn');
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>';
  btn.disabled = true;
  const body = {
    title: document.getElementById('e-title').value.trim() || null,
    description: document.getElementById('e-desc').value.trim() || null,
    url: document.getElementById('e-url').value.trim() || null,
  };
  const res = await api('PATCH', `/api/content/${contentId}`, body);
  if (res.ok) {
    closeModal();
    toast('Content updated!');
    await renderContentDetail(document.getElementById('page'), contentId);
  } else {
    toast(res.data?.detail || 'Failed to update', true);
    btn.textContent = 'Save Changes';
    btn.disabled = false;
  }
}

async function deleteContent(contentId) {
  const ok = await customConfirm('Delete Content', 'This action cannot be undone. Are you sure?', 'Delete', true);
  if (!ok) return;
  const res = await api('DELETE', `/api/content/${contentId}`);
  if (res.ok) { toast('Deleted!'); navigate('#home'); }
  else toast(res.data?.detail || 'Failed to delete', true);
}

// Expose globally for onclick handlers
window.switchContentTab = switchContentTab;
window.openContentActions = openContentActions;
window.processWithAI = processWithAI;
window.openAddToCollectionModal = openAddToCollectionModal;
window.addToCollection = addToCollection;
window.openEditContentModal = openEditContentModal;
window.doEditContent = doEditContent;
window.deleteContent = deleteContent;
