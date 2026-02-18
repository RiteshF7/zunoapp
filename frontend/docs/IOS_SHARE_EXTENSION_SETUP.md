# iOS Share Extension — "Share to Zuno" Setup

Add the Share Extension target in Xcode so "Share to Zuno" appears in the iOS Share sheet.

## What's already done

- Share Extension code: `mobile/ios/ShareToZunoExtension/`
- Main app syncs token and API base to App Group

## Steps (macOS, Xcode)

1. `cd mobile && npx cap open ios`
2. File → New → Target → Share Extension, name `ShareToZunoExtension`
3. Replace template with files from `mobile/ios/ShareToZunoExtension/`
4. Add App Group `group.com.zuno.app` to both App and ShareToZunoExtension targets
5. Add Social.framework to ShareToZunoExtension

## API base

Extension reads API base from App Group (synced by main app). Run backend on port 8000; for device use LAN IP or production URL.
