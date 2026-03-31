-- Add tracker settings to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tracker_motivation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracker_daily_fact BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN profiles.tracker_motivation IS 'Enable Telegram motivation messages from Tracker agent';
COMMENT ON COLUMN profiles.tracker_daily_fact IS 'Enable daily fact/quote from business books';
