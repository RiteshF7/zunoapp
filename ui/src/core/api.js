// ═══════════════════════════════════════════════════════════════════════════
// API HELPER
// ═══════════════════════════════════════════════════════════════════════════

import { getApiBase } from './config.js';

let _refreshing = null; // single in-flight refresh promise

// Use /api/v1/ directly to avoid 307 redirect (browsers often drop Authorization on redirect → 401)
function _normalizePath(path) {
  if (path.startsWith('/api/') && !path.startsWith('/api/v1/')) {
    return '/api/v1' + path.slice(4);
  }
  return path;
}

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} ok - True if response status is 2xx
 * @property {number} status - HTTP status code (or 0 on network error)
 * @property {Object|string} data - Parsed JSON body or error message
 */

/**
 * Performs a single fetch to the backend. Path is normalized to /api/v1/.
 * @param {string} method - HTTP method (GET, POST, PATCH, PUT, DELETE)
 * @param {string} path - Path (e.g. /api/profile)
 * @param {Object|null} body - Request body for POST/PATCH/PUT/DELETE
 * @param {Object|null} params - Query params (key-value)
 * @returns {Promise<ApiResponse>}
 */
async function _doFetch(method, path, body, params) {
  const token = localStorage.getItem('zuno_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const normalizedPath = _normalizePath(path);
  const apiBase = getApiBase();
  let url = `${apiBase}${normalizedPath}`;
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

/**
 * Call the backend API. Uses getApiBase(), sends Bearer token, normalizes path to /api/v1/.
 * On 401, attempts one token refresh and retry; if still 401, clears tokens and redirects to #auth.
 * @param {string} method - HTTP method
 * @param {string} path - Path (e.g. /api/profile, /api/content)
 * @param {Object|null} [body=null] - Request body
 * @param {Object|null} [params=null] - Query params
 * @returns {Promise<ApiResponse>}
 */
export async function api(method, path, body = null, params = null) {
  if (typeof window.showProgress === 'function') window.showProgress();
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
        const currentHash = window.location.hash || '#';
        if (currentHash !== '#auth' && currentHash !== '#') {
          try { sessionStorage.setItem('zuno_intended_route', currentHash); } catch (_) {}
        }
        localStorage.removeItem('zuno_token');
        localStorage.removeItem('zuno_refresh_token');
        if (window.location.hash !== '#auth') {
          window.location.hash = '#auth';
        }
      }
    }

    return result;
  } catch (err) {
    const url = `${getApiBase()}${_normalizePath(path)}`;
    console.error('[API]', method, url, err.message);
    return { ok: false, status: 0, data: { error: err.message } };
  } finally {
    if (typeof window.hideProgress === 'function') window.hideProgress();
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
