# Setting Up Custom Domain with Resend

Using your custom domain `ggscuemk.tech` with Resend will significantly improve email deliverability!

## Steps to Verify Your Domain

### 1. Add Domain in Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `ggscuemk.tech`
4. Click **Add**

### 2. Add DNS Records

Resend will provide you with DNS records to add. You need to add these to your domain registrar:

**Typical records you'll need to add:**

1. **SPF Record** (TXT):

   ```
   Name: @ or ggscuemk.tech
   Type: TXT
   Value: v=spf1 include:_spf.resend.com ~all
   ```

2. **DKIM Records** (CNAME):

   ```
   Name: resend._domainkey
   Type: CNAME
   Value: [Resend will provide this]
   ```

3. **MX Records** (if using Resend for receiving):

   ```
   Priority: 10
   Value: feedback-smtp.resend.com
   ```

### 3. Verify Domain

1. After adding DNS records, go back to Resend Dashboard
2. Click **Verify** next to your domain
3. Wait for DNS propagation (can take up to 48 hours, usually minutes)

### 4. Update Environment Variables

**Local (.env):**

```bash
EMAIL_FROM_ADDRESS=noreply@ggscuemk.tech
```

**Render Environment:**
Update `EMAIL_FROM_ADDRESS` to `noreply@ggscuemk.tech`

## Verification Status

Check domain status in Resend Dashboard:

- ✅ **Verified** - Ready to send emails!
- ⏳ **Pending** - Waiting for DNS propagation
- ❌ **Failed** - Check DNS records

## Using Different Email Addresses

Once verified, you can send from any address on your domain:

- `noreply@ggscuemk.tech`
- `event@ggscuemk.tech`
- `registration@ggscuemk.tech`

Just update `EMAIL_FROM_ADDRESS` in your environment variables!

## Troubleshooting

**DNS not propagating?**

- Wait 15-30 minutes and try again
- Use [DNS Checker](https://dnschecker.org) to verify records
- Make sure you added records to the root domain, not a subdomain

**Still showing as unverified?**

- Double-check the DNS records match exactly what Resend provided
- Contact your domain registrar for help adding DNS records
- Check Resend docs: <https://resend.com/docs/dashboard/domains/introduction>
