// ═══════════════════════════════════════════════════════════════════════════
// SKELETON / LOADING HELPERS
// ═══════════════════════════════════════════════════════════════════════════
export function skeletonCards(count = 3) {
  return Array(count).fill(0).map(() => `
    <div class="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div class="flex gap-3">
        <div class="w-20 h-20 rounded-xl skeleton-line flex-shrink-0"></div>
        <div class="flex-1 space-y-2.5 py-1">
          <div class="h-4 skeleton-line w-3/4"></div>
          <div class="h-3 skeleton-line w-full"></div>
          <div class="h-3 skeleton-line w-1/3"></div>
        </div>
      </div>
    </div>`).join('');
}

export function skeletonGrid(count = 4) {
  return `<div class="grid grid-cols-2 gap-3">${Array(count).fill(0).map(() => `
    <div class="rounded-2xl p-4 h-36 skeleton-line"></div>`).join('')}</div>`;
}

export function skeletonDetail() {
  return `
    <div class="space-y-4">
      <div class="h-48 rounded-2xl skeleton-line"></div>
      <div class="h-6 skeleton-line w-2/3"></div>
      <div class="h-4 skeleton-line w-full"></div>
      <div class="h-4 skeleton-line w-5/6"></div>
      <div class="flex gap-2"><div class="h-6 w-16 rounded-full skeleton-line"></div><div class="h-6 w-20 rounded-full skeleton-line"></div></div>
    </div>`;
}

export function loadingSpinner() {
  return '<div class="flex justify-center py-12"><div class="spinner"></div></div>';
}
