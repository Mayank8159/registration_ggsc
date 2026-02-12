import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Get user statistics including is_present counts
 * GET /api/users/stats
 */
router.get('/stats', async (req, res) => {
    try {
        // Get total count
        const { count: totalCount } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Get present count
        const { count: presentCount } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_present', true);

        // Get absent count
        const { count: absentCount } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_present', false);

        // Get null count
        const { count: nullCount } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .is('is_present', null);

        res.status(200).json({
            total: totalCount,
            present: presentCount,
            absent: absentCount,
            null: nullCount,
            summary: `${presentCount}/${totalCount} users are present`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all users
 * GET /api/users
 */
router.get('/', async (req, res) => {
    try {
        const { department, year } = req.query;

        let query = supabaseAdmin.from('users').select('*');

        if (department) {
            query = query.eq('department', department);
        }
        if (year) {
            query = query.eq('year', parseInt(year));
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ users: data, count: data.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update user profile
 * PATCH /api/users/:id
 * When is_present is set to true, automatically assigns user to a team (FIFO)
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mobile_number, department, year } = req.body;

        // Handle is_present - can come as boolean or string
        let isPresent = req.body.is_present;
        if (typeof isPresent === 'string') {
            isPresent = isPresent.toLowerCase() === 'true';
        }

        const updates = {};
        if (mobile_number) updates.mobile_number = mobile_number;
        if (department) updates.department = department;
        if (year) updates.year = parseInt(year);
        if (req.body.is_present !== undefined) updates.is_present = isPresent;

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // If user is being marked as present, assign them to a team automatically
        let teamAssignment = null;
        let teamError = null;
        if (isPresent === true && data) {
            // Call the FIFO team assignment function
            const { data: teamData, error: rpcError } = await supabaseAdmin.rpc('assign_user_to_team_fifo', {
                p_user_id: data.id,
                p_user_email: data.email,
                p_team_size: 4,
                p_team_name_prefix: 'Team'
            });

            if (rpcError) {
                console.error('Team assignment RPC error:', rpcError);
                teamError = rpcError.message;
            } else if (teamData && teamData.length > 0) {
                // Map from SQL column names to response format
                teamAssignment = {
                    team_number: teamData[0].assigned_team_number,
                    team_name: teamData[0].assigned_team_name,
                    member_count: teamData[0].current_member_count,
                    is_new_team: teamData[0].is_new_team
                };
            } else {
                console.log('Team assignment returned empty data:', teamData);
            }
        }

        res.status(200).json({
            message: teamAssignment
                ? `User updated and assigned to ${teamAssignment.team_name}`
                : 'User updated successfully',
            user: data,
            team_assignment: teamAssignment,
            team_error: teamError
        });
    } catch (error) {
        console.error('PATCH user error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
