// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM CONFIRM DIALOG
// ═══════════════════════════════════════════════════════════════════════════
export function customConfirm(title, message, confirmText = 'Confirm', isDanger = false) {
  return new Promise(resolve => {
    const overlay = document.getElementById('confirm-overlay');
    document.getElementById('confirm-content').innerHTML = `
      <h3 class="text-lg font-bold text-heading mb-2">${title}</h3>
      <p class="text-muted text-sm mb-6">${message}</p>
      <div class="flex gap-3">
        <button id="confirm-cancel" class="flex-1 py-3 rounded-xl text-sm font-semibold bg-surface-hover text-heading hover:bg-border transition-colors active:scale-[0.97]">Cancel</button>
        <button id="confirm-ok" class="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors active:scale-[0.97] ${isDanger ? 'bg-danger hover:bg-red-600' : 'bg-accent hover:bg-accent-hover'}">${confirmText}</button>
      </div>`;
    overlay.classList.remove('hidden');
    document.getElementById('confirm-cancel').onclick = () => { overlay.classList.add('hidden'); resolve(false); };
    document.getElementById('confirm-ok').onclick = () => { overlay.classList.add('hidden'); resolve(true); };
  });
}
