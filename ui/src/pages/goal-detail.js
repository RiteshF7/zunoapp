// ═══════════════════════════════════════════════════════════════════════════
// GOAL DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { _showCompletedSteps, setShowCompletedSteps } from '../core/state.js';
import { toast } from '../components/toast.js';
import { customConfirm } from '../components/confirm.js';
import { badge, progressRing } from '../components/ui.js';
import { esc } from '../utils/helpers.js';

export async function renderGoalDetail(el, id) {
  if (!id) { navigate('#goals'); return; }
  const res = await api('GET', `/api/goals/${id}`);
  if (!res.ok) { el.innerHTML = '<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Goal not found</p></div>'; return; }
  const g = res.data;
  const steps = g.steps || [];
  const completedSteps = steps.filter(s => s.is_completed);
  const pendingSteps = steps.filter(s => !s.is_completed);
  const completedCount = completedSteps.length;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const confidence = Math.round((g.confidence || 0) * 100);
  const evidenceCount = (g.evidence_content_ids || []).length;
  const children = g.children || [];
  const hasChildren = children.length > 0;
  const isChild = !!g.parent_goal_id;
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  const ringColor = `hsl(${primary})`;

  el.innerHTML = `
    <div class="slide-in-right">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('${isChild ? '#goal-detail/' + g.parent_goal_id : '#goals'}')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="${isChild ? 'Back to parent goal' : 'Back to goals'}">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${isChild ? 'Sub-goal' : 'Goal'}</h1>
      </div>

      <!-- Progress Card -->
      <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
        <div class="flex items-center gap-4 mb-4">
          <div class="relative flex-shrink-0">
            ${progressRing(progressPercent, 64, 5, ringColor)}
            <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-heading">${progressPercent}%</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-bold text-heading leading-snug">${esc(g.title)}</h2>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              ${badge(g.category, 'emerald')}
              ${badge(g.status, g.status === 'active' ? 'indigo' : g.status === 'completed' ? 'green' : 'gray')}
              ${hasChildren ? '<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Parent</span>' : ''}
              ${isChild ? '<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Sub-goal</span>' : ''}
            </div>
          </div>
        </div>
        <p class="text-body text-sm leading-relaxed">${esc(g.description)}</p>
        <div class="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">trending_up</span>${confidence}% match</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">link</span>${evidenceCount} from your content</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">checklist</span>${completedCount}/${totalSteps} steps</span>
        </div>
      </section>

      <!-- Sub-goals (horizontal scroll) -->
      ${hasChildren ? `
      <section class="mb-4" aria-label="Sub-goals">
        <h3 class="text-sm font-semibold text-heading mb-3 flex items-center gap-1.5">
          <span class="material-icons-round text-base text-purple-400">account_tree</span> Sub-goals
        </h3>
        <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          ${children.map(c => {
            const cConf = Math.round((c.confidence || 0) * 100);
            const cStatus = c.status || 'active';
            const cIcon = cStatus === 'completed' ? 'check_circle' : cStatus === 'dismissed' ? 'do_not_disturb_on' : 'flag';
            const cColor = cStatus === 'completed' ? 'text-success' : cStatus === 'dismissed' ? 'text-muted-foreground' : 'text-accent';
            return `
            <article onclick="navigate('#goal-detail/${c.id}')" class="flex-shrink-0 w-44 bg-card rounded-xl p-3.5 shadow-sm border border-border hover:shadow-elevated transition-all cursor-pointer active:scale-[0.97]">
              <div class="flex items-center gap-2 mb-2">
                <span class="material-icons-round text-lg ${cColor}">${cIcon}</span>
                <span class="text-[10px] text-muted-foreground">${cConf}%</span>
              </div>
              <h4 class="font-semibold text-heading text-xs leading-snug line-clamp-2">${esc(c.title)}</h4>
            </article>`;
          }).join('')}
        </div>
      </section>` : ''}

      <!-- Steps -->
      <section class="mb-4" aria-label="Goal steps">
        <h3 class="text-sm font-semibold text-heading mb-3">Steps</h3>
        ${totalSteps === 0 ? '<p class="text-muted-foreground text-sm text-center py-4">No steps yet</p>' : `
          <div class="space-y-2" id="goal-steps-list">
            ${pendingSteps.map(step => goalStepCard(step, id)).join('')}
            ${completedCount > 0 ? `
              <button onclick="toggleCompletedSteps('${id}')" class="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground font-medium hover:text-heading transition-colors">
                <span class="material-icons-round text-sm">${_showCompletedSteps ? 'expand_less' : 'expand_more'}</span>
                ${completedCount} completed step${completedCount !== 1 ? 's' : ''}
              </button>
              ${_showCompletedSteps ? completedSteps.map(step => goalStepCard(step, id)).join('') : ''}
            ` : ''}
          </div>`}
      </section>

      ${g.ai_reasoning ? `
        <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Reasoning</h3>
          </div>
          <p class="text-muted-foreground text-sm leading-relaxed">${esc(g.ai_reasoning)}</p>
        </section>` : ''}

      <!-- Actions -->
      <div class="space-y-2">
        ${g.status === 'active' ? `
          <button onclick="updateGoalStatus('${g.id}','completed')" class="w-full flex items-center justify-center gap-2 bg-success/10 hover:bg-success/20 text-success font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">check_circle</span> Mark Complete
          </button>
          <button onclick="updateGoalStatus('${g.id}','dismissed')" class="w-full flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border text-muted-foreground font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">do_not_disturb_on</span> Dismiss Goal
          </button>` : `
          <button onclick="updateGoalStatus('${g.id}','active')" class="w-full flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">flag</span> Reactivate
          </button>`}
        <button onclick="deleteGoal('${g.id}')" class="w-full flex items-center justify-center gap-2 bg-card hover:bg-danger/10 border border-border text-danger font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
          <span class="material-icons-round text-lg">delete</span> Delete Goal
        </button>
      </div>
    </div>`;
}

