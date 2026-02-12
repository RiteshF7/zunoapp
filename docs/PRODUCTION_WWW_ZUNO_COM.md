# Production: www.zuno.com — what to update

**Current backend URL:** `https://zunoapp.onrender.com`

1. **backend/.env** (local) / **Render env vars** (deployed)  
   - `ENVIRONMENT=production`  
   - `CORS_ORIGINS=https://zunoapp.onrender.com,https://www.zuno.com,https://zuno.com,http://localhost:5173,...`

2. **ui/.env** (for prod build)  
   - `VITE_SUPABASE_URL` = prod Supabase URL  
   - `VITE_SUPABASE_ANON_KEY` = prod anon key  
   - Same host: leave `VITE_API_BASE` unset.  
   - API on api.zuno.com: `VITE_API_BASE=https://api.zuno.com`

3. **.env** (root, if using mobile)  
   - `EXPO_PUBLIC_BACKEND_URL=https://www.zuno.com` (or `https://api.zuno.com`)

4. **Supabase Dashboard** → Authentication → URL Configuration → Redirect URLs: add  
   - `https://zunoapp.onrender.com/` (current backend + static app)  
   - `https://zunoapp.onrender.com/app/`  
   - `https://zunoapp.onrender.com/app`  
   - `https://www.zuno.com/`  
   - `https://www.zuno.com/app/`  
   - `https://www.zuno.com/app`  
   - `https://zuno.com/`  
   - `https://zuno.com/app/`  
   - `https://zuno.com/app`  
   - `http://localhost:5173/` (local dev)  
   - `http://localhost:8000/app/` (local dev)  
   - `com.zuno.app://callback`

5. Build UI and landing: from repo root run `.\scripts\build-ui.ps1` or `./scripts/build-ui.sh`.  
   Deploy over HTTPS.
