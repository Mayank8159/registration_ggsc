import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * Get all users
 * GET /api/users
 */
router.get('/', async (req, res) => {
    try {
        const { department, year } = req.query;

        let query = supabase.from('users').select('*');

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

        const { data, error } = await supabase
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
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mobile_number, department, year } = req.body;

        const updates = {};
        if (mobile_number) updates.mobile_number = mobile_number;
        if (department) updates.department = department;
        if (year) updates.year = parseInt(year);

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'User updated successfully', user: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
