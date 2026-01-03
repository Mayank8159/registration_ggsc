import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * User signup
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, full_name, enrollment_number, mobile_number, department, year } = req.body;

        // Validate required fields
        if (!email || !password || !full_name || !enrollment_number || !mobile_number || !department || !year) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'password', 'full_name', 'enrollment_number', 'mobile_number', 'department', 'year']
            });
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        // Create user profile using admin client (bypasses RLS)
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                full_name,
                enrollment_number,
                mobile_number,
                department,
                year: parseInt(year)
            })
            .select()
            .single();

        if (userError) {
            return res.status(400).json({ error: userError.message });
        }

        // Send confirmation email
        try {
            const { sendRegistrationEmail } = await import('../services/emailService.js');
            await sendRegistrationEmail(userData);
            console.log('📧 Confirmation email sent to:', userData.email);
        } catch (emailError) {
            console.error('📧 Failed to send confirmation email:', emailError.message);
            console.error('Email error details:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            message: 'User registered successfully',
            user: userData,
            session: authData.session
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * User login
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Get user profile
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        res.status(200).json({
            message: 'Login successful',
            user: userData,
            session: data.session
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * User logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user profile
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        res.status(200).json({ user: userData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
