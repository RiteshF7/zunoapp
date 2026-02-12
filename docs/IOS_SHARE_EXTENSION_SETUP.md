# iOS Share Extension — "Share to Zuno" Setup

This doc describes how to add the **Share Extension** target in Xcode so "Share to Zuno" appears in the iOS Share sheet. The extension code and config are already in the repo; you only need to add the target and enable App Groups.

## What’s already done

- **Share Extension code:** `mobile/ios/ShareToZunoExtension/`
  - `ShareViewController.swift` — receives URL/text/image, reads token from App Group, POSTs to backend, triggers AI processing
  - `Info.plist` — NSExtensionPrincipalClass, activation rule for URL, text, image
  - `ShareToZunoExtension.entitlements` — App Group `group.com.zuno.app`
- **Main app:** `ZunoAuthSyncPlugin` syncs token and API base to App Group; `App.entitlements` adds the same App Group. The web app calls the plugin on load and after login (iOS only).

## Steps (on macOS, in Xcode)

### 1. Open the iOS project

```bash
cd mobile
npx cap open ios
```

### 2. Add the Share Extension target

1. In Xcode: **File → New → Target…**
2. Choose **iOS → Share Extension**, click **Next**.
3. **Product Name:** `ShareToZunoExtension`
4. **Language:** Swift  
5. Uncheck **Include UI Extension** if you only want the share extension.
6. Click **Finish**. If Xcode asks to activate the new scheme, click **Cancel** (we’ll use the existing files).

### 3. Replace the template with our extension

1. In the Project Navigator, **delete** the group and files Xcode created for `ShareToZunoExtension` (e.g. `ShareViewController.swift`, `Info.plist`, `MainInterface.storyboard`), choosing **Move to Trash**.
2. **Right‑click** the `ShareToZunoExtension` group (or the `App` group) → **Add Files to "App"…**
3. Navigate to `mobile/ios/ShareToZunoExtension/` and select:
   - `ShareViewController.swift`
   - `Info.plist`
   - `ShareToZunoExtension.entitlements`
4. Ensure **Copy items if needed** is unchecked and **Add to targets: ShareToZunoExtension** is checked. Click **Add**.
5. If `Info.plist` was not set as the extension’s plist: select the **ShareToZunoExtension** target → **Build Settings** → search **Info.plist** → set **Info.plist File** to `ShareToZunoExtension/Info.plist` (or the path that matches your group).
6. In **Build Settings** for **ShareToZunoExtension**, set **Code Signing Entitlements** to `ShareToZunoExtension/ShareToZunoExtension.entitlements`.

### 4. App Group for main app and extension

1. Select the **App** target → **Signing & Capabilities** → **+ Capability** → **App Groups** → add `group.com.zuno.app` (or double‑check that `App.entitlements` already has it and the capability is present).
2. Select the **ShareToZunoExtension** target → **Signing & Capabilities** → **+ Capability** → **App Groups** → add the same `group.com.zuno.app`.

### 5. Link Social framework (Share Extension)

1. Select the **ShareToZunoExtension** target → **Build Phases** → **Link Binary With Libraries** → **+** → add **Social.framework**.

### 6. Build and run

1. Build the **App** target and run on a simulator or device.
2. Log in once in the app so the token is synced to the App Group.
3. Open Safari (or any app that supports Share), tap **Share**, and confirm **Zuno** / **Share to Zuno** appears. Share a URL or text and confirm it is saved.

## API base for the extension

- The extension reads **API base** from the same App Group (synced by the main app when you open it).
- **Simulator:** Default is `http://localhost:8000`; run the backend on your Mac.
- **Device:** The main app should use your Mac’s LAN IP (e.g. `http://192.168.1.x:8000`) or your production API; the extension will then use that same base.

## Troubleshooting

- **"Please log in to Zuno first"** — Open the main Zuno app and log in once so the token is written to the App Group.
- **Zuno not in Share sheet** — Ensure the Share Extension target is included in the scheme (Edit Scheme → Run → Build → check ShareToZunoExtension).
- **Build error: Social.framework** — Add **Social.framework** to the ShareToZunoExtension target (step 5).
- **Build error: CAPBridgeViewController / ZunoAuthSyncPlugin** — The App target must link the Capacitor runtime (CapApp-SPM). If you see “No such module Capacitor” in the App target, add the **Capacitor** package (same as CapApp-SPM, e.g. capacitor-swift-pm 8.1.0) to the App target’s **Frameworks**.
