import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter configuration error:', error.message);
    } else {
        console.log('✅ Email server is ready to send emails');
    }
});

/**
 * Send registration confirmation email
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

        // Send email
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'GGSC Event'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: user.email,
            subject: '🎉 Registration Successful - Treasure Hunt: Chamber of Secrets',
            text: personalizedText,
            html: personalizedHtml,
        });

        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
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
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'GGSC Event'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: toEmail,
            subject: 'Test Email - GGSC Backend',
            text: 'This is a test email from the GGSC backend. Email service is working correctly!',
            html: '<p>This is a test email from the GGSC backend.</p><p><strong>Email service is working correctly!</strong></p>',
        });

        console.log('✅ Test email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending test email:', error);
        throw error;
    }
}

export default {
    sendRegistrationEmail,
    sendTestEmail,
};
