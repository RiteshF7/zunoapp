-- Add role column to profiles for admin access (DB as source of truth).
-- Values: 'user' (default) | 'admin'. Set in Table Editor or: UPDATE profiles SET role = 'admin' WHERE id = '<uuid>';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- New signups get role 'user' (default handles it; optionally set explicitly in trigger)
COMMENT ON COLUMN public.profiles.role IS 'user | admin; admin can access /api/v1/admin';
