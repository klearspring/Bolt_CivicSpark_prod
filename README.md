# CivicSpark - Neighborhood Engagement Platform

A mobile-first web application that empowers neighbors to connect, collaborate, and create positive change in their communities through civic missions, neighborhood circles, and local leadership discovery.

## 🌟 Features

- **Real User Authentication**: Secure sign-up and sign-in with Supabase
- **Demo Mode**: Try the app with sample data without creating an account
- **Civic Missions**: Gamified civic engagement activities with points and achievements
- **Neighborhood Circles**: Location-based community groups for local discussions
- **Leader Discovery**: Find and support emerging civic leaders in your area
- **Achievement System**: Comprehensive gamification with unlockable achievements
- **Community Building**: Connect with neighbors and coordinate local initiatives

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account (for real backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civicspark-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/` in order
   - This will create all necessary tables and security policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔐 Authentication Modes

### Demo Mode
- **Purpose**: Try the app without creating an account
- **Features**: Full app functionality with sample data
- **Access**: Click "Try Demo Mode" on the sign-in screen
- **Data**: All data is local and temporary

### Real Account Mode
- **Purpose**: Create a real account with persistent data
- **Features**: Full app functionality with real user data
- **Backend**: Powered by Supabase
- **Data**: Stored securely in the cloud

## 🏗️ Architecture

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context + useReducer
- **Styling**: StyleSheet with custom color system
- **Icons**: Lucide React Native

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (ready for future features)
- **Storage**: Supabase Storage (ready for file uploads)

### Database Schema
- `user_profiles`: Extended user information
- `civic_actions`: Track user civic activities
- `achievements`: User achievement progress
- `communities`: User community memberships

## 📱 Testing

### Demo Mode Testing
1. Open the app
2. Tap "Try Demo Mode" on sign-in screen
3. Explore all features with sample data
4. No account creation required

### Real Account Testing
1. Tap "Sign Up" to create a real account
2. Complete the registration process
3. Verify email (optional in development)
4. Start using the app with real data

### Feature Testing Checklist
- [ ] **Authentication**: Sign up, sign in, sign out
- [ ] **Profile Management**: View and edit profile information
- [ ] **Civic Missions**: Create, join, and complete missions
- [ ] **Neighborhood Circles**: Join circles, create posts, participate in discussions
- [ ] **Achievements**: Unlock achievements through activities
- [ ] **Communities**: Manage community memberships
- [ ] **Settings**: Adjust preferences and account settings

## 🔧 Development

### Project Structure
```
├── app/                    # App screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── constants/             # App constants (colors, etc.)
├── contexts/              # React contexts
├── lib/                   # Third-party library configurations
├── services/              # API and business logic
├── supabase/              # Database migrations
└── types/                 # TypeScript type definitions
```

### Key Services
- **AuthService**: Handles all authentication operations
- **CivicDataService**: Manages civic actions, achievements, and communities
- **SocialAuthService**: Handles social login (Google, Apple)

### Adding New Features
1. **Database Changes**: Add migrations to `supabase/migrations/`
2. **API Layer**: Update services in `services/`
3. **Types**: Add TypeScript types in `types/`
4. **UI Components**: Create components in `components/`
5. **Screens**: Add screens in `app/`

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```
Deploy the `dist` folder to any static hosting service.

### Mobile Deployment
```bash
# Build for iOS
eas build --platform ios

# Build for Android  
eas build --platform android
```

## 🔒 Security

- **Row Level Security**: All database tables use RLS
- **Authentication**: Secure JWT-based authentication
- **Data Validation**: Input validation on both client and server
- **Environment Variables**: Sensitive data stored in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Expo and React Native
- Backend powered by Supabase
- Icons by Lucide
- Images from Pexels