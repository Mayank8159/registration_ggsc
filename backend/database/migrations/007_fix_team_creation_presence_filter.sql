-- ============================================
-- MIGRATION: Fix Team Creation to Properly Filter by is_present
-- ============================================

-- Drop and recreate the function with stricter presence filtering
DROP FUNCTION IF EXISTS create_random_team_assignments(INTEGER, TEXT);

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
    
    -- Get count of present users not in teams (strict boolean check)
    SELECT COUNT(*) INTO total_unassigned
    FROM users
    WHERE is_present IS TRUE  -- Explicit IS TRUE check
    AND id NOT IN (SELECT user_id FROM team_members);
    
    RAISE NOTICE 'Total users in database: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Users with is_present=true: %', (SELECT COUNT(*) FROM users WHERE is_present IS TRUE);
    RAISE NOTICE 'Users with is_present=false: %', (SELECT COUNT(*) FROM users WHERE is_present IS FALSE);
    RAISE NOTICE 'Users with is_present=null: %', (SELECT COUNT(*) FROM users WHERE is_present IS NULL);
    
    IF total_unassigned = 0 THEN
        RAISE NOTICE 'No present, unassigned users found. Cannot create teams.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found % present users to assign to teams', total_unassigned;
    
    -- Create teams with exactly team_size members (or remaining users for last team)
    FOR unassigned_users IN
        SELECT id, email, full_name
        FROM users
        WHERE is_present IS TRUE  -- Explicit IS TRUE check
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
-- MIGRATION COMPLETE
-- ============================================
