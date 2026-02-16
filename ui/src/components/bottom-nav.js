// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM NAV — bottom navigation bar (Home, Ask, Goals, Feed)
// Preserves id="bottomnav" and id="nav-feed" for router and config.
// Translucent background and app theme (border, heading, muted) via base.css.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates the bottom nav element (id="bottomnav").
 * @returns {HTMLElement}
 */
export function createBottomNav() {
  const nav = document.createElement('nav');
  nav.id = 'bottomnav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');
  nav.className = 'hidden fixed bottom-0 left-0 right-0 border-t border-border px-6 py-4 z-30 safe-bottom';

  nav.innerHTML = `
    <div class="flex justify-around items-center max-w-2xl mx-auto">
      <button onclick="navigate('#home')" data-tab="home" class="nav-btn flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Home">
        <i data-lucide="home" class="nav-lucide w-6 h-6"></i>
        <span class="text-[10px] font-medium">Home</span>
      </button>
      <button onclick="navigate('#knowledge')" data-tab="knowledge" class="nav-btn flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Ask AI">
        <span class="material-icons-round text-2xl text-muted">auto_awesome</span>
        <span class="text-[10px] font-medium">Ask</span>
      </button>
      <button onclick="navigate('#goals')" data-tab="goals" class="nav-btn flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Goals">
        <i data-lucide="target" class="nav-lucide w-6 h-6"></i>
        <span class="text-[10px] font-medium">Goals</span>
      </button>
      <button id="nav-feed" onclick="navigate('#feed')" data-tab="feed" class="nav-btn hidden flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Feed">
        <i data-lucide="rss" class="nav-lucide w-6 h-6"></i>
        <span class="text-[10px] font-medium">Feed</span>
      </button>
    </div>
  `;

  return nav;
}

/**
 * Renders the bottom nav into the given container (e.g. #bottom-nav-root).
 * Lucide icons must be initialized by the app after mount (e.g. lucide.createIcons()).
 * @param {HTMLElement} [container] - Parent to append the nav to. If omitted, uses #bottom-nav-root.
 * @returns {HTMLElement|null}
 */
export function renderBottomNav(container) {
  const target = container || document.getElementById('bottom-nav-root');
  if (!target) return null;
  const nav = createBottomNav();
  target.appendChild(nav);
  return nav;
}
