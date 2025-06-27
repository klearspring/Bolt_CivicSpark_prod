# Fix Netlify Build - Environment Variables Setup

## The Problem
Your Netlify build is failing because it can't find the Supabase environment variables. The `.env` file is not available during the build process.

## Solution: Add Environment Variables to Netlify

### Step 1: Go to Netlify Dashboard
1. Log into https://app.netlify.com
2. Select your CivicSpark site
3. Go to **Site Settings** → **Environment Variables**

### Step 2: Add Required Variables
Add these environment variables in Netlify:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_WEB_URL=https://civicspark.app
EXPO_PUBLIC_API_URL=https://civicspark.app/api
EXPO_PUBLIC_ENVIRONMENT=production
```

### Step 3: Get Your Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (for EXPO_PUBLIC_SUPABASE_URL)
   - **anon public** key (for EXPO_PUBLIC_SUPABASE_ANON_KEY)

### Step 4: Trigger New Build
After adding the environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to trigger auto-deploy

## Alternative: Quick Test Deploy
If you want to test locally first:

```bash
# Build locally with your .env file
npm run build:web

# Then drag the 'dist' folder to Netlify for manual deploy
```

## Verification
Once environment variables are added, the build should succeed and you'll see:
```
✅ Supabase client initialized successfully
```

Your app will then be live at https://civicspark.app!