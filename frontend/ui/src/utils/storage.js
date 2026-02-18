// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════
export function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem('zuno_searches') || '[]'); } catch { return []; }
}

export function addRecentSearch(q) {
  const s = getRecentSearches().filter(x => x !== q);
  s.unshift(q);
  localStorage.setItem('zuno_searches', JSON.stringify(s.slice(0, 5)));
}
