// Runs on Zuno app - sends token to extension when user connects
(function () {
  const hash = window.location.hash || '';
  if (hash.indexOf('connect-extension') === -1) return;

  const token = localStorage.getItem('zuno_token');
  if (token) {
    chrome.runtime.sendMessage({ type: 'ZUNO_TOKEN', token });
  }
})();
