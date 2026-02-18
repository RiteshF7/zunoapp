// ═══════════════════════════════════════════════════════════════════════════
// HOME DASHBOARD (Collections strip + Library strip)
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { contentCardHtml } from '../components/ui.js';
import { getProcessingIds, getUserProfile } from '../core/state.js';
import { esc, getGreeting } from '../utils/helpers.js';
import { showApiError } from '../utils/api-error.js';

const COLLECTION_LIMIT = 15;
const LIBRARY_LIMIT = 15;

const _collectionThemeColors = {
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  green: 'from-green-500/20 to-green-600/5 border-green-500/20',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
  indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
};

function collectionCardSmallHtml(c) {
  const tc = _collectionThemeColors[c.theme] || _collectionThemeColors.blue;
  return `
    <article onclick="navigate('#collection/${c.id}')" class="bg-gradient-to-br ${tc} border rounded-md p-3 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-24 w-[140px] flex-shrink-0 flex flex-col justify-between">
      <span class="material-icons-round text-lg text-heading/80">${esc(c.icon || 'folder')}</span>
      <div class="min-w-0">
        <h3 class="text-heading font-semibold text-xs leading-snug line-clamp-1">${esc(c.title)}</h3>
        <p class="text-muted text-[10px] mt-0.5">${c.item_count} item${c.item_count !== 1 ? 's' : ''}</p>
      </div>
    </article>`;
}

/**
 * Renders the Home dashboard: horizontal collections strip + vertical library strip, each with "View all".
 * @param {HTMLElement} el - Container element
 */
export async function renderHomeDashboard(el) {
  const [profile, colRes, contentRes] = await Promise.all([
    getUserProfile(),
    api('GET', '/api/collections'),
    api('GET', '/api/content', null, { limit: LIBRARY_LIMIT }),
  ]);
  if (!colRes.ok) showApiError(colRes);
  if (!contentRes.ok) showApiError(contentRes);

  const name = profile?.display_name || 'there';
  const cols = colRes.ok ? (Array.isArray(colRes.data) ? colRes.data : []) : [];
  const collections = cols.slice(0, COLLECTION_LIMIT);
  const raw = contentRes.ok ? contentRes.data : null;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  const savedItems = items.slice(0, LIBRARY_LIMIT);

  const welcomeSection = `
    <section class="mb-4" aria-label="Welcome">
      <h1 class="text-xl font-bold text-heading">Hi, ${esc(name)}!</h1>
      <p class="text-muted-foreground text-sm mt-0.5">${getGreeting()}</p>
    </section>`;

  const searchBar = `
    <section class="mb-4" aria-label="Search">
      <button type="button" onclick="navigate('#search')" class="w-full flex items-center gap-3 px-4 py-3 rounded-sm bg-surface border border-border text-left hover:bg-surface-hover transition-colors active:scale-[0.99]" aria-label="Search content">
        <span class="material-icons-round text-xl text-muted-foreground shrink-0">search</span>
        <span class="text-muted-foreground text-sm">Search</span>
      </button>
    </section>`;

  const collectionsSection =
    collections.length === 0
      ? `
    <div class="flex items-center justify-center gap-3 py-4 px-4 rounded-md bg-surface border border-border">
      <span class="material-icons-round text-2xl text-muted-foreground">folder_open</span>
      <p class="text-muted-foreground text-sm">No collections yet</p>
      <a href="#collections" onclick="navigate('#collections');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>
    </div>`
      : `
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style="scrollbar-width:thin;">
      ${collections.map(collectionCardSmallHtml).join('')}
      <a href="#collections" onclick="navigate('#collections');return false" class="flex-shrink-0 w-[100px] h-24 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-accent hover:bg-accent/5 transition-all text-muted text-xs font-medium" aria-label="View all collections">
        View all
      </a>
    </div>`;

  const librarySection =
    savedItems.length === 0
      ? `
    <div class="flex items-center justify-center gap-3 py-6 px-4 rounded-md bg-surface border border-border">
      <span class="material-icons-round text-2xl text-muted-foreground">bookmark_border</span>
      <p class="text-muted-foreground text-sm">No content yet</p>
      <a href="#home/saved" onclick="navigate('#home/saved');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>
    </div>`
      : `
    <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1" id="home-library-list">
      ${savedItems.map((item) => contentCardHtml(item, { showAiStatus: true, processingIds: getProcessingIds(), roundedMinimal: true })).join('')}
      <a href="#home/saved" onclick="navigate('#home/saved');return false" class="block text-center py-3 text-accent text-sm font-semibold hover:underline rounded-md border border-dashed border-border hover:border-accent">View all</a>
    </div>`;

  const shareBanner = `
    <section class="mb-5" aria-label="Share Zuno">
      <div class="flex items-center justify-between gap-4 p-4 rounded-sm bg-surface border border-border shadow-sm">
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-icons-round text-2xl text-heading shrink-0" aria-hidden="true">auto_awesome</span>
          <p class="text-heading font-semibold text-sm">Share your Zuno</p>
        </div>
        <button type="button" onclick="openSaveContentModal()" class="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-sm bg-white dark:bg-neutral-800 text-heading border border-border hover:bg-surface-hover text-sm font-semibold shadow-sm transition-colors active:scale-[0.97]" aria-label="Add content">
          <span class="material-icons-round text-lg">add</span>
          <span>Add</span>
        </button>
      </div>
    </section>`;

  el.innerHTML = `
    <div class="fade-in pb-6">
      ${welcomeSection}
      ${searchBar}
      ${shareBanner}
      <section class="mb-6" aria-label="Collections">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-heading">Collections</h2>
          ${collections.length > 0 ? `<a href="#collections" onclick="navigate('#collections');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>` : ''}
        </div>
        ${collectionsSection}
      </section>

      <section aria-label="Library">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-heading">Library</h2>
          ${savedItems.length > 0 ? `<a href="#home/saved" onclick="navigate('#home/saved');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>` : ''}
        </div>
        ${librarySection}
      </section>
    </div>`;
}
