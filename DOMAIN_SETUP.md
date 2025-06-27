# CivicSpark Domain Setup Guide

## 🌐 Domain: civicspark.app

Congratulations! You've purchased the domain `civicspark.app`. Here's how to connect it to your CivicSpark application.

## Step 1: Configure Domain in Netlify

1. **Log into your Netlify dashboard**
   - Go to https://app.netlify.com
   - Select your CivicSpark site

2. **Add Custom Domain**
   - Go to Site Settings → Domain Management
   - Click "Add custom domain"
   - Enter: `civicspark.app`
   - Click "Verify"

3. **Add www subdomain (recommended)**
   - Also add: `www.civicspark.app`
   - This ensures both versions work

## Step 2: Configure DNS Records

You'll need to set up DNS records with your domain provider. Here are the required records:

### Primary Domain (civicspark.app)
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

### WWW Subdomain (www.civicspark.app)
```
Type: CNAME
Name: www
Value: [your-netlify-site-name].netlify.app
TTL: 3600
```

### Alternative: Netlify DNS (Recommended)
For easier management, you can use Netlify's DNS:

1. In Netlify, go to Domain Management
2. Click "Set up Netlify DNS"
3. Copy the 4 nameservers provided
4. Update your domain's nameservers with your registrar

## Step 3: SSL Certificate

Netlify will automatically provision an SSL certificate for your domain. This usually takes 5-10 minutes after DNS propagation.

## Step 4: Update Application Configuration

Update your app configuration to use the new domain:

### Environment Variables
If you have any environment variables that reference URLs, update them:
```
EXPO_PUBLIC_API_URL=https://civicspark.app/api
EXPO_PUBLIC_WEB_URL=https://civicspark.app
```

### Social Authentication Redirects
If using social auth, update redirect URLs in:
- Google Console
- Apple Developer Console
- Any other OAuth providers

## Step 5: Verification

Once DNS propagates (can take up to 48 hours), verify:

1. **Primary domain**: https://civicspark.app
2. **WWW subdomain**: https://www.civicspark.app
3. **SSL certificate**: Look for the lock icon in browser
4. **Redirects**: Ensure www redirects to primary domain (or vice versa)

## Troubleshooting

### DNS Propagation
- Use https://dnschecker.org to check propagation status
- DNS changes can take 24-48 hours to fully propagate

### SSL Issues
- SSL certificates are automatically provisioned by Netlify
- If issues persist, try "Renew certificate" in Netlify dashboard

### Domain Not Working
1. Check DNS records are correct
2. Verify domain is properly added in Netlify
3. Ensure DNS has propagated globally

## Production Checklist

- [ ] Domain points to Netlify
- [ ] SSL certificate is active
- [ ] Both www and non-www versions work
- [ ] Environment variables updated
- [ ] Social auth redirects updated
- [ ] Analytics tracking updated (if applicable)
- [ ] Email templates updated with new domain

## Next Steps

1. **Update Marketing Materials**: Update any links in documentation, social media, etc.
2. **SEO**: Submit new domain to Google Search Console
3. **Monitoring**: Set up uptime monitoring for the new domain
4. **Backup**: Keep your old Netlify URL as a backup during transition

Your CivicSpark app will be live at https://civicspark.app once DNS propagates!