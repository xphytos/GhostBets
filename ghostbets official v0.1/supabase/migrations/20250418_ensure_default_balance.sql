
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the user profile WITH EXPLICITLY DEFINED BALANCE OF 15
  INSERT INTO public.profiles (id, username, balance, streak_days, last_reward_claim)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    15,  -- Explicitly set value rather than using default
    0,
    NULL
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable realtime for profiles table to ensure UI updates
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
