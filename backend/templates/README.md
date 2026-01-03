# Email Templates

This directory contains email templates for the registration system.

## Templates

### 1. Registration Success Email

- **HTML**: `registration_success_email.html`
- **Plain Text**: `registration_success_email.txt`

#### Template Variables

The following variables need to be replaced when sending emails:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{USER_NAME}}` | Full name of the registered user | John Doe |
| `{{USER_EMAIL}}` | Email address of the user | <john@example.com> |
| `{{ENROLLMENT_NUMBER}}` | Student enrollment number | EN12345 |
| `{{DEPARTMENT}}` | Department/Branch | Computer Science |
| `{{YEAR}}` | College year | 3rd Year |

#### Usage Example (Node.js with Nodemailer)

```javascript
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Read email template
const htmlTemplate = fs.readFileSync(
  path.join(__dirname, 'templates', 'registration_success_email.html'),
  'utf-8'
);

const textTemplate = fs.readFileSync(
  path.join(__dirname, 'templates', 'registration_success_email.txt'),
  'utf-8'
);

// Replace variables
const personalizedHtml = htmlTemplate
  .replace(/\{\{USER_NAME\}\}/g, user.full_name)
  .replace(/\{\{USER_EMAIL\}\}/g, user.email)
  .replace(/\{\{ENROLLMENT_NUMBER\}\}/g, user.enrollment_number)
  .replace(/\{\{DEPARTMENT\}\}/g, user.department)
  .replace(/\{\{YEAR\}\}/g, `${user.year}${getYearSuffix(user.year)} Year`);

const personalizedText = textTemplate
  .replace(/\{\{USER_NAME\}\}/g, user.full_name)
  .replace(/\{\{USER_EMAIL\}\}/g, user.email)
  .replace(/\{\{ENROLLMENT_NUMBER\}\}/g, user.enrollment_number)
  .replace(/\{\{DEPARTMENT\}\}/g, user.department)
  .replace(/\{\{YEAR\}\}/g, `${user.year}${getYearSuffix(user.year)} Year`);

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email
await transporter.sendMail({
  from: '"GGSC Event" <gambassador2025@gmail.com>',
  to: user.email,
  subject: '🎉 Registration Successful - Treasure Hunt: Chamber of Secrets',
  text: personalizedText,
  html: personalizedHtml
});

function getYearSuffix(year) {
  const suffixes = { 1: 'st', 2: 'nd', 3: 'rd', 4: 'th' };
  return suffixes[year] || 'th';
}
```

## Email Service Setup

To send emails, you'll need to:

1. Install nodemailer: `npm install nodemailer`
2. Set up email credentials in `.env`:

   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. For Gmail, enable "App Passwords" in your Google Account settings

## Testing

You can preview the HTML email by opening `registration_success_email.html` in a web browser after manually replacing the template variables.
