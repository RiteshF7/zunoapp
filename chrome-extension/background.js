// Default Zuno URLs
const DEFAULT_ZUNO_APP = 'https://zunoapp.onrender.com/app/';
const DEFAULT_API_BASE = 'https://zunoapp.onrender.com';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'share-to-zuno',
    title: 'Share to Zuno',
    contexts: ['page', 'link', 'selection'],
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ZUNO_TOKEN' && msg.token) {
    chrome.storage.sync.set({ zuno_token: msg.token }).then(() => {
      showNotification('Extension connected!');
      if (sender.tab?.id) chrome.tabs.remove(sender.tab.id);
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === 'SHARE_URL' && msg.url) {
    shareUrl(msg.url).then((done) => {
      sendResponse({ ok: !!done });
    });
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

  const ok = await saveViaApi(apiBase, token, urlToShare);
  if (ok) {
    showNotification('Shared to Zuno!');
    return true;
  }

  showNotification('Save failed. Check your connection or log in again at Zuno.');
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
  try {
    const res = await fetch(apiBase + '/api/v1/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.id) {
      fetch(apiBase + '/api/v1/ai/process-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ content_id: data.id }),
      }).catch(() => {});
    }
    return true;
  } catch {
    return false;
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

