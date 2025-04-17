
-- Add avatar_url to profiles table if it doesn't exist
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add updated_at to profiles table if it doesn't exist
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure default balance is set to 15 coins
ALTER TABLE IF EXISTS profiles
ALTER COLUMN balance SET DEFAULT 15;

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON user_settings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON user_settings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON user_settings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Update profiles policies if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);
  END IF;
END
$$;
