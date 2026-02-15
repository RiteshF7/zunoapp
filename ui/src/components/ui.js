// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
import { esc, truncate } from '../utils/helpers.js';
import { navigate } from '../core/navigate.js';

export function badge(text, color = 'indigo') {
  if (!text) return '';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-${color}-500/15 text-${color}-600 dark:text-${color}-400">${esc(text)}</span>`;
}

export function platformIcon(p) {
  const icons = { youtube: 'play_circle', instagram: 'camera_alt', x: 'tag', reddit: 'forum', tiktok: 'music_note', spotify: 'headphones', web: 'language' };
  return icons[p] || 'link';
}

// Universal content card
export function contentCardHtml(item, opts = {}) {
  const id = item.content_id || item.id;
  const title = item.title || item.url || 'Untitled';
  const desc = item.description || item.ai_summary || '';
  const thumb = item.image_url || item.thumbnail_url;
  const cat = item.category || item.ai_category;
  const platform = item.platform;
  const showBookmark = opts.showBookmark || false;
  const isBookmarked = opts.isBookmarked || false;
  const showAiStatus = opts.showAiStatus || false;
  const processingIds = opts.processingIds || null;
  const aiProcessed = item.ai_processed;
  const isProcessing = showAiStatus && processingIds && processingIds.has(id);

  const aiStatusHtml = !showAiStatus ? '' : isProcessing
    ? `<span class="text-accent/80 text-[10px] flex items-center gap-1 shrink-0" role="status" aria-busy="true">
        <span class="progress-bar-inline flex-1 min-w-[48px] max-w-[80px]"><span class="progress-bar-inline-inner block h-full rounded"></span></span>
        <span class="material-icons-round text-xs">auto_awesome</span> Processing with AI
       </span>`
    : aiProcessed
      ? '<span class="text-success text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">check_circle</span>AI</span>'
      : '<span class="text-muted-foreground text-[10px]">Pending</span>';

  return `
    <article class="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.97] group"
      onclick="if(!event.target.closest('.card-action'))navigate('#content-detail/${id}')">
      <div class="flex gap-3">
        ${thumb
          ? `<img src="${esc(thumb)}" alt="" class="w-20 h-20 rounded-xl object-cover flex-shrink-0" onerror="this.style.display='none'" loading="lazy"/>`
          : `<div class="w-20 h-20 rounded-xl bg-surface-hover flex items-center justify-center flex-shrink-0"><span class="material-icons-round text-2xl text-muted-foreground">${platformIcon(platform)}</span></div>`}
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${esc(title)}</h3>
            ${showBookmark ? `
              <button class="card-action flex-shrink-0 p-1 rounded-lg hover:bg-surface-hover transition-colors" onclick="toggleBookmark('${item.id}', this)" aria-label="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                <span class="material-icons-round text-lg ${isBookmarked ? 'text-accent bookmark-pop' : 'text-muted-foreground'}">${isBookmarked ? 'bookmark' : 'bookmark_border'}</span>
              </button>` : ''}
          </div>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-2">${esc(truncate(desc, 120))}</p>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            ${badge(cat)}
            ${platform ? `<span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">${platformIcon(platform)}</span>${esc(platform)}</span>` : ''}
            ${aiStatusHtml}
          </div>
        </div>
      </div>
    </article>`;
}

// Progress ring SVG
export function progressRing(percent, size = 48, stroke = 4, color = 'var(--c-accent)') {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * percent / 100);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="transform -rotate-90">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--c-border)" stroke-width="${stroke}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" class="progress-ring-circle"/>
  </svg>`;
}
