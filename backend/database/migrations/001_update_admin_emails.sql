    -- ============================================
    -- MIGRATION: Update Admin Emails
    -- ============================================
    -- Purpose: Update the admin email list in the is_admin() function
    -- Date: 2026-01-03
    -- ============================================

    -- Drop existing function
    DROP FUNCTION IF EXISTS is_admin();

    -- Recreate with updated admin emails
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND email IN (
                -- Admin emails
                'gambassador2025@gmail.com'
                -- Add more admin emails here separated by commas:
                -- 'admin2@example.com',
                -- 'admin3@example.com'
            )
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- ============================================
    -- MIGRATION COMPLETE
    -- ============================================
    -- To add more admins in the future, simply add their emails
    -- to the list above and run this migration again.
