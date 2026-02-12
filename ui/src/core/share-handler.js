// ═══════════════════════════════════════════════════════════════════════════
// SHARE-TO-ZUNO HANDLER
// Receives content shared from other Android apps via ACTION_SEND intents.
// Called by native Java (MainActivity) through window.handleSharedContent().
// ═══════════════════════════════════════════════════════════════════════════
import { api } from './api.js';
import { toast } from '../components/toast.js';

// Simple URL regex — matches http(s) links inside shared text
const URL_RE = /https?:\/\/[^\s)<>]+/i;

/**
 * Handle content shared from another app.
 *
 * @param {{ type: 'text'|'image', content: string, mimeType?: string }} data
 *   - type 'text':  content is the raw shared string (may contain a URL)
 *   - type 'image': content is base64-encoded image data, mimeType is e.g. 'image/jpeg'
 */
export async function handleIncomingShare(data) {
  if (!data || !data.content) return;

  // ── Auth check ──────────────────────────────────────────────────────
  const token = localStorage.getItem('zuno_token');
  if (!token) {
    toast('Please log in to save shared content', true);
    return;
  }

  try {
    if (typeof showProgress === 'function') showProgress();
    try {
      if (data.type === 'text') {
        await handleTextShare(data.content);
      } else if (data.type === 'image') {
        await handleImageShare(data.content, data.mimeType || 'image/jpeg');
      }
    } finally {
      if (typeof hideProgress === 'function') hideProgress();
    }
  } catch (err) {
    console.error('[ShareHandler]', err);
    toast('Failed to save shared content', true);
    if (typeof hideProgress === 'function') hideProgress();
  }
}

// ─── Text / URL share ─────────────────────────────────────────────────────
async function handleTextShare(text) {
  const urlMatch = text.match(URL_RE);

  if (urlMatch) {
    // Shared text contains a URL — save as content
    const url = urlMatch[0];
    const res = await api('POST', '/api/content', { url });
    if (res.ok) {
      toast('Saved to Zuno!');
      // Fire background AI processing (non-blocking)
      api('POST', '/api/ai/process-content', { content_id: res.data.id });
    } else {
      toast(res.data?.detail || 'Failed to save link', true);
    }
  } else {
    // Plain text — save as a note
    const title = text.length > 80 ? text.slice(0, 77) + '...' : text;
    const res = await api('POST', '/api/content/text', { title, source_text: text });
    if (res.ok) {
      toast('Note saved to Zuno!');
    } else {
      toast(res.data?.detail || 'Failed to save note', true);
    }
  }
}

// ─── Image share ──────────────────────────────────────────────────────────
async function handleImageShare(base64Data, mimeType) {
  // Convert base64 to a Blob, then upload via multipart form
  const byteChars = atob(base64Data);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArr[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArr], { type: mimeType });

  const ext = mimeType.split('/')[1] || 'jpg';
  const fileName = `shared_${Date.now()}.${ext}`;

  const formData = new FormData();
  formData.append('file', blob, fileName);

  // Use raw fetch for multipart (api() sets Content-Type: application/json)
  const API_BASE = window.ZUNO_API_BASE
    || (window.location.hostname === 'localhost' && !window.location.port
        ? 'http://10.0.2.2:8000'
        : window.location.origin);

  const token = localStorage.getItem('zuno_token');
  const res = await fetch(`${API_BASE}/api/v1/content/upload`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  const resData = await res.json().catch(() => ({}));

  if (res.ok) {
    toast('Image saved to Zuno!');
    // Fire background AI processing (non-blocking)
    if (resData.id) {
      api('POST', '/api/ai/process-content', { content_id: resData.id });
    }
  } else {
    toast(resData?.detail || 'Failed to save image', true);
  }
}

// ─── Expose globally for native Java bridge ───────────────────────────────
window.handleSharedContent = handleIncomingShare;
