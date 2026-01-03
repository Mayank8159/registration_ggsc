import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Update team score for a specific round (admin only)
 * POST /api/scores/update
 */
router.post('/update', async (req, res) => {
    try {
        const { team_id, round, score } = req.body;

        // Validate inputs
        if (!team_id || !round || score === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['team_id', 'round', 'score']
            });
        }

        const roundNum = parseInt(round);
        if (roundNum < 1 || roundNum > 3) {
            return res.status(400).json({
                error: 'Invalid round number. Must be 1, 2, or 3'
            });
        }

        // Prepare update object
        const updates = {
            [`round${roundNum}_score`]: parseInt(score),
            [`round${roundNum}_updated_at`]: new Date().toISOString()
        };

        // Update team score using admin client (bypasses RLS)
        const { data, error } = await supabaseAdmin
            .from('teams')
            .update(updates)
            .eq('id', team_id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: `Round ${roundNum} score updated successfully`,
            team: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Batch update scores for multiple teams
 * POST /api/scores/batch-update
 */
router.post('/batch-update', async (req, res) => {
    try {
        const { updates } = req.body;

        // updates should be an array like:
        // [{ team_id: 'uuid', round: 1, score: 100 }, ...]

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                error: 'Updates must be a non-empty array'
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            const { team_id, round, score } = update;
            const roundNum = parseInt(round);

            if (!team_id || !round || score === undefined) {
                errors.push({ team_id, error: 'Missing required fields' });
                continue;
            }

            if (roundNum < 1 || roundNum > 3) {
                errors.push({ team_id, error: 'Invalid round number' });
                continue;
            }

            const updateData = {
                [`round${roundNum}_score`]: parseInt(score),
                [`round${roundNum}_updated_at`]: new Date().toISOString()
            };

            const { data, error } = await supabaseAdmin
                .from('teams')
                .update(updateData)
                .eq('id', team_id)
                .select()
                .single();

            if (error) {
                errors.push({ team_id, error: error.message });
            } else {
                results.push(data);
            }
        }

        res.status(200).json({
            message: 'Batch update completed',
            successful: results.length,
            failed: errors.length,
            results,
            errors
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get leaderboard for a specific round
 * GET /api/scores/leaderboard/:round
 */
router.get('/leaderboard/:round', async (req, res) => {
    try {
        const { round } = req.params;
        const roundNum = parseInt(round);

        if (roundNum < 1 || roundNum > 3) {
            return res.status(400).json({
                error: 'Invalid round number. Must be 1, 2, or 3'
            });
        }

        const scoreField = `round${roundNum}_score`;

        const { data, error } = await supabaseAdmin
            .from('teams')
            .select(`
        id,
        team_name,
        ${scoreField},
        round${roundNum}_updated_at,
        team_members(
          users(full_name, enrollment_number)
        )
      `)
            .order(scoreField, { ascending: false, nullsFirst: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            round: roundNum,
            teams: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get overall leaderboard (total scores)
 * GET /api/scores/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('teams')
            .select(`
        *,
        team_members(
          users(full_name, enrollment_number)
        )
      `)
            .order('total_score', { ascending: false, nullsFirst: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            leaderboard: data,
            count: data.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
