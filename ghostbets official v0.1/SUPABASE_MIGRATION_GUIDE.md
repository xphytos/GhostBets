
# Supabase Migration Guide

This document provides detailed instructions for migrating your Supabase project from Lovable's integrated version to your own standalone Supabase project. This guide ensures you don't lose any database functionality when switching to VS Code development and deploying to GoDaddy.

## Step 1: Backup Current Supabase Project

Before proceeding, ensure you have a complete backup of your current Supabase project:

1. Export Database:
   - Go to the Supabase dashboard for your current project
   - Navigate to "Project Settings" > "Database"
   - Click "Generate backup" and download the SQL dump

2. Document Current Configuration:
   - Screenshot or document all current authentication providers
   - Note all RLS policies
   - List all Edge Functions and their configurations
   - Document all secrets/environment variables

## Step 2: Create New Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project" and fill in the details:
   - Name: Choose a descriptive name
   - Database Password: Set a secure password
   - Region: Choose the closest to your users
   - Pricing Plan: Select appropriate tier
3. Wait for project creation to complete (2-3 minutes)
4. Save your new project's URL and anon key for later use

## Step 3: Recreate Database Schema

### Method 1: Using Migration Files (Recommended)

1. Navigate to SQL Editor in your new Supabase project
2. Execute each migration file from the `supabase/migrations/` directory in order:

   ```sql
   -- First run 20250417_add_streaks_to_profiles.sql
   ALTER TABLE profiles 
   ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 0,
   ADD COLUMN IF NOT EXISTS last_reward_claim TIMESTAMP WITH TIME ZONE;
   
   -- Then run 20250417_ensure_default_balance.sql
   -- And so on for each migration file
   ```

3. Verify each table's creation by checking the Table Editor

### Method 2: Manual Schema Recreation

If migration files are incomplete or problematic, recreate the schema manually:

1. Create the profiles table first:
   ```sql
   CREATE TABLE profiles (
     id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
     username TEXT NOT NULL,
     balance NUMERIC NOT NULL DEFAULT 15,
     streak_days INTEGER DEFAULT 0,
     last_reward_claim TIMESTAMP WITH TIME ZONE,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
     updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );
   ```

2. Create remaining tables in this order:
   - leagues
   - teams
   - games
   - bet_lines
   - bets
   - parlay_bets
   - user_settings
   - api_cache
   - transaction_logs

3. Refer to `PROJECT_DOCUMENTATION.md` for complete schema details

## Step 4: Set Up Row Level Security (RLS)

For each table:

1. Enable Row Level Security:
   ```sql
   ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;
   ```

2. Create appropriate policies:

   **Profiles Table:**
   ```sql
   CREATE POLICY "Users can view their own profile" 
   ON profiles FOR SELECT 
   USING (auth.uid() = id);
   
   CREATE POLICY "Users can update their own profile" 
   ON profiles FOR UPDATE 
   USING (auth.uid() = id);
   ```

   **Bets Table:**
   ```sql
   CREATE POLICY "Users can view their own bets" 
   ON bets FOR SELECT 
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert their own bets" 
   ON bets FOR INSERT 
   WITH CHECK (auth.uid() = user_id);
   ```

   **Repeat for all tables with user-specific data**

3. For public data tables (e.g., leagues, games), create open SELECT policies:
   ```sql
   CREATE POLICY "Anyone can view leagues" 
   ON leagues FOR SELECT 
   USING (true);
   ```

## Step 5: Create Triggers and Functions

