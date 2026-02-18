// ═══════════════════════════════════════════════════════════════════════════
// API ERROR DISPLAY
// ═══════════════════════════════════════════════════════════════════════════
import { toast } from '../components/toast.js';

/**
 * If the API response is not ok, show the backend error message in a toast.
 * Reads res.data.error or res.data.detail (string or validation array).
 * @param {{ ok: boolean, data?: { error?: string, detail?: string | Array }} } res - Result from api().
 */
export function showApiError(res) {
  if (res.ok) return;
  const d = res.data;
  let msg = 'Something went wrong';
  if (d && typeof d === 'object') {
    if (typeof d.error === 'string') msg = d.error;
    else if (d.detail != null) {
      if (typeof d.detail === 'string') msg = d.detail;
      else if (Array.isArray(d.detail)) msg = d.detail.map((e) => e.msg || e.message || JSON.stringify(e)).join('; ') || msg;
    }
  } else if (typeof d === 'string' && d) msg = d;
  toast(msg, true);
}
