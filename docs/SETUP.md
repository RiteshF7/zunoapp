# Zuno — Developer Setup

Steps to get the app running locally and deploy the backend. For full config reference see [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md). For production see [PRODUCTION.md](PRODUCTION.md).

---

## Table of Contents

1. [EAS Project ID & First Build (Mobile)](#1-eas-project-id--first-build-mobile)
2. [Deploy Backend](#2-deploy-backend)
3. [Production Build & App Store](#3-production-build--app-store)

---

## 1. EAS Project ID & First Build (Mobile)

*If your Expo app lives in `frontend/`, use that path instead of `mobile/` below.*

### 1.1 Login and Initialize EAS

```bash
cd mobile   # or frontend

npx eas login
npx eas init
```

After `eas init`, verify `mobile/app.json` (or `frontend/app.json`) has:

```json
"extra": {
  "eas": {
    "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

Replace `"your-eas-project-id"` manually if needed.

### 1.2 Development Build (required for Google OAuth on device)

Expo Go cannot handle the `zunoapp://` deep link, so OAuth needs a custom dev build.

**Android (APK):**

```bash
cd mobile
npx eas build --profile development --platform android
```

Install the APK on device/emulator (e.g. `adb install path/to/downloaded.apk` or drag onto emulator).

**iOS (macOS only):**

```bash
cd mobile
npx eas build --profile development --platform ios
```

Simulator builds use `"simulator": true` in the development profile.

### 1.3 Run with development build

```bash
cd mobile
npx expo start --dev-client
```

### 1.4 Test Google OAuth

1. Open app → login screen
2. Tap **Continue with Google**
3. Complete flow; redirect to `zunoapp://auth/callback`
4. App opens on Home tab; Profile shows Google name/avatar

*OAuth works on **Expo Web** (`npm run web`) without a dev build.*

---

## 2. Deploy Backend

Backend runs on `localhost:8000` by default. For devices on another network, deploy to a host. Example options:

### Option A: Railway

1. **Procfile** in `backend/`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. **runtime.txt** (optional): `python-3.11.x`
3. [railway.app](https://railway.app) → New Project → Deploy from GitHub → select repo
4. Set **Root Directory** to `backend`
5. **Variables:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `GEMINI_API_KEY` or Vertex env, `AI_PROVIDER`, `CORS_ORIGINS`, `PORT`
6. Settings → Networking → Generate Domain
7. Deploy

### Option B: Render

1. Same **Procfile** in `backend/`
2. [render.com](https://render.com) → New → Web Service → connect repo
3. **Root Directory:** `backend`, **Build:** `pip install -r requirements.txt`, **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add same env vars as above
5. Create Web Service → URL like `https://zuno-backend.onrender.com`

*Render free tier spins down after inactivity; first request after sleep can be slow.*

### Option C: Fly.io

```bash
# Install: https://fly.io/docs/hub/install/
cd backend
fly auth login
fly launch
# No DB when prompted
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_JWT_SECRET=... GEMINI_API_KEY=... AI_PROVIDER=gemini CORS_ORIGINS=...
fly deploy
```

### After deploy

1. **mobile/.env:** `EXPO_PUBLIC_BACKEND_URL=https://your-backend-url...`
2. **mobile/eas.json:** add `EXPO_PUBLIC_BACKEND_URL` to each build profile `env`
3. **Backend:** add your app/production origins to `CORS_ORIGINS`
4. **Verify:** `https://your-backend-url/health` → `{"status":"ok","service":"zuno-api"}`

---

## 3. Production Build & App Store

### 3.1 Build for stores

```bash
cd mobile

# Android (AAB for Google Play)
npx eas build --profile production --platform android

# iOS (App Store)
npx eas build --profile production --platform ios
```

### 3.2 Google Play

1. [play.google.com/console](https://play.google.com/console) — Google Play Developer account ($25 one-time)
2. Create app; set up API access / service account for EAS submit
3. Store listing: name, descriptions, screenshots, feature graphic, icon, privacy policy URL, category
4. Submit: `npx eas submit --profile production --platform android`

### 3.3 Apple App Store

1. [developer.apple.com/programs](https://developer.apple.com/programs) — Apple Developer Program ($99/year)
2. Create App ID (e.g. `com.zuno.app`); create app in App Store Connect
3. In `eas.json` submit config, set `appleId` for production iOS
4. Fill store listing; submit: `npx eas submit --profile production --platform ios`

### 3.4 Privacy policy

Both stores require a public privacy policy URL. Include: data collected, storage (Supabase), third parties (Google OAuth, AI providers, Supabase), user rights, contact.

---

## Summary

| Step | When |
|------|------|
| `eas init` + dev build | To test OAuth on real device |
| Deploy backend (Railway/Render/Fly) | Before sharing outside local network |
| Production build + store submit | When ready to publish |

*See [PRODUCTION.md](PRODUCTION.md) for full production runbook and [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md) for all config files.*
