# CivicSpark Deployment Guide

## 🌐 Web Deployment (Recommended for Beta)

### Quick Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build:web
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to the deploy area
   - Get your live URL instantly

3. **Share with testers**
   ```
   🌐 CivicSpark Beta: https://your-app-name.netlify.app
   
   Test on:
   - Desktop browser
   - Mobile browser (add to home screen for app-like experience)
   - Tablet
   ```

### Environment Variables for Production

In Netlify dashboard, add these environment variables:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_WEB_URL=https://your-domain.com
EXPO_PUBLIC_API_URL=https://your-domain.com/api
```

## 📱 Mobile Testing with Expo Go

### For Beta Testers

1. **Install Expo Go**
   - iOS: Download from App Store
   - Android: Download from Google Play

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Share with testers**
   - QR Code: Show the QR code from terminal
   - URL: Share the exp:// URL
   - Instructions: Send setup guide to testers

### Tester Instructions Template

```
Hi! Ready to test CivicSpark? Here's how:

📱 MOBILE APP:
1. Download "Expo Go" from your app store
2. Scan this QR code: [PASTE QR CODE]
3. Or paste this link in Expo Go: [PASTE URL]

🌐 WEB VERSION:
Visit: https://your-app-name.netlify.app

Try both versions and let me know which you prefer!

Focus on:
✅ Creating missions and joining circles
✅ Overall user experience  
✅ Any bugs or confusing parts

Feedback: [YOUR_EMAIL/PHONE]
```

## 🔄 Continuous Deployment

### Git-Based Deployment

1. **Connect to Git**
   - Push code to GitHub/GitLab
   - Connect repository to Netlify
   - Enable auto-deploy on push

2. **Branch Strategy**
   ```
   main → Production deployment
   staging → Staging environment
   develop → Development builds
   ```

3. **Environment-Specific Builds**
   ```bash
   # Production
   npm run build:web
   
   # Staging with different env
   EXPO_PUBLIC_API_URL=https://staging-api.com npm run build:web
   ```

## 📊 Monitoring & Analytics

### Basic Monitoring

1. **Netlify Analytics**
   - Built-in traffic analytics
   - Performance monitoring
   - Error tracking

2. **Supabase Dashboard**
   - Database usage
   - Authentication metrics
   - API performance

### Error Tracking

Add error boundary for production:

```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong. Please refresh the page.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## 🔒 Security for Production

### Environment Security

1. **Secure Environment Variables**
   - Never commit `.env` files
   - Use different keys for production
   - Rotate keys regularly

2. **Supabase Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   
   -- Restrict API access
   CREATE POLICY "Users can only access own data"
   ON user_profiles FOR ALL
   TO authenticated
   USING (auth.uid() = id);
   ```

### Content Security

1. **Input Validation**
   - Sanitize all user inputs
   - Validate data types and lengths
   - Prevent XSS attacks

2. **Rate Limiting**
   ```typescript
   // Implement rate limiting for API calls
   const rateLimiter = {
     requests: new Map(),
     limit: 100, // requests per hour
     window: 3600000 // 1 hour in ms
   };
   ```

## 🧪 Testing Strategy

### Pre-Deployment Testing

1. **Functionality Testing**
   ```bash
   # Test all core features
   - Authentication (sign up, sign in, sign out)
   - Mission creation and completion
   - Circle joining and posting
   - Achievement unlocking
   - Profile management
   ```

2. **Performance Testing**
   ```bash
   # Check build size
   npm run build:web
   du -sh dist/
   
   # Test loading speed
   # Use browser dev tools Network tab
   ```

3. **Cross-Browser Testing**
   - Chrome, Firefox, Safari
   - Mobile browsers (iOS Safari, Chrome Mobile)
   - Different screen sizes

### Beta Testing Checklist

- [ ] Demo mode works without account
- [ ] Real account creation and login
- [ ] All main features functional
- [ ] Mobile responsive design
- [ ] Fast loading times
- [ ] No console errors
- [ ] Proper error handling
- [ ] Data persistence works

## 🚀 Launch Preparation

### Pre-Launch

1. **Content Review**
   - Update sample missions for your community
   - Customize achievement descriptions
   - Review all copy and messaging

2. **Performance Optimization**
   ```bash
   # Optimize images
   # Minimize bundle size
   # Enable compression
   ```

3. **SEO Setup**
   ```html
   <!-- Add to index.html -->
   <meta name="description" content="CivicSpark - Connect with neighbors and make a difference in your community">
   <meta property="og:title" content="CivicSpark">
   <meta property="og:description" content="Neighborhood engagement platform">
   ```

### Launch Day

1. **Final Testing**
   - Test all features one more time
   - Verify all environment variables
   - Check database connections

2. **Monitoring Setup**
   - Enable error tracking
   - Set up uptime monitoring
   - Prepare support channels

3. **Communication**
   - Announce to beta testers
   - Share on community channels
   - Prepare user support

## 📈 Post-Launch

### Monitoring

1. **User Analytics**
   - Track feature usage
   - Monitor user engagement
   - Identify popular features

2. **Performance Metrics**
   - Page load times
   - Error rates
   - User retention

### Iteration

1. **Feedback Collection**
   - User surveys
   - Feature requests
   - Bug reports

2. **Continuous Improvement**
   - Regular updates
   - New feature development
   - Performance optimization

Your CivicSpark app is now ready for production deployment!