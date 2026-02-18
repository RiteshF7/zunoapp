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

      <section class="bg-card rounded-2xl shadow-sm border border-border mb-4 overflow-hidden" aria-label="Developer tools">
        <div class="p-5 space-y-4">
          <!-- Cache -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Cache</h4>
            <div class="flex gap-2">
              <input id="admin-cache-pattern" placeholder="Pattern (optional)" class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoBustCache()" id="admin-bust-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Bust</button>
            </div>
            <button onclick="adminLoadCacheStats()" class="text-xs text-accent hover:text-accent-hover mt-2 font-medium">View Stats</button>
            <div id="admin-cache-stats-result" class="mt-2"></div>
          </div>

          <!-- Prompts -->
          <div id="admin-prompts-section">
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Prompts</h4>
            <div id="admin-prompts-list-wrap">
              <div class="flex gap-2 mb-2">
                <button onclick="adminLoadPromptsList()" id="admin-prompts-load-btn" class="flex-1 bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
                  <span class="material-icons-round text-base">list</span> Load prompts
                </button>
                <button onclick="adminDoReloadPrompts()" id="admin-prompts-btn" class="bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5 px-3" title="Clear cache">
                  <span class="material-icons-round text-base">refresh</span> Reload cache
                </button>
              </div>
              <div id="admin-prompts-list-result" class="mt-2"></div>
            </div>
            <div id="admin-prompts-edit-wrap" class="hidden space-y-3">
              <div class="flex items-center justify-between">
                <span id="admin-prompts-edit-title" class="text-sm font-medium text-heading">Edit prompt</span>
                <button type="button" onclick="adminShowPromptsList()" class="text-xs text-muted-foreground hover:text-heading">Back to list</button>
              </div>
              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">System prompt</label>
                <textarea id="admin-prompt-system" rows="6" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent font-mono"></textarea>
              </div>
              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">User template (optional)</label>
                <textarea id="admin-prompt-user-template" rows="3" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent font-mono" placeholder="e.g. {query} or leave empty"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Version</label>
                  <input type="text" id="admin-prompt-version" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="1.0" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Temperature</label>
                  <input type="number" id="admin-prompt-temperature" step="0.1" min="0" max="2" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="0.3" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Max output tokens</label>
                  <input type="number" id="admin-prompt-max-tokens" min="1" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="2048" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Model (optional)</label>
                  <input type="text" id="admin-prompt-model" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="" />
                </div>
              </div>
              <div class="flex gap-2">
                <button type="button" onclick="adminSavePrompt()" id="admin-prompt-save-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl">Save</button>
                <button type="button" onclick="adminShowPromptsList()" class="bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium px-4 py-2.5 rounded-xl">Cancel</button>
              </div>
            </div>
          </div>

          <!-- Global config (app config: feature flags, limits, links) -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Global config</h4>
            <p class="text-xs text-muted-foreground mb-2">App config (feature flags, limits, feed settings, app links). Used by GET /api/config.</p>
            <div class="flex gap-2 mb-2">
              <button onclick="adminLoadGlobalConfig()" id="admin-global-load-btn" class="bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl px-3">Load</button>
              <button onclick="adminSaveGlobalConfig()" id="admin-global-save-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl px-3">Save</button>
            </div>
            <textarea id="admin-global-config-json" rows="12" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-mono text-heading focus:outline-none focus:border-accent" placeholder="Load to fetch current JSON"></textarea>
            <div id="admin-global-config-result" class="mt-2"></div>
          </div>

          <!-- Local config (about: dev/prod reference URLs) -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Local config</h4>
            <p class="text-xs text-muted-foreground mb-2">About/reference URLs (dev and prod apiBase, appUrl). Used by GET /api/about-config.</p>
            <div class="flex gap-2 mb-2">
              <button onclick="adminLoadLocalConfig()" id="admin-local-load-btn" class="bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl px-3">Load</button>
              <button onclick="adminSaveLocalConfig()" id="admin-local-save-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl px-3">Save</button>
            </div>
            <textarea id="admin-local-config-json" rows="8" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-mono text-heading focus:outline-none focus:border-accent" placeholder="Load to fetch current JSON"></textarea>
            <div id="admin-local-config-result" class="mt-2"></div>
          </div>

          <!-- Embedding Test -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Generate Embedding</h4>
            <div class="flex gap-2">
              <input id="admin-embed-text" placeholder="Text to embed..." class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoGenerateEmbedding()" id="admin-embed-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Go</button>
            </div>
            <div id="admin-embed-result" class="mt-2"></div>
          </div>

          <!-- Generate Feed -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">AI Feed</h4>
            <button onclick="adminDoGenerateFeed()" id="admin-gen-feed-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">auto_awesome</span> Generate Feed
            </button>
            <div id="admin-gen-feed-result" class="mt-2"></div>
          </div>

          <!-- Health Check -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Health</h4>
            <button onclick="adminDoHealthCheck()" id="admin-health-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">monitor_heart</span> Check Health
            </button>
            <div id="admin-health-result" class="mt-2"></div>
          </div>

          <!-- Pro waitlist -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Pro waitlist</h4>
            <button onclick="adminLoadWaitlist()" id="admin-waitlist-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">list</span> Load waitlist
            </button>
            <div id="admin-waitlist-result" class="mt-2"></div>
          </div>
        </div>
      </section>
    </div>`;
}

async function adminLoadCacheStats() {
  const statsRes = await api('GET', '/api/admin/cache/stats');
  const el = document.getElementById('admin-cache-stats-result');
  if (statsRes.ok) el.innerHTML = `<pre class="text-xs text-muted-foreground bg-bg rounded-xl p-3 overflow-x-auto max-h-32">${esc(JSON.stringify(statsRes.data, null, 2))}</pre>`;
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

let _adminEditingPromptName = null;

async function adminLoadPromptsList() {
  const btn = document.getElementById('admin-prompts-load-btn');
  const resultEl = document.getElementById('admin-prompts-list-result');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>';
  btn.disabled = true;
  resultEl.innerHTML = '';
  const res = await api('GET', '/api/admin/prompts');
  if (!res.ok) {
    resultEl.innerHTML = `<p class="text-danger text-xs">${esc(res.data?.detail || 'Failed to load prompts')}</p>`;
    btn.innerHTML = '<span class="material-icons-round text-base">list</span> Load prompts';
    btn.disabled = false;
    return;
  }
  const items = Array.isArray(res.data) ? res.data : [];
  const rows = items.map((p) => `
    <div class="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <span class="text-sm font-medium text-heading">${esc(p.name)}</span>
        <span class="text-xs text-muted-foreground ml-2">v${esc(p.version || '—')}</span>
        ${p.updated_at ? `<span class="text-xs text-muted-foreground ml-2">${new Date(p.updated_at).toLocaleString()}</span>` : ''}
      </div>
      <button type="button" onclick="adminEditPrompt('${esc(p.name)}')" class="text-xs text-accent hover:text-accent-hover font-medium py-1 px-2">Edit</button>
    </div>
  `).join('');
  resultEl.innerHTML = items.length
    ? `<div class="max-h-48 overflow-y-auto rounded-xl border border-border p-2">${rows}</div>`
    : '<p class="text-muted-foreground text-xs">No prompts in DB. Run migration to seed.</p>';
  btn.innerHTML = '<span class="material-icons-round text-base">list</span> Load prompts';
  btn.disabled = false;
}

function adminShowPromptsList() {
  _adminEditingPromptName = null;
  document.getElementById('admin-prompts-list-wrap').classList.remove('hidden');
  document.getElementById('admin-prompts-edit-wrap').classList.add('hidden');
}

async function adminEditPrompt(name) {
  _adminEditingPromptName = name;
  document.getElementById('admin-prompts-list-wrap').classList.add('hidden');
  document.getElementById('admin-prompts-edit-wrap').classList.remove('hidden');
  document.getElementById('admin-prompts-edit-title').textContent = `Edit: ${name}`;
  const res = await api('GET', `/api/admin/prompts/${encodeURIComponent(name)}`);
  if (!res.ok) {
    toast(res.data?.detail || 'Failed to load prompt', true);
    adminShowPromptsList();
    return;
  }
  const p = res.data;
  document.getElementById('admin-prompt-system').value = p.system || '';
  document.getElementById('admin-prompt-user-template').value = p.user_template ?? '';
  document.getElementById('admin-prompt-version').value = p.version ?? '';
  document.getElementById('admin-prompt-temperature').value = p.temperature ?? '';
  document.getElementById('admin-prompt-max-tokens').value = p.max_output_tokens ?? '';
  document.getElementById('admin-prompt-model').value = p.model ?? '';
}

async function adminSavePrompt() {
  const name = _adminEditingPromptName;
  if (!name) return;
  const payload = {
    system: document.getElementById('admin-prompt-system').value,
    user_template: document.getElementById('admin-prompt-user-template').value || null,
    version: document.getElementById('admin-prompt-version').value || null,
    temperature: document.getElementById('admin-prompt-temperature').value ? parseFloat(document.getElementById('admin-prompt-temperature').value) : null,
    max_output_tokens: document.getElementById('admin-prompt-max-tokens').value ? parseInt(document.getElementById('admin-prompt-max-tokens').value, 10) : null,
    model: document.getElementById('admin-prompt-model').value || null,
  };
  const btn = document.getElementById('admin-prompt-save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  const res = await api('PUT', `/api/admin/prompts/${encodeURIComponent(name)}`, payload);
  if (res.ok) {
    toast('Prompt saved!');
    adminShowPromptsList();
  } else {
    toast(res.data?.detail || 'Failed to save', true);
  }
  btn.disabled = false;
  btn.textContent = 'Save';
}

async function adminDoReloadPrompts() {
  const btn = document.getElementById('admin-prompts-btn');
  const origHtml = btn.innerHTML;
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('POST', '/api/admin/prompts/reload');
  if (res.ok) toast('Prompts cache cleared!');
  else toast(res.data?.detail || 'Failed', true);
  btn.innerHTML = '<span class="material-icons-round text-base">refresh</span> Reload cache';
  btn.disabled = false;
}

async function adminLoadGlobalConfig() {
  const btn = document.getElementById('admin-global-load-btn');
  const resultEl = document.getElementById('admin-global-config-result');
  const textarea = document.getElementById('admin-global-config-json');
  btn.disabled = true;
  resultEl.textContent = '';
  const res = await api('GET', '/api/admin/config/global');
  if (res.ok) {
    textarea.value = JSON.stringify(res.data, null, 2);
    resultEl.innerHTML = '<span class="text-success text-xs">Loaded. Edit JSON and click Save.</span>';
  } else {
    resultEl.innerHTML = `<span class="text-danger text-xs">${esc(res.data?.detail || 'Failed to load')}</span>`;
  }
  btn.disabled = false;
}

async function adminSaveGlobalConfig() {
  const resultEl = document.getElementById('admin-global-config-result');
  const textarea = document.getElementById('admin-global-config-json');
  let payload;
  try {
    payload = JSON.parse(textarea.value.trim());
  } catch (e) {
    resultEl.innerHTML = `<span class="text-danger text-xs">Invalid JSON: ${esc(e.message)}</span>`;
    return;
  }
  const btn = document.getElementById('admin-global-save-btn');
  btn.disabled = true;
  resultEl.textContent = '';
  const res = await api('PUT', '/api/admin/config/global', payload);
  if (res.ok) {
    toast('Global config saved!');
    resultEl.innerHTML = '<span class="text-success text-xs">Saved.</span>';
  } else {
    resultEl.innerHTML = `<span class="text-danger text-xs">${esc(res.data?.detail || 'Failed to save')}</span>`;
  }
  btn.disabled = false;
}

async function adminLoadLocalConfig() {
  const btn = document.getElementById('admin-local-load-btn');
  const resultEl = document.getElementById('admin-local-config-result');
  const textarea = document.getElementById('admin-local-config-json');
  btn.disabled = true;
  resultEl.textContent = '';
  const res = await api('GET', '/api/admin/config/local');
  if (res.ok) {
    textarea.value = JSON.stringify(res.data, null, 2);
    resultEl.innerHTML = '<span class="text-success text-xs">Loaded. Edit JSON and click Save.</span>';
  } else {
    resultEl.innerHTML = `<span class="text-danger text-xs">${esc(res.data?.detail || 'Failed to load')}</span>`;
  }
  btn.disabled = false;
}

async function adminSaveLocalConfig() {
  const resultEl = document.getElementById('admin-local-config-result');
  const textarea = document.getElementById('admin-local-config-json');
  let payload;
  try {
    payload = JSON.parse(textarea.value.trim());
  } catch (e) {
    resultEl.innerHTML = `<span class="text-danger text-xs">Invalid JSON: ${esc(e.message)}</span>`;
    return;
  }
  const btn = document.getElementById('admin-local-save-btn');
  btn.disabled = true;
  resultEl.textContent = '';
  const res = await api('PUT', '/api/admin/config/local', payload);
  if (res.ok) {
    toast('Local config saved!');
    resultEl.innerHTML = '<span class="text-success text-xs">Saved.</span>';
  } else {
    resultEl.innerHTML = `<span class="text-danger text-xs">${esc(res.data?.detail || 'Failed to save')}</span>`;
  }
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
    el.innerHTML = `<p class="text-success text-xs">Embedding generated (${dim} dimensions)</p><pre class="text-xs text-muted-foreground bg-bg rounded-lg p-2 mt-1 max-h-24 overflow-y-auto">[${res.data.embedding?.slice(0, 5).map(n => n.toFixed(6)).join(', ')}... ]</pre>`;
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
    if (res.data.message) el.innerHTML += `<p class="text-muted-foreground text-xs mt-1">${esc(res.data.message)}</p>`;
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

let _waitlistData = [];

async function adminLoadWaitlist() {
  const btn = document.getElementById('admin-waitlist-btn');
  const resultEl = document.getElementById('admin-waitlist-result');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Loading...';
  btn.disabled = true;
  const res = await api('GET', '/api/admin/waitlist');
  if (!res.ok) {
    resultEl.innerHTML = `<p class="text-danger text-xs">${esc(res.data?.detail || 'Failed to load waitlist')}</p>`;
    btn.innerHTML = '<span class="material-icons-round text-base">list</span> Load waitlist';
    btn.disabled = false;
    return;
  }
  const items = res.data?.items || [];
  _waitlistData = items;
  const total = res.data?.total ?? items.length;
  const rows = items.map(
    (r) => `<tr class="border-b border-border"><td class="py-2 pr-3 text-sm text-heading">${esc(r.email)}</td><td class="py-2 pr-3 text-xs text-muted-foreground">${esc(r.tier)}</td><td class="py-2 pr-3 text-xs text-muted-foreground">${esc(r.discount_code || '—')}</td><td class="py-2 text-xs text-muted-foreground">${r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td></tr>`
  ).join('');
  resultEl.innerHTML = `
    <p class="text-success text-xs mb-2">${total} signup(s)</p>
    <div class="overflow-x-auto max-h-48 overflow-y-auto rounded-xl border border-border">
      <table class="w-full text-left text-sm">
        <thead><tr class="bg-card border-b border-border"><th class="py-2 pr-3 font-semibold text-heading">Email</th><th class="py-2 pr-3 font-semibold text-heading">Tier</th><th class="py-2 pr-3 font-semibold text-heading">Code</th><th class="py-2 font-semibold text-heading">Date</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" class="py-4 text-center text-muted-foreground text-xs">No entries</td></tr>'}</tbody>
      </table>
    </div>
    ${items.length > 0 ? '<button type="button" onclick="adminExportWaitlistCsv()" class="mt-2 text-xs text-accent hover:text-accent-hover font-medium">Export CSV</button>' : ''}
  `;
  btn.innerHTML = '<span class="material-icons-round text-base">list</span> Load waitlist';
  btn.disabled = false;
}

function adminExportWaitlistCsv() {
  if (_waitlistData.length === 0) return;
  const headers = ['email', 'tier', 'discount_code', 'created_at'];
  const csv = [headers.join(',')].concat(
    _waitlistData.map((r) => headers.map((h) => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `zuno-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

window.renderAdmin = renderAdmin;
window.adminLoadCacheStats = adminLoadCacheStats;
window.adminDoBustCache = adminDoBustCache;
window.adminLoadPromptsList = adminLoadPromptsList;
window.adminShowPromptsList = adminShowPromptsList;
window.adminEditPrompt = adminEditPrompt;
window.adminSavePrompt = adminSavePrompt;
window.adminDoReloadPrompts = adminDoReloadPrompts;
window.adminLoadGlobalConfig = adminLoadGlobalConfig;
window.adminSaveGlobalConfig = adminSaveGlobalConfig;
window.adminLoadLocalConfig = adminLoadLocalConfig;
window.adminSaveLocalConfig = adminSaveLocalConfig;
window.adminDoGenerateEmbedding = adminDoGenerateEmbedding;
window.adminDoGenerateFeed = adminDoGenerateFeed;
window.adminDoHealthCheck = adminDoHealthCheck;
window.adminLoadWaitlist = adminLoadWaitlist;
window.adminExportWaitlistCsv = adminExportWaitlistCsv;
