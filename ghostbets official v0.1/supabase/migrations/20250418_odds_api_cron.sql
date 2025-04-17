
-- Enable the pg_cron extension to schedule jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Set up a job to run on the 1st of each month at 00:00 UTC
SELECT cron.schedule(
  'refresh-odds-data-monthly',
  '0 0 1 * *',  -- minute hour day month day_of_week (1st of each month at midnight)
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
