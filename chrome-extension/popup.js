const ZUNO_APP = 'https://zunoapp.onrender.com/app/';

document.addEventListener('DOMContentLoaded', async () => {
  const { zuno_token } = await chrome.storage.sync.get('zuno_token');
  const shareBtn = document.getElementById('share-btn');
  const connectDiv = document.getElementById('connect');
  const contentDiv = document.getElementById('content');

  if (!zuno_token) {
    contentDiv.style.display = 'none';
    connectDiv.style.display = 'block';
    const linkInput = document.getElementById('zuno-link');
    const copyBtn = document.getElementById('copy-btn');
    copyBtn.onclick = () => {
      linkInput.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1500);
    };
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const urlEl = document.getElementById('url');

  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    urlEl.textContent = url;
    shareBtn.disabled = false;
    shareBtn.onclick = async () => {
      shareBtn.disabled = true;
      shareBtn.textContent = 'Sharing...';
      const res = await chrome.runtime.sendMessage({ type: 'SHARE_URL', url });
      shareBtn.textContent = res?.ok ? 'Shared!' : 'Share this page';
      if (res?.ok) setTimeout(() => window.close(), 500);
      else shareBtn.disabled = false;
    };
  } else {
    urlEl.textContent = 'Cannot share this page';
    shareBtn.disabled = true;
  }
});
