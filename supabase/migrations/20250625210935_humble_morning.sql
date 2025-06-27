/*
  # Create users and profiles schema

  1. New Tables
    - `user_profiles` - Extended user profile information
      - `id` (uuid, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `display_name` (text)
      - `avatar_url` (text)
      - `phone_number` (text)
      - `date_of_birth` (date)
      - `location` (jsonb)
      - `preferences` (jsonb)
      - `civic_profile` (jsonb)
      - `verification` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `civic_actions` - Track user civic activities
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `action_type` (text)
      - `title` (text)
      - `description` (text)
      - `points` (integer)
      - `verified` (boolean)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `achievements` - User achievements
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `achievement_id` (text)
      - `unlocked_at` (timestamptz)
      - `progress` (jsonb)

    - `communities` - User community memberships
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `community_name` (text)
      - `community_type` (text)
      - `member_count` (integer)
      - `engagement_level` (text)
      - `missions_completed` (integer)
      - `circles_joined` (integer)
      - `is_active` (boolean)
      - `location` (jsonb)
      - `joined_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  phone_number text,
  date_of_birth date,
  location jsonb DEFAULT '{
    "address": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "coordinates": null
  }'::jsonb,
  preferences jsonb DEFAULT '{
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "privacy": {
      "profileVisibility": "circles",
      "locationSharing": true,
      "activityVisibility": "circles"
    }
  }'::jsonb,
  civic_profile jsonb DEFAULT '{
    "totalPoints": 0,
    "completedMissions": 0,
    "joinedCircles": [],
    "achievements": [],
    "civicScore": 0
  }'::jsonb,
  verification jsonb DEFAULT '{
    "emailVerified": false,
    "phoneVerified": false,
    "identityVerified": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create civic_actions table
CREATE TABLE IF NOT EXISTS civic_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('mission', 'meeting', 'volunteer', 'advocacy')),
  title text NOT NULL,
  description text,
  points integer DEFAULT 0,
  verified boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  progress jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  community_name text NOT NULL,
  community_type text NOT NULL CHECK (community_type IN ('neighborhood', 'district', 'city', 'workplace', 'school')),
  member_count integer DEFAULT 1,
  engagement_level text DEFAULT 'low' CHECK (engagement_level IN ('low', 'medium', 'high')),
  missions_completed integer DEFAULT 0,
  circles_joined integer DEFAULT 0,
  is_active boolean DEFAULT true,
  location jsonb DEFAULT '{
    "address": "",
    "radius": ""
  }'::jsonb,
  joined_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for civic_actions
CREATE POLICY "Users can view own civic actions"
  ON civic_actions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own civic actions"
  ON civic_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own civic actions"
  ON civic_actions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for achievements
CREATE POLICY "Users can view own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for communities
CREATE POLICY "Users can view own communities"
  ON communities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communities"
  ON communities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own communities"
  ON communities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    display_name
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User Name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();