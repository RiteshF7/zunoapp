# Zuno App — Configuration Reference

This document covers **every configuration file** in the project, what it does, and how to modify it. Use this as a single source of truth when setting up the project from scratch or troubleshooting config issues.

---

## Table of Contents

1. [Environment Variables (`.env`)](#1-environment-variables-env)
2. [App Manifest (`app.json`)](#2-app-manifest-appjson)
3. [TypeScript (`tsconfig.json`)](#3-typescript-tsconfigjson)
4. [Tailwind CSS (`tailwind.config.js`)](#4-tailwind-css-tailwindconfigjs)
5. [NativeWind / Global CSS (`global.css`)](#5-nativewind--global-css-globalcss)
6. [Metro Bundler (`metro.config.js`)](#6-metro-bundler-metroconfigjs)
7. [Babel (`babel.config.js`)](#7-babel-babelconfigjs)
8. [NativeWind Type Declarations (`nativewind-env.d.ts`)](#8-nativewind-type-declarations-nativewind-envdts)
9. [Package Manager (`package.json`)](#9-package-manager-packagejson)
10. [EAS Build (`eas.json`)](#10-eas-build-easjson)
11. [Supabase Local Config (`supabase/config.toml`)](#11-supabase-local-config-supabaseconfigtoml)
12. [Supabase Migrations (`supabase/migrations/`)](#12-supabase-migrations-supabasemigrations)
13. [Supabase Seed Data (`supabase/seed.sql`)](#13-supabase-seed-data-subaseseedsql)
14. [Supabase Edge Functions (`supabase/functions/`)](#14-supabase-edge-functions-supabasefunctions)
15. [Git Ignore (`.gitignore`)](#15-git-ignore-gitignore)
16. [Design Tokens (`lib/constants.ts`)](#16-design-tokens-libconstantsts)
17. [Utility Functions (`lib/utils.ts`)](#17-utility-functions-libutilsts)
18. [Supabase Client (`lib/supabase.ts`)](#18-supabase-client-libsupabasetsxxx)
19. [AI Provider Types (`lib/ai/provider.ts`)](#19-ai-provider-types-libaiproviderts)

---

## 1. Environment Variables (`.env`)

**File:** `.env` (git-ignored — never commit this)

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Required Variables

| Variable | Description | Where to find |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project REST URL | Supabase Dashboard → Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key | Supabase Dashboard → Settings → API |

### Notes
- The `EXPO_PUBLIC_` prefix makes these accessible at build time in Expo.
- For EAS builds, these are also duplicated in `eas.json` per build profile.
- The Supabase Edge Functions use separate env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`) set in the Supabase dashboard under Functions → Secrets.

---

## 2. App Manifest (`app.json`)

**File:** `app.json`

Controls the Expo build system and native app configuration.

### Key Fields

| Field | Value | Purpose |
|---|---|---|
| `name` | `"Zuno"` | Display name on home screen |
| `slug` | `"zunoapp"` | Unique slug for Expo (used in OTA updates) |
| `version` | `"1.0.0"` | Semantic version shown in app stores |
| `scheme` | `"zunoapp"` | Deep link URL scheme (`zunoapp://`) |
| `icon` | `"./assets/icon.png"` | 1024×1024 app icon |
| `splash.image` | `"./assets/splash-icon.png"` | Splash screen image |
| `splash.backgroundColor` | `"#F8FAFC"` | Splash bg (matches `background-light`) |

### iOS-Specific

| Field | Purpose |
|---|---|
| `bundleIdentifier` | `com.zuno.app` — unique iOS identifier |
| `infoPlist.NSPhotoLibraryUsageDescription` | Photo library permission string |
| `infoPlist.CFBundleURLTypes` | Registers `zunoapp://` URL scheme |

### Android-Specific

| Field | Purpose |
|---|---|
| `package` | `com.zuno.app` — unique Android package name |
| `adaptiveIcon.foregroundImage` | Adaptive icon foreground layer |
| `intentFilters` | Registers the app as a share target for `text/plain` |

### Plugins

| Plugin | Purpose |
|---|---|
| `expo-router` | File-system based routing |
| `expo-font` | Custom font loading |
| `expo-secure-store` | Encrypted storage for auth tokens |
| `expo-web-browser` | In-app browser for OAuth flows |

### EAS

```json
"extra": {
  "eas": {
    "projectId": "your-eas-project-id"
  }
}
```

Replace `"your-eas-project-id"` with the ID from `eas init` after running `eas login`.

---

## 3. TypeScript (`tsconfig.json`)

**File:** `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "nativewind-env.d.ts"],
  "exclude": ["node_modules", "supabase/functions"]
}
```

### Key Points
- **`strict: true`** — Enables strict type checking.
- **`@/*` path alias** — Maps `@/components/...` to `./components/...` from project root. This must match the `babel.config.js` resolver and Metro config.
- **Excludes `supabase/functions`** — Edge Functions use Deno, not Node TypeScript, so they're excluded from the main TS project.
- **`nativewind-env.d.ts`** — Must be included for NativeWind className type support on RN components.

---

## 4. Tailwind CSS (`tailwind.config.js`)

**File:** `tailwind.config.js`

### Custom Design Tokens

```javascript
colors: {
  primary: "#E2E8F0",
  "background-light": "#F8FAFC",
  "background-dark": "#1A1C1E",
  "card-dark": "#2D2F31",
  "accent-blue": "#4D96FF",
}
```

| Token | Usage |
|---|---|
| `background-light` | Light mode page background |
| `background-dark` | Dark mode page background |
| `card-dark` | Dark mode card/surface background |
| `accent-blue` | Primary action color, links, highlights |
| `primary` | Subtle borders/surfaces |

### Border Radius

```javascript
borderRadius: {
  DEFAULT: "20px",   // rounded-DEFAULT
  xl: "24px",        // rounded-xl
  "2xl": "32px",     // rounded-2xl
}
```

### Dark Mode
- Uses **`class`** strategy (not `media`), so dark mode is toggled by adding/removing the `dark` class on a parent element.
- Controlled by `useThemeStore` → sets class on root `<View>` in `app/_layout.tsx`.

### NativeWind Preset
- `presets: [require("nativewind/preset")]` is required for NativeWind v4 to work.

### Content Paths
```javascript
content: [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
]
```
All files in `app/` and `components/` are scanned for Tailwind class names.

---

## 5. NativeWind / Global CSS (`global.css`)

**File:** `global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

This is the entry point for Tailwind's CSS processing via NativeWind. It's referenced by Metro config.

---

## 6. Metro Bundler (`metro.config.js`)

**File:** `metro.config.js`

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

### Key Points
- `withNativeWind` wraps the default Metro config to enable CSS processing.
- `input: "./global.css"` tells NativeWind where the Tailwind entry CSS file is.

---

## 7. Babel (`babel.config.js`)

**File:** `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### Key Points
- `jsxImportSource: "nativewind"` enables the `className` prop on React Native components.
- `"nativewind/babel"` preset handles the CSS-to-StyleSheet transformation.
- `api.cache(true)` caches the config for faster builds.

---

## 8. NativeWind Type Declarations (`nativewind-env.d.ts`)

**File:** `nativewind-env.d.ts`

```typescript
/// <reference types="nativewind/types" />
```

Provides TypeScript type support for `className` on React Native core components (`View`, `Text`, `Pressable`, etc.).

---

## 9. Package Manager (`package.json`)

**File:** `package.json`

### Key Scripts

| Script | Command | Purpose |
|---|---|---|
| `start` | `expo start` | Start the Metro dev server |
| `android` | `expo start --android` | Start with Android target |
| `ios` | `expo start --ios` | Start with iOS target |
| `web` | `expo start --web` | Start with web target |

### Core Dependencies

| Package | Purpose |
|---|---|
| `expo` ~54.x | Framework |
| `expo-router` ~6.x | File-system routing |
| `react` 19.1.0 | UI library |
| `react-native` 0.81.x | Native runtime |
| `nativewind` ^4.2 | Tailwind CSS for RN |
| `tailwindcss` ^3.4 | CSS utility framework |
| `zustand` ^5.0 | State management |
| `@supabase/supabase-js` ^2.95 | Supabase client |
| `@tanstack/react-query` ^5.90 | Data fetching/caching |
| `@tanstack/react-query-persist-client` ^5.90 | Offline query persistence |
| `@tanstack/query-async-storage-persister` ^5.90 | AsyncStorage adapter for persistence |
| `expo-image` ^3.0 | Optimized image component with caching |
| `expo-secure-store` ~15.0 | Encrypted storage (auth tokens) |
| `expo-web-browser` ~15.0 | In-app browser (OAuth) |
| `expo-linear-gradient` ~15.0 | Gradient effects |
| `expo-blur` ~15.0 | Blur effects (headers) |
| `react-native-reanimated` ~4.1 | Animations |
| `react-native-gesture-handler` ~2.28 | Gesture support |
| `react-native-screens` ~4.16 | Native screen containers |
| `react-native-safe-area-context` ~5.6 | Safe area handling |
| `@react-native-async-storage/async-storage` 2.2.0 | Persistent key-value storage |
| `react-native-url-polyfill` ^3.0 | URL API polyfill (Supabase needs it) |
| `lucide-react-native` ^0.563 | Icon library |
| `class-variance-authority` ^0.7 | Component variant utility |
| `clsx` ^2.1 | Conditional classNames |
| `tailwind-merge` ^3.4 | Merge conflicting Tailwind classes |
| `@expo-google-fonts/inter` ^0.4 | Inter font family |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `@types/react` ~19.1 | React type definitions |
| `typescript` ~5.9 | TypeScript compiler |

### Entry Point
```json
"main": "expo-router/entry"
```
This tells Metro to use Expo Router's entry point instead of the default `index.js`.

---

## 10. EAS Build (`eas.json`)

**File:** `eas.json`

### Build Profiles

| Profile | Distribution | Android | iOS | Use Case |
|---|---|---|---|---|
| `development` | Internal | APK | Simulator | Local dev with dev client |
| `preview` | Internal | APK | — | Internal team testing |
| `production` | App stores | AAB | Default | Store release |

### Environment Variables
Each profile includes `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Replace the placeholder `"your-anon-key"` with your actual anon key.

### Setup Steps
1. `npm install -g eas-cli`
2. `eas login`
3. `eas init` (generates the `projectId`)
4. Update `app.json` → `extra.eas.projectId`
5. Update `eas.json` → `EXPO_PUBLIC_SUPABASE_ANON_KEY` in each profile
6. Build: `eas build --profile development --platform android`

---

## 11. Supabase Local Config (`supabase/config.toml`)

**File:** `supabase/config.toml`

This configures the local Supabase development environment (via `supabase start`).

### Key Sections

| Section | Purpose | Notes |
|---|---|---|
| `[api]` | REST API config | Port 54321, public + graphql schemas |
| `[db]` | PostgreSQL | Port 54322, Postgres 17 |
| `[auth]` | Auth settings | JWT expiry 3600s, signup enabled |
| `[auth.email]` | Email auth | OTP length 6, 1hr expiry |
| `[auth.sms]` | SMS auth | Twilio integration (disabled by default) |
| `[auth.external.apple]` | Apple OAuth | Disabled by default |
| `[storage]` | File storage | 50MiB limit |
| `[edge_runtime]` | Edge Functions | Deno v2, `per_worker` hot reload |
| `[analytics]` | Analytics backend | Postgres backend |

### Edge Functions Registered

| Function | JWT Verify | Description |
|---|---|---|
| `process-content` | Yes | AI content processing (categorize, summarize, tag) |
| `generate-embedding` | Yes | Generate vector embeddings for search queries |
| `generate-feed` | Yes | Personalized feed generation |

### Auth Providers
To enable OAuth providers (Google, Apple, etc.), add them in the Supabase Dashboard under Authentication → Providers, **not** in `config.toml` (which is for local dev only).

---

## 12. Supabase Migrations (`supabase/migrations/`)

Applied in order by filename timestamp:

| File | Contents |
|---|---|
| `20260207000000_initial_schema.sql` | Core tables (`profiles`, `tags`, `collections`, `content`, `content_tags`, `collection_items`, `user_interests`, `feed_items`, `bookmarks`), pgvector extension, FTS indexes, RLS policies, triggers |
| `20260207000001_rpc_functions.sql` | `increment_collection_count`, `decrement_collection_count` RPC functions |
| `20260207000002_search_functions.sql` | `hybrid_search` (FTS + semantic), `search_content` (FTS only), `search_by_tag` RPC functions |

### Running Migrations
```bash
# Push all pending migrations to remote database
npx supabase db push

# Reset local database (applies migrations + seed)
npx supabase db reset
```

---

## 13. Supabase Seed Data (`supabase/seed.sql`)

**File:** `supabase/seed.sql`

Contains initial data for tags and feed items. Applied during `supabase db reset` when `[db.seed] enabled = true` in `config.toml`.

---

## 14. Supabase Edge Functions (`supabase/functions/`)

| Function | File | Deploy Command | Required Secrets |
|---|---|---|---|
| `process-content` | `supabase/functions/process-content/index.ts` | `npx supabase functions deploy process-content --no-verify-jwt` | `OPENAI_API_KEY` |
| `generate-embedding` | `supabase/functions/generate-embedding/index.ts` | `npx supabase functions deploy generate-embedding --no-verify-jwt` | `OPENAI_API_KEY` |
| `generate-feed` | `supabase/functions/generate-feed/index.ts` | `npx supabase functions deploy generate-feed --no-verify-jwt` | `OPENAI_API_KEY` |

### Setting Secrets
```bash
npx supabase secrets set OPENAI_API_KEY=sk-...
```

Each function also has a `deno.json` file (auto-generated by `supabase functions new`).

---

## 15. Git Ignore (`.gitignore`)

**File:** `.gitignore`

| Pattern | Purpose |
|---|---|
| `node_modules/` | Dependencies |
| `.expo/`, `dist/`, `web-build/` | Expo build artifacts |
| `/ios`, `/android` | Generated native folders |
| `.env`, `.env.local`, `.env.production` | Environment secrets |
| `*.tsbuildinfo` | TypeScript incremental build cache |
| `.DS_Store` | macOS metadata |
| `*.pem`, `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision` | Signing keys (never commit) |

---

## 16. Design Tokens (`lib/constants.ts`)

**File:** `lib/constants.ts`

Runtime equivalents of the Tailwind design tokens for use in JavaScript/TypeScript (e.g., when you need a color value for `react-native-reanimated` or `expo-linear-gradient`).

| Export | Contents |
|---|---|
| `COLORS` | `primary`, `backgroundLight`, `backgroundDark`, `cardDark`, `accentBlue` |
| `COLLECTION_THEMES` | 6 color themes (`blue`, `green`, `purple`, `amber`, `rose`, `indigo`) with light/dark Tailwind classes |
| `APP` | App name, avatar letter, tagline |
| `CollectionTheme` | TypeScript type for theme keys |

---

## 17. Utility Functions (`lib/utils.ts`)

**File:** `lib/utils.ts`

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Combines `clsx` (conditional class joining) with `tailwind-merge` (resolves conflicting Tailwind classes). Used throughout components for dynamic className composition.

---

## 18. Supabase Client (`lib/supabase.ts`)

**File:** `lib/supabase.ts`

### Key Configuration

| Setting | Value | Purpose |
|---|---|---|
| `auth.storage` | `ExpoSecureStoreAdapter` | Stores auth tokens securely on mobile, falls back to `localStorage` on web |
| `auth.autoRefreshToken` | `true` | Automatically refreshes expired JWT tokens |
| `auth.persistSession` | `true` | Persists auth session across app restarts |
| `auth.detectSessionInUrl` | `false` | Disabled for React Native (no browser URL bar) |

### Storage Adapter
The custom `ExpoSecureStoreAdapter` uses:
- **Mobile:** `expo-secure-store` (encrypted native keychain/keystore)
- **Web:** `localStorage`

---

## 19. AI Provider Types (`lib/ai/provider.ts`)

**File:** `lib/ai/provider.ts`

TypeScript interfaces for the AI processing pipeline:

| Interface | Fields | Used By |
|---|---|---|
| `AICategorizationResult` | `category`, `confidence` | Content categorization |
| `AISummaryResult` | `summary` | Content summarization |
| `AITagsResult` | `tags` | Auto-tagging |
| `AIEmbeddingResult` | `embedding` | Vector embeddings for search |
| `AIProcessResult` | All of the above combined | `process-content` Edge Function |
| `AIProvider` | Method signatures | Provider abstraction layer |

---

## Quick Setup Checklist

When setting up the project from scratch:

1. ☐ Clone the repository
2. ☐ Run `npm install`
3. ☐ Create `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. ☐ Run `npx supabase login` (authenticate with Supabase)
5. ☐ Run `npx supabase link --project-ref <your-ref>` (link to remote project)
6. ☐ Run `npx supabase db push` (apply all migrations)
7. ☐ Set Edge Function secrets: `npx supabase secrets set OPENAI_API_KEY=sk-...`
8. ☐ Deploy Edge Functions:
   ```bash
   npx supabase functions deploy process-content --no-verify-jwt
   npx supabase functions deploy generate-embedding --no-verify-jwt
   npx supabase functions deploy generate-feed --no-verify-jwt
   ```
9. ☐ Run `npm start` to start the Expo dev server
10. ☐ (Optional) Run `eas login` + `eas init` for EAS builds, then update `app.json` `projectId`
11. ☐ (Optional) Update `eas.json` with real `EXPO_PUBLIC_SUPABASE_ANON_KEY` per profile
