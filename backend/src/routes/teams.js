import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Get all teams (leaderboard)
 * GET /api/teams
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select(`
        *,
        team_members(
          user_id,
          users(id, full_name, email, enrollment_number)
        )
      `)
            .order('total_score', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ teams: data, count: data.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get team by ID
 * GET /api/teams/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('teams')
            .select(`
        *,
        team_members(
          user_id,
          joined_at,
          users(id, full_name, email, enrollment_number, department, year)
        )
      `)
            .eq('id', id)
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
 * Create random teams (admin only)
 * POST /api/teams/create-random
 */
router.post('/create-random', async (req, res) => {
    try {
        const { team_size = 4, team_name_prefix = 'Team' } = req.body;

        // Call the database function to create random teams
        const { data, error } = await supabaseAdmin.rpc('create_random_teams', {
            desired_team_size: parseInt(team_size),
            team_name_prefix
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Random teams created successfully',
            teams: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user's team
 * GET /api/teams/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('team_members')
            .select(`
        team_id,
        teams(
          *,
          team_members(
            user_id,
            users(id, full_name, email, enrollment_number)
          )
        )
      `)
            .eq('user_id', userId)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User not in any team' });
        }

        res.status(200).json({ team: data.teams });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
