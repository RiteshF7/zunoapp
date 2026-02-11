// ═══════════════════════════════════════════════════════════════════════════
// GENERAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════
export function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function truncate(s, n = 100) {
  return s && s.length > n ? s.slice(0, n) + '...' : (s || '');
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
