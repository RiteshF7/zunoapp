// ═══════════════════════════════════════════════════════════════════════════
// ADMIN PAGE (cache, prompts, embedding, feed, health — admin-only)
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { toast } from '../components/toast.js';
import { esc } from '../utils/helpers.js';

export async function renderAdmin(el) {
  const meRes = await api('GET', '/api/admin/me');
  if (!meRes.ok || !meRes.data?.admin) {
    navigate('#profile');
    return;
  }

  el.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center gap-3 mb-5">
        <button onclick="navigate('#profile')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to profile">
          <span class="material-icons-round text-heading">arrow_back</span>
        </button>
        <h1 class="text-xl font-bold text-heading">Admin</h1>
      </div>

      <section class="bg-surface rounded-2xl shadow-card border border-border mb-4 overflow-hidden" aria-label="Developer tools">
        <div class="p-5 space-y-4">
          <!-- Cache -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Cache</h4>
            <div class="flex gap-2">
              <input id="admin-cache-pattern" placeholder="Pattern (optional)" class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoBustCache()" id="admin-bust-btn" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Bust</button>
            </div>
            <button onclick="adminLoadCacheStats()" class="text-xs text-accent hover:text-accent-hover mt-2 font-medium">View Stats</button>
            <div id="admin-cache-stats-result" class="mt-2"></div>
          </div>

          <!-- Prompts -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Prompts</h4>
            <button onclick="adminDoReloadPrompts()" id="admin-prompts-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">refresh</span> Reload Prompts
            </button>
          </div>

          <!-- Embedding Test -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Generate Embedding</h4>
            <div class="flex gap-2">
              <input id="admin-embed-text" placeholder="Text to embed..." class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoGenerateEmbedding()" id="admin-embed-btn" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Go</button>
            </div>
            <div id="admin-embed-result" class="mt-2"></div>
          </div>

          <!-- Generate Feed -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">AI Feed</h4>
            <button onclick="adminDoGenerateFeed()" id="admin-gen-feed-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">auto_awesome</span> Generate Feed
            </button>
            <div id="admin-gen-feed-result" class="mt-2"></div>
          </div>

          <!-- Health Check -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Health</h4>
            <button onclick="adminDoHealthCheck()" id="admin-health-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">monitor_heart</span> Check Health
            </button>
            <div id="admin-health-result" class="mt-2"></div>
          </div>
        </div>
      </section>
    </div>`;
}

async function adminLoadCacheStats() {
  const statsRes = await api('GET', '/api/admin/cache/stats');
  const el = document.getElementById('admin-cache-stats-result');
  if (statsRes.ok) el.innerHTML = `<pre class="text-xs text-muted bg-bg rounded-xl p-3 overflow-x-auto max-h-32">${esc(JSON.stringify(statsRes.data, null, 2))}</pre>`;
  else el.innerHTML = `<p class="text-danger text-xs">${esc(statsRes.data?.detail || 'Failed to load stats')}</p>`;
}

async function adminDoBustCache() {
  const btn = document.getElementById('admin-bust-btn');
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>';
  btn.disabled = true;
  const pattern = document.getElementById('admin-cache-pattern').value.trim();
  const res = await api('POST', '/api/admin/cache/bust', null, pattern ? { pattern } : null);
  if (res.ok) toast('Cache busted!');
  else toast(res.data?.detail || 'Failed', true);
  btn.textContent = 'Bust';
  btn.disabled = false;
}

async function adminDoReloadPrompts() {
  const btn = document.getElementById('admin-prompts-btn');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('POST', '/api/admin/prompts/reload');
  if (res.ok) toast('Prompts reloaded!');
  else toast(res.data?.detail || 'Failed', true);
  btn.innerHTML = '<span class="material-icons-round text-base">refresh</span> Reload Prompts';
  btn.disabled = false;
}

async function adminDoGenerateEmbedding() {
  const text = document.getElementById('admin-embed-text').value.trim();
  if (!text) { toast('Enter text', true); return; }
  const btn = document.getElementById('admin-embed-btn');
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('POST', '/api/ai/generate-embedding', { text });
  const el = document.getElementById('admin-embed-result');
  if (res.ok) {
    const dim = res.data.embedding?.length || 0;
    el.innerHTML = `<p class="text-success text-xs">Embedding generated (${dim} dimensions)</p><pre class="text-xs text-muted bg-bg rounded-lg p-2 mt-1 max-h-24 overflow-y-auto">[${res.data.embedding?.slice(0, 5).map(n => n.toFixed(6)).join(', ')}... ]</pre>`;
  } else el.innerHTML = `<p class="text-danger text-xs">${esc(res.data?.detail || 'Failed')}</p>`;
  btn.textContent = 'Go';
  btn.disabled = false;
}

async function adminDoGenerateFeed() {
  const btn = document.getElementById('admin-gen-feed-btn');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Generating...';
  btn.disabled = true;
  const res = await api('POST', '/api/ai/generate-feed');
  const el = document.getElementById('admin-gen-feed-result');
  if (res.ok) {
    const count = res.data.items?.length || 0;
    el.innerHTML = `<p class="text-success text-xs">${count} feed items generated</p>`;
    if (res.data.message) el.innerHTML += `<p class="text-muted text-xs mt-1">${esc(res.data.message)}</p>`;
  } else el.innerHTML = `<p class="text-danger text-xs">${esc(res.data?.detail || 'Failed')}</p>`;
  btn.innerHTML = '<span class="material-icons-round text-base">auto_awesome</span> Generate Feed';
  btn.disabled = false;
}

async function adminDoHealthCheck() {
  const btn = document.getElementById('admin-health-btn');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('GET', '/health');
  document.getElementById('admin-health-result').innerHTML = `<pre class="text-xs ${res.ok ? 'text-success' : 'text-danger'} bg-bg rounded-lg p-2 mt-1">${esc(JSON.stringify(res.data, null, 2))}</pre>`;
  btn.innerHTML = '<span class="material-icons-round text-base">monitor_heart</span> Check Health';
  btn.disabled = false;
}

window.renderAdmin = renderAdmin;
window.adminLoadCacheStats = adminLoadCacheStats;
window.adminDoBustCache = adminDoBustCache;
window.adminDoReloadPrompts = adminDoReloadPrompts;
window.adminDoGenerateEmbedding = adminDoGenerateEmbedding;
window.adminDoGenerateFeed = adminDoGenerateFeed;
window.adminDoHealthCheck = adminDoHealthCheck;
