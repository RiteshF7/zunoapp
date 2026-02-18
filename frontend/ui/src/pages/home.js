// ═══════════════════════════════════════════════════════════════════════════
// HOME (FEED) PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { getUserProfile, getProcessingIds } from '../core/state.js';
import { router } from '../core/router.js';
import { contentCardHtml } from '../components/ui.js';
import { esc, getGreeting, formatDate } from '../utils/helpers.js';
import { showApiError } from '../utils/api-error.js';

/**
 * Renders the home (feed) page. Fetches profile, user preferences, feed items, and bookmarks.
 * res.data for feed: array of items or { items: Array }. res.data for bookmarks: array of feed_item_ids.
 * @param {HTMLElement} el - Container element
 */
export async function renderHome(el) {
  const profile = await getUserProfile();
  const prefRes = await api('GET', '/api/user-preferences');
  if (!prefRes.ok) showApiError(prefRes);
  const feedType = prefRes.ok ? prefRes.data.feed_type : 'usersaved';

  const endpoint = feedType === 'suggestedcontent' ? '/api/suggested-feed' : '/api/feed';
  const [feedRes, bookmarkRes] = await Promise.all([
    api('GET', endpoint, null, { limit: 30 }),
    api('GET', '/api/feed/bookmarks'),
  ]);
  if (!feedRes.ok) showApiError(feedRes);
  if (!bookmarkRes.ok) showApiError(bookmarkRes);

  const items = feedRes.ok ? (Array.isArray(feedRes.data) ? feedRes.data : feedRes.data.items || []) : [];
  const bookmarks = bookmarkRes.ok ? (Array.isArray(bookmarkRes.data) ? bookmarkRes.data : []) : [];
  const bookmarkSet = new Set(bookmarks);
  const name = profile.display_name || 'there';

  el.innerHTML = `
    <div class="fade-in">
      <!-- Greeting -->
      <section class="mb-6" aria-label="Greeting">
        <h1 class="text-2xl font-bold text-heading">${getGreeting()}, ${esc(name)}</h1>
        <p class="text-muted-foreground text-sm mt-0.5">${formatDate()}</p>
      </section>

      <!-- Feed Toggle -->
      <div class="flex bg-muted/30 rounded-2xl p-1 gap-2 mb-5" role="tablist" aria-label="Feed type">
        <button onclick="switchFeedType('usersaved')" role="tab" aria-selected="${feedType === 'usersaved'}" class="flex-1 py-2.5 text-sm font-medium rounded-full border border-border shadow-sm hover:shadow-md transition-all duration-200 ${feedType === 'usersaved' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground'}">My Feed</button>
        <button onclick="switchFeedType('suggestedcontent')" role="tab" aria-selected="${feedType === 'suggestedcontent'}" class="flex-1 py-2.5 text-sm font-medium rounded-full border border-border shadow-sm hover:shadow-md transition-all duration-200 ${feedType === 'suggestedcontent' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground'}">Suggested</button>
      </div>

      <!-- Feed Items -->
      ${items.length === 0 ? `
        <div class="rounded-2xl p-6 min-h-[180px] bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800/40 dark:to-neutral-800/20 border border-border shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div class="absolute inset-0 opacity-20 pointer-events-none"><svg viewBox="0 0 200 200" class="w-full h-full"><defs><filter id="blur-f"><feGaussianBlur in="SourceGraphic" stdDeviation="40"/></filter></defs><circle cx="60" cy="60" r="80" fill="currentColor" filter="url(#blur-f)"/></svg></div>
          <div class="relative z-10"><span class="material-icons-round text-4xl text-heading opacity-80">dynamic_feed</span></div>
          <p class="relative z-10 text-heading font-semibold mb-1 mt-2">Your feed is empty</p>
          <p class="relative z-10 text-muted-foreground text-sm mb-4">Save some content to start building your feed</p>
          <button onclick="navigate('#home')" class="relative z-10 px-4 py-2 bg-card rounded-full text-sm font-medium shadow-sm hover:shadow-md border border-border">Go to Home</button>
        </div>` : `
        <div class="space-y-3" id="feed-list" role="feed" aria-label="Feed items">
          ${items.map(item => contentCardHtml(item, { showBookmark: true, isBookmarked: bookmarkSet.has(item.id), showAiStatus: true, processingIds: getProcessingIds() })).join('')}
        </div>`}
    </div>`;
}

async function switchFeedType(type) {
  await api('PATCH', '/api/user-preferences', { feed_type: type });
  await router();
}

async function toggleBookmark(feedItemId, btn) {
  const res = await api('POST', `/api/feed/bookmarks/${feedItemId}/toggle`);
  if (res.ok) {
    const icon = btn.querySelector('span');
    const isNow = res.data?.bookmarked ?? !icon.textContent.includes('border');
    icon.textContent = isNow ? 'bookmark' : 'bookmark_border';
    icon.classList.toggle('text-accent', isNow);
    icon.classList.toggle('text-muted-foreground', !isNow);
    if (isNow) icon.classList.add('bookmark-pop');
    else icon.classList.remove('bookmark-pop');
  }
}

// Expose globally for onclick handlers
window.switchFeedType = switchFeedType;
window.toggleBookmark = toggleBookmark;
