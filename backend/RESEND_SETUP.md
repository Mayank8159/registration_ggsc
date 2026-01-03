# Resend Email Setup Guide

This backend uses [Resend](https://resend.com) for sending registration confirmation emails. Resend is a modern email API service that works perfectly on cloud platforms like Render.

## Why Resend?

- ✅ Works on Render's free tier (HTTP API, not SMTP)
- ✅ Better deliverability than SMTP
- ✅ Free tier: 100 emails/day, 3,000 emails/month
- ✅ Modern API with better error messages
- ✅ No App Password setup required

## Setup Steps

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your [Resend Dashboard](https://resend.com/dashboard)
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "GGSC Backend  - Production")
5. Select permission: **Sending access**
6. Click **Add**
7. **Copy the API key** (it starts with `re_`)
   - ⚠️ You won't be able to see it again!

### 3. Verify Your Domain (Optional for Gmail)

If using a Gmail address (`gambassador2025@gmail.com`):

- Resend allows sending from Gmail addresses in their sandbox
- Emails will be sent, but may have limited deliverability
- For production, consider verifying a custom domain

### 4. Update Local Environment

Update `backend/.env`:

```bash
# Email Configuration (via Resend API)
RESEND_API_KEY=re_YourActualAPIKeyHere
EMAIL_FROM_NAME=GGSC Event
EMAIL_FROM_ADDRESS=gambassador2025@gmail.com
```

### 5. Update Render Environment

1. Go to your Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update/Add these variables:
   - `RESEND_API_KEY`: `re_YourActualAPIKeyHere`
   - `EMAIL_FROM_NAME`: `GGSC Event`
   - `EMAIL_FROM_ADDRESS`: `gambassador2025@gmail.com`
5. Save changes (Render will auto-redeploy)

### 6. Test the Integration

**Locally:**

```bash
cd backend
pnpm start
# Try registering a test user
```

**On Render:**

- Register a test user through your frontend
- Check the Render logs for success messages
- Check your inbox for the registration email

## Troubleshooting

### Email not received?

1. **Check Render logs** for error messages
2. **Check spam folder**
3. **Verify API key** is correct in Render environment
4. **Check Resend Dashboard** > Logs to see delivery status

### "Invalid API key" error?

- Make sure you copied the full API key (starts with `re_`)
- Verify the key is set correctly in Render environment variables
- Try creating a new API key

### Emails going to spam?

- This is expected with Gmail addresses in Resend's sandbox
- For production, verify a custom domain in Resend
- Or use Supabase's built-in email system

## Production Recommendations

For better deliverability in production:

1. **Use a custom domain** (e.g., `noreply@ggsc.edu`)
2. **Verify your domain** in Resend Dashboard
3. **Set up SPF/DKIM** records (Resend provides these)
4. **Monitor bounce rates** in Resend Dashboard

## API Limits

**Free Tier:**

- 100 emails per day
- 3,000 emails per month
- If you exceed limits, upgrade to a paid plan

## Support

- [Resend Documentation](https://resend.com/docs)
- [Resend Discord](https://discord.gg/resend)
- [Resend API Reference](https://resend.com/docs/api-reference)
