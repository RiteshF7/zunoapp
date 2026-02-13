# Zuno — Project Rules & Conventions

Short reference for how this project is structured and what to follow. For full details, see the linked docs.

---

## API & Backend

- **API base URL**: The UI must use `getApiBase()` from [ui/src/core/config.js](ui/src/core/config.js) as the only source for the backend base URL. Do not duplicate API-base logic elsewhere.
- **API versioning**: Backend exposes `/api/v1/`. Legacy `/api/...` redirects to `/api/v1/...`. The UI normalizes paths to `/api/v1/` to avoid 307 and dropped auth.
- **Backend errors**: Backend uses `ZunoException` and returns JSON with `error`, `code`, `detail`, and optionally `request_id`. See [backend/docs/API_DOCS.md](backend/docs/API_DOCS.md).

---

## UI (Vite app in `ui/`)

- **Routing**: Hash-based routing (`#home`, `#library`, `#auth`, etc.). Router lives in [ui/src/core/router.js](ui/src/core/router.js).
- **Handlers**: Pages and components expose handlers on `window` for `onclick` and similar (e.g. `window.router`, `window.navigate`, `openSaveContentModal`). Keep this pattern consistent when adding features.
- **Auth**: Supabase Auth for Google OAuth only. JWT is sent as `Authorization: Bearer <token>` to the backend. Tokens stored in `localStorage` (`zuno_token`, `zuno_refresh_token`).

---

## Design & Theming

- **Design tokens**: See [docs/UI_STYLE_GUIDE.md](docs/UI_STYLE_GUIDE.md) for colors, typography, spacing, and components.
- **Implementation**: App uses CSS variables in [ui/src/styles/theme.css](ui/src/styles/theme.css) (`--c-bg`, `--c-surface`, `--c-accent`, etc.) and Tailwind config in [ui/index.html](ui/index.html). Landing uses Tailwind in [landing-ui/](landing-ui/).

---

## Repo layout

- **ui/**: Vite web app (main frontend).
- **backend/**: FastAPI server; talks to Supabase and Vertex AI.
- **mobile/**: Capacitor shell (iOS/Android) wrapping the built UI.
- **chrome-extension/**: Share to Zuno browser extension.
- **landing-ui/**: Marketing/landing pages.
- **supabase/**: Migrations, edge functions, config.
- **scripts/**: Build and deployment scripts.

For setup and config, see [docs/CONFIG_REFERENCE.md](docs/CONFIG_REFERENCE.md) and [docs/SETUP.md](docs/SETUP.md).
