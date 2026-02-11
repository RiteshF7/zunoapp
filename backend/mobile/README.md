# Zuno Mobile App (Capacitor)

Native Android wrapper for the Zuno HTML UI using Capacitor.

## Prerequisites

- **Node.js** (18+)
- **Android Studio** (for SDK & emulator)
- **Java 17+** (bundled with Android Studio)

## Setup

```bash
npm install
npx cap sync android
```

## Development

1. Start the backend on your machine:
   ```bash
   cd ../  # backend folder
   uvicorn app.main:app --reload --port 8000
   ```

2. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```

3. Run the app on an emulator or device from Android Studio.

The app defaults to `http://10.0.2.2:8000` as the API base, which is the
Android emulator's alias for the host machine's `localhost:8000`.

## Updating the HTML

When `static/index.html` changes, copy it into `www/` and re-apply the
API_BASE tweak:

```bash
cp ../static/index.html www/index.html
# Edit www/index.html line 105:
#   const API_BASE = window.ZUNO_API_BASE || 'http://10.0.2.2:8000';
npx cap copy android
```

## Production

For a production build, either:

1. Set `server.url` in `capacitor.config.ts` to your deployed backend URL, or
2. Inject `window.ZUNO_API_BASE` before the app script runs.

Then build a release APK:

```bash
npx cap sync android
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/`.
