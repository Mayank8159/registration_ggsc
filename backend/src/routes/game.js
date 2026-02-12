import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Submit game level completion data
 * POST /api/game/submit-level
 */
router.post('/submit-level', async (req, res) => {
    try {
        const { email, levelTime, totalGameTime, lastCompletedLevel, completedAt } = req.body;

        // Validate required fields
        if (!email || !lastCompletedLevel) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'lastCompletedLevel']
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Verify email exists in users table (using admin client to bypass RLS)
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('email', normalizedEmail)
            .single();

        if (userError || !userData) {
            return res.status(404).json({
                error: 'Email not found in registered users',
                message: 'Please register first, or check your email address.'
            });
        }

        // Insert into game_levels table
        const { data, error } = await supabaseAdmin
            .from('game_levels')
            .insert({
                email: normalizedEmail,
                level_time: levelTime,
                total_game_time: totalGameTime,
                last_completed_level: lastCompletedLevel,
                completed_at: completedAt || new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Level completion saved successfully',
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get results for a specific user
 * GET /api/game/results/:email
 */
router.get('/results/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const normalizedEmail = email.toLowerCase().trim();

        const { data, error } = await supabase
            .from('game_levels')
            .select('*')
            .eq('email', normalizedEmail)
            .order('completed_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            email: normalizedEmail,
            count: data.length,
            results: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get global leaderboard
 * GET /api/game/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        // Fetch game levels
        const { data, error } = await supabase
            .from('game_levels')
            .select('*')
            .order('total_game_time', { ascending: true })
            .limit(100);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get user details for the emails in the leaderboard
        const emails = [...new Set(data.map(item => item.email))];
        const { data: usersData, error: usersError } = await supabaseAdmin
            .from('users')
            .select('email, full_name, enrollment_number, department, year')
            .in('email', emails);

        if (usersError) {
            console.error("Error fetching user details for leaderboard:", usersError);
        }

        const usersMap = {};
        if (usersData) {
            usersData.forEach(user => {
                usersMap[user.email] = user;
            });
        }

        const leaderboardWithDetails = data.map(entry => {
            const user = usersMap[entry.email] || {};
            return {
                ...entry,
                fullName: user.full_name || 'Unknown',
                enrollmentNumber: user.enrollment_number || 'N/A',
                department: user.department || 'N/A',
                year: user.year || 0
            };
        });

        res.status(200).json({
            count: data.length,
            leaderboard: leaderboardWithDetails
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all submissions (Admin)
 * GET /api/game/submissions
 */
router.get('/submissions', async (req, res) => {
    try {
        // Fetch all game levels with user data join
        // Using explicit join via supabase library feature if possible, 
        // OR manual join like in qrmaze route above.
        // Let's stick to the manual join pattern for consistency/safety if foreign keys aren't perfect in Supabase client type inference.

        const { data, error } = await supabaseAdmin
            .from('game_levels')
            .select('*')
            .order('completed_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get unique emails to fetch user details
        const emails = [...new Set(data.map(item => item.email))];

        // Fetch user details
        const { data: usersData, error: usersError } = await supabaseAdmin
            .from('users')
            .select('email, full_name, enrollment_number, department, year')
            .in('email', emails);

        if (usersError) {
            console.error("Error fetching user details for submissions:", usersError);
        }

        const usersMap = {};
        if (usersData) {
            usersData.forEach(user => {
                usersMap[user.email] = user;
            });
        }

        const submissionsWithDetails = data.map(entry => {
            const user = usersMap[entry.email] || {};
            return {
                id: entry.id,
                email: entry.email,
                fullName: user.full_name || 'Unknown',
                enrollmentNumber: user.enrollment_number || 'N/A',
                department: user.department || 'N/A',
                year: user.year || 0,
                levelTime: entry.level_time,
                totalGameTime: entry.total_game_time,
                lastCompletedLevel: entry.last_completed_level,
                completedAt: entry.completed_at
            };
        });

        res.status(200).json({
            count: data.length,
            submissions: submissionsWithDetails
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Delete a submission (Admin)
 * DELETE /api/game/submission/:id
 */
router.delete('/submission/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('game_levels')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'Submission deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
