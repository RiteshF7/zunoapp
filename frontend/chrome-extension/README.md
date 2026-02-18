# Share to Zuno – Chrome Extension

Save any page or link to your Zuno library from Chrome. Shows a notification when shared — no redirect.

## Auth / Verification (simplest approach)

**You don’t need extra verification.** The extension reuses your existing web app auth:

1. **User proves identity on the web**  
   They log in to Zuno (e.g. Google OAuth) as they already do. The web app stores the access token (e.g. in `localStorage` as `zuno_token`).

2. **User explicitly hands the token to the extension**  
   In the app they go to Profile → **Connect Extension**. That opens the app with `#connect-extension`. The content script (which runs only on your app origin) reads the same token and sends it to the extension via `chrome.runtime.sendMessage`. The extension stores it in `chrome.storage.sync`.

3. **Backend verifies the same way as the web app**  
   When the extension saves a URL, it calls your API with `Authorization: Bearer <token>`. Your backend already validates that token (e.g. Supabase JWT) for the web app — use the same validation for the extension. No separate “extension auth” or new endpoint is required.

So: **auth verification = same as your web app.** One token, one validation path.

## Install (developer mode)

1. **Inject env (from root `.env`):** Run `./scripts/resolve-env.sh` from the repo root so the extension gets the correct app/API URLs for your current `ZUNO_MODE` (dev → localhost, prod → zunoapp.onrender.com).
2. Open Chrome and go to `chrome://extensions/`
3. Turn on **Developer mode** (top right)
4. Click **Load unpacked** and select the `chrome-extension` folder

## First-time setup: Connect

1. Log in to Zuno at [zunoapp.onrender.com/app](https://zunoapp.onrender.com/app/)
2. Go to **Profile** → **Connect Extension**
3. A new tab opens; the extension receives your token and shows "Extension connected!"
4. The tab closes automatically

## How to share

- **Right-click** page, link, or selected URL text → **Share to Zuno** → notification "Shared to Zuno!"
- **Click extension icon** → **Share this page** → notification "Shared to Zuno!"

When not connected, right-click opens the Zuno app so you can connect or save manually.

## Contexts

- **Page**: Right-click anywhere on a page → saves current page URL
- **Link**: Right-click on a link → saves the link URL
- **Selection**: Select text that contains a URL → Right-click → saves the URL

> The address bar is not a web page, so "Share to Zuno" does not appear when right-clicking there. Use the **extension icon** to share the current tab instead.

---

## How to test

### 1. Load the extension

1. Open Chrome → `chrome://extensions/`
2. Turn **Developer mode** on (top right)
3. Click **Load unpacked** and select the project’s `chrome-extension` folder  
   *(If you see icon errors, the extension still runs; add PNGs in `icons/` later if you want.)*

### 2. Run the web app (for connect + API)

- **Option A – Production:** Use [zunoapp.onrender.com/app](https://zunoapp.onrender.com/app/) (backend must be up).
- **Option B – Dev (separate Render or local):** Open your **dev** app in Chrome (e.g. your dev Render URL or `http://localhost:5173/app/`). When you connect (Profile → Connect Extension), the extension stores the **same API base your app uses** (from `VITE_API_BASE` / `getApiBase()`), so saves go to your dev backend. The extension is env-aware: connect from prod → prod API; connect from dev → dev API.
- **Option C – Local:** Run app and backend locally. The extension allows `http://localhost:*/` and `http://127.0.0.1:*/`.

### 3. Connect the extension (one-time)

1. Open your Zuno app (production or local) in Chrome.
2. Log in (e.g. Google).
3. Go to **Profile** → click **Connect Extension**.
4. A new tab opens with “Connecting extension…”.
5. You should see a Chrome notification: **“Extension connected!”** and the tab may close.
6. Click the extension icon in the toolbar; you should see “Share this page” and “Add a link” (not the “Copy link to connect” screen).

**If you updated the extension:** Reconnect once (Profile → Connect Extension) so it stores the correct API base and token.

### 4. Test sharing

| Test | Steps | Expected |
|------|--------|----------|
| **Popup – current page** | Open any normal webpage → click extension icon → **Share this page** | Notification “Shared to Zuno!”; item appears in Zuno app (e.g. Home / Library). |
| **Popup – add link** | Extension popup → paste a URL in “Add a link” → **Save link** | Same as above. |
| **Context menu – page** | Right-click anywhere on a webpage → **Share to Zuno** | Same. |
| **Context menu – link** | Right-click on a **link** (not the page) → **Share to Zuno** | Saves the **link URL**, not the page URL. |
| **Context menu – selection** | Select text that contains a URL → Right-click → **Share to Zuno** | Saves the extracted URL. |

### 5. Quick checks if something fails

- **“Please log in at Zuno…”**  
  Extension has no token. Open the Zuno app, log in, then **Profile → Connect Extension** (step 3 above).

- **“Save failed. Check your connection or log in again at Zuno.”**  
  - **Auth:** Token may be missing or expired. Reconnect: open the Zuno app (same URL you use to log in), go to **Profile → Connect Extension**, then try saving again.  
  - **Permissions:** In `chrome://extensions/` ensure the extension can access your API origin (e.g. `https://zunoapp.onrender.com`).  
  - **Network:** If you use a custom backend, its origin must be in `manifest.json` under `host_permissions` and the extension reloaded.

- **“Session expired. Connect again from Zuno (Profile → Connect Extension).”**  
  The saved token was rejected (401). Open the Zuno app, log in again if needed, then **Profile → Connect Extension** once more.

- **Connect tab opens but no “Extension connected!”**  
  Content script may not run. Confirm the tab URL matches the extension’s `content_scripts.matches` (e.g. `https://zunoapp.onrender.com/app/#connect-extension` or `http://localhost:PORT/app/#connect-extension`).

- **Debug:**  
  Right-click extension icon → **Inspect popup** for popup errors.  
  `chrome://extensions/` → your extension → **Service worker** (background) for API/connect issues.
