-- ============================================
-- MIGRATION: Create Team Members Table
-- Random team formation for group activities
-- ============================================

-- ============================================
-- TABLE: TEAM_MEMBERS (Team Formation)
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    
    -- Team information
    team_number INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    
    -- Team role (optional)
    role TEXT DEFAULT 'member',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each user can only be in ONE team
    CONSTRAINT unique_user_in_team UNIQUE(user_id)
);

-- Indexes for faster queries
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_team_number ON team_members(team_number);
CREATE INDEX idx_team_members_team_name ON team_members(team_name);

-- ============================================
-- FUNCTION: Update timestamp on modification
-- ============================================
CREATE OR REPLACE FUNCTION update_team_members_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_team_members_timestamp();

-- ============================================
-- FUNCTION: Random Team Formation
-- ============================================
CREATE OR REPLACE FUNCTION create_random_team_assignments(
    team_size INTEGER DEFAULT 4,
    team_name_prefix TEXT DEFAULT 'Team'
)
RETURNS TABLE (
    team_number INTEGER,
    team_name TEXT,
    member_count BIGINT,
    members JSONB
) AS $$
DECLARE
    unassigned_users RECORD;
    current_team_number INTEGER := 1;
    users_assigned INTEGER := 0;
    total_unassigned INTEGER;
    user_batch UUID[];
    batch_size INTEGER;
BEGIN
    -- Clear existing team assignments
    TRUNCATE TABLE team_members;
    
    -- Get count of present users not in teams
    SELECT COUNT(*) INTO total_unassigned
    FROM users
    WHERE is_present IS TRUE
    AND id NOT IN (SELECT user_id FROM team_members);
    
    IF total_unassigned = 0 THEN
        RAISE NOTICE 'No present, unassigned users found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found % present users to assign to teams', total_unassigned;
    
    -- Create teams with exactly team_size members (or remaining users for last team)
    FOR unassigned_users IN
        SELECT id, email, full_name
        FROM users
        WHERE is_present IS TRUE
        AND id NOT IN (SELECT user_id FROM team_members)
        ORDER BY RANDOM()
    LOOP
        -- Determine current batch size
        batch_size := users_assigned % team_size;
        
        -- If starting a new team
        IF batch_size = 0 AND users_assigned > 0 THEN
            current_team_number := current_team_number + 1;
        END IF;
        
        -- Add user to current team
        INSERT INTO team_members (user_id, email, team_number, team_name)
        VALUES (
            unassigned_users.id,
            unassigned_users.email,
            current_team_number,
            team_name_prefix || ' ' || current_team_number
        );
        
        users_assigned := users_assigned + 1;
    END LOOP;
    
    RAISE NOTICE 'Created % teams with % total members', current_team_number, users_assigned;
    
    -- Return created teams with member details
    RETURN QUERY
    SELECT 
        tm.team_number,
        tm.team_name,
        COUNT(tm.user_id) as member_count,
        jsonb_agg(
            jsonb_build_object(
                'user_id', tm.user_id,
                'email', tm.email,
                'full_name', u.full_name,
                'enrollment_number', u.enrollment_number,
                'department', u.department,
                'year', u.year,
                'is_present', u.is_present
            ) ORDER BY tm.created_at
        ) as members
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    GROUP BY tm.team_number, tm.team_name
    ORDER BY tm.team_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW: Team Summary
-- ============================================
CREATE OR REPLACE VIEW team_summary AS
SELECT 
    tm.team_number,
    tm.team_name,
    COUNT(tm.user_id) as member_count,
    jsonb_agg(
        jsonb_build_object(
            'user_id', tm.user_id,
            'email', tm.email,
            'full_name', u.full_name,
            'enrollment_number', u.enrollment_number,
            'department', u.department,
            'year', u.year,
            'is_present', u.is_present,
            'role', tm.role
        ) ORDER BY tm.created_at
    ) as members,
    MIN(tm.created_at) as created_at,
    MAX(tm.updated_at) as updated_at
FROM team_members tm
JOIN users u ON tm.user_id = u.id
GROUP BY tm.team_number, tm.team_name
ORDER BY tm.team_number;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view team memberships
CREATE POLICY "Anyone can view team members"
    ON team_members FOR SELECT
    USING (true);

-- Users can view their own team membership
CREATE POLICY "Users can view own team"
    ON team_members FOR SELECT
    USING (user_id = auth.uid());

-- Only admins can create team assignments
CREATE POLICY "Only admins can create teams"
    ON team_members FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update team assignments
CREATE POLICY "Only admins can update teams"
    ON team_members FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Only admins can delete team assignments
CREATE POLICY "Only admins can delete teams"
    ON team_members FOR DELETE
    USING (is_admin());

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
