// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL PROGRESS BAR — universal loading indicator
// Shown during navigation, API calls, save, AI processing, etc.
// Ref-counted so multiple concurrent operations keep the bar visible until all finish.
// ═══════════════════════════════════════════════════════════════════════════

const SHOW_DELAY_MS = 80;   // Don't show bar for very fast operations
const MIN_SHOW_MS = 200;    // Keep bar visible at least this long to avoid flash

let _barEl = null;
let _visible = false;
let _count = 0;
let _showTimeout = null;
let _hideTimeout = null;
let _showTime = 0;

function ensureBar() {
  if (_barEl) return _barEl;
  _barEl = document.createElement('div');
  _barEl.id = 'global-loading-bar';
  _barEl.setAttribute('role', 'progressbar');
  _barEl.setAttribute('aria-label', 'Loading');
  _barEl.setAttribute('aria-hidden', 'true');
  _barEl.className = 'global-loading-bar hidden';
  _barEl.innerHTML = '<div class="global-loading-bar-inner"></div>';
  document.body.appendChild(_barEl);
  return _barEl;
}

function actuallyShow() {
  if (!_barEl || _visible) return;
  if (_hideTimeout) {
    clearTimeout(_hideTimeout);
    _hideTimeout = null;
  }
  _barEl.classList.remove('hidden');
  _barEl.setAttribute('aria-hidden', 'false');
  _visible = true;
  _showTime = Date.now();
}

function actuallyHide() {
  if (!_barEl) return;
  const elapsed = Date.now() - _showTime;
  const wait = Math.max(0, MIN_SHOW_MS - elapsed);
  if (wait > 0 && _visible) {
    _hideTimeout = setTimeout(() => {
      _hideTimeout = null;
      _barEl.classList.add('hidden');
      _barEl.setAttribute('aria-hidden', 'true');
      _visible = false;
    }, wait);
  } else {
    _barEl.classList.add('hidden');
    _barEl.setAttribute('aria-hidden', 'true');
    _visible = false;
  }
}

export function showProgress() {
  _count++;
  ensureBar();
  if (_count === 1) {
    if (_hideTimeout) {
      clearTimeout(_hideTimeout);
      _hideTimeout = null;
    }
    _showTimeout = setTimeout(() => {
      _showTimeout = null;
      if (_count > 0) actuallyShow();
    }, SHOW_DELAY_MS);
  }
}

export function hideProgress() {
  if (_count > 0) _count--;
  if (_count === 0) {
    if (_showTimeout) {
      clearTimeout(_showTimeout);
      _showTimeout = null;
    }
    if (_visible) actuallyHide();
  }
}

export function isVisible() {
  return _visible;
}

// Expose for onclick handlers and other modules
window.showProgress = showProgress;
window.hideProgress = hideProgress;
