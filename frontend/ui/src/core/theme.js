// ═══════════════════════════════════════════════════════════════════════════
// THEME MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
export function initTheme() {
  const saved = localStorage.getItem('zuno_theme') || 'system';
  applyTheme(saved);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('zuno_theme') || 'system') === 'system') applyTheme('system');
  });
}

export function applyTheme(mode) {
  localStorage.setItem('zuno_theme', mode);
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

export function getTheme() {
  return localStorage.getItem('zuno_theme') || 'system';
}

// Expose applyTheme globally for onclick handlers in profile page
window.applyTheme = applyTheme;
