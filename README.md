# Zuno

Your unified content hub — save, organize, and discover content from anywhere.

## Project Structure

```
zunoapp/
├── frontend/    Expo / React Native mobile app
├── backend/     Python FastAPI server
├── supabase/    Database migrations, edge functions, config
├── docs/        Project documentation & phase plans
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **Android Studio** (for Android emulator & SDK)
- **Supabase CLI** (for local DB / migrations)

### Frontend (Expo)

```bash
cd frontend
npm install
npx expo start          # dev server (Expo Go)
npx expo run:android    # native Android build
```

Create `frontend/.env` from the example:

```bash
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_BACKEND_URL
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

## Documentation

See the [docs/](docs/) folder for:

- [APP_OVERVIEW.md](docs/APP_OVERVIEW.md) — high-level architecture
- [CONCEPT.md](docs/CONCEPT.md) — product concept
- [UI_STYLE_GUIDE.md](docs/UI_STYLE_GUIDE.md) — design system
- [Phase plans](docs/phases/) — step-by-step build phases
