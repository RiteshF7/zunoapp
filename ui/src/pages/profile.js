// ═══════════════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { getTheme, applyTheme } from '../core/theme.js';
import { setUserProfile } from '../core/state.js';
import { toast } from '../components/toast.js';
import { doLogout } from './auth.js';
import { esc } from '../utils/helpers.js';

export async function renderProfile(el) {
  const [profileRes, prefRes, adminMeRes] = await Promise.all([
    api('GET', '/api/profile'),
    api('GET', '/api/user-preferences'),
    api('GET', '/api/admin/me'),
  ]);
  const p = profileRes.ok ? profileRes.data : {};
  const pref = prefRes.ok ? prefRes.data : {};
  const theme = getTheme();
  const isAdmin = adminMeRes.ok && adminMeRes.data?.admin === true;

  el.innerHTML = `
    <div class="fade-in">
      <!-- Avatar Hero -->
      <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border" aria-label="Account info">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center overflow-hidden flex-shrink-0">
            ${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="Avatar" class="w-full h-full object-cover" onerror="this.style.display='none'"/>` : `<span class="material-icons-round text-3xl text-accent">person</span>`}
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">${esc(p.display_name || 'No name')}</h1>
            <p class="text-muted-foreground text-sm">${esc(p.email || p.phone || '')}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label for="p-name" class="text-xs text-muted-foreground font-medium mb-1.5 block">Display Name</label>
            <input id="p-name" value="${esc(p.display_name || '')}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <div>
            <label for="p-avatar" class="text-xs text-muted-foreground font-medium mb-1.5 block">Avatar URL</label>
            <input id="p-avatar" value="${esc(p.avatar_url || '')}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <button onclick="doUpdateProfile()" id="profile-btn" class="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl transition-colors active:scale-[0.97] shadow-sm hover:shadow-md">Update Profile</button>
        </div>
      </section>

      <!-- Preferences -->
      <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border" aria-label="Preferences">
        <h3 class="text-sm font-semibold text-heading mb-4">Preferences</h3>

        <div class="mb-4">
          <label class="text-xs text-muted-foreground font-medium mb-2 block">Default Feed</label>
          <div class="flex gap-2">
            <button onclick="updateFeedPref('usersaved')" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${pref.feed_type === 'usersaved' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card border border-border text-foreground'} active:scale-[0.97]">My Saved</button>
            <button onclick="updateFeedPref('suggestedcontent')" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${pref.feed_type === 'suggestedcontent' ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card border border-border text-foreground'} active:scale-[0.97]">Suggested</button>
          </div>
        </div>

        <div>
          <label class="text-xs text-muted-foreground font-medium mb-2 block">Theme</label>
          <div class="flex gap-2">
            ${['light', 'dark', 'system'].map(t => `
              <button onclick="applyTheme('${t}');renderProfile(document.getElementById('page'))" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${theme === t ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card border border-border text-foreground'} active:scale-[0.97]">
                <span class="material-icons-round text-base">${t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : 'brightness_auto'}</span>
                ${t.charAt(0).toUpperCase() + t.slice(1)}
              </button>`).join('')}
          </div>
        </div>
      </section>

      <!-- Chrome Extension -->
      <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border" aria-label="Chrome Extension">
        <h3 class="text-sm font-semibold text-heading mb-2">Chrome Extension</h3>
        <p class="text-xs text-muted-foreground mb-3">Connect the Share to Zuno extension to save links without opening the app.</p>
        <a href="#connect-extension" target="_blank" rel="noopener" class="block w-full text-center py-2.5 rounded-xl text-sm font-medium bg-bg hover:bg-surface-hover border border-border text-heading transition-colors">
          <span class="material-icons-round text-base align-middle mr-1">extension</span> Connect Extension
        </a>
      </section>

      ${isAdmin ? `
      <!-- Admin (only for allowlisted users) -->
      <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border" aria-label="Admin">
        <button onclick="navigate('#admin')" class="w-full flex items-center justify-center gap-2 bg-bg hover:bg-surface-hover border border-border text-heading font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
          <span class="material-icons-round text-xl text-muted-foreground">admin_panel_settings</span>
          Open Admin
        </button>
      </section>
      ` : ''}

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

// Expose globally for onclick handlers
window.renderProfile = renderProfile;
window.doUpdateProfile = doUpdateProfile;
window.updateFeedPref = updateFeedPref;
