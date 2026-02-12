// ═══════════════════════════════════════════════════════════════════════════
// PROFILE PAGE (includes Admin / Developer Tools)
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { getTheme, applyTheme } from '../core/theme.js';
import { setUserProfile } from '../core/state.js';
import { toast } from '../components/toast.js';
import { doLogout } from './auth.js';
import { esc } from '../utils/helpers.js';

export async function renderProfile(el) {
  const [profileRes, prefRes] = await Promise.all([
    api('GET', '/api/profile'),
    api('GET', '/api/user-preferences'),
  ]);
  const p = profileRes.ok ? profileRes.data : {};
  const pref = prefRes.ok ? prefRes.data : {};
  const theme = getTheme();

  el.innerHTML = `
    <div class="fade-in">
      <!-- Avatar Hero -->
      <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border" aria-label="Account info">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center overflow-hidden flex-shrink-0">
            ${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="Avatar" class="w-full h-full object-cover" onerror="this.style.display='none'"/>` : `<span class="material-icons-round text-3xl text-accent">person</span>`}
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">${esc(p.display_name || 'No name')}</h1>
            <p class="text-muted text-sm">${esc(p.email || p.phone || '')}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label for="p-name" class="text-xs text-muted font-medium mb-1.5 block">Display Name</label>
            <input id="p-name" value="${esc(p.display_name || '')}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <div>
            <label for="p-avatar" class="text-xs text-muted font-medium mb-1.5 block">Avatar URL</label>
            <input id="p-avatar" value="${esc(p.avatar_url || '')}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <button onclick="doUpdateProfile()" id="profile-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.97]">Update Profile</button>
        </div>
      </section>

      <!-- Preferences -->
      <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border" aria-label="Preferences">
        <h3 class="text-sm font-semibold text-heading mb-4">Preferences</h3>

        <div class="mb-4">
          <label class="text-xs text-muted font-medium mb-2 block">Default Feed</label>
          <div class="flex gap-2">
            <button onclick="updateFeedPref('usersaved')" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${pref.feed_type === 'usersaved' ? 'bg-accent text-white shadow-sm' : 'bg-bg border border-border text-muted hover:text-heading'} active:scale-[0.97]">My Saved</button>
            <button onclick="updateFeedPref('suggestedcontent')" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${pref.feed_type === 'suggestedcontent' ? 'bg-accent text-white shadow-sm' : 'bg-bg border border-border text-muted hover:text-heading'} active:scale-[0.97]">Suggested</button>
          </div>
        </div>

        <div>
          <label class="text-xs text-muted font-medium mb-2 block">Theme</label>
          <div class="flex gap-2">
            ${['light', 'dark', 'system'].map(t => `
              <button onclick="applyTheme('${t}');renderProfile(document.getElementById('page'))" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${theme === t ? 'bg-accent text-white shadow-sm' : 'bg-bg border border-border text-muted hover:text-heading'} active:scale-[0.97]">
                <span class="material-icons-round text-base">${t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : 'brightness_auto'}</span>
                ${t.charAt(0).toUpperCase() + t.slice(1)}
              </button>`).join('')}
          </div>
        </div>
      </section>

      <!-- Developer Tools (Collapsible) -->
      <section class="bg-surface rounded-2xl shadow-card border border-border mb-4 overflow-hidden" aria-label="Developer tools">
        <button onclick="document.getElementById('dev-tools').classList.toggle('hidden');this.querySelector('.expand-icon').classList.toggle('rotate-180')" class="w-full flex items-center justify-between p-5 hover:bg-surface-hover transition-colors">
          <div class="flex items-center gap-3">
            <span class="material-icons-round text-xl text-muted">code</span>
            <h3 class="text-sm font-semibold text-heading">Developer Tools</h3>
          </div>
          <span class="material-icons-round text-muted expand-icon transition-transform">expand_more</span>
        </button>
        <div id="dev-tools" class="hidden border-t border-border p-5 space-y-4">
          <!-- Cache -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Cache</h4>
            <div class="flex gap-2">
              <input id="cache-pattern" placeholder="Pattern (optional)" class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="doBustCache()" id="bust-btn" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Bust</button>
            </div>
            <button onclick="loadCacheStats()" class="text-xs text-accent hover:text-accent-hover mt-2 font-medium">View Stats</button>
            <div id="cache-stats-result" class="mt-2"></div>
          </div>

          <!-- Prompts -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Prompts</h4>
            <button onclick="doReloadPrompts()" id="prompts-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">refresh</span> Reload Prompts
            </button>
          </div>

          <!-- Embedding Test -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Generate Embedding</h4>
            <div class="flex gap-2">
              <input id="embed-text" placeholder="Text to embed..." class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="doGenerateEmbedding()" id="embed-btn" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Go</button>
            </div>
            <div id="embed-result" class="mt-2"></div>
          </div>

          <!-- Generate Feed -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">AI Feed</h4>
            <button onclick="doGenerateFeed()" id="gen-feed-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">auto_awesome</span> Generate Feed
            </button>
            <div id="gen-feed-result" class="mt-2"></div>
          </div>

          <!-- Health Check -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Health</h4>
            <button onclick="doHealthCheck()" id="health-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">monitor_heart</span> Check Health
            </button>
            <div id="health-result" class="mt-2"></div>
          </div>
        </div>
      </section>

      <!-- Sign Out -->
      <button onclick="doLogout()" class="w-full flex items-center justify-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
        <span class="material-icons-round text-lg">logout</span> Sign Out
      </button>
    </div>`;
}

async function doUpdateProfile() {
  const btn = document.getElementById('profile-btn');
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>';
  btn.disabled = true;
  const body = {
    display_name: document.getElementById('p-name').value.trim() || null,
    avatar_url: document.getElementById('p-avatar').value.trim() || null,
  };
  const res = await api('PATCH', '/api/profile', body);
  if (res.ok) { setUserProfile(null); toast('Profile updated!'); }
  else toast(res.data?.detail || 'Failed to update', true);
  btn.textContent = 'Update Profile';
  btn.disabled = false;
}

async function updateFeedPref(type) {
  await api('PATCH', '/api/user-preferences', { feed_type: type });
  toast('Feed preference updated!');
  await renderProfile(document.getElementById('page'));
}

// ─── Admin action handlers ───
async function loadCacheStats() {
  const statsRes = await api('GET', '/api/admin/cache/stats');
  const el = document.getElementById('cache-stats-result');
  if (statsRes.ok) el.innerHTML = `<pre class="text-xs text-muted bg-bg rounded-xl p-3 overflow-x-auto max-h-32">${esc(JSON.stringify(statsRes.data, null, 2))}</pre>`;
  else el.innerHTML = `<p class="text-danger text-xs">Failed to load stats</p>`;
}

async function doBustCache() {
  const btn = document.getElementById('bust-btn');
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>';
  btn.disabled = true;
  const pattern = document.getElementById('cache-pattern').value.trim();
  const res = await api('POST', '/api/admin/cache/bust', null, pattern ? { pattern } : null);
  if (res.ok) toast('Cache busted!');
  else toast(res.data?.detail || 'Failed', true);
  btn.textContent = 'Bust';
  btn.disabled = false;
}

async function doReloadPrompts() {
  const btn = document.getElementById('prompts-btn');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('POST', '/api/admin/prompts/reload');
  if (res.ok) toast('Prompts reloaded!');
  else toast(res.data?.detail || 'Failed', true);
  btn.innerHTML = '<span class="material-icons-round text-base">refresh</span> Reload Prompts';
  btn.disabled = false;
}

async function doGenerateEmbedding() {
  const text = document.getElementById('embed-text').value.trim();
  if (!text) { toast('Enter text', true); return; }
  const btn = document.getElementById('embed-btn');
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('POST', '/api/ai/generate-embedding', { text });
  const el = document.getElementById('embed-result');
  if (res.ok) {
    const dim = res.data.embedding?.length || 0;
    el.innerHTML = `<p class="text-success text-xs">Embedding generated (${dim} dimensions)</p><pre class="text-xs text-muted bg-bg rounded-lg p-2 mt-1 max-h-24 overflow-y-auto">[${res.data.embedding?.slice(0, 5).map(n => n.toFixed(6)).join(', ')}... ]</pre>`;
  } else el.innerHTML = `<p class="text-danger text-xs">${esc(res.data?.detail || 'Failed')}</p>`;
  btn.textContent = 'Go';
  btn.disabled = false;
}

async function doGenerateFeed() {
  const btn = document.getElementById('gen-feed-btn');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Generating...';
  btn.disabled = true;
  const res = await api('POST', '/api/ai/generate-feed');
  const el = document.getElementById('gen-feed-result');
  if (res.ok) {
    const count = res.data.items?.length || 0;
    el.innerHTML = `<p class="text-success text-xs">${count} feed items generated</p>`;
    if (res.data.message) el.innerHTML += `<p class="text-muted text-xs mt-1">${esc(res.data.message)}</p>`;
  } else el.innerHTML = `<p class="text-danger text-xs">${esc(res.data?.detail || 'Failed')}</p>`;
  btn.innerHTML = '<span class="material-icons-round text-base">auto_awesome</span> Generate Feed';
  btn.disabled = false;
}

async function doHealthCheck() {
  const btn = document.getElementById('health-btn');
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>';
  btn.disabled = true;
  const res = await api('GET', '/health');
  document.getElementById('health-result').innerHTML = `<pre class="text-xs ${res.ok ? 'text-success' : 'text-danger'} bg-bg rounded-lg p-2 mt-1">${esc(JSON.stringify(res.data, null, 2))}</pre>`;
  btn.innerHTML = '<span class="material-icons-round text-base">monitor_heart</span> Check Health';
  btn.disabled = false;
}

// Expose globally for onclick handlers
window.renderProfile = renderProfile;
window.doUpdateProfile = doUpdateProfile;
window.updateFeedPref = updateFeedPref;
window.loadCacheStats = loadCacheStats;
window.doBustCache = doBustCache;
window.doReloadPrompts = doReloadPrompts;
window.doGenerateEmbedding = doGenerateEmbedding;
window.doGenerateFeed = doGenerateFeed;
window.doHealthCheck = doHealthCheck;
