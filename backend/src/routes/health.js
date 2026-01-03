import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/', async (req, res) => {
    try {
        // Check Supabase connection
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        const supabaseStatus = error ? 'disconnected' : 'connected';

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            services: {
                database: supabaseStatus
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

export default router;
