# Zuno

Your unified content hub — save, organize, and discover content from anywhere.

## Project Structure

```
zunoapp/
├── ui/              Vite web app (served at /app when built)
├── backend/         Python FastAPI server
├── mobile/          Capacitor (iOS/Android shell for ui)
├── chrome-extension/  Share to Zuno browser extension
├── landing-ui/      Marketing/landing pages
├── supabase/        Database migrations, edge functions, config
├── scripts/         Build and deployment scripts
├── docs/            Project documentation & phase plans
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **Android Studio** (for Android emulator & SDK)
- **Supabase CLI** (for local DB / migrations)

### UI (Vite)

```bash
cd ui
npm install
npm run dev          # dev server (e.g. http://localhost:5173)
```

Create `ui/.env` from the example:

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_BASE
```

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Create `backend/.env` from the example:

```bash
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET, OPENAI_API_KEY
```

### Supabase

```bash
supabase start           # local Supabase stack
supabase db push         # apply migrations
supabase functions serve # run edge functions locally
```

### Mobile (Capacitor)

The native app wraps the built UI. After building the ui (`cd ui && npm run build`), sync and run from `mobile/`:

```bash
cd mobile
npm install
npx cap sync
npx cap open android   # or ios
```

### Landing

```bash
cd landing-ui
npm install
node build.js          # outputs to dist/ (or as configured)
```

## Documentation

See the [docs/](docs/) folder. Start with [docs/INDEX.md](docs/INDEX.md) for a full index. Main docs:

- [PRODUCT.md](docs/PRODUCT.md) — product overview, concept, features, screens, landing copy
- [SETUP.md](docs/SETUP.md) — developer setup (backend deploy, app store)
- [PRODUCTION.md](docs/PRODUCTION.md) — production runbook
- [CONFIG_REFERENCE.md](docs/CONFIG_REFERENCE.md) — all config files
- [UI_STYLE_GUIDE.md](docs/UI_STYLE_GUIDE.md) — design system
- [Phase plans](docs/phases/) — step-by-step build phases
