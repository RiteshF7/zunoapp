# Zuno Frontend

UI (Vite), mobile (Capacitor), landing, chrome extension.

## Setup

```bash
cd ui
cp .env.example .env
# Set VITE_API_BASE to backend URL (e.g. http://localhost:8000)
npm install
```

## Run

```bash
# From frontend/
./scripts/run.sh web-debug     # Vite dev (starts backend if ../backend exists)
./scripts/run.sh web-prod      # Build UI + landing to dist/
./scripts/run.sh android-debug
./scripts/run.sh android-prod
```

Or from `ui/`:
```bash
npm run dev
```
