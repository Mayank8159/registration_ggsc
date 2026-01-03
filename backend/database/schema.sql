-- ============================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Registration & Scoring System with Supabase
-- ============================================

-- ============================================
-- TABLE 1: USERS (Registration Table)
-- ============================================
CREATE TABLE users (
    -- Primary identifier (matches Supabase Auth UUID)
    id UUID PRIMARY KEY,
    
    -- User information
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    enrollment_number TEXT UNIQUE NOT NULL,
    mobile_number TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_users_enrollment ON users(enrollment_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department_year ON users(department, year);

-- ============================================
-- TABLE 2: TEAMS (Scoring Table)
-- ============================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL,
    
    -- Round scores (nullable until round is completed)
    round1_score INTEGER,
    round2_score INTEGER,
    round3_score INTEGER,
    
    -- Auto-calculated total score
    total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(round1_score, 0) + 
        COALESCE(round2_score, 0) + 
        COALESCE(round3_score, 0)
    ) STORED,
    
    -- Timestamps for each round update
    round1_updated_at TIMESTAMPTZ,
    round2_updated_at TIMESTAMPTZ,
    round3_updated_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX idx_teams_total_score ON teams(total_score DESC NULLS LAST);
CREATE INDEX idx_teams_round1 ON teams(round1_score DESC NULLS LAST);
CREATE INDEX idx_teams_round2 ON teams(round2_score DESC NULLS LAST);
CREATE INDEX idx_teams_round3 ON teams(round3_score DESC NULLS LAST);
CREATE INDEX idx_teams_name ON teams(team_name);

-- ============================================
-- TABLE 3: TEAM_MEMBERS (Junction Table)
-- ============================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Metadata
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each user can only be in ONE team
    UNIQUE(user_id),
    
    -- Prevent duplicate team-user pairs
    CONSTRAINT unique_team_user UNIQUE(team_id, user_id)
);

-- Indexes for lookups
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================
-- TRIGGER: Enforce team size limit (1-4 members)
-- ============================================
CREATE OR REPLACE FUNCTION check_team_size()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM team_members WHERE team_id = NEW.team_id) >= 4 THEN
        RAISE EXCEPTION 'Team cannot have more than 4 members';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_team_size
    BEFORE INSERT ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION check_team_size();

-- ============================================
-- FUNCTION: Admin role check
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND email IN (
            -- Admin emails
            'gambassador2025@gmail.com'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- USERS TABLE POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Authenticated users can view all profiles (for team info)
CREATE POLICY "Authenticated users can view all profiles"
    ON users FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can insert their own profile after signup
CREATE POLICY "Users can create own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- TEAMS TABLE POLICIES
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Anyone can view teams and scores (public leaderboard)
CREATE POLICY "Anyone can view teams"
    ON teams FOR SELECT
    USING (true);

-- Only admins can update team scores
CREATE POLICY "Only admins can update team scores"
    ON teams FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Only admins can create teams (random assignment)
CREATE POLICY "Only admins can create teams"
    ON teams FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can delete teams
CREATE POLICY "Only admins can delete teams"
    ON teams FOR DELETE
    USING (is_admin());

-- TEAM_MEMBERS TABLE POLICIES
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view team memberships (for team info display)
CREATE POLICY "Anyone can view team members"
    ON team_members FOR SELECT
    USING (true);

-- Only admins can add team members (random assignment)
CREATE POLICY "Only admins can add team members"
    ON team_members FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can remove team members
CREATE POLICY "Only admins can remove team members"
    ON team_members FOR DELETE
    USING (is_admin());

-- ============================================
-- FUNCTION: Random Team Formation
-- ============================================
CREATE OR REPLACE FUNCTION create_random_teams(
    desired_team_size INTEGER DEFAULT 4,
    team_name_prefix TEXT DEFAULT 'Team'
)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    member_count BIGINT
) AS $$
DECLARE
    unassigned_users UUID[];
    current_team_id UUID;
    current_team_number INTEGER := 1;
    users_assigned INTEGER := 0;
    total_unassigned INTEGER;
BEGIN
    -- Get all users who are not in any team (randomized)
    SELECT ARRAY_AGG(id ORDER BY RANDOM())
    INTO unassigned_users
    FROM users
    WHERE id NOT IN (SELECT user_id FROM team_members);
    
    total_unassigned := COALESCE(array_length(unassigned_users, 1), 0);
    
    IF total_unassigned = 0 THEN
        RAISE NOTICE 'No unassigned users found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found % unassigned users', total_unassigned;
    
    -- Create teams with variable sizes (1-4 members)
    WHILE users_assigned < total_unassigned LOOP
        DECLARE
            remaining_users INTEGER := total_unassigned - users_assigned;
            this_team_size INTEGER;
            team_name_text TEXT;
        BEGIN
            -- Determine team size
            IF remaining_users >= desired_team_size THEN
                this_team_size := desired_team_size;
            ELSE
                this_team_size := remaining_users;
            END IF;
            
            -- Create new team
            team_name_text := team_name_prefix || ' ' || current_team_number;
            
            INSERT INTO teams (team_name)
            VALUES (team_name_text)
            RETURNING id INTO current_team_id;
            
            -- Add members to team
            FOR i IN 1..this_team_size LOOP
                INSERT INTO team_members (team_id, user_id)
                VALUES (current_team_id, unassigned_users[users_assigned + i]);
            END LOOP;
            
            users_assigned := users_assigned + this_team_size;
            current_team_number := current_team_number + 1;
        END;
    END LOOP;
    
    -- Return created teams with member counts
    RETURN QUERY
    SELECT 
        t.id,
        t.team_name,
        COUNT(tm.user_id) as member_count
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.created_at > NOW() - INTERVAL '5 minutes'
    GROUP BY t.id, t.team_name
    ORDER BY t.team_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Update admin emails in is_admin() function
-- 2. Enable Supabase Auth (email/password provider)
-- 3. Test with sample data
