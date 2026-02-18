// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL LOADING OVERLAY — used only while saving content (Add URL, Share, image upload).
// Hide as soon as save succeeds; AI processing is shown on the content card only.
// Ref-counted so multiple concurrent operations keep it visible until all finish.
// ═══════════════════════════════════════════════════════════════════════════

const SHOW_DELAY_MS = 80;   // Don't show for very fast operations
const MIN_SHOW_MS = 200;    // Keep visible at least this long to avoid flash

let _overlayEl = null;
let _visible = false;
let _count = 0;
let _showTimeout = null;
let _hideTimeout = null;
let _showTime = 0;

function ensureOverlay() {
  if (_overlayEl) return _overlayEl;
  _overlayEl = document.createElement('div');
  _overlayEl.id = 'global-loading-overlay';
  _overlayEl.setAttribute('role', 'progressbar');
  _overlayEl.setAttribute('aria-label', 'Loading');
  _overlayEl.setAttribute('aria-hidden', 'true');
  _overlayEl.className = 'global-loading-overlay hidden';
  _overlayEl.innerHTML = '<div class="global-loading-spinner"></div>';
  document.body.appendChild(_overlayEl);
  return _overlayEl;
}

function actuallyShow() {
  if (!_overlayEl || _visible) return;
  if (_hideTimeout) {
    clearTimeout(_hideTimeout);
    _hideTimeout = null;
  }
  _overlayEl.classList.remove('hidden');
  _overlayEl.setAttribute('aria-hidden', 'false');
  _visible = true;
  _showTime = Date.now();
}

function actuallyHide() {
  if (!_overlayEl) return;
  const elapsed = Date.now() - _showTime;
  const wait = Math.max(0, MIN_SHOW_MS - elapsed);
  if (wait > 0 && _visible) {
    _hideTimeout = setTimeout(() => {
      _hideTimeout = null;
      _overlayEl.classList.add('hidden');
      _overlayEl.setAttribute('aria-hidden', 'true');
      _visible = false;
    }, wait);
  } else {
    _overlayEl.classList.add('hidden');
    _overlayEl.setAttribute('aria-hidden', 'true');
    _visible = false;
  }
}

export function showProgress() {
  _count++;
  ensureOverlay();
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
