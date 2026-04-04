-- Add notification time preference to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tracker_notify_time TEXT DEFAULT '09:00';

COMMENT ON COLUMN profiles.tracker_notify_time IS 'Preferred time for Telegram notifications (HH:MM format, user local time)';
