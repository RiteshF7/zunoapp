# Zuno App — Remaining Setup Steps

These are the only 3 things left to do. Everything else is fully configured.

---

## 1. EAS Project ID + First Build

### 1.1 Login and Initialize EAS

```bash
cd frontend

# Login to your Expo account (creates one if you don't have it)
npx eas login

# Initialize — this generates a project ID and updates app.json automatically
npx eas init
```

After `eas init`, verify `frontend/app.json` was updated:

```json
"extra": {
  "eas": {
    "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

If it still says `"your-eas-project-id"`, paste the ID manually from the terminal output.

### 1.2 Build a Development Client (Required for Google OAuth on Device)

Expo Go cannot handle the `zunoapp://` deep link scheme, so Google OAuth redirect will fail in Expo Go. You need a custom development build.

**Android (APK for testing):**

```bash
cd frontend
npx eas build --profile development --platform android
```

What happens:
1. EAS uploads your project to Expo's build servers
2. Build takes ~5-10 minutes
3. You get a download link for the APK
4. Download and install the APK on your Android device or emulator

**Install on Android Emulator:**

```bash
# If you have adb set up, install directly:
adb install path/to/downloaded.apk
```

Or drag-and-drop the APK onto the emulator window.

**iOS (macOS only):**

```bash
cd frontend
npx eas build --profile development --platform ios
```

For simulator builds, the `development` profile already has `"simulator": true` configured.

### 1.3 Run the App with the Development Build

After installing the development build on your device/emulator:

```bash
cd frontend
npx expo start --dev-client
```

This starts Metro bundler in development client mode. Your custom build will connect to it automatically.

### 1.4 Test Google OAuth

1. Open the app — you should see the login screen (auth enforcement is active)
2. Tap **"Continue with Google"**
3. A browser opens with Google's login page
4. After signing in, it redirects to `zunoapp://auth/callback`
5. The app should open and land on the Home tab
6. Check the Profile tab — should show your Google name/avatar

> **Note:** OAuth already works on **Expo Web** (`npm run web`) without a dev build. Use that for quick testing.

---

## 2. Deploy Backend to Production

The Python backend currently runs on `localhost:8000`. Real devices on a different network can't reach it. Here are step-by-step instructions for the easiest options.

### Option A: Railway (Recommended — Easiest)

**Step 1: Prepare a `Procfile`**

Create `backend/Procfile`:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Step 2: Prepare a `runtime.txt`** (optional, specifies Python version)

Create `backend/runtime.txt`:

```
python-3.11.x
```

**Step 3: Deploy**

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project" → "Deploy from GitHub Repo"**
3. Select your `zunoapp` repo
4. Railway auto-detects the project. Set the **Root Directory** to `backend`
5. Go to the service's **Variables** tab and add:

   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | `https://tikdbvwxzkzamrancxms.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(your service role key)* |
   | `SUPABASE_JWT_SECRET` | *(your JWT secret)* |
   | `GEMINI_API_KEY` | *(your Gemini key)* |
   | `AI_PROVIDER` | `gemini` |
   | `CORS_ORIGINS` | `http://localhost:8081,https://zunoapp.expo.dev` |
   | `PORT` | `8000` |

6. Go to **Settings → Networking → Generate Domain** to get a public URL (e.g., `https://zunoapp-backend-production.up.railway.app`)
7. Click **Deploy**

### Option B: Render (Free Tier Available)

**Step 1: Same `Procfile` as above** (create `backend/Procfile`)

**Step 2: Deploy**

