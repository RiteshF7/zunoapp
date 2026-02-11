// ═══════════════════════════════════════════════════════════════════════════
// SHARED APPLICATION STATE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from './api.js';

export let _userProfile = null;

export function setUserProfile(val) {
  _userProfile = val;
}

export async function getUserProfile(force = false) {
  if (_userProfile && !force) return _userProfile;
  const res = await api('GET', '/api/profile');
  if (res.ok) _userProfile = res.data;
  return _userProfile || {};
}

// Library tab state
export let _libraryTab = 'saved';
export function setLibraryTab(tab) { _libraryTab = tab; }

// Content detail tab state
export let _contentDetailTab = 'summary';
export function setContentDetailTab(tab) { _contentDetailTab = tab; }

// Goals state
export let _goalsFilter = 'active';
export function setGoalsFilter(f) { _goalsFilter = f; }

export let _showSuggestions = false;
export function setShowSuggestions(v) { _showSuggestions = v; }

export let _showCompletedSteps = false;
export function setShowCompletedSteps(v) { _showCompletedSteps = v; }

// Search state
export let _searchType = 'fts';
export function setSearchType(t) { _searchType = t; }

// Knowledge state
export let _knowledgeHistory = [];
export function pushKnowledgeHistory(msg) { _knowledgeHistory.push(msg); }
export function clearKnowledgeHistory() { _knowledgeHistory = []; }

export const _suggestedQuestions = [
  'What topics appear most in my saved content?',
  'Summarize my most recent saves',
  'What are the key takeaways from my articles?',
  'How are my saved items connected?',
];

// Router transition state
export let _prevPage = null;
export function setPrevPage(p) { _prevPage = p; }
