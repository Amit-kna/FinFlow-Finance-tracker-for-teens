-- FinFlow Pro MVP — Database Migration
-- Run this SQL in Supabase SQL Editor

-- ──────────────────────────────────────────────
-- 1. Add Pro columns to users table
-- ──────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freeze_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- ──────────────────────────────────────────────
-- 2. Subscriptions table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  plan TEXT DEFAULT 'pro',
  price NUMERIC DEFAULT 2.99,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (true);

-- ──────────────────────────────────────────────
-- 3. Friendships table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view friendships they are in" ON friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create friendship requests" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update friendships they are in" ON friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- ──────────────────────────────────────────────
-- 4. Friend goals table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friend_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE friend_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view friend goals they are in" ON friend_goals FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM goals WHERE goals.id = friend_goals.goal_id)
  OR auth.uid() = friend_goals.friend_id
);
CREATE POLICY "Users can create friend goal links" ON friend_goals FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM goals WHERE goals.id = friend_goals.goal_id)
);

-- ──────────────────────────────────────────────
-- 5. Streak freezes table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  used_at DATE,
  month_year TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own streak freezes" ON streak_freezes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage streak freezes" ON streak_freezes FOR ALL USING (true);

-- ──────────────────────────────────────────────
-- 6. Points log table (server-side only)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

ALTER TABLE points_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points log" ON points_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert into points log" ON points_log FOR INSERT WITH CHECK (true);

-- ──────────────────────────────────────────────
-- 7. Leaderboard view
-- ──────────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id,
  u.name,
  u.money_score,
  u.streak,
  u.is_pro,
  u.total_xp,
  COUNT(DISTINCT lp.id) FILTER (WHERE lp.completed = true) AS lessons_completed,
  COUNT(DISTINCT g.id) FILTER (WHERE g.completed = true) AS goals_completed,
  ROW_NUMBER() OVER (ORDER BY u.money_score DESC) AS rank
FROM users u
LEFT JOIN lesson_progress lp ON lp.user_id = u.id
LEFT JOIN goals g ON g.user_id = u.id
GROUP BY u.id, u.name, u.money_score, u.streak, u.is_pro, u.total_xp;

-- ──────────────────────────────────────────────
-- 8. Monthly freeze reset function
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reset_monthly_freezes()
RETURNS void AS $$
  UPDATE users
  SET streak_freeze_count = 1
  WHERE is_pro = true;
$$ LANGUAGE sql;

-- TODO: Schedule this function to run on the 1st of every month
-- using Supabase cron (pg_cron extension) or a Vercel cron job
