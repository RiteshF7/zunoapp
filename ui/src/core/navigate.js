// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
export function navigate(hash) {
  window.location.hash = hash;
}

const VALID_PAGES = new Set([
  'auth', 'connect-extension', 'home', 'library', 'content-detail', 'collection',
  'goals', 'goal-detail', 'search', 'knowledge', 'profile', 'admin',
]);

export function getRoute() {
  const h = window.location.hash || '';
  const parts = h.replace(/^#/, '').split('/');
  const page = (parts[0] || '').trim().toLowerCase();
  const id = (parts[1] || '').trim() || null;
  const validPage = page && VALID_PAGES.has(page) ? page : '';
  return { page: validPage, id };
}

// Expose navigate globally for onclick handlers in templates
window.navigate = navigate;
