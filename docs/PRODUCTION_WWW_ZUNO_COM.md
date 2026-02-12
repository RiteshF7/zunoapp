# Production: www.zuno.com — what to update

1. **backend/.env**  
   - `ENVIRONMENT=production`  
   - `CORS_ORIGINS=https://www.zuno.com,https://zuno.com`

2. **ui/.env** (for prod build)  
   - `VITE_SUPABASE_URL` = prod Supabase URL  
   - `VITE_SUPABASE_ANON_KEY` = prod anon key  
   - Same host: leave `VITE_API_BASE` unset.  
   - API on api.zuno.com: `VITE_API_BASE=https://api.zuno.com`

3. **.env** (root, if using mobile)  
   - `EXPO_PUBLIC_BACKEND_URL=https://www.zuno.com` (or `https://api.zuno.com`)

4. **Supabase Dashboard** → Authentication → URL Configuration → Redirect URLs: add  
   - `https://www.zuno.com/`  
   - `https://zuno.com/`  
   - `com.zuno.app://callback`

5. Build UI: from repo root run `.\scripts\build-ui.ps1` or `cd ui && npm run build`.  
   Deploy over HTTPS.
