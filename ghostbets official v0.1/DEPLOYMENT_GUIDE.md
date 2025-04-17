
# Deployment and Maintenance Guide

## Setting Up Local Development Environment

### Prerequisites
1. Node.js (v16.x or higher)
2. npm or yarn
3. Git
4. VS Code (recommended)

### Getting Started
1. Clone the repository from GitHub:
   ```
   git clone <your-github-repo-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Supabase Configuration

### Creating a New Supabase Project
1. Go to [Supabase](https://supabase.com) and create an account if you don't have one
2. Create a new project by clicking "New Project"
3. Enter a name for your project
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"
7. Wait for your project to be created (usually takes 2-3 minutes)

### Setting Up Database Schema
1. Once your project is created, navigate to the SQL Editor in the Supabase dashboard
2. You'll need to recreate all the database tables and functions. There are two ways to do this:

   **Option 1: Using SQL Migration Files**
   - In your project repository, locate the SQL migration files in `supabase/migrations/`
   - Run them in order (from earliest date to latest) in the SQL Editor
   - Execute each file separately and check for successful execution

   **Option 2: Using Database UI**
   - Go to the "Table Editor" in Supabase
   - Create each table manually according to the schema described in `PROJECT_DOCUMENTATION.md`
   - Don't forget to set up proper relationships between tables

### Configuring Row Level Security (RLS)
1. For each table, enable Row Level Security:
   - Go to "Authentication" → "Policies"
   - Select a table
   - Toggle "Enable RLS"
2. Create the necessary policies for each table:
   - For profiles: Ensure users can only read/write their own profile
   - For bets: Users should only see their own bets
   - For api_cache: Public read access, restricted write access

### Setting Up Authentication
1. Navigate to "Authentication" → "Providers" in the Supabase dashboard
2. Configure Email provider:
   - For development, you may want to disable email confirmation
3. If using GitHub OAuth:
   - Register a new OAuth application in GitHub
   - Add the client ID and secret to Supabase
   - Set callback URL to your domain
4. Configure Site URL and Redirect URLs:
   - Set Site URL to your domain (e.g., `https://yourdomain.com`)
   - Add redirect URLs for local development (`http://localhost:3000`)
   - Add redirect URLs for your production domain

### Deploying Edge Functions
1. Install the Supabase CLI:
   ```
   npm install -g supabase
   ```

2. Link your local project to your Supabase project:
   ```
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

3. Deploy the edge functions:
   ```
   supabase functions deploy
   ```

4. Set up secrets for edge functions:
   ```
   supabase secrets set API_SPORTS_SOCCER_KEY=<your-api-key>
   supabase secrets set API_SPORTS_FOOTBALL_KEY=<your-api-key>
   ```
   (Repeat for all API keys listed in `supabase/config.toml`)

### Updating Supabase Connection in Code
1. Update the Supabase URL and anonymous key in these files:
   - `src/lib/supabase.ts`
   - `src/integrations/supabase/client.ts`

   Replace with your new project's URL and anon key:
   ```typescript
   const supabaseUrl = "https://your-project-ref.supabase.co";
   const supabaseAnonKey = "your-anon-key";
   ```

2. If you're using Edge Functions, update the endpoint URLs as well

## API Connections Maintenance

### Sports Data APIs
1. The project uses several sports data APIs:
   - ESPN API for leagues and games data
   - Odds API for betting odds
   - API Sports for additional sports data

2. To maintain or update API keys:
   - Get new API keys from the respective providers
   - Update them in your Supabase project as secrets
   - For direct API calls in frontend code, update the keys in API client files

### Scheduled Tasks
1. The project uses pg_cron jobs to refresh odds data periodically:
   - These are set up in the `supabase/migrations/20250418_odds_api_cron.sql` file
   - Verify these are running correctly in your new Supabase project
   - You can check the status in the Supabase dashboard under Database → Extensions → pg_cron

2. To modify or add cron jobs:
   ```sql
   SELECT cron.schedule(
     'job-name',
     'cron-schedule', -- e.g., '0 0 * * *' for daily at midnight
     $$ -- SQL command to execute
        SELECT net.http_post(...)
     $$
   );
   ```

## GoDaddy Hosting Setup

### Preparing for Deployment
1. Build the application for production:
   ```
   npm run build
   ```

2. The build output will be in the `dist` directory.

### Setting Up GoDaddy Hosting

1. Log in to your GoDaddy account
2. Navigate to your hosting control panel
3. Set up a domain or subdomain for your application

### Configuring for Supabase Connection

1. Ensure your GoDaddy hosting allows:
   - CORS requests to external services
   - WebSocket connections (for Supabase Realtime)
   - Outbound API calls

2. Create a `.env.production` file before building:
   ```
   # No environment variables needed since we hardcode Supabase URLs
   ```

3. Configure for Single-Page Application:
   - Create a `.htaccess` file in the root directory:
     ```
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

