# CivicSpark Continuous Deployment Guide

## 🚀 Quick Setup (5 minutes)

Your CivicSpark project is now configured for continuous deployment! Follow these steps to connect it to Netlify.

### Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CivicSpark setup"
   ```

2. **Create GitHub repository**:
   - Go to [github.com](https://github.com) and create a new repository
   - Name it `civicspark-app` or similar
   - Don't initialize with README (since you already have files)

3. **Connect and push**:
   ```bash
   git remote add origin https://github.com/yourusername/civicspark-app.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Connect to Netlify

1. **Log into Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub (recommended)

2. **Import your repository**:
   - Click "New site from Git"
   - Choose "GitHub"
   - Select your `civicspark-app` repository

3. **Configure build settings**:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `dist`
   - **Node version**: `18`
   
   (These are already configured in `netlify.toml`)

4. **Add environment variables**:
   - Go to Site Settings → Environment Variables
   - Add your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     EXPO_PUBLIC_WEB_URL=https://your-site-name.netlify.app
     EXPO_PUBLIC_API_URL=https://your-site-name.netlify.app/api
     EXPO_PUBLIC_ENVIRONMENT=production
     ```

5. **Deploy**:
   - Click "Deploy site"
   - Your site will be live in 2-3 minutes!

### Step 3: Custom Domain (Optional)

If you want to use `civicspark.app`:

1. **Add custom domain**:
   - Go to Site Settings → Domain Management
   - Click "Add custom domain"
   - Enter `civicspark.app`

2. **Configure DNS**:
   - Update your domain's DNS to point to Netlify
   - SSL certificate will be automatically provisioned

## 🔄 How Continuous Deployment Works

### Automatic Deployments
- **Every push to `main`** triggers a new deployment
- **Build process** runs automatically using `netlify.toml` config
- **Environment variables** are injected during build
- **Live site** updates within 2-3 minutes

### Branch Deployments
- **Feature branches** get preview deployments
- **Pull requests** get deploy previews
- **Test changes** before merging to main

### Build Process
1. Netlify detects push to repository
2. Installs dependencies (`npm install`)
3. Runs build command (`npm run build:web`)
4. Deploys `dist` folder to CDN
5. Invalidates cache and updates live site

## 📊 Monitoring & Management

### Netlify Dashboard
- **Deploy logs**: See build output and errors
- **Analytics**: Traffic and performance metrics
- **Forms**: Handle contact forms (if added)
- **Functions**: Serverless functions (if needed)

### Build Notifications
- **Email alerts** for failed deployments
- **Slack integration** for team notifications
- **GitHub status checks** on pull requests

## 🛠️ Development Workflow

### Making Changes
```bash
# Make your changes
git add .
git commit -m "Add new feature"
git push origin main
# Site automatically updates in 2-3 minutes!
```

### Testing Before Deploy
```bash
# Test locally first
npm run build:web
# Check the dist folder
# Then push when ready
```

### Rollback if Needed
- Use Netlify dashboard to rollback to previous deploy
- Or revert Git commit and push

## 🔒 Security & Performance

### Automatic Features
- **HTTPS** enabled by default
- **CDN** for fast global delivery
- **Security headers** configured in `netlify.toml`
- **Asset optimization** and compression

### Environment Variables
- **Secure storage** of sensitive data
- **Build-time injection** (not exposed to client)
- **Different values** for different branches

## 🚨 Troubleshooting

### Build Failures
1. **Check deploy logs** in Netlify dashboard
2. **Verify environment variables** are set correctly
3. **Test build locally** with `npm run build:web`
4. **Check Node version** matches (18)

### Environment Issues
1. **Missing variables**: Add in Netlify dashboard
2. **Wrong values**: Double-check Supabase credentials
3. **Caching issues**: Clear browser cache

### Common Solutions
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build:web

# Check for TypeScript errors
npx tsc --noEmit
```

## 🎉 You're All Set!

Your CivicSpark app now has:
- ✅ **Automatic deployments** on every push
- ✅ **Production-ready** build process
- ✅ **Environment variables** configured
- ✅ **Custom domain** ready (if configured)
- ✅ **Security headers** and optimizations
- ✅ **Rollback capability** if needed

### Next Steps
1. **Test the deployment** by making a small change and pushing
2. **Share the live URL** with your beta testers
3. **Monitor the dashboard** for any issues
4. **Set up custom domain** if desired

Your civic engagement platform is now live and ready to help communities connect and make a difference! 🌟