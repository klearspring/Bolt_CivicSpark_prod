/*
  # Fix user profile creation trigger

  1. Updates
    - Fix `handle_new_user()` function to properly handle all user metadata
    - Ensure proper JSON extraction and type casting
    - Handle nullable fields correctly
    - Add error handling for missing required fields

  2. Changes
    - Updated INSERT statement to extract all fields from raw_user_meta_data
    - Added proper JSON field handling for complex objects
    - Ensured compatibility with sign-up form data structure
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    display_name,
    phone_number,
    date_of_birth,
    location,
    preferences
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 
             CONCAT(
               COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'), 
               ' ', 
               COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name')
             )
    ),
    NEW.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->'location' IS NOT NULL 
      THEN NEW.raw_user_meta_data->'location'
      ELSE '{
        "address": "",
        "city": "",
        "state": "",
        "zipCode": "",
        "coordinates": null
      }'::jsonb
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->'preferences' IS NOT NULL 
      THEN NEW.raw_user_meta_data->'preferences'
      ELSE '{
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
      }'::jsonb
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
    -- Insert minimal profile to ensure user creation succeeds
    INSERT INTO user_profiles (id, first_name, last_name, display_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
      COALESCE(NEW.raw_user_meta_data->>'display_name', 'User Name')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();