# CivicSpark Setup Guide

## Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Run the migration files in order:
   - `supabase/migrations/20250625210935_humble_morning.sql`
   - `supabase/migrations/20250626221815_fragrant_bush.sql`

### 3. Start Development
```bash
npm install
npm run dev
```

## Testing the App

### Demo Mode (No Account Required)
1. Open the app
2. Click "Try Demo Mode" on sign-in screen
3. Explore all features with sample data

### Real Account Mode
1. Click "Sign Up" to create an account
2. Fill out the registration form
3. Start using the app with real data

## Key Features to Test

### 🎯 Missions Tab
- Browse available civic missions
- Create new missions
- Join and complete missions
- Add comments and discussions

### 👥 Circles Tab
- Join neighborhood circles
- Create discussion posts
- Reply to conversations
- Create new circles

### 🔍 Discover Tab
- Browse community leaders
- Upvote and endorse leaders
- View civic scores and achievements

### 👤 Profile Tab
- View civic score and stats
- Browse achievements
- Manage communities
- Track civic actions

### ⚙️ Settings Tab
- Adjust app preferences
- Manage account settings
- Privacy controls

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify Supabase URL and API key in `.env`
- Check that migrations have been run
- Ensure Supabase project is active

**Sign-up Errors**
- Check browser console for detailed errors
- Verify database migrations are complete
- Ensure RLS policies are enabled

**Demo Mode Not Working**
- Clear browser localStorage
- Refresh the page
- Check browser console for errors

### Getting Help

1. Check the browser console for error messages
2. Verify all environment variables are set
3. Ensure Supabase project is properly configured
4. Review the migration files for any missing tables

## Production Deployment

### Web Deployment
```bash
npm run build:web
# Deploy the 'dist' folder to your hosting provider
```

### Environment Variables for Production
```
EXPO_PUBLIC_SUPABASE_URL=your_production_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
EXPO_PUBLIC_WEB_URL=https://your-domain.com
EXPO_PUBLIC_API_URL=https://your-domain.com/api
```

## Next Steps

1. **Customize Branding**: Update colors in `constants/Colors.ts`
2. **Add Content**: Customize missions and circles for your community
3. **Configure Analytics**: Add tracking for user engagement
4. **Set Up Monitoring**: Monitor app performance and errors
5. **Plan Beta Testing**: Recruit local community members to test

Your CivicSpark app is now ready for development and testing!