### Uploading to GoDaddy
1. Use FTP to connect to your GoDaddy hosting
2. Upload the contents of the `dist` folder to your web directory (usually `public_html`)
3. Ensure all files have the correct permissions:
   - HTML/CSS/JS files: 644
   - Directories: 755

### Testing the Deployment
1. Visit your website URL
2. Test all functionality:
   - Authentication (login/signup)
   - Viewing sports data
   - Placing bets
   - Checking account balance and rewards
   
2. Check browser console for errors
3. Verify API connections are working correctly

## Troubleshooting

### Common Supabase Issues

1. **Authentication Problems**:
   - Check Site URL and Redirect URLs in Supabase Auth settings
   - Ensure Email confirmation is configured correctly
   - Verify that your domain is allowed as a redirect URL

2. **Database Connection Issues**:
   - Verify Supabase URL and anon key are correct
   - Check if RLS policies are blocking data access
   - Test queries directly in the Supabase dashboard

3. **Edge Function Errors**:
   - Check the Edge Function logs in Supabase dashboard
   - Verify all required secrets are set
   - Test functions directly via the Supabase dashboard

4. **Realtime Subscription Issues**:
   - Ensure tables have REPLICA IDENTITY FULL set
   - Verify tables are added to the realtime publication
   - Check for RLS policies that might block access

### Fixing Odds API
1. The current Odds API integration has limitations. To improve it:
   - Get a valid API key from [the-odds-api.com](https://the-odds-api.com)
   - Update the key in Supabase secrets
   - Check rate limits and adjust caching strategy if needed
   - Consider implementing additional error handling

2. To update the integration:
   - Review `supabase/functions/refresh-odds-data/index.ts`
   - Update API endpoints or parameters as needed
   - Test by manually triggering the function
   - Monitor logs for error responses

## Database Maintenance

### Backup and Restore
1. Regularly back up your Supabase database:
   ```
   pg_dump -h db.cesltdnpizhouatyezok.supabase.co -U postgres -d postgres -F c -b -v -f backup.dump
   ```

2. To restore from a backup:
   ```
   pg_restore -h db.your-new-project.supabase.co -U postgres -d postgres -v backup.dump
   ```

### Schema Migrations
1. When making database changes, always create migration files:
   ```sql
   -- migration_name.sql
   -- Changes to be applied
   ```

2. Apply migrations to your development environment first
3. Test thoroughly before applying to production
4. Keep all migration files in the `supabase/migrations` directory

## Performance Optimization

1. **Caching Strategy**:
   - The application uses caching for API responses
   - Review and adjust TTL (Time To Live) settings as needed
   - Consider implementing a more robust caching solution

2. **Database Indexes**:
   - Monitor query performance in Supabase dashboard
   - Add indexes for frequently queried columns
   - Example:
     ```sql
     CREATE INDEX idx_bets_user_id ON bets(user_id);
     ```

3. **API Rate Limiting**:
   - Implement additional rate limiting for API endpoints
   - Use caching to reduce API calls
   - Consider implementing a queue for periodic updates

## Security Considerations

1. **Supabase Security**:
   - Regularly review and update RLS policies
   - Use least privilege principle for all database operations
   - Consider adding additional validation to API endpoints

2. **API Keys Security**:
   - Never expose API keys in frontend code
   - Always use Supabase Edge Functions for sensitive operations
   - Regularly rotate API keys for all services

3. **User Data Protection**:
   - Implement proper data sanitization for user inputs
   - Use parameterized queries to prevent SQL injection
   - Consider adding data encryption for sensitive information

## Monitoring and Maintenance

1. **Database Monitoring**:
   - Regularly check Supabase dashboard for performance issues
   - Monitor database size and connection limits
   - Set up alerts for unusual activity

2. **API Health Checks**:
   - Implement monitoring for all external API dependencies
   - Create a status page or health check endpoint
   - Set up alerts for API failures

3. **Regular Updates**:
   - Keep dependencies updated
   - Regularly test and update Edge Functions
   - Monitor for security advisories for all dependencies
