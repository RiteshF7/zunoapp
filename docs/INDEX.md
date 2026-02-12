# Zuno — Documentation Index

Overview of docs in `docs/` (excluding `phases/`). Use this to find the right doc quickly.

---

## Product & concept

| Doc | Purpose |
|-----|---------|
| **[PRODUCT.md](PRODUCT.md)** | What Zuno is, problem/solution, core features, screens, feature breakdown (implemented vs planned), user flow, content types & platforms, investor story, technical vision, monetization, competitive edge, **and landing page copy** (hero, taglines, features, CTAs). *Merged from APP_OVERVIEW, CONCEPT, LANDING_PAGE_CONCEPT_AND_FEATURES.* |

---

## Setup & configuration

| Doc | Purpose |
|-----|---------|
| **[SETUP.md](SETUP.md)** | Developer setup: EAS init, dev build (mobile), deploy backend (Railway/Render/Fly), production build & app store. *Merged from SETUP_STEPS.* |
| **[CONFIG_REFERENCE.md](CONFIG_REFERENCE.md)** | Every config file in the project (env, app.json, tsconfig, Tailwind, Metro, Babel, Supabase, EAS, design tokens, etc.) with what each does and how to change it. |

---

## Production

| Doc | Purpose |
|-----|---------|
| **[PRODUCTION.md](PRODUCTION.md)** | Production runbook: status, env, Supabase (project, migrations, auth URLs, Edge Functions), backend (JWKS, Render deploy), frontend build & deploy, security, domain-specific (www.zuno.com), checklist. *Merged from LEFT_FOR_PRODUCTION, PRODUCTION_CHECKLIST, PRODUCTION_DEPLOYMENT, PRODUCTION_WWW_ZUNO_COM.* |

---

## Testing & platform-specific

| Doc | Purpose |
|-----|---------|
| **[TESTING.md](TESTING.md)** | Manual testing checklist (auth, home, save, feed, search, collections, config, AI pipeline, RAG, theme, admin) and quick curl API examples. *Renamed from FEATURES_AND_TESTING.* |
| **[IOS_SHARE_EXTENSION_SETUP.md](IOS_SHARE_EXTENSION_SETUP.md)** | iOS Share Extension (“Share to Zuno”) setup in Xcode: add target, App Groups, replace template, build & run. |
| **[VERTEX_AI_SETUP.md](VERTEX_AI_SETUP.md)** | Vertex AI setup: gcloud CLI or Console, enable API, service account, JSON key, `.env`, verify, DB migrations. |

---

## Design

| Doc | Purpose |
|-----|---------|
| **[UI_STYLE_GUIDE.md](UI_STYLE_GUIDE.md)** | Design system: tokens, typography, colors, spacing, components (header, filters, cards, buttons, dropdown), dark mode, dependencies, implementation checklist. |

---

## Phases (unchanged)

| Folder | Purpose |
|--------|---------|
| **[phases/](phases/)** | Phase-by-phase implementation docs (setup, design system, navigation, home, feed, Supabase, auth, content CRUD, AI, search, feed polish). Not merged. |

---

## Quick links

- **New to the project?** → [PRODUCT.md](PRODUCT.md) then [SETUP.md](SETUP.md)
- **Changing config?** → [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md)
- **Going to production?** → [PRODUCTION.md](PRODUCTION.md)
- **Testing features?** → [TESTING.md](TESTING.md)
- **Building the UI?** → [UI_STYLE_GUIDE.md](UI_STYLE_GUIDE.md)
