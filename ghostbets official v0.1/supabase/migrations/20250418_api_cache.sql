
-- Create a table to store API cache data
CREATE TABLE IF NOT EXISTS api_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create an index on the cached_at column for faster queries
CREATE INDEX IF NOT EXISTS api_cache_cached_at_idx ON api_cache (cached_at);

-- Add a policy to allow authenticated users to read the cache
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for all authenticated users" 
  ON api_cache FOR SELECT 
  TO authenticated 
  USING (true);

-- Only allow service role to insert/update
CREATE POLICY "Allow insert for service role only" 
  ON api_cache FOR INSERT 
  TO service_role 
  USING (true);

CREATE POLICY "Allow update for service role only" 
  ON api_cache FOR UPDATE 
  TO service_role 
  USING (true);