1. Create the user creation trigger:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     INSERT INTO public.profiles (id, username, balance, streak_days, last_reward_claim)
     VALUES (
       NEW.id,
       COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
       15,
       0,
       NULL
     );
     
     RETURN NEW;
   END;
   $$;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```

2. Set up the pg_cron extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

3. Create cron job for refreshing odds data:
   ```sql
   SELECT cron.schedule(
     'refresh-odds-data-monthly',
     '0 0 1 * *',
     $$
     SELECT
       net.http_post(
         url:=CONCAT(current_setting('hooks.auth_service_url'), '/functions/v1/refresh-odds-data'),
         headers:=jsonb_build_object(
           'Content-Type', 'application/json',
           'Authorization', CONCAT('Bearer ', current_setting('hooks.auth_service_role_key'))
         ),
         body:='{}'
       ) AS request_id;
     $$
   );
   ```

## Step 6: Deploy Edge Functions

1. Install Supabase CLI if not already installed:
   ```
   npm install -g supabase
   ```

2. Link to your new project:
   ```
   supabase login
   supabase link --project-ref your-new-project-ref
   ```

3. Deploy the Edge Function:
   ```
   supabase functions deploy refresh-odds-data
   ```

4. Configure secrets for the Edge Function:
   ```
   supabase secrets set API_SPORTS_SOCCER_KEY=your-api-key
   supabase secrets set API_SPORTS_FOOTBALL_KEY=your-api-key
   supabase secrets set API_SPORTS_BASKETBALL_KEY=your-api-key
   supabase secrets set API_SPORTS_BASEBALL_KEY=your-api-key
   supabase secrets set API_SPORTS_HOCKEY_KEY=your-api-key
   supabase secrets set API_SPORTS_MMA_KEY=your-api-key
   supabase secrets set API_SPORTS_RUGBY_KEY=your-api-key
   supabase secrets set API_SPORTS_VOLLEYBALL_KEY=your-api-key
   supabase secrets set API_SPORTS_FORMULA1_KEY=your-api-key
   supabase secrets set API_SPORTS_AFL_KEY=your-api-key
   supabase secrets set API_SPORTS_HANDBALL_KEY=your-api-key
   ```

## Step 7: Configure Authentication

1. In Supabase Dashboard, go to Authentication → Providers
2. Configure Email provider:
   - For development, disable email confirmation
   - For production, enable email confirmation
3. If using GitHub OAuth:
   - Create a new OAuth app in GitHub
   - Add client ID and secret to Supabase
4. Configure Site URL and Redirect URLs:
   - Add your local development URL (http://localhost:3000)
   - Add your production domain (https://yourdomain.com)

## Step 8: Update Application Code

1. Update Supabase connection details in:
   - `src/lib/supabase.ts`
   - `src/integrations/supabase/client.ts`

   Replace with your new project details:
   ```typescript
   const supabaseUrl = "https://your-new-project-ref.supabase.co";
   const supabaseAnonKey = "your-new-anon-key";
   ```

2. Update any hardcoded Edge Function URLs:
   - Look for URLs containing your old project reference
   - Replace with your new project reference

## Step 9: Testing Connection

1. Run the application locally:
   ```
   npm run dev
   ```

2. Test all database functionality:
   - User registration and login
   - Viewing sports data
   - Placing bets
   - Checking profile and balance

3. Check console for any Supabase connection errors

## Step 10: Data Migration (Optional)

If you need to migrate existing data:

1. Export data from your old project as CSV:
   - Go to Table Editor
   - Select a table
   - Click "Export"
   - Choose CSV format

2. Clean up user-related data:
   - Remove or update user IDs to match new users
   - Ensure foreign key relationships are maintained

3. Import data to your new project:
   - Go to Table Editor
   - Select the table
   - Click "Import"
   - Upload your CSV

4. Test data after import to ensure relationships are preserved

## Step 11: Enable Realtime Features

For tables that need realtime updates:

1. Enable full replica identity:
   ```sql
   ALTER TABLE profiles REPLICA IDENTITY FULL;
   ALTER TABLE bets REPLICA IDENTITY FULL;
   ```

2. Add tables to realtime publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
   ALTER PUBLICATION supabase_realtime ADD TABLE bets;
   ```

## Step 12: Performance Optimization

1. Add indexes to frequently queried columns:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
   CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
   CREATE INDEX IF NOT EXISTS idx_games_league_id ON games(league_id);
   CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
   ```

2. Consider adding foreign key constraints if missing:
   ```sql
   ALTER TABLE bets 
   ADD CONSTRAINT fk_bets_game_id 
   FOREIGN KEY (game_id) REFERENCES games(id);
   ```

## Step 13: Production Deployment

After testing locally:

1. Build for production:
   ```
   npm run build
   ```

2. Upload to GoDaddy hosting:
   - Use FTP to upload the `dist` directory contents
   - Set up `.htaccess` for single-page application routing

3. Test thoroughly on the production site

## Common Issues and Solutions

### Authentication Issues
- **Problem**: Login redirects fail
  **Solution**: Check Site URL and Redirect URLs in Supabase Authentication settings
  
- **Problem**: "User not found" errors
  **Solution**: Verify user creation trigger is working properly

### Database Access Issues
- **Problem**: "Invalid RLS policy" errors
  **Solution**: Check RLS policies and ensure they're correctly configured
  
- **Problem**: Data not appearing for logged-in users
  **Solution**: Verify user ID is correctly passed in queries

### Edge Function Issues
- **Problem**: Edge functions not working
  **Solution**: Check deployment status and logs, verify secrets are set
  
- **Problem**: CORS errors when calling functions
  **Solution**: Ensure Edge functions have proper CORS headers configured

### Realtime Updates Not Working
- **Problem**: UI not updating in real-time
  **Solution**: Check table has REPLICA IDENTITY FULL and is added to publication

## Conclusion

Following this guide should ensure a smooth transition from the Lovable integrated Supabase project to your own standalone Supabase instance. Remember to thoroughly test all functionality after each step of the migration process to catch and address issues early.

For ongoing maintenance, establish a regular backup schedule and document any schema changes made over time. This will make future migrations or updates easier to manage.
