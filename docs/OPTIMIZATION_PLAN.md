# Zuno — Code Review & Optimization Plan

This document contains the **analysis** (against the repo’s implementation plan, technical spec, and product docs) and an **optimization plan** with atomic, implementable steps. React Native is out of scope (ignored).

---

<analysis>

## 1. Code Organization & Structure

**Strengths**
- **Backend** is well organized: clear split between `routers/`, `services/`, `schemas/`, `utils/`, `prompts/`, with a single `ZunoException` hierarchy and consistent handlers in `main.py`. Matches the Python FastAPI plan (`.cursor/plans/`).
- **Supabase**: Migrations are ordered and named; RPCs and knowledge/embedding migrations are present.
- **UI** has a clear split: `core/` (api, config, router, state, theme, share-handler), `pages/`, `components/`, `utils/`, `styles/`. Router centralizes hash-based routes and guards.

**Gaps and inconsistencies**
- **README** still describes a `frontend/` folder and Expo; the repo uses `ui/` (Vite) and `mobile/` (Capacitor). New contributors will be misled.
- **CONFIG_REFERENCE.md** is heavily Expo/React Native–oriented (app.json, Metro, Babel, EAS, etc.). The active stack is Vite (`ui/`), Capacitor (`mobile/`), and FastAPI; config docs don’t match.
- **Global coupling in UI**: Pages and components rely on `window` (e.g. `window.router`, `window.switchFeedType`, `openSaveContentModal`, `navigate`). This works but is implicit and makes testing and tree-shaking harder; there is no single “app” or “shell” module that wires these.
- **Duplicate API base logic**: `api.js` derives `API_BASE` inline; `config.js` has `getApiBase()`. Same fallbacks (VITE_API_BASE, ZUNO_API_BASE, localhost) are repeated — a single source of truth would reduce drift.
- **Landing vs app design**: `landing-ui/` and `ui/` are separate (different index.html, Tailwind config, fonts). Landing uses `accent-blue` (#4D96FF) and its own build; app uses `accent` (#6366f1). No shared design-token package or doc that both consume.
- **Chrome extension**: Very small surface (content script + popup); popup.js and background.js are not yet reviewed in depth but fit “connect extension” flow. Structure is fine for current scope.

## 2. Code Quality & Best Practices

**Strengths**
- **Backend**: Pydantic schemas, Depends() for auth and Supabase, JWKS-based JWT verification, rate limiting, request ID and timing middleware, structured exception responses. Aligns with API_DOCS and the backend plan.
- **UI**: Consistent use of `esc()` for interpolated user/content strings (XSS mitigation). 401 handling with single refresh and redirect to auth is clear.
- **API versioning**: Backend exposes `/api/v1/` and redirects legacy `/api/...` to `/api/v1/...`; frontend normalizes to `/api/v1/` to avoid 307 and dropped auth. Good.

**Gaps**
- **UI is JavaScript only**: No TypeScript; no shared types with backend (e.g. profile, content, collection). Acceptable for current size but limits refactors and IDE support; no JSDoc or type hints.
- **Error handling on the client**: Many pages only check `res.ok` and use empty data on failure (e.g. library, home). Users don’t see `res.data.error` or `res.data.detail`; only the router’s catch shows `err.message`. No central “show API error to user” helper (e.g. toast or inline).
- **Hardcoded dev fallback in config.js**: Supabase URL and anon key are embedded for “DEV”; safe if not used in production build but should be clearly env-gated and documented.
- **Backend**: Some routers may return different shapes (list vs `{ items: [] }`); UI sometimes handles both (e.g. home feed). Standardizing list responses (e.g. always `{ items, next_offset }` or always array) would simplify the UI.
- **Logging**: Backend uses std logging; no correlation of request_id to client (e.g. in response header). Helpful for support to trace client request → server log.

## 3. UI/UX

**Strengths**
- **UI_STYLE_GUIDE**: Design tokens (colors, radius, typography), dark mode, header/card/button patterns are documented. App uses CSS variables in `theme.css` (--c-bg, --c-surface, etc.) and Tailwind with those vars; splash and shell are consistent.
- **Accessibility**: Skip link (“Skip to content”), aria-label on nav and key buttons, role="main", role="feed", role="tablist"/tab. Good baseline.
- **Responsiveness**: Bottom sheet–style modal on small screens, max-width container; nav and FAB adapt.

**Gaps**
- **Design token mismatch with UI_STYLE_GUIDE**: Guide specifies `accent-blue: #4D96FF`, `background-light/dark`, Inter as display font. App uses `accent: #6366f1`, Plus Jakarta Sans + Inter, and different names (e.g. `heading`/`body` via vars). Landing uses `accent-blue` and #4D96FF. Unifying the app with the guide (or updating the guide to match app) would align product and landing.
- **Missing accent in theme.css**: `theme.css` defines --c-bg, --c-surface, etc., but no `--c-accent`. Tailwind in index.html uses `accent: { DEFAULT: '#6366f1' }`; animations.css falls back to `#6366f1`. Centralizing accent in theme.css and Tailwind would keep dark mode and future theme changes consistent.
- **Empty and error states**: Empty states (no feed, no library, no collections) are clear and actionable. Generic error state in the router is minimal (“Something went wrong” + message). No retry button or distinction between network vs validation vs 5xx.
- **Loading**: Skeleton and spinner are used; good. No global “loading bar” or disabling of nav during navigation to prevent double-taps.
- **Forms**: Auth (Google only), waitlist, and modals (save content, create collection) exist. Validation errors from the API are not consistently shown next to fields (e.g. toast vs inline).

</analysis>

---

# Optimization Plan

Each step is atomic (≤20 file touches where applicable), preserves existing behavior unless stated, and follows PROJECT_RULES and the Technical Specification (PRODUCT.md, UI_STYLE_GUIDE, CONFIG_REFERENCE, API_DOCS). Success criteria are listed so another AI or a developer can implement and verify in one iteration.

---

## Code Structure & Organization

- [ ] **Step 1: Align README with actual repo structure**
  - **Task**: Update the root README so it describes the current layout: `ui/` (Vite web app), `backend/` (FastAPI), `mobile/` (Capacitor), `chrome-extension/`, `landing-ui/`, `supabase/`, `scripts/`. Remove or replace references to `frontend/` and Expo. Keep prerequisites and “Getting started” for backend, ui, and Supabase; add one line each for mobile (Capacitor) and landing-ui if needed.
  - **Files**:
    - `README.md`: Replace Project Structure section and any frontend/Expo instructions with ui + backend + mobile + others; fix doc links if needed.
  - **Step Dependencies**: None.
  - **Success Criteria**: README lists real folders; no mention of Expo or `frontend/`; a new dev can run ui and backend from README alone.
  - **User Instructions**: None.

- [ ] **Step 2: Single source of truth for API base URL (UI)**
  - **Task**: Use `getApiBase()` from `config.js` as the only place that defines the API base. In `api.js`, remove the local `API_BASE` derivation and import `getApiBase` from `config.js`; call it at request time (or once at module load) so all fetch URLs use it. Ensure iOS share sync and any other consumer already using `getApiBase()` continue to work.
  - **Files**:
    - `ui/src/core/config.js`: Ensure `getApiBase()` returns the same logic as current `api.js` (VITE_API_BASE, ZUNO_API_BASE, localhost fallback for Android emulator, else origin). Add a short comment that this is the single source for API base.
    - `ui/src/core/api.js`: Remove local `API_BASE`; import `getApiBase` from `config.js` and use it (e.g. `const API_BASE = getApiBase()` at top, or call inside `_doFetch`). Keep path normalization and 401/refresh logic unchanged.
  - **Step Dependencies**: None.
  - **Success Criteria**: All API requests still hit the same URL as before; no duplicate API-base logic in api.js; `ios-share-sync.js` (if it uses getApiBase) unchanged.
  - **User Instructions**: None.

- [ ] **Step 3: Add a PROJECT_RULES / conventions doc**
  - **Task**: Create a short, in-repo document that captures current constraints and conventions: e.g. “API base from config.getApiBase only”, “UI uses hash routing and window handlers”, “Backend uses ZunoException and /api/v1/”, “Design tokens: see UI_STYLE_GUIDE and ui/src/styles/theme.css”. This can live in `docs/PROJECT_RULES.md` or `.cursor/rules` (per create-rule skill). Do not change code behavior.
  - **Files**:
    - `docs/PROJECT_RULES.md` (or `.cursor/rules/PROJECT_RULES.md`): New file listing conventions (API, auth, routing, design tokens, backend structure).
  - **Step Dependencies**: None.
  - **Success Criteria**: One place for “how we do things” that points to existing docs; AI and humans can reference it.
  - **User Instructions**: Choose location (docs vs .cursor/rules) if you have a preference.

- [ ] **Step 4: Update CONFIG_REFERENCE for current stack**
  - **Task**: Revise CONFIG_REFERENCE.md so the primary setup path is Vite (`ui/`), Capacitor (`mobile/`), and FastAPI (`backend/`). Add or expand sections for: `ui/.env.example` and VITE_* vars, `ui/vite.config.js`, `mobile/capacitor.config.ts`, and backend `.env`. Reduce or move Expo/Metro/Babel/EAS to a “Legacy / unused” subsection or remove if not used anywhere. Keep Supabase, design tokens, and env var tables accurate.
  - **Files**:
    - `docs/CONFIG_REFERENCE.md`: Restructure so “Environment Variables” and “Getting started” reflect ui + backend + mobile; add Vite and Capacitor; demote or remove Expo-centric sections.
  - **Step Dependencies**: Step 1 (README) recommended for consistency.
  - **Success Criteria**: A developer following CONFIG_REFERENCE can configure ui, backend, and mobile without reading Expo docs.
  - **User Instructions**: None.

---

## Code Quality & Best Practices

- [ ] **Step 5: Centralize API error display in UI**
  - **Task**: Add a small helper (e.g. `showApiError(res)` or `handleApiResponse(res, { onError: (msg) => toast(msg, true) })`) that: if `!res.ok`, reads `res.data?.error` or `res.data?.detail` and shows it via the existing toast (or a single “error” UI). Use it in 2–3 high-traffic pages first (e.g. home, library, auth callback) so users see API errors instead of silent failure. Do not change backend response shape.
  - **Files**:
    - `ui/src/utils/helpers.js` (or new `ui/src/utils/api-error.js`): Add `showApiError(res)` that calls existing toast with error message.
    - `ui/src/pages/home.js`, `ui/src/pages/library.js`, `ui/src/pages/auth.js`: After `api(...)`, if `!res.ok` call `showApiError(res)` (and optionally still use empty data for list/feed). Adjust so one place controls “toast on API error”.
  - **Step Dependencies**: None.
  - **Success Criteria**: On 4xx/5xx from feed or content list or auth, user sees a toast (or inline) with the backend error message; existing success paths unchanged.
  - **User Instructions**: None.

- [ ] **Step 6: Optional — Add JSDoc types for API responses (UI)**
  - **Task**: Add JSDoc comments for the main `api()` usage and key response shapes (e.g. `@param`, `@returns {{ ok: boolean, status: number, data: Object }}` and, where useful, `data: { items: Array }`). No TypeScript or new build step; only comments in api.js and 1–2 page files. Improves IDE hints and future migration to TS.
  - **Files**:
    - `ui/src/core/api.js`: JSDoc for `api()`, `_doFetch`, and return shape.
    - `ui/src/pages/home.js` and `ui/src/pages/library.js`: Short JSDoc for the fetch-and-render functions and expected `res.data` shape.
  - **Step Dependencies**: None.
  - **Success Criteria**: Hover on `api(...)` and `res.data` in those files shows a sensible type; no runtime or build change.
  - **User Instructions**: Optional; can be skipped if you prefer no comments.

---

## UI/UX & Design Consistency

- [ ] **Step 7: Unify accent color with UI_STYLE_GUIDE**
  - **Task**: UI_STYLE_GUIDE specifies `accent-blue: #4D96FF`. Decide: either (A) switch the app to use `accent-blue` and #4D96FF (and add it to theme.css and Tailwind in ui), or (B) update UI_STYLE_GUIDE to document current app accent (#6366f1) and keep landing as-is. This step implements (A): add `--c-accent` and optional `--c-accent-hover` in `theme.css`, set Tailwind `accent` to `var(--c-accent)`, use that in animations.css and any hardcoded #6366f1 in ui (e.g. progressRing default). Leave landing-ui and backend static assets unchanged for this step.
  - **Files**:
    - `ui/src/styles/theme.css`: Add `--c-accent: #4D96FF` and `--c-accent-hover` in :root and .dark if desired.
    - `ui/index.html`: In tailwind.config.theme.extend.colors, set `accent: { DEFAULT: 'var(--c-accent)', hover: 'var(--c-accent-hover)' }` (or equivalent).
    - `ui/src/styles/animations.css`: Replace hardcoded #6366f1 with `var(--c-accent)`.
    - `ui/src/components/ui.js`: progressRing default color use `var(--c-accent)` or Tailwind accent.
  - **Step Dependencies**: None.
  - **Success Criteria**: App accent is #4D96FF (or a single var); no hardcoded #6366f1 in ui source; dark mode unchanged.
  - **User Instructions**: If you prefer to keep current indigo (#6366f1), choose (B) and only update UI_STYLE_GUIDE in a separate step instead.

- [ ] **Step 8: Add retry and error state in router**
  - **Task**: In the router’s catch block, replace the generic error div with a short message plus a “Try again” button that calls `router()` again (or navigates to the same hash). Optionally set `aria-live="assertive"` for the error region. Keep existing error message text.
  - **Files**:
    - `ui/src/core/router.js`: In the catch block, add a button “Try again” that re-runs the same route (e.g. `window.location.hash = getRoute(); router();` or similar). Ensure focus and screen readers can reach the button.
  - **Step Dependencies**: None.
  - **Success Criteria**: On render failure, user sees “Something went wrong” + message + “Try again”; clicking “Try again” re-runs the route.
  - **User Instructions**: None.

- [ ] **Step 9: Document design token source in one place**
  - **Task**: Add a short “Design tokens” section to UI_STYLE_GUIDE (or a dedicated subsection) that states: “App uses CSS variables in `ui/src/styles/theme.css` (--c-bg, --c-surface, --c-accent, etc.) and Tailwind in `ui/index.html`; landing uses Tailwind in `landing-ui/index.html` with accent-blue.” No code changes in ui or landing.
  - **Files**:
    - `docs/UI_STYLE_GUIDE.md`: Add “Where tokens live” or “Implementation” pointing to theme.css and index.html for app, and landing-ui for landing.
  - **Step Dependencies**: Optional: Step 7 (so accent var is already in theme.css).
  - **Success Criteria**: A developer knows where to change colors (theme.css + Tailwind) for app and landing.
  - **User Instructions**: None.

---

## Optional / Follow-up

- [ ] **Step 10 (optional): Expose request_id in API responses**
  - **Task**: Backend already sets request_id in error bodies and likely in middleware. Add a response header (e.g. `X-Request-Id`) for all JSON responses so clients can log or display it for support. Document in API_DOCS.
  - **Files**:
    - `backend/app/middleware.py` (or wherever request_id is set): Add `X-Request-Id` to response headers for API routes.
    - `backend/docs/API_DOCS.md`: Mention X-Request-Id in “Architecture” or “Auth” section.
  - **Step Dependencies**: None.
  - **Success Criteria**: Every API response includes X-Request-Id when request_id exists; API_DOCS updated.
  - **User Instructions**: None.

---

## Logical Next Step

After implementing the steps you care about (1–9, and optionally 6 and 10), the next logical step is to **run the full test checklist** in `docs/TESTING.md` (auth, home, save, feed, search, collections, theme, admin) and fix any regressions. If you later introduce TypeScript for the UI, Step 6’s JSDoc will ease the migration.
