import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * Verify if email exists in users table
 * POST /api/verify-email
 * Body: { email: "user@example.com" }
 */
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                exists: false,
                error: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                exists: false,
                error: 'Invalid email format'
            });
        }

        // Check if email exists in users table (using admin client to bypass RLS)
        const normalizedEmail = email.toLowerCase().trim();
        console.log('Checking email:', normalizedEmail);

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, enrollment_number, department, year, mobile_number')
            .eq('email', normalizedEmail);

        console.log('Query result:', { data: data?.length, error });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({
                success: false,
                exists: false,
                error: 'Database query failed',
                details: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(200).json({
                success: true,
                exists: false,
                message: 'Email not found in registered users',
                email: normalizedEmail
            });
        }

        // Email exists - return user details (take first match)
        const user = data[0];
        res.status(200).json({
            success: true,
            exists: true,
            message: 'Email verified successfully',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                enrollment_number: user.enrollment_number,
                department: user.department,
                year: user.year,
                mobile_number: user.mobile_number
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            exists: false,
            error: error.message
        });
    }
});

/**
 * Verify multiple emails in bulk
 * POST /api/verify-email/bulk
 * Body: { emails: ["user1@example.com", "user2@example.com"] }
 */
router.post('/bulk', async (req, res) => {
    try {
        const { emails } = req.body;

        if (!Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'emails must be a non-empty array'
            });
        }

        if (emails.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 100 emails allowed per request'
            });
        }

        // Normalize emails
        const normalizedEmails = emails.map(e => e.toLowerCase().trim());

        // Query all emails
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, enrollment_number')
            .in('email', normalizedEmails);

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // Create result map
        const foundEmails = new Set(data.map(u => u.email));
        const results = normalizedEmails.map(email => ({
            email,
            exists: foundEmails.has(email),
            user: data.find(u => u.email === email) || null
        }));

        res.status(200).json({
            success: true,
            total: emails.length,
            found: data.length,
            not_found: emails.length - data.length,
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