function goalStepCard(step, goalId) {
  const sourceCount = (step.source_content_ids || []).length;
  return `
    <div class="bg-card rounded-xl p-3.5 flex items-start gap-3 transition-all duration-200 shadow-sm ${step.is_completed ? 'opacity-60' : ''}">
      <button onclick="event.stopPropagation();toggleGoalStep('${goalId}','${step.id}',${!step.is_completed})" class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 ${step.is_completed ? 'bg-accent border-accent check-bounce' : 'border-border hover:border-accent'} flex items-center justify-center transition-all" aria-label="${step.is_completed ? 'Mark incomplete' : 'Mark complete'}">
        ${step.is_completed ? '<span class="material-icons-round text-sm text-white">check</span>' : ''}
      </button>
      <div class="flex-1 min-w-0">
        <p class="text-heading text-sm font-medium leading-snug ${step.is_completed ? 'line-through' : ''}">${esc(step.title)}</p>
        ${step.description ? `<p class="text-muted-foreground text-xs mt-1 leading-relaxed">${esc(step.description)}</p>` : ''}
        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-muted-foreground text-[10px]">Step ${step.step_index + 1}</span>
          ${sourceCount > 0 ? `<span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-[10px]">link</span>${sourceCount}</span>` : ''}
          ${step.is_completed && step.completed_at ? '<span class="text-success text-[10px]">Done</span>' : ''}
        </div>
      </div>
    </div>`;
}

function toggleCompletedSteps(goalId) {
  setShowCompletedSteps(!_showCompletedSteps);
  renderGoalDetail(document.getElementById('page'), goalId);
}

async function toggleGoalStep(goalId, stepId, newValue) {
  const res = await api('PATCH', `/api/goals/${goalId}/steps/${stepId}`, { is_completed: newValue });
  if (res.ok) await renderGoalDetail(document.getElementById('page'), goalId);
  else toast(res.data?.detail || 'Failed to update step', true);
}

async function updateGoalStatus(goalId, status) {
  const res = await api('PATCH', `/api/goals/${goalId}`, { status });
  if (res.ok) {
    toast(`Goal ${status === 'completed' ? 'completed' : status === 'dismissed' ? 'dismissed' : 'reactivated'}!`);
    await renderGoalDetail(document.getElementById('page'), goalId);
  } else toast(res.data?.detail || 'Failed to update goal', true);
}

async function deleteGoal(goalId) {
  const ok = await customConfirm('Delete Goal', 'This will delete the goal and all its steps. Continue?', 'Delete', true);
  if (!ok) return;
  const res = await api('DELETE', `/api/goals/${goalId}`);
  if (res.ok) { toast('Goal deleted'); navigate('#goals'); }
  else toast(res.data?.detail || 'Failed to delete', true);
}

// Expose globally for onclick handlers
window.toggleCompletedSteps = toggleCompletedSteps;
window.toggleGoalStep = toggleGoalStep;
window.updateGoalStatus = updateGoalStatus;
window.deleteGoal = deleteGoal;
