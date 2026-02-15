// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { toast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { customConfirm } from '../components/confirm.js';
import { esc } from '../utils/helpers.js';

export async function renderCollectionDetail(el, id) {
  if (!id) { navigate('#collections'); return; }
  const [colRes, itemsRes] = await Promise.all([
    api('GET', `/api/collections/${id}`),
    api('GET', `/api/collections/${id}/items`),
  ]);
  if (!colRes.ok) { el.innerHTML = '<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Collection not found</p></div>'; return; }
  const c = colRes.data;
  const items = itemsRes.ok ? (Array.isArray(itemsRes.data) ? itemsRes.data : []) : [];

  el.innerHTML = `
    <div class="slide-in-right">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-5">
        <button onclick="navigate('#collections')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="Back to collections">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons-round text-2xl text-accent">${esc(c.icon || 'folder')}</span>
            <h1 class="text-lg font-bold text-heading truncate">${esc(c.title)}</h1>
          </div>
          <p class="text-muted-foreground text-xs mt-0.5">${c.item_count} items ${c.is_shared ? '&middot; Shared' : ''}</p>
        </div>
        <div class="flex gap-1">
          <button onclick="openEditCollectionModal('${c.id}')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="Edit collection">
            <span class="material-icons-round text-lg text-muted-foreground">edit</span>
          </button>
          <button onclick="deleteCollection('${c.id}')" class="p-2 rounded-xl hover:bg-danger/10 transition-colors" aria-label="Delete collection">
            <span class="material-icons-round text-lg text-danger">delete</span>
          </button>
        </div>
      </div>

      ${c.description ? `<p class="text-muted-foreground text-sm mb-4">${esc(c.description)}</p>` : ''}

      <button onclick="openAddContentToCollectionModal('${c.id}')" class="w-full flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border text-heading text-sm font-medium py-3 rounded-xl transition-colors mb-4 shadow-sm active:scale-[0.97]">
        <span class="material-icons-round text-base">add</span> Add Content
      </button>

      ${items.length === 0 ? '<div class="text-center py-12"><p class="text-muted-foreground text-sm">No items in this collection</p></div>' : `
        <div class="space-y-2">
          ${items.map(item => {
            const ci = item.content || item;
            return `
            <div class="bg-card rounded-xl p-3.5 flex items-center gap-3 hover:bg-card-hover transition-colors shadow-sm">
              <div class="flex-1 min-w-0 cursor-pointer" onclick="navigate('#content-detail/${ci.id || item.content_id}')">
                <p class="text-heading text-sm font-medium truncate">${esc(ci.title || ci.url || 'Untitled')}</p>
                <p class="text-muted-foreground text-xs truncate">${esc(ci.url || '')}</p>
              </div>
              <button onclick="removeFromCollection('${c.id}','${ci.id || item.content_id}')" class="p-1.5 rounded-lg hover:bg-danger/10 transition-colors" aria-label="Remove from collection">
                <span class="material-icons-round text-base text-danger">close</span>
              </button>
            </div>`;
          }).join('')}
        </div>`}
    </div>`;
}

async function openAddContentToCollectionModal(collectionId) {
  const res = await api('GET', '/api/content', null, { limit: 50 });
  const items = res.ok ? (Array.isArray(res.data) ? res.data : []) : [];
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Add Content</h2>
    ${items.length === 0 ? '<p class="text-muted-foreground text-sm">No content to add. Save some content first.</p>' : `
      <div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
        ${items.map(c => `
          <button onclick="addToCollection('${collectionId}','${c.id}')" class="w-full text-left bg-bg hover:bg-card-hover border border-border rounded-xl px-4 py-3 transition-colors">
            <p class="text-heading text-sm font-medium truncate">${esc(c.title || c.url)}</p>
            <p class="text-muted-foreground text-xs truncate">${esc(c.url)}</p>
          </button>`).join('')}
      </div>`}
  `);
}

async function removeFromCollection(collectionId, contentId) {
  const res = await api('DELETE', `/api/collections/${collectionId}/items/${contentId}`);
  if (res.ok) {
    toast('Removed from collection');
    await renderCollectionDetail(document.getElementById('page'), collectionId);
  } else toast(res.data?.detail || 'Failed to remove', true);
}

async function openEditCollectionModal(collectionId) {
  const res = await api('GET', `/api/collections/${collectionId}`);
  if (!res.ok) return;
  const c = res.data;
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Collection</h2>
    <div class="space-y-4">
      <div>
        <label for="ec-title" class="text-xs text-muted-foreground font-medium mb-1.5 block">Title</label>
        <input id="ec-title" value="${esc(c.title)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="ec-desc" class="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
        <textarea id="ec-desc" rows="2" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${esc(c.description || '')}</textarea>
      </div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input id="ec-shared" type="checkbox" ${c.is_shared ? 'checked' : ''} class="w-5 h-5 rounded-lg border-border text-accent focus:ring-accent" />
        <span class="text-sm text-heading font-medium">Share collection</span>
      </label>
      <button onclick="doEditCollection('${collectionId}')" id="edit-col-btn" class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `);
}

async function doEditCollection(collectionId) {
  const btn = document.getElementById('edit-col-btn');
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>';
  btn.disabled = true;
  const body = {
    title: document.getElementById('ec-title').value.trim() || null,
    description: document.getElementById('ec-desc').value.trim() || null,
    is_shared: document.getElementById('ec-shared').checked,
  };
  const res = await api('PATCH', `/api/collections/${collectionId}`, body);
  if (res.ok) {
    closeModal();
    toast('Collection updated!');
    await renderCollectionDetail(document.getElementById('page'), collectionId);
  } else {
    toast(res.data?.detail || 'Failed to update', true);
    btn.textContent = 'Save Changes';
    btn.disabled = false;
  }
}

async function deleteCollection(id) {
  const ok = await customConfirm('Delete Collection', 'This will remove the collection but not its content. Continue?', 'Delete', true);
  if (!ok) return;
  const res = await api('DELETE', `/api/collections/${id}`);
  if (res.ok) { toast('Deleted!'); navigate('#collections'); }
  else toast(res.data?.detail || 'Failed to delete', true);
}

// Expose globally for onclick handlers
window.openAddContentToCollectionModal = openAddContentToCollectionModal;
window.removeFromCollection = removeFromCollection;
window.openEditCollectionModal = openEditCollectionModal;
window.doEditCollection = doEditCollection;
window.deleteCollection = deleteCollection;
