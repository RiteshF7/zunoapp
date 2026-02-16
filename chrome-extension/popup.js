const DEFAULT_ZUNO_APP = 'https://zunoapp.onrender.com/app/';
const RESET_BUTTON_MS = 1800;

function shareUrlFireAndForget(url, onReset) {
  chrome.runtime.sendMessage({ type: 'SHARE_URL', url }, (res) => {
    if (chrome.runtime.lastError) return;
    if (res?.ok && typeof onReset.closePopup === 'function') onReset.closePopup();
  });
  setTimeout(() => {
    if (typeof onReset.resetButton === 'function') onReset.resetButton();
  }, RESET_BUTTON_MS);
}

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
    const { zuno_app_url } = await chrome.storage.sync.get('zuno_app_url');
    const base = (zuno_app_url || DEFAULT_ZUNO_APP).replace(/\/?$/, '/');
    linkInput.value = base + '#connect-extension';
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(linkInput.value);
        copyBtn.textContent = 'Copied!';
      } catch {
        linkInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
      }
      setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1500);
    };
    return;
  }

  const addLinkUrl = document.getElementById('add-link-url');
  const addLinkBtn = document.getElementById('add-link-btn');
  const addLinkError = document.getElementById('add-link-error');

  function showAddLinkError(msg) {
    addLinkError.textContent = msg;
    addLinkError.style.display = 'block';
    setTimeout(() => {
      addLinkError.textContent = '';
      addLinkError.style.display = 'none';
    }, 3000);
  }

  addLinkBtn.onclick = () => {
    const trimmedUrl = (addLinkUrl.value || '').trim();
    if (!trimmedUrl || (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))) {
      showAddLinkError('Enter a valid URL');
      return;
    }
    addLinkError.style.display = 'none';
    addLinkBtn.disabled = true;
    addLinkBtn.textContent = 'Saving...';
    shareUrlFireAndForget(trimmedUrl, {
      resetButton: () => {
        addLinkBtn.textContent = 'Save link';
        addLinkBtn.disabled = false;
      },
      closePopup: () => setTimeout(() => window.close(), 500),
    });
  };

  addLinkUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLinkBtn.click();
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const urlEl = document.getElementById('url');

  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    urlEl.textContent = url;
    shareBtn.disabled = false;
    shareBtn.onclick = () => {
      shareBtn.disabled = true;
      shareBtn.textContent = 'Sharing...';
      shareUrlFireAndForget(url, {
        resetButton: () => {
          shareBtn.textContent = 'Share this page';
          shareBtn.disabled = false;
        },
        closePopup: () => setTimeout(() => window.close(), 500),
      });
    };
  } else {
    urlEl.textContent = 'Cannot share this page';
    shareBtn.disabled = true;
  }
});
