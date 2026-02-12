// ═══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════
export function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.querySelector('.toast-msg').textContent = msg;
  const icon = el.querySelector('.toast-icon');
  icon.textContent = isError ? 'error_outline' : 'check_circle';
  icon.className = `toast-icon material-icons-round text-lg ${isError ? 'text-danger' : 'text-success'}`;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3000);
}

// Expose globally for onclick handlers
window.toast = toast;
