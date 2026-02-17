# Zuno Mobile App (Capacitor)

Native Android and iOS wrapper for the Zuno HTML UI using Capacitor.

## Prerequisites

- **Node.js** (18+)
- **Android:** Android Studio (SDK & emulator), Java 17+ (bundled with Android Studio)
- **iOS:** macOS only — Xcode and CocoaPods (iOS build/run is not supported on Windows/Linux)

## Setup

```bash
npm install
npx cap sync android
npx cap sync ios
```

If the `ios` folder is missing (first time), add the platform first:

```bash
npx cap add ios
npx cap sync ios
```

## Dev vs prod URLs (Supabase / API)

**Android does not use build variants for API or Supabase URLs.** The URLs are **baked into the web bundle** when the UI is built (Vite). The contents of `mobile/www/` determine which environment the app uses:

| Build | Script | Supabase | API base |
|-------|--------|----------|----------|
| **Debug (dev)** | `./scripts/build-android-debug.sh` | **rvp** (`…rvp.supabase.co`) | `http://10.0.2.2:8000` |
| **Release (prod)** | `./scripts/build-android-release.sh` | **izx** (`…izx.supabase.co`) | `https://zunoapp.onrender.com` |

- **Debug APK** (package `com.zuno.app.dev`, name "Zuno Dev"): run **`./scripts/build-android-debug.sh`** from repo root. It resolves env for dev, builds the UI with `--mode development`, copies the bundle to `mobile/www/`, then syncs and runs `assembleDebug`. If you only run `npx cap sync android` and `./gradlew installDebug` without that script, `www/` may still contain a **production** bundle (izx), so the app will use prod.
- **Release APK** (package `com.zuno.app`, name "Zuno"): run **`./scripts/build-android-release.sh`** for prod URLs.

**Login (OAuth):** For the dev app to complete Google sign-in, add the dev redirect URL in your **dev** Supabase project: **Authentication → URL Configuration → Redirect URLs** → add `com.zuno.app.dev://callback`. Prod Supabase should have `com.zuno.app://callback`.

## Development

### Android

1. Start the backend on your machine:
   ```bash
   ./scripts/use-dev.sh
   ./scripts/start.sh dev backend
   ```

2. Either use the **bundled** dev APK (no live reload), or **live reload** from the Vite dev server:
   - **Bundled:** run `./scripts/build-android-debug.sh` from repo root, then open the app on the emulator.
   - **Live reload (emulator loads from your PC):** create `mobile/.use-dev-server` (e.g. `touch mobile/.use-dev-server`), run `cd ui && npm run dev` (Vite on `0.0.0.0:5173`), then `cd ../mobile && npx cap sync android && npx cap run android`. The app loads from `http://10.0.2.2:5173` (never localhost). Delete `.use-dev-server` when you want the bundled app again.

3. Or open the Android project in Android Studio and run from there:
   ```bash
   npx cap open android
   ```

The app defaults to `http://10.0.2.2:8000` as the API base (Android emulator’s alias for host `localhost:8000`).

### iOS

1. Start the backend on your Mac (same as above).

2. Build/copy the UI into `www/` (same flow as Android — e.g. run `../scripts/build-ui.sh` then copy from `backend/static/app/` into `mobile/www/`, or use `build-and-install-ios.sh` with UI build).

3. Sync and open in Xcode:
   ```bash
   npx cap sync ios
   npx cap open ios
   ```

4. Run in the iOS Simulator or on a device from Xcode.

- **Simulator:** The WebView can reach the host at `http://localhost:8000`. Set `window.ZUNO_API_BASE` or build-time `VITE_API_BASE` to `http://localhost:8000` for dev.
- **Physical device:** Use your Mac’s LAN IP (e.g. `http://192.168.1.x:8000`) so the phone can reach the backend; `window.ZUNO_API_BASE` or `VITE_API_BASE` controls this.

## Updating the HTML

When the built app (e.g. `backend/static/app/index.html` and assets) changes, copy it into `www/` and re-apply any path/API_BASE tweaks, then sync both platforms:

```bash
# After copying into www/ (see build-and-install.sh or build-and-install-ios.sh)
npx cap copy
# or sync both:
npx cap sync
# or per platform:
npx cap sync android
npx cap sync ios
```

For Android-only copy: `npx cap copy android`. For iOS: `npx cap copy ios`.

## Production

For a production build, either:

1. Set `server.url` in `capacitor.config.ts` to your deployed backend URL, or
2. Inject `window.ZUNO_API_BASE` before the app script runs.

**Android** — release APK:

From repo root (builds UI for prod, copies to `www/`, syncs, then assembles):

```bash
./scripts/build-android-release.sh
# or: npm run build:android:release
```

Or manually: `npx cap sync android` then `cd android && ./gradlew assembleRelease`.

The APK will be at `android/app/build/outputs/apk/release/`. Without signing it will be **unsigned** (`app-release-unsigned.apk`); Android will not install it until it is signed.

### Signing the release APK

To get a **signed** release APK (installable or for Play Store), use one of these:

**Option A — Environment variables (CI / scripts)**

1. Create a release keystore (once):
   ```bash
   keytool -genkey -v -keystore zuno-release.keystore -alias zuno -keyalg RSA -keysize 2048 -validity 10000
   ```
   Store the keystore somewhere safe (e.g. `mobile/android/app/` or a secrets path). **Do not commit it.**

2. Set these env vars before running `assembleRelease`:
   - `ZUNO_RELEASE_STORE_FILE` — path to the `.keystore` file (absolute or relative to `android/app/`)
   - `ZUNO_RELEASE_STORE_PASSWORD` — keystore password
   - `ZUNO_RELEASE_KEY_ALIAS` — key alias (e.g. `zuno`)
   - `ZUNO_RELEASE_KEY_PASSWORD` — key password

   Example (Windows, Git Bash):
   ```bash
   export ZUNO_RELEASE_STORE_FILE="app/zuno-release.keystore"
   export ZUNO_RELEASE_STORE_PASSWORD="your-keystore-password"
   export ZUNO_RELEASE_KEY_ALIAS="zuno"
   export ZUNO_RELEASE_KEY_PASSWORD="your-key-password"
   cd mobile/android && ./gradlew assembleRelease
   ```

**Option B — keystore.properties (local only)**

1. Create the keystore as above.
2. In `mobile/android/app/`, create `keystore.properties` (add this file to `.gitignore` — do not commit):
   ```properties
   storeFile=zuno-release.keystore
   storePassword=your-keystore-password
   keyAlias=zuno
   keyPassword=your-key-password
   ```
   Paths in `storeFile` are relative to `android/app/`.

3. Run `./gradlew assembleRelease` from `mobile/android/`. The release build will use this config and produce a signed APK.

**Output:** Signed APK at `android/app/build/outputs/apk/release/app-release.apk`. You can install it with `adb install app-release.apk` or distribute it.

**iOS** — same `server.url` or `ZUNO_API_BASE` approach; build and archive in Xcode (Product → Archive) for App Store or ad-hoc distribution.

### Share to Zuno (iOS)

To show "Share to Zuno" in the iOS Share sheet (share URLs, text, or images from Safari, etc.), add the Share Extension target in Xcode and enable App Groups. See [docs/IOS_SHARE_EXTENSION_SETUP.md](../docs/IOS_SHARE_EXTENSION_SETUP.md) for step-by-step instructions.

## Debugging Android (adb)

To see why "Failed to save to Zuno" or API errors occur, capture logs while reproducing the action:

```bash
# All app + Chromium console output (recommended)
adb logcat -s "chromium:I" "Console:I" "Capacitor:*" "com.zuno.app:*"

# Or broader: last 500 lines after you share a link
adb logcat -d -t 500 | grep -iE "zuno|api|fetch|error|failed|CORS|ShareHandler|Console"
```

The app logs `[API]` and `[ShareHandler]` errors to the WebView console; Chromium forwards them to logcat. Backend request logging: every request is logged as `METHOD /path origin=... -> status` (see `RequestLoggingMiddleware`). If no log appears for a request, the call never reached the server (wrong URL, CORS, or network).
