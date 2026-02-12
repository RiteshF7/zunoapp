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

## Development

### Android

1. Start the backend on your machine:
   ```bash
   cd ../backend
   uvicorn app.main:app --reload --port 8000
   ```

2. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```

3. Run the app on an emulator or device from Android Studio.

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

```bash
npx cap sync android
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/`.

**iOS** — same `server.url` or `ZUNO_API_BASE` approach; build and archive in Xcode (Product → Archive) for App Store or ad-hoc distribution.

### Share to Zuno (iOS)

To show "Share to Zuno" in the iOS Share sheet (share URLs, text, or images from Safari, etc.), add the Share Extension target in Xcode and enable App Groups. See [docs/IOS_SHARE_EXTENSION_SETUP.md](../docs/IOS_SHARE_EXTENSION_SETUP.md) for step-by-step instructions.