1. Go to [https://render.com](https://render.com) and sign in with GitHub
2. Click **"New" → "Web Service"**
3. Connect your `zunoapp` repo
4. Configure:
   - **Name:** `zuno-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add the same environment variables as Option A
6. Click **"Create Web Service"**
7. You'll get a URL like `https://zuno-backend.onrender.com`

> **Note:** Render's free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Paid plan ($7/mo) keeps it always on.

### Option C: Fly.io

**Step 1: Install Fly CLI**

```bash
# Windows (PowerShell):
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Or via npm:
npm install -g flyctl
```

**Step 2: Login and Launch**

```bash
cd backend
fly auth login
fly launch
```

Follow the prompts:
- App name: `zuno-backend`
- Region: pick one close to you
- When asked about a database, say **No**

**Step 3: Set Secrets**

```bash
fly secrets set SUPABASE_URL=https://tikdbvwxzkzamrancxms.supabase.co
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
fly secrets set SUPABASE_JWT_SECRET=your-secret
fly secrets set GEMINI_API_KEY=your-gemini-key
fly secrets set AI_PROVIDER=gemini
fly secrets set CORS_ORIGINS=http://localhost:8081
```

**Step 4: Deploy**

```bash
fly deploy
```

You'll get a URL like `https://zuno-backend.fly.dev`

### After Deploying (All Options)

Once you have your production backend URL:

**1. Update `frontend/.env`:**

```env
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.up.railway.app
```

**2. Update `frontend/eas.json`** — add `EXPO_PUBLIC_BACKEND_URL` to each build profile:

```json
"env": {
  "EXPO_PUBLIC_SUPABASE_URL": "https://tikdbvwxzkzamrancxms.supabase.co",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbG...",
  "EXPO_PUBLIC_BACKEND_URL": "https://your-backend-url.up.railway.app"
}
```

**3. Update `CORS_ORIGINS` on your deployed backend** to allow requests from your app's production domain.

**4. Verify:** Open `https://your-backend-url/health` in a browser — should return:

```json
{"status": "ok", "service": "zuno-api"}
```

---

## 3. Production Build & App Store Submission

### 3.1 Build for Production

```bash
cd frontend

# Android (AAB for Google Play):
npx eas build --profile production --platform android

# iOS (for App Store):
npx eas build --profile production --platform ios
```

### 3.2 Google Play Store

1. Create a **Google Play Developer account** ($25 one-time fee) at [https://play.google.com/console](https://play.google.com/console)
2. Create a **new app** in the Play Console
3. Set up a **service account** for automated uploads:
   - Play Console → Setup → API access → Create service account
   - In Google Cloud Console, create a key for the service account (JSON format)
   - Download it and save as `frontend/google-services.json` (already in `.gitignore`)
   - Back in Play Console, grant the service account **"Release manager"** permissions
4. Fill in the store listing:
   - App name, short description, full description
   - Screenshots (phone + tablet)
   - Feature graphic (1024x500)
   - App icon (512x512)
   - Privacy policy URL (required)
   - App category
5. Submit:

```bash
npx eas submit --profile production --platform android
```

### 3.3 Apple App Store

1. Enroll in **Apple Developer Program** ($99/year) at [https://developer.apple.com/programs](https://developer.apple.com/programs)
2. Create an **App ID** in the Apple Developer portal:
   - Certificates, Identifiers & Profiles → Identifiers → + → App IDs
   - Bundle ID: `com.zuno.app`
3. Create the app in **App Store Connect** ([https://appstoreconnect.apple.com](https://appstoreconnect.apple.com)):
   - My Apps → + → New App
   - Bundle ID: select `com.zuno.app`
4. Update `frontend/eas.json`:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-real-apple-id@email.com"
    }
  }
}
```

5. Fill in the store listing (similar to Google Play)
6. Submit:

```bash
npx eas submit --profile production --platform ios
```

### 3.4 Privacy Policy (Required by Both Stores)

Both Google Play and Apple require a public privacy policy URL. Quick options:

- **Free hosted page:** Create a page on [Notion](https://notion.so) and share it publicly
- **GitHub Pages:** Add a `privacy-policy.md` to a public repo and enable Pages
- **Your own domain:** Host a simple HTML page

Must cover:
- What data you collect (Google account info, saved URLs, AI-generated categories)
- How data is stored (Supabase cloud database)
- Third-party services used (Google OAuth, OpenAI/Gemini, Supabase)
- User rights (data deletion, account deletion)
- Contact email

---

## Summary

| # | Step | When |
|---|---|---|
| 1 | `eas init` + build development client | Now — needed to test OAuth on real device |
| 2 | Deploy backend (Railway/Render/Fly.io) | Before sharing app with anyone outside your local network |
| 3 | Production build + store submission | When ready to publish |
