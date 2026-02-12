// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
export function navigate(hash) {
  window.location.hash = hash;
}

export function getRoute() {
  const h = window.location.hash || '#auth';
  const parts = h.replace('#', '').split('/');
  return { page: parts[0], id: parts[1] || null };
}

// Expose navigate globally for onclick handlers in templates
window.navigate = navigate;
