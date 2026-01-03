import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

console.log('📧 Email Service: Resend API initialized', {
    apiKey: process.env.RESEND_API_KEY ? '(set)' : '(missing)',
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`
});

/**
 * Send registration confirmation email using Resend
 * @param {Object} user - User data object
 * @param {string} user.full_name - Full name of user
 * @param {string} user.email - Email address
 * @param {string} user.enrollment_number - Enrollment number
 * @param {string} user.department - Department
 * @param {number} user.year - College year (1-4)
 */
export async function sendRegistrationEmail(user) {
    try {
        // Read email templates (templates are in backend/templates, not backend/src/templates)
        const templatesDir = path.join(__dirname, '..', '..', 'templates');
        const htmlTemplate = fs.readFileSync(
            path.join(templatesDir, 'registration_success_email.html'),
            'utf-8'
        );
        const textTemplate = fs.readFileSync(
            path.join(templatesDir, 'registration_success_email.txt'),
            'utf-8'
        );

        // Helper function to get year suffix
        const getYearSuffix = (year) => {
            const suffixes = { 1: 'st', 2: 'nd', 3: 'rd', 4: 'th' };
            return suffixes[year] || 'th';
        };

        const yearDisplay = `${user.year}${getYearSuffix(user.year)} Year`;

        // Replace template variables
        const replacements = {
            '{{USER_NAME}}': user.full_name,
            '{{USER_EMAIL}}': user.email,
            '{{ENROLLMENT_NUMBER}}': user.enrollment_number,
            '{{DEPARTMENT}}': user.department,
            '{{YEAR}}': yearDisplay,
        };

        let personalizedHtml = htmlTemplate;
        let personalizedText = textTemplate;

        // Replace all occurrences of each variable
        Object.entries(replacements).forEach(([key, value]) => {
            const regex = new RegExp(key, 'g');
            personalizedHtml = personalizedHtml.replace(regex, value);
            personalizedText = personalizedText.replace(regex, value);
        });

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: `${process.env.EMAIL_FROM_NAME || 'GGSC Event'} <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: user.email,
            subject: '🎉 Registration Successful - Treasure Hunt: Chamber of Secrets',
            text: personalizedText,
            html: personalizedHtml,
        });

        if (error) {
            console.error('❌ Resend API error:', error);
            throw error;
        }

        console.log('✅ Email sent successfully via Resend:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
}

/**
 * Send test email to verify configuration
 * @param {string} toEmail - Email address to send test to
 */
export async function sendTestEmail(toEmail) {
    try {
        const { data, error } = await resend.emails.send({
            from: `${process.env.EMAIL_FROM_NAME || 'GGSC Event'} <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: toEmail,
            subject: 'Test Email - GGSC Backend',
            text: 'This is a test email from the GGSC backend. Email service is working correctly!',
            html: '<p>This is a test email from the GGSC backend.</p><p><strong>Email service is working correctly!</strong></p>',
        });

        if (error) {
            console.error('❌ Resend API error:', error);
            throw error;
        }

        console.log('✅ Test email sent via Resend:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('❌ Error sending test email:', error);
        throw error;
    }
}

export default {
    sendRegistrationEmail,
    sendTestEmail,
};
