-- ============================================
-- MIGRATION: ADD ATTENDANCE TRACKING
-- ============================================

-- 1. Add is_present column to users table
-- Defaulting to false so users must be checked in to be placed in a team
ALTER TABLE users ADD COLUMN is_present BOOLEAN DEFAULT false;

-- 2. Add index for performance
CREATE INDEX idx_users_is_present ON users(is_present);

-- 3. Update create_random_teams function to ONLY pick present users
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
    -- Get all users who are not in any team AND are marked present
    SELECT ARRAY_AGG(id ORDER BY RANDOM())
    INTO unassigned_users
    FROM users
    WHERE id NOT IN (SELECT user_id FROM team_members)
    AND is_present = true;  -- Only select users who are present at the venue
    
    total_unassigned := COALESCE(array_length(unassigned_users, 1), 0);
    
    IF total_unassigned = 0 THEN
        RAISE NOTICE 'No unassigned present users found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found % unassigned present users', total_unassigned;
    
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
