// ═══════════════════════════════════════════════════════════════════════════
// APP HEADER — top nav: Zuno branding, Search, Add, Profile
// Preserves id="topnav" and #header-profile-avatar for router and state.js.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates the app header element (id="topnav").
 * @returns {HTMLElement}
 */
export function createAppHeader() {
  const header = document.createElement('header');
  header.id = 'topnav';
  header.setAttribute('role', 'banner');
  header.className = 'hidden sticky top-0 z-30 bg-transparent px-5 py-3 flex items-center justify-between safe-top mt-4';

  header.innerHTML = `
    <span class="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Zuno</span>
    <div class="flex items-center gap-2">
      <button onclick="navigate('#search')" class="topnav-btn p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-white/10 transition-all" aria-label="Search">
        <i data-lucide="search" class="nav-lucide w-5 h-5"></i>
      </button>
      <button onclick="openSaveContentModal()" class="topnav-btn flex items-center gap-1.5 px-3 py-2 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all" aria-label="Add content">
        <i data-lucide="plus" class="nav-lucide w-5 h-5"></i>
        <span class="text-sm font-medium">Add</span>
      </button>
      <button onclick="navigate('#profile')" class="topnav-btn header-profile-btn w-9 h-9 rounded-md overflow-hidden flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600 transition-all shrink-0" aria-label="Profile">
        <span id="header-profile-avatar" class="hidden w-full h-full bg-cover bg-center"></span>
        <i data-lucide="circle-user" class="nav-lucide w-6 h-6 header-profile-icon"></i>
      </button>
    </div>
  `;

  return header;
}

/**
 * Renders the app header into the given container (e.g. #app-header-root).
 * Lucide icons must be initialized by the app after mount (e.g. lucide.createIcons()).
 * @param {HTMLElement} [container] - Parent to append the header to. If omitted, uses #app-header-root.
 */
export function renderAppHeader(container) {
  const target = container || document.getElementById('app-header-root');
  if (!target) return null;
  const header = createAppHeader();
  target.appendChild(header);
  return header;
}
