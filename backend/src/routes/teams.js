import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Get all teams
 * GET /api/teams
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('team_summary')
            .select('*')
            .order('team_number', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ 
            teams: data, 
            count: data.length,
            total_members: data.reduce((sum, team) => sum + team.member_count, 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get team by team number
 * GET /api/teams/:teamNumber
 */
router.get('/:teamNumber', async (req, res) => {
    try {
        const { teamNumber } = req.params;

        const { data, error } = await supabase
            .from('team_summary')
            .select('*')
            .eq('team_number', parseInt(teamNumber))
            .single();

        if (error) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.status(200).json({ team: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create random teams of 4 members
 * POST /api/teams/create-random
 */
router.post('/create-random', async (req, res) => {
    try {
        const { team_size = 4, team_name_prefix = 'Team' } = req.body;

        // Call the database function to create random team assignments
        const { data, error } = await supabaseAdmin.rpc('create_random_team_assignments', {
            team_size: parseInt(team_size),
            team_name_prefix
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Random teams created successfully',
            teams: data,
            total_teams: data ? data.length : 0,
            total_members: data ? data.reduce((sum, team) => sum + team.member_count, 0) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user's team by email or user ID
 * GET /api/teams/user/:identifier (can be email or user_id)
 */
router.get('/user/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // URL decode the identifier in case it contains encoded characters
        const decodedIdentifier = decodeURIComponent(identifier);

        // Check if identifier looks like a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedIdentifier);

        let query;
        if (isUUID) {
            // If it's a UUID, search by user_id
            query = supabaseAdmin
                .from('team_members')
                .select('*')
                .eq('user_id', decodedIdentifier);
        } else {
            // If it's an email, search by email in team_members table
            query = supabaseAdmin
                .from('team_members')
                .select('*')
                .eq('email', decodedIdentifier.toLowerCase());
        }

        const { data, error } = await query.single();

        if (error || !data) {
            return res.status(404).json({ error: 'User not in any team' });
        }

        // Now get the user details separately using admin client
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, enrollment_number, department, year')
            .eq('id', data.user_id)
            .single();

        if (userError) {
            return res.status(500).json({ error: 'User data not found' });
        }

        // Get all team members for this team
        const { data: teamMembers, error: teamError } = await supabaseAdmin
            .from('team_members')
            .select(`
                user_id,
                email,
                team_number,
                team_name,
                role,
                users!team_members_user_id_fkey(full_name, enrollment_number, department, year, is_present)
            `)
            .eq('team_number', data.team_number);

        if (teamError) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Format the team data
        const teamData = {
            team_number: data.team_number,
            team_name: data.team_name,
            member_count: teamMembers.length,
            members: teamMembers.map(member => ({
                user_id: member.user_id,
                email: member.email,
                full_name: member.users.full_name,
                enrollment_number: member.users.enrollment_number,
                department: member.users.department,
                year: member.users.year,
                is_present: member.users.is_present,
                role: member.role || 'member'
            }))
        };

        res.status(200).json({ 
            user: {
                user_id: data.user_id,
                email: data.email,
                full_name: userData.full_name,
                enrollment_number: userData.enrollment_number
            },
            team: teamData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Remove all team assignments (admin only)
 * DELETE /api/teams/clear
 */
router.delete('/clear', async (req, res) => {
    try {
        // Delete all team assignments using admin client
        const { error } = await supabaseAdmin
            .from('team_members')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // This will match all records

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'All team assignments cleared successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
