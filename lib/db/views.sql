-- ============================================
-- Leaderboard Live View (Teams + Solo Warriors)
-- ============================================
-- Derived from teams + solo users + submissions.
-- Both multi-person teams and solo warriors (acting as solo teams) are ranked.
-- Computed live on every read — strictly based on judge score / points.
-- When score is 0 (no judge points yet), leaderboard_rank is 0 (unranked).
-- When score > 0, DENSE_RANK() groups equal points into the same rank.
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS leaderboard;
DROP VIEW IF EXISTS leaderboard;

CREATE OR REPLACE VIEW leaderboard AS
WITH all_entities AS (
  -- Multi-person teams
  SELECT
    t.id AS user_id,
    t.name AS username,
    t.name AS full_name,
    NULL::text AS avatar_url,
    CASE
      WHEN t.score >= 300 THEN 'Shogun'
      WHEN t.score >= 200 THEN 'Samurai'
      WHEN t.score >= 100 THEN 'Kenshi'
      ELSE 'Ronin'
    END AS rank,
    t.score AS total_score,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END)::int AS tasks_completed,
    'team' AS entity_type
  FROM teams t
  LEFT JOIN submissions s ON s.team_id = t.id AND s.status = 'approved'
  GROUP BY t.id, t.name, t.score

  UNION ALL

  -- Solo warriors (acting as solo teams with their names)
  SELECT
    u.id AS user_id,
    u.username AS username,
    COALESCE(u.full_name, u.username) AS full_name,
    u.avatar_url AS avatar_url,
    CASE
      WHEN u.score >= 300 THEN 'Shogun'
      WHEN u.score >= 200 THEN 'Samurai'
      WHEN u.score >= 100 THEN 'Kenshi'
      ELSE 'Ronin'
    END AS rank,
    u.score AS total_score,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END)::int AS tasks_completed,
    'solo' AS entity_type
  FROM users u
  LEFT JOIN submissions s ON s.user_id = u.id AND s.status = 'approved'
  WHERE u.role = 'user' AND u.current_team_id IS NULL
  GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.score
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
  CASE
    WHEN total_score = 0 THEN 0
    ELSE DENSE_RANK() OVER (
      PARTITION BY (CASE WHEN total_score > 0 THEN 1 ELSE 0 END)
      ORDER BY total_score DESC
    )
  END AS leaderboard_rank
FROM all_entities;

-- ============================================
-- Helper function (no-op for backwards compatibility)
-- ============================================
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  -- No-op: leaderboard is a live view
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Security: Revoke default public API access
-- (Secures view from direct Supabase PostgREST bypass)
-- ============================================
REVOKE SELECT ON public.leaderboard FROM anon;
REVOKE SELECT ON public.leaderboard FROM authenticated;
