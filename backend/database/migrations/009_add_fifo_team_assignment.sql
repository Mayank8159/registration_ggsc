-- ============================================
-- MIGRATION: FIFO Team Assignment on Attendance
-- Assigns users to teams in order as they're marked present
-- ============================================

-- Function to assign a single user to a team using FIFO logic
-- Called when a user is marked present
CREATE OR REPLACE FUNCTION assign_user_to_team_fifo(
    p_user_id UUID,
    p_user_email TEXT,
    p_team_size INTEGER DEFAULT 4,
    p_team_name_prefix TEXT DEFAULT 'Team'
)
RETURNS TABLE (
    team_number INTEGER,
    team_name TEXT,
    member_count BIGINT,
    is_new_team BOOLEAN
) AS $$
DECLARE
    v_existing_team_number INTEGER;
    v_target_team_number INTEGER;
    v_target_team_name TEXT;
    v_current_member_count BIGINT;
    v_is_new_team BOOLEAN := FALSE;
BEGIN
    -- Check if user is already assigned to a team
    SELECT tm.team_number INTO v_existing_team_number
    FROM team_members tm
    WHERE tm.user_id = p_user_id;
    
    IF v_existing_team_number IS NOT NULL THEN
        -- User already has a team, return existing assignment
        RETURN QUERY
        SELECT 
            tm.team_number,
            tm.team_name,
            COUNT(tm2.user_id) as member_count,
            FALSE as is_new_team
        FROM team_members tm
        JOIN team_members tm2 ON tm.team_number = tm2.team_number
        WHERE tm.user_id = p_user_id
        GROUP BY tm.team_number, tm.team_name;
        RETURN;
    END IF;
    
    -- Find the first team with less than team_size members (FIFO - lowest team number first)
    SELECT 
        tm.team_number,
        COUNT(tm.user_id) as current_count
    INTO v_target_team_number, v_current_member_count
    FROM team_members tm
    GROUP BY tm.team_number
    HAVING COUNT(tm.user_id) < p_team_size
    ORDER BY tm.team_number ASC
    LIMIT 1;
    
    -- If no incomplete team found, create a new one
    IF v_target_team_number IS NULL THEN
        -- Get the next team number
        SELECT COALESCE(MAX(tm.team_number), 0) + 1 
        INTO v_target_team_number
        FROM team_members tm;
        
        v_is_new_team := TRUE;
    END IF;
    
    -- Set the team name
    v_target_team_name := p_team_name_prefix || ' ' || v_target_team_number;
    
    -- Insert the user into the team
    INSERT INTO team_members (user_id, email, team_number, team_name)
    VALUES (p_user_id, p_user_email, v_target_team_number, v_target_team_name);
    
    -- Return the team assignment details
    RETURN QUERY
    SELECT 
        v_target_team_number as team_number,
        v_target_team_name as team_name,
        (SELECT COUNT(*) FROM team_members WHERE team_number = v_target_team_number) as member_count,
        v_is_new_team as is_new_team;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
