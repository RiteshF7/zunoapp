// ═══════════════════════════════════════════════════════════════════════════
// ABOUT APP PAGE
// Shows runtime URLs, reference dev/prod URLs, version and build mode.
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import {
  getApiBase,
  SUPABASE_URL,
  getOAuthRedirectUrl,
  APP_SCHEME,
  showFeed,
  isCapacitor,
} from '../core/config.js';
import { esc } from '../utils/helpers.js';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';

function getBuildMode() {
  if (typeof import.meta === 'undefined' || !import.meta.env) return 'unknown';
  const mode = import.meta.env.MODE;
  return mode || 'unknown';
}

export async function renderAbout(el) {
  const refRes = await api('GET', '/api/about-config');
  const ref = refRes.ok ? refRes.data : null;
  const hasRef = ref && (ref.dev?.apiBase || ref.dev?.appUrl || ref.prod?.apiBase || ref.prod?.appUrl);

  const apiBase = getApiBase();
  const oauthRedirect = typeof window !== 'undefined' ? getOAuthRedirectUrl() : '';

  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('zuno_token');
  const backHash = hasToken ? '#profile' : '#auth';
  const backLabel = hasToken ? 'Back to Profile' : 'Back to Login';

  el.innerHTML = `
    <div class="fade-in">
      <button onclick="navigate('${backHash}')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors mb-4 flex items-center gap-2 text-muted-foreground hover:text-heading" aria-label="${backLabel}">
        <span class="material-icons-round text-xl">arrow_back</span> ${backLabel}
      </button>

      <!-- Version & Build -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Version and build">
        <h2 class="text-sm font-semibold text-heading mb-4">Version &amp; Build</h2>
        <dl class="space-y-2 text-sm">
          <div><dt class="text-muted-foreground font-medium">App version</dt><dd class="text-heading mt-0.5">${esc(APP_VERSION)}</dd></div>
          <div><dt class="text-muted-foreground font-medium">Build mode</dt><dd class="text-heading mt-0.5">${esc(getBuildMode())}</dd></div>
        </dl>
      </section>

      <!-- Current runtime -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Current runtime">
        <h2 class="text-sm font-semibold text-heading mb-4">Current runtime</h2>
        <dl class="space-y-2 text-sm">
          <div><dt class="text-muted-foreground font-medium">API base</dt><dd class="text-heading mt-0.5 break-all">${esc(apiBase || '(none)')}</dd></div>
          <div><dt class="text-muted-foreground font-medium">Supabase URL</dt><dd class="text-heading mt-0.5 break-all">${esc(SUPABASE_URL || '(none)')}</dd></div>
          <div><dt class="text-muted-foreground font-medium">OAuth redirect URL</dt><dd class="text-heading mt-0.5 break-all">${esc(oauthRedirect || '(none)')}</dd></div>
          <div><dt class="text-muted-foreground font-medium">App scheme</dt><dd class="text-heading mt-0.5">${esc(APP_SCHEME || '(none)')}</dd></div>
          <div><dt class="text-muted-foreground font-medium">Feed visible</dt><dd class="text-heading mt-0.5">${showFeed() ? 'Yes' : 'No'}</dd></div>
          <div><dt class="text-muted-foreground font-medium">Capacitor (native)</dt><dd class="text-heading mt-0.5">${isCapacitor() ? 'Yes' : 'No'}</dd></div>
        </dl>
      </section>

      <!-- Reference (dev vs prod) -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Reference URLs">
        <h2 class="text-sm font-semibold text-heading mb-4">Reference (expected dev / prod)</h2>
        ${hasRef ? `
          <div class="space-y-4">
            ${(ref.dev?.apiBase || ref.dev?.appUrl) ? `
            <div>
              <h3 class="text-xs font-medium text-muted-foreground uppercase mb-2">Dev</h3>
              <dl class="space-y-2 text-sm">
                ${ref.dev.apiBase ? `<div><dt class="text-muted-foreground font-medium">API base</dt><dd class="text-heading mt-0.5 break-all">${esc(ref.dev.apiBase)}</dd></div>` : ''}
                ${ref.dev.appUrl ? `<div><dt class="text-muted-foreground font-medium">App URL</dt><dd class="text-heading mt-0.5 break-all">${esc(ref.dev.appUrl)}</dd></div>` : ''}
              </dl>
            </div>
            ` : ''}
            ${(ref.prod?.apiBase || ref.prod?.appUrl) ? `
            <div>
              <h3 class="text-xs font-medium text-muted-foreground uppercase mb-2">Prod</h3>
              <dl class="space-y-2 text-sm">
                ${ref.prod.apiBase ? `<div><dt class="text-muted-foreground font-medium">API base</dt><dd class="text-heading mt-0.5 break-all">${esc(ref.prod.apiBase)}</dd></div>` : ''}
                ${ref.prod.appUrl ? `<div><dt class="text-muted-foreground font-medium">App URL</dt><dd class="text-heading mt-0.5 break-all">${esc(ref.prod.appUrl)}</dd></div>` : ''}
              </dl>
            </div>
            ` : ''}
          </div>
        ` : `<p class="text-sm text-muted-foreground">Reference not available (server env not set or request failed).</p>`}
      </section>
    </div>`;
}
