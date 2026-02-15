// ═══════════════════════════════════════════════════════════════════════════
// GOALS PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { _goalsFilter, setGoalsFilter, _showSuggestions, setShowSuggestions } from '../core/state.js';
import { toast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { badge, progressRing } from '../components/ui.js';
import { esc } from '../utils/helpers.js';

export async function renderGoals(el) {
  const [res, suggestionsRes] = await Promise.all([
    api('GET', '/api/goals', null, { status: _goalsFilter }),
    _goalsFilter === 'active' ? api('GET', '/api/goals/suggestions', null, { status: 'pending' }) : Promise.resolve({ ok: true, data: [] }),
  ]);
  const goals = res.ok ? (Array.isArray(res.data) ? res.data : []) : [];
  const suggestions = suggestionsRes.ok ? (Array.isArray(suggestionsRes.data) ? suggestionsRes.data : []) : [];
  const parentGoals = goals.filter(g => !g.parent_goal_id);
  const subGoalsByParent = {};
  goals.filter(g => g.parent_goal_id).forEach(g => {
    if (!subGoalsByParent[g.parent_goal_id]) subGoalsByParent[g.parent_goal_id] = [];
    subGoalsByParent[g.parent_goal_id].push(g);
  });

  // Calculate overall progress
  const allSteps = goals.flatMap(g => g.steps || []);
  const totalSteps = allSteps.length;
  const completedSteps = allSteps.filter(s => s.is_completed).length;
  const overallPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  el.innerHTML = `
    <div class="fade-in">
      <!-- Header with Progress Ring -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-4">
          <div class="relative">
            ${progressRing(overallPercent, 52, 4)}
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-heading">${overallPercent}%</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">Goals</h1>
            <p class="text-muted-foreground text-xs">${goals.length} goal${goals.length !== 1 ? 's' : ''} &middot; ${completedSteps}/${totalSteps} steps</p>
          </div>
        </div>
        <button onclick="openGoalsMenu()" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Goal actions">
          <span class="material-icons-round text-xl text-muted-foreground">more_vert</span>
        </button>
      </div>

      <!-- Filter Pills -->
      <div class="flex gap-2 mb-5" role="tablist" aria-label="Goal status filter">
        ${['active', 'completed', 'dismissed'].map(s => `
          <button onclick="setGoalsFilterAndRender('${s}')" role="tab" aria-selected="${_goalsFilter === s}" class="px-4 py-2 rounded-full text-xs font-semibold border border-border shadow-sm hover:shadow-md transition-all duration-200 ${_goalsFilter === s ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground'}">${s.charAt(0).toUpperCase() + s.slice(1)}</button>
        `).join('')}
      </div>

      <!-- Merge Suggestions Banner -->
      ${suggestions.length > 0 ? `
        <button onclick="toggleSuggestions()" class="w-full bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-4 flex items-center gap-3 transition-all active:scale-[0.98]" aria-expanded="${_showSuggestions}">
          <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span class="material-icons-round text-xl text-purple-400">merge_type</span>
          </div>
          <div class="flex-1 text-left">
            <p class="text-heading text-sm font-semibold">You have ${suggestions.length} merge suggestion${suggestions.length !== 1 ? 's' : ''}</p>
            <p class="text-muted-foreground text-xs">Tap to ${_showSuggestions ? 'hide' : 'review'}</p>
          </div>
          <span class="material-icons-round text-muted-foreground transition-transform ${_showSuggestions ? 'rotate-180' : ''}">${_showSuggestions ? 'expand_less' : 'expand_more'}</span>
        </button>
        ${_showSuggestions ? `<div class="space-y-3 mb-4">${suggestions.map(mergeSuggestionCard).join('')}</div>` : ''}
      ` : ''}

      <!-- Goals List -->
      ${parentGoals.length === 0 && suggestions.length === 0 ? `
        <div class="rounded-2xl p-6 min-h-[180px] bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800/40 dark:to-neutral-800/20 border border-border shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div class="absolute inset-0 opacity-20 pointer-events-none"><svg viewBox="0 0 200 200" class="w-full h-full"><defs><filter id="blur-g"><feGaussianBlur in="SourceGraphic" stdDeviation="40"/></filter></defs><circle cx="60" cy="60" r="80" fill="currentColor" filter="url(#blur-g)"/></svg></div>
          <div class="relative z-10"><span class="material-icons-round text-4xl text-heading opacity-80">flag</span></div>
          <p class="relative z-10 text-heading font-semibold mb-1 mt-2">${_goalsFilter === 'active' ? 'No active goals yet' : 'No ' + _goalsFilter + ' goals'}</p>
          <p class="relative z-10 text-muted-foreground text-sm">Save more content and Zuno will detect your goals automatically</p>
        </div>` : `
        <div class="space-y-3">
          ${parentGoals.map(g => goalCard(g, subGoalsByParent[g.id] || [])).join('')}
        </div>`}
    </div>`;
}

function goalCard(goal, children = []) {
  const confidence = Math.round((goal.confidence || 0) * 100);
  const evidenceCount = (goal.evidence_content_ids || []).length;
  const hasChildren = children.length > 0;
  const steps = goal.steps || [];
  const stepsDone = steps.filter(s => s.is_completed).length;
  const stepsTotal = steps.length;
  const stepPercent = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;

  const statusBorder = { active: 'border-l-accent', completed: 'border-l-success', dismissed: 'border-l-muted' };
  const borderClass = statusBorder[goal.status] || 'border-l-accent';

  return `
    <article onclick="navigate('#goal-detail/${goal.id}')" class="bg-card rounded-2xl p-4 border border-border border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.97] ${borderClass}">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl ${hasChildren ? 'bg-purple-500/15' : 'bg-accent/15'} flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl ${hasChildren ? 'text-purple-500' : 'text-accent'}">${hasChildren ? 'account_tree' : 'flag'}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${esc(goal.title)}</h3>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-2">${esc(goal.description || '')}</p>

          <!-- Mini Progress Bar -->
          ${stepsTotal > 0 ? `
          <div class="mt-2.5 flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div class="h-full ${hasChildren ? 'bg-purple-500' : 'bg-accent'} rounded-full transition-all duration-300" style="width:${stepPercent}%"></div>
            </div>
            <span class="text-muted-foreground text-[10px] flex-shrink-0">${stepsDone}/${stepsTotal}</span>
          </div>` : ''}

          <div class="flex items-center gap-3 mt-2">
            ${badge(goal.category, 'emerald')}
            <span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">trending_up</span>${confidence}%</span>
            <span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">link</span>${evidenceCount}</span>
            ${hasChildren ? `<span class="text-purple-400 text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">account_tree</span>${children.length}</span>` : ''}
          </div>
        </div>
      </div>
    </article>`;
}

function mergeSuggestionCard(suggestion) {
  const childCount = (suggestion.child_goal_ids || []).length;
  return `
    <div class="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl text-purple-400">merge_type</span>
        </div>
        <div class="flex-1 min-w-0">
          <span class="inline-block text-[10px] font-semibold uppercase tracking-wide text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full mb-1.5">Merge Suggestion</span>
          <h3 class="font-semibold text-heading text-sm leading-snug">${esc(suggestion.suggested_parent_title)}</h3>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-3">${esc(suggestion.ai_reasoning || suggestion.suggested_parent_description)}</p>
          <p class="text-purple-400/70 text-[10px] mt-1.5"><span class="material-icons-round text-xs align-middle">account_tree</span> Merges ${childCount} goal${childCount !== 1 ? 's' : ''}</p>
          <div class="flex items-center gap-2 mt-3">
            <button onclick="event.stopPropagation();acceptSuggestion('${suggestion.id}')" id="accept-${suggestion.id}" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1">
              <span class="material-icons-round text-sm">check</span> Accept
            </button>
            <button onclick="event.stopPropagation();dismissSuggestion('${suggestion.id}')" id="dismiss-${suggestion.id}" class="flex-1 bg-surface hover:bg-surface-hover text-muted-foreground text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors active:scale-[0.97] border border-border flex items-center justify-center gap-1">
              <span class="material-icons-round text-sm">close</span> Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

function toggleSuggestions() {
  setShowSuggestions(!_showSuggestions);
  renderGoals(document.getElementById('page'));
}

function openGoalsMenu() {
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Goal Actions</h2>
    <div class="space-y-2">
      <button onclick="closeModal();reanalyzeGoals()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-accent">refresh</span>
        <div><p class="text-heading text-sm font-medium">Reanalyze Goals</p><p class="text-muted-foreground text-xs">Re-scan content for new goals</p></div>
      </button>
      <button onclick="closeModal();triggerConsolidate()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-purple-400">merge_type</span>
        <div><p class="text-heading text-sm font-medium">Consolidate Goals</p><p class="text-muted-foreground text-xs">Find goals to merge together</p></div>
      </button>
    </div>
  `);
}

async function acceptSuggestion(id) {
  const btn = document.getElementById('accept-' + id);
  if (btn) { btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>'; btn.disabled = true; }
  const res = await api('POST', `/api/goals/suggestions/${id}/accept`);
  if (res.ok) { toast(res.data?.message || 'Goals merged!'); renderGoals(document.getElementById('page')); }
  else { toast(res.data?.detail || 'Failed to merge', true); if (btn) { btn.textContent = 'Accept'; btn.disabled = false; } }
}

async function dismissSuggestion(id) {
  const btn = document.getElementById('dismiss-' + id);
  if (btn) { btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>'; btn.disabled = true; }
  const res = await api('POST', `/api/goals/suggestions/${id}/dismiss`);
  if (res.ok) { toast('Suggestion dismissed'); renderGoals(document.getElementById('page')); }
  else { toast(res.data?.detail || 'Failed to dismiss', true); if (btn) { btn.textContent = 'Dismiss'; btn.disabled = false; } }
}

async function triggerConsolidate() {
  toast('Starting consolidation...');
  const res = await api('POST', '/api/goals/consolidate');
  if (res.ok) toast(res.data?.message || 'Consolidation started!');
  else toast(res.data?.detail || 'Consolidation failed', true);
}

async function reanalyzeGoals() {
  toast('Reanalyzing goals...');
  const res = await api('POST', '/api/goals/reanalyze');
  if (res.ok) toast(res.data?.message || 'Reanalysis started!');
  else toast(res.data?.detail || 'Reanalysis failed', true);
}

function setGoalsFilterAndRender(status) {
  setGoalsFilter(status);
  renderGoals(document.getElementById('page'));
}

// Expose globally for onclick handlers
window.setGoalsFilterAndRender = setGoalsFilterAndRender;
window.toggleSuggestions = toggleSuggestions;
window.openGoalsMenu = openGoalsMenu;
window.acceptSuggestion = acceptSuggestion;
window.dismissSuggestion = dismissSuggestion;
window.triggerConsolidate = triggerConsolidate;
window.reanalyzeGoals = reanalyzeGoals;
