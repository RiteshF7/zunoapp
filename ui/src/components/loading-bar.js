// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL LOADING BAR (save / AI analyzing)
// Thin fixed top bar; show during POST content and process-content.
// ═══════════════════════════════════════════════════════════════════════════

let _barEl = null;
let _visible = false;

function ensureBar() {
  if (_barEl) return _barEl;
  _barEl = document.createElement('div');
  _barEl.id = 'global-loading-bar';
  _barEl.setAttribute('aria-hidden', 'true');
  _barEl.className = 'global-loading-bar hidden';
  _barEl.innerHTML = '<div class="global-loading-bar-inner"></div>';
  document.body.appendChild(_barEl);
  return _barEl;
}

export function showProgress() {
  const bar = ensureBar();
  bar.classList.remove('hidden');
  _visible = true;
}

export function hideProgress() {
  if (!_barEl) return;
  _barEl.classList.add('hidden');
  _visible = false;
}

export function isVisible() {
  return _visible;
}

// Expose for onclick handlers and other modules
window.showProgress = showProgress;
window.hideProgress = hideProgress;
