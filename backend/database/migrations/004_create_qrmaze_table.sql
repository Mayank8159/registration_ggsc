-- ============================================
-- MIGRATION: Replace Teams with QRMaze Scoring
-- Changes team-based round scoring to individual set-based scoring
-- ============================================

-- Drop existing team-related tables
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- ============================================
-- TABLE: QRMAZE (Individual Set-Based Scoring)
-- ============================================
CREATE TABLE qrmaze (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference (email-based linking)
    email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Set information
    set_number INTEGER NOT NULL CHECK (set_number >= 1 AND set_number <= 5),
    title TEXT NOT NULL,
    
    -- Performance metrics
    correct_answers INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL, -- time in seconds
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one submission per user per set
    CONSTRAINT unique_user_set UNIQUE(email, set_number)
);

-- Indexes for faster queries
CREATE INDEX idx_qrmaze_email ON qrmaze(email);
CREATE INDEX idx_qrmaze_user_id ON qrmaze(user_id);
CREATE INDEX idx_qrmaze_set_number ON qrmaze(set_number);
CREATE INDEX idx_qrmaze_correct_answers ON qrmaze(correct_answers DESC);
CREATE INDEX idx_qrmaze_time_taken ON qrmaze(time_taken ASC);

-- Composite index for leaderboard queries (by set)
CREATE INDEX idx_qrmaze_leaderboard ON qrmaze(set_number, correct_answers DESC, time_taken ASC);

-- ============================================
-- FUNCTION: Auto-populate user_id from email
-- ============================================
CREATE OR REPLACE FUNCTION set_user_id_from_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically set user_id based on email
    SELECT id INTO NEW.user_id
    FROM users
    WHERE email = NEW.email;
    
    IF NEW.user_id IS NULL THEN
        RAISE EXCEPTION 'Email % not found in users table', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER populate_user_id
    BEFORE INSERT OR UPDATE ON qrmaze
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_email();

-- ============================================
-- FUNCTION: Update timestamp on modification
-- ============================================
CREATE OR REPLACE FUNCTION update_qrmaze_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qrmaze_updated_at
    BEFORE UPDATE ON qrmaze
    FOR EACH ROW
    EXECUTE FUNCTION update_qrmaze_timestamp();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE qrmaze ENABLE ROW LEVEL SECURITY;

-- Anyone can view scores (public leaderboard)
CREATE POLICY "Anyone can view qrmaze scores"
    ON qrmaze FOR SELECT
    USING (true);

-- Users can insert their own scores (authenticated users)
CREATE POLICY "Users can submit their own scores"
    ON qrmaze FOR INSERT
    WITH CHECK (
        email IN (
            SELECT email FROM users WHERE id = auth.uid()
        )
    );

-- Allow unauthenticated score submissions for verified emails
CREATE POLICY "Allow score submissions for verified emails"
    ON qrmaze FOR INSERT
    WITH CHECK (
        email IN (
            SELECT email FROM users
        )
    );

-- Users can update their own scores (if needed for corrections)
CREATE POLICY "Users can update their own scores"
    ON qrmaze FOR UPDATE
    USING (
        email IN (
            SELECT email FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        email IN (
            SELECT email FROM users WHERE id = auth.uid()
        )
    );

-- Only admins can delete scores
CREATE POLICY "Only admins can delete scores"
    ON qrmaze FOR DELETE
    USING (is_admin());

-- ============================================
-- VIEW: User total scores across all sets
-- ============================================
CREATE OR REPLACE VIEW qrmaze_user_totals AS
SELECT 
    email,
    user_id,
    COUNT(*) as sets_completed,
    SUM(correct_answers) as total_correct_answers,
    SUM(time_taken) as total_time_taken,
    AVG(correct_answers) as avg_correct_answers,
    AVG(time_taken) as avg_time_taken,
    MAX(updated_at) as last_submission
FROM qrmaze
GROUP BY email, user_id;

-- ============================================
-- VIEW: Leaderboard per set
-- ============================================
CREATE OR REPLACE VIEW qrmaze_set_leaderboard AS
SELECT 
    q.set_number,
    q.title,
    q.email,
    u.full_name,
    u.enrollment_number,
    u.department,
    u.year,
    q.correct_answers,
    q.time_taken,
    q.created_at,
    -- Ranking within each set (by correct answers desc, then time asc)
    ROW_NUMBER() OVER (
        PARTITION BY q.set_number 
        ORDER BY q.correct_answers DESC, q.time_taken ASC
    ) as rank
FROM qrmaze q
JOIN users u ON q.email = u.email;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Update API routes to use qrmaze table
-- 2. Test email verification and score submission
-- 3. Verify RLS policies are working correctly
