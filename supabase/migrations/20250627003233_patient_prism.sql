/*
  # Fix trigger function for user profile creation

  1. Issues Fixed
    - Ensure function is created with proper permissions
    - Use correct schema references
    - Add better error handling
    - Ensure trigger is properly attached

  2. Changes
    - Drop and recreate function with SECURITY DEFINER
    - Ensure proper schema permissions
    - Add comprehensive error handling
    - Verify trigger attachment
*/

-- First, ensure we're working in the public schema
SET search_path TO public, auth;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function with proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_first_name text;
  user_last_name text;
  user_display_name text;
  user_phone text;
  user_dob date;
  user_location jsonb;
  user_preferences jsonb;
  subscribe_to_newsletter_opted_in boolean;
BEGIN
  -- Extract data with proper null handling
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name');
  user_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name', 
    user_first_name || ' ' || user_last_name
  );
  user_phone := NEW.raw_user_meta_data->>'phone_number';
  
  -- Handle date conversion safely
  BEGIN
    user_dob := CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
      ELSE NULL 
    END;
  EXCEPTION WHEN OTHERS THEN
    user_dob := NULL;
  END;
  
  -- Handle location JSON
  user_location := CASE 
    WHEN NEW.raw_user_meta_data->'location' IS NOT NULL 
    THEN NEW.raw_user_meta_data->'location'
    ELSE '{
      "address": "",
      "city": "",
      "state": "",
      "zipCode": "",
      "coordinates": null
    }'::jsonb
  END;

-- Extract subscribe_to_newsletter and convert to boolean
  subscribe_to_newsletter_opted_in := (NEW.raw_user_meta_data->>'subscribe_to_newsletter')::boolean;

-- Construct preferences JSON, overriding email notification based on subscribe_to_newsletter
  user_preferences := jsonb_build_object(
    'notifications', jsonb_build_object(
      'email', COALESCE(subscribe_to_newsletter_opted_in, true), -- Default to true if not specified
      'push', true,
      'sms', false
    ),
    'privacy', jsonb_build_object(
      'profileVisibility', 'circles',
      'locationSharing', true,
      'activityVisibility', 'circles'
    )
  );

  -- Insert the user profile
  INSERT INTO public.user_profiles (
    id,
    first_name,
    last_name,
    display_name,
    phone_number,
    date_of_birth,
    location,
    preferences,
    civic_profile,
    verification
  )
  VALUES (
    NEW.id,
    user_first_name,
    user_last_name,
    user_display_name,
    user_phone,
    user_dob,
    user_location,
    user_preferences,
    '{
      "joinDate": "' || CURRENT_DATE || '",
      "totalPoints": 0,
      "completedMissions": 0,
      "joinedCircles": [],
      "achievements": [],
      "civicScore": 0
    }'::jsonb,
    '{
      "emailVerified": ' || CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'true' ELSE 'false' END || ',
      "phoneVerified": false,
      "identityVerified": false
    }'::jsonb
  );

  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user for user %: % %', NEW.id, SQLSTATE, SQLERRM;
    
    -- Try to insert a minimal profile to prevent auth failure
    BEGIN
      INSERT INTO public.user_profiles (id, first_name, last_name, display_name)
      VALUES (NEW.id, user_first_name, user_last_name, user_display_name)
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- If even minimal insert fails, log it but don't fail the auth
      RAISE LOG 'Failed to create minimal profile for user %: % %', NEW.id, SQLSTATE, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
  ) THEN
    RAISE NOTICE 'Trigger on_auth_user_created created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create trigger on_auth_user_created';
  END IF;
END $$;

-- Create a test function to verify the trigger function exists
CREATE OR REPLACE FUNCTION public.test_trigger_function_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'handle_new_user'
  );
END;
$$;

-- Grant permissions on the test function
GRANT EXECUTE ON FUNCTION public.test_trigger_function_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_trigger_function_exists() TO anon;
GRANT EXECUTE ON FUNCTION public.test_trigger_function_exists() TO service_role;