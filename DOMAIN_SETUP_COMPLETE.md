# CivicSpark Domain Setup - civicspark.app

## 🌐 Domain Configuration Steps

### Step 1: Netlify Domain Setup

1. **Log into Netlify Dashboard**
   - Go to https://app.netlify.com
   - Select your CivicSpark site

2. **Add Custom Domain**
   - Navigate to: Site Settings → Domain Management
   - Click "Add custom domain"
   - Enter: `civicspark.app`
   - Click "Verify"

3. **Add WWW Subdomain**
   - Also add: `www.civicspark.app`
   - This ensures both versions work properly

### Step 2: DNS Configuration

You'll need to configure DNS records with your domain registrar. Here are the required settings:

#### Option A: Netlify DNS (Recommended)
1. In Netlify Domain Management, click "Set up Netlify DNS"
2. Copy the 4 nameservers provided (something like):
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
3. Go to your domain registrar (where you bought civicspark.app)
4. Update nameservers to use Netlify's nameservers
5. Wait 24-48 hours for propagation

#### Option B: Manual DNS Records
If you prefer to keep your current DNS provider:

**Primary Domain (civicspark.app)**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

**WWW Subdomain (www.civicspark.app)**
```
Type: CNAME
Name: www
Value: [your-netlify-site-name].netlify.app
TTL: 3600
```

### Step 3: SSL Certificate
- Netlify automatically provisions SSL certificates
- This happens within 5-10 minutes after DNS propagation
- Look for the green lock icon in your browser

### Step 4: Update Application Configuration

Update your environment variables to use the new domain:

```env
EXPO_PUBLIC_WEB_URL=https://civicspark.app
EXPO_PUBLIC_API_URL=https://civicspark.app/api
```

### Step 5: Verification Checklist

Once DNS propagates (up to 48 hours), verify:

- [ ] https://civicspark.app loads your app
- [ ] https://www.civicspark.app redirects properly
- [ ] SSL certificate is active (green lock icon)
- [ ] All app features work on the new domain

## 🔧 Netlify Configuration

Your `netlify.toml` is already configured correctly with:
- Domain redirects (www → non-www)
- SPA routing support
- Security headers
- Asset caching

## 📊 Monitoring Setup

### DNS Propagation Check
Use https://dnschecker.org to monitor DNS propagation globally.

### Uptime Monitoring
Consider setting up monitoring for:
- https://civicspark.app
- SSL certificate expiration
- Performance metrics

## 🚀 Post-Setup Tasks

### 1. Update Marketing Materials
- Update any documentation with new domain
- Update social media links
- Update email signatures

### 2. SEO Setup
```html
<!-- Add to your app's head section -->
<meta name="description" content="CivicSpark - Connect with neighbors and make a difference in your community">
<meta property="og:title" content="CivicSpark - Neighborhood Engagement Platform">
<meta property="og:description" content="Gamified civic engagement, neighborhood circles, and local leadership discovery">
<meta property="og:url" content="https://civicspark.app">
<meta property="og:type" content="website">
```

### 3. Analytics Update
If you're using analytics, update the domain configuration.

### 4. Social Auth Redirects
Update OAuth redirect URLs in:
- Google Console: https://console.developers.google.com
- Apple Developer Console
- Any other social providers

## 🐛 Troubleshooting

### Domain Not Loading
1. Check DNS propagation at dnschecker.org
2. Verify DNS records are correct
3. Clear browser cache
4. Try incognito/private browsing

### SSL Issues
1. Wait for automatic provisioning (up to 24 hours)
2. Try "Renew certificate" in Netlify dashboard
3. Check that DNS is fully propagated

### Redirect Issues
1. Verify netlify.toml redirect rules
2. Check Netlify deploy logs
3. Test both www and non-www versions

## 📞 Support

- **Netlify Support**: Available 24/7 for domain issues
- **DNS Propagation**: Usually 4-24 hours, can take up to 48 hours
- **SSL Certificates**: Automatic, but can take up to 24 hours

## 🎉 Success!

Once everything is configured, your CivicSpark platform will be live at:
**https://civicspark.app**

Your civic engagement platform will be accessible to communities worldwide!