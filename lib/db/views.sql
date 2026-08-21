-- ============================================
-- Leaderboard Live View
-- ============================================
-- Derived from submissions + reviews + users + teams.
-- Computed live on every read — no background refresh needed.
--
-- Run this SQL after Drizzle migrations to create the view.
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS leaderboard;
DROP VIEW IF EXISTS leaderboard;

CREATE OR REPLACE VIEW leaderboard AS
WITH combined AS (
  -- Solo Users
  SELECT
    u.id AS user_id,
    u.username,
    u.full_name,
    u.avatar_url,
    u.rank AS rank,
    u.score AS total_score,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END)::int AS tasks_completed,
    'solo' AS entity_type
  FROM users u
  LEFT JOIN submissions s ON s.user_id = u.id AND s.status = 'approved' AND s.team_id IS NULL
  WHERE u.is_active = true AND u.role = 'user'
  GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.rank, u.score

  UNION ALL

  -- Teams
  SELECT
    t.id AS user_id,
    t.name AS username,
    NULL AS full_name,
    NULL AS avatar_url,
    'Team' AS rank,
    t.score AS total_score,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END)::int AS tasks_completed,
    'team' AS entity_type
  FROM teams t
  LEFT JOIN submissions s ON s.team_id = t.id AND s.status = 'approved'
  GROUP BY t.id, t.name, t.score
)
SELECT
  user_id,
  username,
  full_name,
  avatar_url,
  rank,
  total_score,
  tasks_completed,
  entity_type,
  RANK() OVER (ORDER BY total_score DESC) AS leaderboard_rank
FROM combined
ORDER BY total_score DESC;

-- ============================================
-- Helper function (no-op for backwards compatibility)
-- ============================================
-- Kept so existing BullMQ jobs / admin recalculate endpoint
-- don't crash. The view is live, so no refresh is needed.
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  -- No-op: leaderboard is now a live view
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Security: Revoke default public API access
-- (Secures view from direct Supabase PostgREST bypass)
-- ============================================
REVOKE SELECT ON public.leaderboard FROM anon;
REVOKE SELECT ON public.leaderboard FROM authenticated;
