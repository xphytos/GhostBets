
-- Create transaction logs table
CREATE TABLE IF NOT EXISTS public.transaction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.transaction_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transaction_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users cannot modify transactions (insert only)
CREATE POLICY "Users can insert transactions" 
ON public.transaction_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
