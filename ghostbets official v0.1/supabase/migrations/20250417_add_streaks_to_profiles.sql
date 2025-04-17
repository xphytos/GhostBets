
-- Add streak_days and last_reward_claim to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reward_claim TIMESTAMP WITH TIME ZONE;
