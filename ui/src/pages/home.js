// ═══════════════════════════════════════════════════════════════════════════
// HOME (FEED) PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { getUserProfile } from '../core/state.js';
import { router } from '../core/router.js';
import { contentCardHtml } from '../components/ui.js';
import { esc, getGreeting, formatDate } from '../utils/helpers.js';

export async function renderHome(el) {
  const profile = await getUserProfile();
  const prefRes = await api('GET', '/api/user-preferences');
  const feedType = prefRes.ok ? prefRes.data.feed_type : 'usersaved';

  const endpoint = feedType === 'suggestedcontent' ? '/api/suggested-feed' : '/api/feed';
  const [feedRes, bookmarkRes] = await Promise.all([
    api('GET', endpoint, null, { limit: 30 }),
    api('GET', '/api/bookmarks'),
  ]);

  const items = feedRes.ok ? (Array.isArray(feedRes.data) ? feedRes.data : feedRes.data.items || []) : [];
  const bookmarks = bookmarkRes.ok ? (Array.isArray(bookmarkRes.data) ? bookmarkRes.data : []) : [];
  const bookmarkSet = new Set(bookmarks);
  const name = profile.display_name || 'there';

  el.innerHTML = `
    <div class="fade-in">
      <!-- Greeting -->
      <section class="mb-6" aria-label="Greeting">
        <h1 class="text-2xl font-bold text-heading">${getGreeting()}, ${esc(name)}</h1>
        <p class="text-muted text-sm mt-0.5">${formatDate()}</p>
      </section>

      <!-- Feed Toggle -->
      <div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Feed type">
        <button onclick="switchFeedType('usersaved')" role="tab" aria-selected="${feedType === 'usersaved'}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${feedType === 'usersaved' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-heading'}">My Feed</button>
        <button onclick="switchFeedType('suggestedcontent')" role="tab" aria-selected="${feedType === 'suggestedcontent'}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${feedType === 'suggestedcontent' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-heading'}">Suggested</button>
      </div>

      <!-- Feed Items -->
      ${items.length === 0 ? `
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">dynamic_feed</span>
          </div>
          <p class="text-heading font-semibold mb-1">Your feed is empty</p>
          <p class="text-muted text-sm mb-4">Save some content to start building your feed</p>
          <button onclick="navigate('#library')" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Go to Library</button>
        </div>` : `
        <div class="space-y-3" id="feed-list" role="feed" aria-label="Feed items">
          ${items.map(item => contentCardHtml(item, { showBookmark: true, isBookmarked: bookmarkSet.has(item.id) })).join('')}
        </div>`}
    </div>`;
}

async function switchFeedType(type) {
  await api('PATCH', '/api/user-preferences', { feed_type: type });
  await router();
}

async function toggleBookmark(feedItemId, btn) {
  const res = await api('POST', `/api/bookmarks/${feedItemId}/toggle`);
  if (res.ok) {
    const icon = btn.querySelector('span');
    const isNow = res.data?.bookmarked ?? !icon.textContent.includes('border');
    icon.textContent = isNow ? 'bookmark' : 'bookmark_border';
    icon.classList.toggle('text-accent', isNow);
    icon.classList.toggle('text-muted', !isNow);
    if (isNow) icon.classList.add('bookmark-pop');
    else icon.classList.remove('bookmark-pop');
  }
}

// Expose globally for onclick handlers
window.switchFeedType = switchFeedType;
window.toggleBookmark = toggleBookmark;
