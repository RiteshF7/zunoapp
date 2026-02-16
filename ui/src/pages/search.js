// ═══════════════════════════════════════════════════════════════════════════
// SEARCH PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { _searchType, setSearchType as setSearchTypeState } from '../core/state.js';
import { contentCardHtml } from '../components/ui.js';
import { skeletonCards } from '../components/skeleton.js';
import { esc } from '../utils/helpers.js';
import { getRecentSearches, addRecentSearch } from '../utils/storage.js';

export async function renderSearch(el) {
  const tagsRes = await api('GET', '/api/tags/popular');
  const tags = tagsRes.ok ? (Array.isArray(tagsRes.data) ? tagsRes.data : []) : [];
  const recent = getRecentSearches();

  el.innerHTML = `
    <div class="fade-in">
      <!-- Search Input -->
      <div class="flex gap-2 mb-3">
        <div class="flex-1 relative">
          <input id="search-input" type="text" placeholder="Search your content..." class="w-full bg-card border border-border rounded-md pl-11 pr-10 py-3.5 text-sm text-heading placeholder-muted-foreground/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 shadow-sm" onkeydown="if(event.key==='Enter')doSearch()" autofocus aria-label="Search input" />
          <span class="material-icons-round text-xl text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2">search</span>
          <button onclick="document.getElementById('search-input').value='';document.getElementById('search-results').innerHTML=''" class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-card-hover transition-colors" aria-label="Clear search">
            <span class="material-icons-round text-lg text-muted-foreground">close</span>
          </button>
        </div>
      </div>

      <!-- Search Type Tabs -->
      <div class="flex gap-2 mb-5" role="tablist" aria-label="Search type">
        <button onclick="setSearchType('fts')" id="st-fts" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${_searchType === 'fts' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground border border-border shadow-sm hover:shadow-md'}">Keywords</button>
        <button onclick="setSearchType('hybrid')" id="st-hybrid" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${_searchType === 'hybrid' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground border border-border shadow-sm hover:shadow-md'}">Smart</button>
        <button onclick="setSearchType('tag')" id="st-tag" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${_searchType === 'tag' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground border border-border shadow-sm hover:shadow-md'}">By topic</button>
      </div>

      ${recent.length > 0 ? `
        <section class="mb-5" aria-label="Recent searches">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent</h3>
          <div class="flex flex-wrap gap-1.5">
            ${recent.map(s => `<button onclick="document.getElementById('search-input').value='${esc(s)}';doSearch()" class="px-3 py-1.5 rounded-md bg-card border border-border text-xs text-body hover:border-accent transition-colors flex items-center gap-1"><span class="material-icons-round text-xs text-muted-foreground">history</span>${esc(s)}</button>`).join('')}
          </div>
        </section>` : ''}

      ${tags.length > 0 ? `
        <section class="mb-5" aria-label="Popular tags">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Popular topics</h3>
          <div class="flex flex-wrap gap-1.5">
            ${tags.map(t => `<button onclick="searchByTag('${esc(t.slug)}')" class="px-3 py-1.5 rounded-md bg-card border border-border text-xs text-body hover:border-accent transition-colors">${esc(t.name)} <span class="text-muted-foreground">${t.count || t.usage_count || ''}</span></button>`).join('')}
          </div>
        </section>` : ''}

      <div id="search-results" aria-live="polite"></div>
    </div>`;
}

function setSearchType(type) {
  setSearchTypeState(type);
  document.querySelectorAll('.search-type').forEach(b => {
    const active = b.id === 'st-' + type;
    b.className = `search-type px-4 py-2 rounded-md text-xs font-semibold border border-border transition-all duration-200 ${active ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground shadow-sm hover:shadow-md'}`;
  });
}

async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  addRecentSearch(q);

  const resultsEl = document.getElementById('search-results');
  resultsEl.innerHTML = skeletonCards(2);

  let res;
  if (_searchType === 'hybrid') res = await api('GET', '/api/search/hybrid', null, { q, limit: 20 });
  else if (_searchType === 'tag') res = await api('GET', `/api/search/tag/${encodeURIComponent(q)}`, null, { limit: 20 });
  else res = await api('GET', '/api/search', null, { q, limit: 20 });

  const items = res.ok ? (Array.isArray(res.data) ? res.data : []) : [];
  if (!res.ok) {
    resultsEl.innerHTML = `<div class="bg-danger/10 rounded-md p-4 text-center"><p class="text-danger text-sm">${esc(res.data?.detail || 'Search failed')}</p></div>`;
    return;
  }

  resultsEl.innerHTML = items.length === 0
    ? '<div class="text-center py-12"><span class="material-icons-round text-4xl text-muted-foreground/60 mb-2">search_off</span><p class="text-muted-foreground text-sm">No results found</p></div>'
    : `<p class="text-muted-foreground text-xs mb-3">${items.length} result${items.length !== 1 ? 's' : ''}</p>
       <div class="space-y-3">${items.map(i => contentCardHtml(i, { roundedMinimal: true })).join('')}</div>`;
}

function searchByTag(slug) {
  setSearchType('tag');
  document.getElementById('search-input').value = slug;
  doSearch();
}

// Expose globally for onclick handlers
window.setSearchType = setSearchType;
window.doSearch = doSearch;
window.searchByTag = searchByTag;
