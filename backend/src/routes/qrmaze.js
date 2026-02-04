import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Verify if email exists in users table
 * POST /api/qrmaze/verify-email
 * Body: { email: "user@example.com" }
 */
router.post('/verify-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email is required',
                exists: false
            });
        }

        // Check if email exists in users table (using admin client to bypass RLS)
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, enrollment_number, department, year')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (error || !data) {
            return res.status(200).json({
                exists: false,
                message: 'Email not found in registered users'
            });
        }

        // Email exists
        res.status(200).json({
            exists: true,
            message: 'Email verified successfully',
            user: {
                id: data.id,
                email: data.email,
                full_name: data.full_name,
                enrollment_number: data.enrollment_number,
                department: data.department,
                year: data.year
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            exists: false
        });
    }
});

/**
 * Submit score for a set
 * POST /api/qrmaze/submit-score
 * Body: {
 *   email: "user@example.com",
 *   timeTaken: 16,
 *   correctAnswers: 1,
 *   setNumber: 1,
 *   title: "Introduction to Programming (C & Python)"
 * }
 */
router.post('/submit-score', async (req, res) => {
    try {
        const { email, timeTaken, correctAnswers, setNumber, title } = req.body;

        // Validate required fields
        if (!email || timeTaken === undefined || correctAnswers === undefined || !setNumber || !title) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'timeTaken', 'correctAnswers', 'setNumber', 'title']
            });
        }

        // Validate setNumber range
        if (setNumber < 1 || setNumber > 5) {
            return res.status(400).json({
                error: 'Invalid set number. Must be between 1 and 5'
            });
        }

        // Validate numeric values
        if (timeTaken < 0 || correctAnswers < 0) {
            return res.status(400).json({
                error: 'timeTaken and correctAnswers must be non-negative'
            });
        }

        // First verify email exists (using admin client to bypass RLS)
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (userError || !userData) {
            return res.status(404).json({
                error: 'Email not found in registered users',
                message: 'Please register first before submitting scores'
            });
        }

        // Insert score into qrmaze table
        const { data, error } = await supabaseAdmin
            .from('qrmaze')
            .insert({
                email: email.toLowerCase().trim(),
                time_taken: parseInt(timeTaken),
                correct_answers: parseInt(correctAnswers),
                set_number: parseInt(setNumber),
                title: title
            })
            .select()
            .single();

        if (error) {
            // Check if it's a duplicate entry error
            if (error.code === '23505') {
                return res.status(409).json({
                    error: 'Score already submitted for this set',
                    message: `You have already submitted a score for set ${setNumber}`
                });
            }
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Score submitted successfully',
            submission: {
                id: data.id,
                email: data.email,
                setNumber: data.set_number,
                title: data.title,
                correctAnswers: data.correct_answers,
                timeTaken: data.time_taken,
                submittedAt: data.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user's progress across all sets
 * GET /api/qrmaze/user/:email
 */
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const { data, error } = await supabase
            .from('qrmaze')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .order('set_number', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get user info (using admin client to bypass RLS)
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('full_name, enrollment_number, department, year')
            .eq('email', email.toLowerCase().trim())
            .single();

        res.status(200).json({
            email: email,
            user: userData,
            sets_completed: data.length,
            submissions: data.map(s => ({
                setNumber: s.set_number,
                title: s.title,
                correctAnswers: s.correct_answers,
                timeTaken: s.time_taken,
                submittedAt: s.created_at
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get leaderboard for a specific set
 * GET /api/qrmaze/leaderboard/:setNumber
 */
router.get('/leaderboard/:setNumber', async (req, res) => {
    try {
        const { setNumber } = req.params;
        const setNum = parseInt(setNumber);

        if (setNum < 1 || setNum > 5) {
            return res.status(400).json({
                error: 'Invalid set number. Must be between 1 and 5'
            });
        }

        // Use the view for leaderboard (using admin client to bypass RLS)
        const { data, error } = await supabaseAdmin
            .from('qrmaze_set_leaderboard')
            .select('*')
            .eq('set_number', setNum)
            .order('rank', { ascending: true })
            .limit(100);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            setNumber: setNum,
            title: data.length > 0 ? data[0].title : null,
            count: data.length,
            leaderboard: data.map(entry => ({
                rank: entry.rank,
                fullName: entry.full_name,
                email: entry.email,
                enrollmentNumber: entry.enrollment_number,
                department: entry.department,
                year: entry.year,
                correctAnswers: entry.correct_answers,
                timeTaken: entry.time_taken,
                submittedAt: entry.created_at
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get overall leaderboard (total scores across all sets)
 * GET /api/qrmaze/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        // Get user totals
        const { data: totalsData, error: totalsError } = await supabaseAdmin
            .from('qrmaze_user_totals')
            .select('*')
            .order('total_correct_answers', { ascending: false })
            .order('total_time_taken', { ascending: true })
            .limit(100);

        if (totalsError) {
            return res.status(400).json({ error: totalsError.message });
        }

        // Get user details separately
        const userIds = totalsData.map(entry => entry.user_id);
        const { data: usersData, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id, full_name, enrollment_number, department, year')
            .in('id', userIds);

        if (usersError) {
            return res.status(400).json({ error: usersError.message });
        }

        // Create a map of user_id to user data
        const usersMap = {};
        usersData.forEach(user => {
            usersMap[user.id] = user;
        });

        res.status(200).json({
            count: totalsData.length,
            leaderboard: totalsData.map((entry, index) => {
                const user = usersMap[entry.user_id] || {};
                return {
                    rank: index + 1,
                    email: entry.email,
                    fullName: user.full_name || 'Unknown',
                    enrollmentNumber: user.enrollment_number || 'N/A',
                    department: user.department || 'N/A',
                    year: user.year || 0,
                    setsCompleted: entry.sets_completed,
                    totalCorrectAnswers: entry.total_correct_answers,
                    totalTimeTaken: entry.total_time_taken,
                    avgCorrectAnswers: parseFloat(entry.avg_correct_answers).toFixed(2),
                    avgTimeTaken: parseFloat(entry.avg_time_taken).toFixed(2),
                    lastSubmission: entry.last_submission
                };
            })
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all submissions for a specific set
 * GET /api/qrmaze/set/:setNumber/submissions
 */
router.get('/set/:setNumber/submissions', async (req, res) => {
    try {
        const { setNumber } = req.params;
        const setNum = parseInt(setNumber);

        if (setNum < 1 || setNum > 5) {
            return res.status(400).json({
                error: 'Invalid set number. Must be between 1 and 5'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('qrmaze')
            .select(`
                *,
                users!inner(full_name, enrollment_number, department, year)
            `)
            .eq('set_number', setNum)
            .order('correct_answers', { ascending: false })
            .order('time_taken', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            setNumber: setNum,
            count: data.length,
            submissions: data.map(entry => ({
                id: entry.id,
                email: entry.email,
                fullName: entry.users.full_name,
                enrollmentNumber: entry.users.enrollment_number,
                department: entry.users.department,
                year: entry.users.year,
                title: entry.title,
                correctAnswers: entry.correct_answers,
                timeTaken: entry.time_taken,
                submittedAt: entry.created_at
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update a user's score for a set (in case of corrections)
 * PUT /api/qrmaze/update-score
 * Body: {
 *   email: "user@example.com",
 *   setNumber: 1,
 *   timeTaken: 20,
 *   correctAnswers: 5
 * }
 */
router.put('/update-score', async (req, res) => {
    try {
        const { email, setNumber, timeTaken, correctAnswers } = req.body;

        if (!email || !setNumber || timeTaken === undefined || correctAnswers === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'setNumber', 'timeTaken', 'correctAnswers']
            });
        }

        const { data, error } = await supabaseAdmin
            .from('qrmaze')
            .update({
                time_taken: parseInt(timeTaken),
                correct_answers: parseInt(correctAnswers)
            })
            .eq('email', email.toLowerCase().trim())
            .eq('set_number', parseInt(setNumber))
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'Score updated successfully',
            submission: {
                email: data.email,
                setNumber: data.set_number,
                correctAnswers: data.correct_answers,
                timeTaken: data.time_taken,
                updatedAt: data.updated_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Delete a submission (admin only)
 * DELETE /api/qrmaze/submission/:id
 */
router.delete('/submission/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('qrmaze')
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
