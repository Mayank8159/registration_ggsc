-- ============================================
-- TABLE: GAME LEVELS (Level Storage 1-5)
-- ============================================

CREATE TABLE game_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL, -- Changed from username to email to match users table
    level_time INTEGER, -- Time in seconds
    total_game_time INTEGER, -- Time in seconds
    last_completed_level TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_game_levels_email ON game_levels(email);
CREATE INDEX idx_game_levels_last_completed_level ON game_levels(last_completed_level);
CREATE INDEX idx_game_levels_completed_at ON game_levels(completed_at DESC);

-- RLS Policies
ALTER TABLE game_levels ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (users submit their own score)
CREATE POLICY "Anyone can insert game levels"
    ON game_levels FOR INSERT
    WITH CHECK (true);

-- Anyone can view
CREATE POLICY "Anyone can view game levels"
    ON game_levels FOR SELECT
    USING (true);
