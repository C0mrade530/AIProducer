-- Add payment_method_id for YooKassa recurring payments
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_method_id TEXT;

-- Add index for cron queries (find expiring subscriptions)
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end
  ON subscriptions (current_period_end)
  WHERE status = 'active';
