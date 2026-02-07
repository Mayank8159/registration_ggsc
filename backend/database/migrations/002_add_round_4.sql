-- ============================================
-- MIGRATION: ADD ROUND 4
-- ============================================

-- 1. Add new columns for Round 4
ALTER TABLE teams ADD COLUMN round4_score INTEGER;
ALTER TABLE teams ADD COLUMN round4_updated_at TIMESTAMPTZ;

-- 2. Update total_score calculation
-- Generated columns cannot have their expression altered directly, so we must recreate it.
ALTER TABLE teams DROP COLUMN total_score;

ALTER TABLE teams ADD COLUMN total_score INTEGER GENERATED ALWAYS AS (
    COALESCE(round1_score, 0) + 
    COALESCE(round2_score, 0) + 
    COALESCE(round3_score, 0) + 
    COALESCE(round4_score, 0)
) STORED;

-- 3. Recreate index on total_score (dropped when column was dropped)
CREATE INDEX idx_teams_total_score ON teams(total_score DESC NULLS LAST);

-- 4. Add index for round 4 scores
CREATE INDEX idx_teams_round4 ON teams(round4_score DESC NULLS LAST);
