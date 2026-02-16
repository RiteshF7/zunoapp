// Runs on Zuno app - sends token and env-aware API base to extension when user connects.
// Waits for the app to set window.ZUNO_API_BASE (getApiBase() in router) so dev vs prod is correct.
(function () {
  const hash = window.location.hash || '';
  if (hash.indexOf('connect-extension') === -1) return;

  function sendTokenAndApiBase() {
    const token = localStorage.getItem('zuno_token');
    if (!token) return;

    // Prefer app-set API base (dev vs prod); fallback to origin then prod default
    const apiBase = (typeof window !== 'undefined' && (window.ZUNO_API_BASE || window.location?.origin)) || 'https://zunoapp.onrender.com';
    chrome.runtime.sendMessage({ type: 'ZUNO_TOKEN', token, apiBase: String(apiBase).replace(/\/?$/, '') });
  }

  // App sets window.ZUNO_API_BASE when router renders connect-extension (getApiBase() is env-aware).
  // Content script runs at document_end (before app boot), so wait for app to run.
  setTimeout(sendTokenAndApiBase, 600);
})();
