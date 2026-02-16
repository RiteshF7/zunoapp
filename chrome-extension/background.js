// Default Zuno URLs (replaced by resolve_env.py from root .env; fallback = prod)
const DEFAULT_ZUNO_APP = 'http://localhost:5173/app/';
const DEFAULT_API_BASE = 'http://localhost:8000';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'share-to-zuno',
    title: 'Share to Zuno',
    contexts: ['page', 'link', 'selection'],
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ZUNO_TOKEN' && msg.token) {
    const toStore = { zuno_token: msg.token };
    if (msg.apiBase && typeof msg.apiBase === 'string') {
      toStore.zuno_api_base = msg.apiBase.replace(/\/?$/, '');
    }
    chrome.storage.sync.set(toStore).then(() => {
      showNotification('Extension connected!');
      if (sender.tab?.id) chrome.tabs.remove(sender.tab.id);
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === 'SHARE_URL' && msg.url) {
    shareUrl(msg.url)
      .then((done) => { sendResponse({ ok: !!done }); })
      .catch(() => { sendResponse({ ok: false }); });
    return true;
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const urlToShare = getUrlFromContext(info);
  await shareUrl(urlToShare);
});

async function shareUrl(urlToShare) {
  const { apiBase, token } = await getConfig();

  if (!urlToShare) {
    showNotification('This page cannot be shared. Try a normal webpage or link.');
    return false;
  }

  if (!token) {
    showNotification('Please log in at Zuno to save from this device.');
    return false;
  }

  const result = await saveViaApi(apiBase, token, urlToShare);
  if (result.ok) {
    showNotification('Shared to Zuno!');
    return true;
  }
  if (result.unauthorized) {
    await chrome.storage.sync.remove('zuno_token');
    showNotification('Session expired. Connect again from Zuno (Profile → Connect Extension).');
    return false;
  }
  const msg = result.detail
    ? 'Save failed: ' + (result.detail.length > 80 ? result.detail.slice(0, 77) + '...' : result.detail)
    : 'Save failed. Check your connection or log in again at Zuno.';
  showNotification(msg);
  return false;
}

function getUrlFromContext(info) {
  if (info.linkUrl) return info.linkUrl;
  if (info.pageUrl) return info.pageUrl;
  if (info.selectionText) {
    const m = info.selectionText.match(/https?:\/\/[^\s)<>"]+/i);
    return m ? m[0] : '';
  }
  return '';
}

async function saveViaApi(apiBase, token, url) {
  const urlToCall = (apiBase.replace(/\/?$/, '') + '/api/v1/content');
  try {
    const res = await fetch(urlToCall, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ url }),
    });
    if (res.status === 401) {
      return { ok: false, unauthorized: true };
    }
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      /* non-JSON response */
    }
    if (!res.ok) {
      let detail = (data && (data.detail || data.error || data.message)) || ('HTTP ' + res.status);
      if (Array.isArray(detail)) detail = detail[0]?.msg || detail[0] || JSON.stringify(detail);
      return { ok: false, unauthorized: false, detail: String(detail) };
    }
    if (data?.id) {
      fetch(apiBase.replace(/\/?$/, '') + '/api/v1/ai/process-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ content_id: data.id }),
      }).catch(() => {});
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, unauthorized: false, detail: (err && err.message) || 'Network error' };
  }
}

function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Zuno',
    message,
  });
}

async function getConfig() {
  const stored = await chrome.storage.sync.get(['zuno_token', 'zuno_api_base', 'zuno_app_url']);
  return {
    token: stored.zuno_token || null,
    apiBase: stored.zuno_api_base || DEFAULT_API_BASE,
    zunoApp: stored.zuno_app_url || DEFAULT_ZUNO_APP,
  };
}

async function getZunoAppUrl() {
  const { zunoApp } = await getConfig();
  return zunoApp.endsWith('/') ? zunoApp : zunoApp + '/';
}

