-- ============================================================
-- AIProducer — Full Database Schema
-- Run this in Supabase SQL Editor to set up the database
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES (extends auth.users)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  niche TEXT,
  bio TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════
-- 2. WORKSPACES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  niche TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage workspaces" ON workspaces
  FOR ALL USING (auth.uid() = owner_id);

-- ═══════════════════════════════════════════════════════════
-- 3. WORKSPACE MEMBERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view workspace members" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Members can insert" ON workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- 4. PROJECTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Мой продукт',
  current_step INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace owners can manage projects" ON projects
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════
-- 5. SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace owners can view subscriptions" ON subscriptions
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════
-- 6. AGENT DEFINITIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  step INT NOT NULL,
  system_prompt TEXT,
  pipeline_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed agents
INSERT INTO agent_definitions (code, name, step) VALUES
  ('unpacker', 'Распаковщик', 1),
  ('methodologist', 'Методолог', 2),
  ('promotion', 'Продвижение', 3),
  ('warmup', 'Прогревщик', 4),
  ('leadmagnet', 'Лид-магниты', 5),
  ('sales', 'Продажник', 6),
  ('tracker', 'Трекер', 7)
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 7. AGENT KNOWLEDGE FILES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_knowledge_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_definitions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  parsed_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 8. AGENT RUNS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agent_definitions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'error')),
  input_context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own runs" ON agent_runs
  FOR ALL USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- 9. AGENT MESSAGES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON agent_messages
  FOR ALL USING (
    run_id IN (SELECT id FROM agent_runs WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════
-- 10. ARTIFACTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agent_definitions(id),
  run_id UUID REFERENCES agent_runs(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  content_json JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'archived')),
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own artifacts" ON artifacts
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════
-- 11. ARTIFACT VERSIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS artifact_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  version INT NOT NULL,
  content_md TEXT NOT NULL,
  content_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 12. TASKS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  source_agent TEXT,
  source_artifact_id UUID REFERENCES artifacts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════
-- 13. TRACKER EVENTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tracker_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  channel TEXT DEFAULT 'web',
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 14. TELEGRAM ACCOUNTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS telegram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT,
  username TEXT,
  first_name TEXT,
  chat_id BIGINT,
  linking_token TEXT,
  linked_at TIMESTAMPTZ,
  notification_time TEXT DEFAULT '09:00',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE telegram_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own telegram" ON telegram_accounts
  FOR ALL USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- 15. PAYMENTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  yookassa_payment_id TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'RUB',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'cancelled', 'refunded')),
  description TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 16. PAYMENT EVENTS (webhook log)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 17. REFERRALS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT WITH CHECK (referred_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- 18. USAGE EVENTS (analytics)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 19. AUDIT LOGS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_project ON agent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_run ON agent_messages(run_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_project ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_telegram_user ON telegram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chat ON telegram_accounts(chat_id);
CREATE INDEX IF NOT EXISTS idx_payments_workspace ON payments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payments_yookassa ON payments(yookassa_payment_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_usage_events_workspace ON usage_events(workspace_id);
