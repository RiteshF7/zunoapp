// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE Q&A PAGE
// ═══════════════════════════════════════════════════════════════════════════
import { api } from '../core/api.js';
import { navigate } from '../core/navigate.js';
import { _knowledgeHistory, pushKnowledgeHistory, clearKnowledgeHistory, _suggestedQuestions } from '../core/state.js';
import { toast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { esc, truncate } from '../utils/helpers.js';

export async function renderKnowledge(el) {
  const statsRes = await api('GET', '/api/knowledge/stats');
  const stats = statsRes.ok ? statsRes.data : null;

  el.innerHTML = `
    <div class="fade-in flex flex-col min-h-0 flex-1 pb-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 class="text-xl font-bold text-heading">Knowledge Q&A</h1>
          ${stats ? `<p class="text-muted-foreground text-xs mt-0.5">${stats.total_chunks || stats.chunks || 0} chunks indexed</p>` : ''}
        </div>
        <button onclick="openKnowledgeSettings()" class="p-2 rounded-md hover:bg-surface-hover transition-colors" aria-label="Knowledge settings">
          <span class="material-icons-round text-xl text-muted-foreground">settings</span>
        </button>
      </div>

      <!-- Chat Area -->
      <div id="knowledge-chat" class="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 mb-4" role="log" aria-label="Chat messages">
        ${_knowledgeHistory.length === 0 ? `
          <div class="flex flex-col items-center justify-center min-h-[200px] text-center px-4 py-6">
            <div class="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center mb-4">
              <span class="material-icons-round text-4xl text-primary">psychology</span>
            </div>
            <p class="text-heading font-semibold mb-1">Ask anything about your content</p>
            <p class="text-muted-foreground text-sm mb-5 opacity-90">Powered by RAG over your knowledge base</p>
            <div class="flex flex-wrap gap-2 justify-center">
              ${_suggestedQuestions.map(q => `
                <button onclick="askSuggested(this.textContent)" class="px-3 py-2 rounded-md bg-card border border-border text-xs text-foreground hover:border-primary hover:text-primary transition-colors shadow-sm">${q}</button>
              `).join('')}
            </div>
          </div>` : _knowledgeHistory.map(renderKnowledgeMessage).join('')}
      </div>

      <!-- Input (always visible above nav) -->
      <div class="flex gap-2 flex-shrink-0 pt-2">
        <input id="knowledge-input" type="text" placeholder="Ask a question..." class="flex-1 min-w-0 bg-card border border-border rounded-md px-4 py-3.5 text-sm text-heading placeholder-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm" onkeydown="if(event.key==='Enter')doAsk()" aria-label="Question input" />
        <button onclick="doAsk()" class="bg-primary text-primary-foreground px-4 rounded-md transition-colors active:scale-95 shadow-sm flex-shrink-0" aria-label="Send question">
          <span class="material-icons-round text-lg">send</span>
        </button>
      </div>
    </div>`;

  const chat = document.getElementById('knowledge-chat');
  chat.scrollTop = chat.scrollHeight;
}

function renderKnowledgeMessage(msg) {
  if (msg.role === 'user') {
    return `<div class="flex justify-end"><div class="bg-accent/20 text-heading rounded-md px-4 py-3 max-w-[80%] text-sm">${esc(msg.text)}</div></div>`;
  }
  return `
    <div class="flex justify-start">
      <div class="bg-card border border-border rounded-md px-4 py-3.5 max-w-[90%] shadow-sm">
        <p class="text-body text-sm leading-relaxed whitespace-pre-wrap">${esc(msg.text)}</p>
        ${msg.sources && msg.sources.length > 0 ? `
          <div class="mt-3 pt-3 border-t border-border">
            <p class="text-muted-foreground text-[10px] uppercase tracking-wide font-semibold mb-2">Sources</p>
            <div class="space-y-1.5">
              ${msg.sources.map(s => `
                <div class="bg-bg rounded-md px-3 py-2.5 cursor-pointer hover:bg-card-hover transition-colors" onclick="navigate('#content-detail/${s.content_id}')">
                  <p class="text-heading text-xs font-medium line-clamp-1">${esc(s.title || s.url || s.content_id)}</p>
                  ${s.chunk_text ? `<p class="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">${esc(truncate(s.chunk_text, 100))}</p>` : ''}
                </div>`).join('')}
            </div>
          </div>` : ''}
      </div>
    </div>`;
}

function askSuggested(q) {
  document.getElementById('knowledge-input').value = q;
  doAsk();
}

async function doAsk() {
  const input = document.getElementById('knowledge-input');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';

  pushKnowledgeHistory({ role: 'user', text: q });
  const chat = document.getElementById('knowledge-chat');
  if (_knowledgeHistory.length === 1) chat.innerHTML = '';
  chat.innerHTML += renderKnowledgeMessage({ role: 'user', text: q });

  // Typing indicator
  chat.innerHTML += `<div id="typing" class="flex justify-start"><div class="bg-card border border-border rounded-md px-5 py-4 shadow-sm"><div class="flex gap-1.5"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div></div>`;
  chat.scrollTop = chat.scrollHeight;

  const res = await api('POST', '/api/knowledge/ask', { query: q, include_sources: true });
  document.getElementById('typing')?.remove();

  const msg = res.ok
    ? { role: 'assistant', text: res.data.answer, sources: res.data.sources || [] }
    : { role: 'assistant', text: `Error: ${res.data?.detail || 'Failed to get answer'}`, sources: [] };
  pushKnowledgeHistory(msg);
  chat.innerHTML += renderKnowledgeMessage(msg);
  chat.scrollTop = chat.scrollHeight;
}

function openKnowledgeSettings() {
  openModal(`
    <h2 class="text-lg font-bold text-heading mb-4">Knowledge Settings</h2>
    <div class="space-y-2">
      <button onclick="closeModal();doReindex()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-md hover:bg-card-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-accent">refresh</span>
        <div><p class="text-heading text-sm font-medium">Reindex Content</p><p class="text-muted-foreground text-xs">Rebuild the knowledge base index</p></div>
      </button>
      <button onclick="closeModal();clearKnowledgeAndRender()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-md hover:bg-card-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted-foreground">delete_sweep</span>
        <div><p class="text-heading text-sm font-medium">Clear Chat</p><p class="text-muted-foreground text-xs">Remove conversation history</p></div>
      </button>
    </div>
  `);
}

async function doReindex() {
  toast('Reindexing...');
  const res = await api('POST', '/api/knowledge/reindex', {});
  if (res.ok) toast(`Reindexed: ${res.data.content_processed} items, ${res.data.chunks_created} chunks`);
  else toast(res.data?.detail || 'Reindex failed', true);
}

function clearKnowledgeAndRender() {
  clearKnowledgeHistory();
  renderKnowledge(document.getElementById('page'));
}

// Expose globally for onclick handlers
window.askSuggested = askSuggested;
window.doAsk = doAsk;
window.openKnowledgeSettings = openKnowledgeSettings;
window.doReindex = doReindex;
window.clearKnowledgeAndRender = clearKnowledgeAndRender;
