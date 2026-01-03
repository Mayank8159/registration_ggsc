# Email Service Setup Guide

## Gmail App Password Setup

Since you're using Gmail (`gambassador2025@gmail.com`), you need to create an **App Password** instead of using your regular Gmail password.

### Steps to Create Gmail App Password

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Under "Signing in to Google", enable **2-Step Verification**
   - Follow the setup process

2. **Create App Password**:
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Sign in if prompted
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **GGSC Backend**
   - Click **Generate**
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

3. **Update .env File**:
   - Open `backend/.env`
   - Replace `your-app-password-here` with the generated app password
   - Remove any spaces from the password

   ```bash
   EMAIL_PASSWORD=abcdabcdabcdabcd
   ```

### Environment Variables

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=gambassador2025@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=GGSC Event
EMAIL_FROM_ADDRESS=gambassador2025@gmail.com
```

## Install Dependencies

```bash
cd backend
pnpm install
```

## Test Email Service

After configuring, restart your backend server and test registration. You can also test email directly:

```javascript
// Add this to test email sending
import { sendTestEmail } from './src/services/emailService.js';

sendTestEmail('your-test-email@example.com')
  .then(() => console.log('Test email sent!'))
  .catch(err => console.error('Failed:', err));
```

## Troubleshooting

### "Invalid login" error

- Make sure you're using an App Password, not your regular Gmail password
- Verify 2FA is enabled on your Google account

### "Connection timeout" error

- Check your firewall settings
- Ensure port 587 is not blocked
- Try using port 465 with `EMAIL_SECURE=true`

### Email not received

- Check spam/junk folder
- Verify the recipient email is correct
- Check Gmail's "Sent" folder to confirm email was sent

## Email Flow

1. User submits registration form
2. Backend creates user in Supabase
3. Backend sends confirmation email **asynchronously** (doesn't block response)
4. User receives beautiful HTML email with registration details
5. Registration response returns immediately to frontend

## Production Considerations

For production, consider using:

- **SendGrid** - More reliable, better analytics
- **AWS SES** - Cost-effective for high volume
- **Mailgun** - Good deliverability

Current Gmail setup is perfect for testing and small-scale events!
