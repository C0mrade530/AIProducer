-- Store user email in profiles for transactional emails
-- (Supabase anon key can't access auth.users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
