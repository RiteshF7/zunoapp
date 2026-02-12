// ═══════════════════════════════════════════════════════════════════════════
// API HELPER
// ═══════════════════════════════════════════════════════════════════════════

// API base: build-time VITE_API_BASE, or runtime ZUNO_API_BASE, or origin / emulator alias.
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  window.ZUNO_API_BASE ||
  (window.location.hostname === 'localhost' && !window.location.port
    ? 'http://10.0.2.2:8000'
    : window.location.origin);

let _refreshing = null; // single in-flight refresh promise

// Use /api/v1/ directly to avoid 307 redirect (browsers often drop Authorization on redirect → 401)
function _normalizePath(path) {
  if (path.startsWith('/api/') && !path.startsWith('/api/v1/')) {
    return '/api/v1' + path.slice(4);
  }
  return path;
}

async function _doFetch(method, path, body, params) {
  const token = localStorage.getItem('zuno_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const normalizedPath = _normalizePath(path);
  let url = `${API_BASE}${normalizedPath}`;
  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) sp.append(k, v); });
    const qs = sp.toString();
    if (qs) url += '?' + qs;
  }

  const opts = { method, headers };
  if (body && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

export async function api(method, path, body = null, params = null) {
  try {
    let result = await _doFetch(method, path, body, params);

    // If 401, try refreshing the token once and retry
    if (result.status === 401) {
      const hasRefresh = !!localStorage.getItem('zuno_refresh_token');
      const refreshed = hasRefresh && await _tryRefresh();
      if (refreshed) {
        result = await _doFetch(method, path, body, params);
      }

      // Still 401 after refresh (or no refresh token) → force logout
      if (result.status === 401) {
        localStorage.removeItem('zuno_token');
        localStorage.removeItem('zuno_refresh_token');
        if (window.location.hash !== '#auth') {
          window.location.hash = '#auth';
        }
      }
    }

    return result;
  } catch (err) {
    return { ok: false, status: 0, data: { error: err.message } };
  }
}

async function _tryRefresh() {
  // Coalesce multiple concurrent refresh attempts into one
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      // Lazy import to avoid circular deps
      const { refreshAccessToken } = await import('../pages/auth.js');
      return await refreshAccessToken();
    } catch {
      return false;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}
